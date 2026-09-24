import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { auditEvents, documents, workspaces } from "../db/schema";
import type { Session } from "../auth/session";
import { mayReadWorkspace } from "../auth/session";
import { decryptDocument } from "../security/document-crypto";
import { getRailwayObject } from "../storage/railway";

export class DocumentNotFoundError extends Error {
  constructor() {
    super("Document not found");
    this.name = "DocumentNotFoundError";
  }
}

async function audit(session: Session, input: {
  workspaceId: string;
  action: "DOCUMENT_VIEWED" | "DOCUMENT_DOWNLOADED";
  documentId: string;
}) {
  await db.insert(auditEvents).values({
    firmId: session.firmId,
    actorUserId: session.kind === "staff" ? session.userId : null,
    workspaceId: input.workspaceId,
    action: input.action,
    targetType: "DOCUMENT",
    targetId: input.documentId,
    metadata: {
      actorKind: session.kind,
      inviteId: session.kind === "client" ? session.inviteId : undefined,
      ip: session.ip,
      userAgent: session.userAgent
    }
  });
}

export async function openTaxDocument(session: Session, documentId: string, mode: "view" | "download") {
  const [row] = await db
    .select({
      documentId: documents.id,
      workspaceId: documents.workspaceId,
      storageKey: documents.storageKey,
      displayName: documents.displayName,
      originalFileName: documents.originalFileName,
      mimeType: documents.mimeType,
      firmId: workspaces.firmId
    })
    .from(documents)
    .innerJoin(workspaces, eq(documents.workspaceId, workspaces.id))
    .where(and(eq(documents.id, documentId), eq(workspaces.firmId, session.firmId)))
    .limit(1);

  if (!row || !mayReadWorkspace(session, row.firmId, row.workspaceId)) {
    throw new DocumentNotFoundError();
  }

  await audit(session, {
    workspaceId: row.workspaceId,
    action: mode === "download" ? "DOCUMENT_DOWNLOADED" : "DOCUMENT_VIEWED",
    documentId: row.documentId
  });

  const encrypted = await getRailwayObject(row.storageKey);
  const bytes = await decryptDocument(row.firmId, row.storageKey, encrypted);

  return {
    bytes,
    mimeType: row.mimeType,
    fileName: row.displayName || row.originalFileName
  };
}
