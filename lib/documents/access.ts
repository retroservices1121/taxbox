import { and, eq } from "drizzle-orm";
import { auditEvents, documents, workspaces } from "../db/schema";
import { withFirmScope } from "../db/scoped";
import type { Session } from "../auth/session";
import { mayReadWorkspace } from "../auth/session";
import { decryptDocument } from "../security/document-crypto";
import { getRailwayObject } from "../storage/railway";

export class DocumentNotFoundError extends Error { constructor(){super("Document not found");this.name="DocumentNotFoundError";} }

export async function openTaxDocument(session:Session,documentId:string,mode:"view"|"download"){
 const row=await withFirmScope(session.firmId,async db=>{
  const [found]=await db.select({documentId:documents.id,workspaceId:documents.workspaceId,storageKey:documents.storageKey,displayName:documents.displayName,originalFileName:documents.originalFileName,mimeType:documents.mimeType,firmId:workspaces.firmId}).from(documents).innerJoin(workspaces,eq(documents.workspaceId,workspaces.id)).where(and(eq(documents.id,documentId),eq(workspaces.firmId,session.firmId))).limit(1);
  if(!found||!mayReadWorkspace(session,found.firmId,found.workspaceId))throw new DocumentNotFoundError();
  await db.insert(auditEvents).values({firmId:session.firmId,actorUserId:session.kind==="staff"?session.userId:null,workspaceId:found.workspaceId,action:mode==="download"?"DOCUMENT_DOWNLOADED":"DOCUMENT_VIEWED",targetType:"DOCUMENT",targetId:found.documentId,metadata:{actorKind:session.kind,inviteId:session.kind==="client"?session.inviteId:undefined,ip:session.ip,userAgent:session.userAgent}});
  return found;
 });
 // Authorization and RLS lookup happen before key-cache/decryption access.
 const encrypted=await getRailwayObject(row.storageKey);
 const bytes=await decryptDocument(row.firmId,row.storageKey,encrypted);
 return{bytes,mimeType:row.mimeType,fileName:row.displayName||row.originalFileName};
}
