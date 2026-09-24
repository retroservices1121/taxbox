import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { firms } from "../db/schema";
import { getKms } from "./kms";
import { openBytes, sealBytes } from "./aes";

const cache = new Map<string, { key: Buffer; expiresAt: number }>();
const TTL = 5 * 60 * 1000;

async function firmDek(firmId: string): Promise<Buffer> {
  const cached = cache.get(firmId);
  if (cached && Date.now() < cached.expiresAt) return cached.key;

  const [firm] = await db.select({
    dekCiphertext: firms.dekCiphertext,
    dekDestroyedAt: firms.dekDestroyedAt
  }).from(firms).where(eq(firms.id, firmId)).limit(1);

  if (!firm) throw new Error("Firm not found");
  if (firm.dekDestroyedAt) throw new Error("Firm encryption key has been destroyed");
  if (!firm.dekCiphertext) throw new Error("Firm has no encryption key");

  const key = await getKms().decryptDataKey(Buffer.from(firm.dekCiphertext), { firmId });
  cache.set(firmId, { key, expiresAt: Date.now() + TTL });
  return key;
}

export async function generateFirmDek(firmId: string) {
  const key = await getKms().generateDataKey({ firmId });
  cache.set(firmId, { key: key.plaintext, expiresAt: Date.now() + TTL });
  return { ciphertext: key.ciphertext, keyId: key.keyId };
}

export async function encryptDocument(firmId: string, objectKey: string, bytes: Buffer): Promise<Buffer> {
  const key = await firmDek(firmId);
  return sealBytes(key, bytes, `${firmId}:${objectKey}`);
}

export async function decryptDocument(firmId: string, objectKey: string, bytes: Buffer): Promise<Buffer> {
  const key = await firmDek(firmId);
  return openBytes(key, bytes, `${firmId}:${objectKey}`);
}
