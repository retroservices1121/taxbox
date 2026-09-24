import { createHash, randomUUID } from "node:crypto";
import { encryptDocument } from "../security/document-crypto";
import { putRailwayObject } from "../storage/railway";
import type { DocumentIntelligenceProvider } from "../document-intelligence/types";

const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 25 * 1024 * 1024;

export async function processTaxDocumentUpload(input: {
  firmId: string;
  workspaceId: string;
  expectedTaxYear: number;
  fileName: string;
  mimeType: string;
  bytes: Buffer;
  intelligence: DocumentIntelligenceProvider;
}) {
  if (!ALLOWED_TYPES.has(input.mimeType)) throw new Error("Unsupported tax document type");
  if (input.bytes.length > MAX_BYTES) throw new Error("Tax document exceeds 25 MB limit");

  const classification = await input.intelligence.classify({
    fileName: input.fileName,
    mimeType: input.mimeType,
    bytes: input.bytes,
    expectedTaxYear: input.expectedTaxYear
  });

  const objectKey = `firms/${input.firmId}/workspaces/${input.workspaceId}/${randomUUID()}`;
  const encrypted = await encryptDocument(input.firmId, objectKey, input.bytes);
  await putRailwayObject(objectKey, encrypted);

  return {
    objectKey,
    encryptedSizeBytes: encrypted.length,
    sha256: createHash("sha256").update(input.bytes).digest("hex"),
    classification
  };
}
