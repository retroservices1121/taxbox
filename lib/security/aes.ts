import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const NONCE_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;

export function assertKey(key: Buffer, label = "key"): Buffer {
  if (key.length !== KEY_BYTES) throw new Error(`${label} must be exactly 32 bytes`);
  return key;
}

export function randomKey(): Buffer {
  return randomBytes(KEY_BYTES);
}

export function sealBytes(key: Buffer, plaintext: Buffer, aad: string): Buffer {
  assertKey(key);
  const nonce = randomBytes(NONCE_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, nonce);
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([nonce, ciphertext, cipher.getAuthTag()]);
}

export function openBytes(key: Buffer, sealed: Buffer, aad: string): Buffer {
  assertKey(key);
  if (sealed.length < NONCE_BYTES + TAG_BYTES) throw new Error("Malformed ciphertext");
  const nonce = sealed.subarray(0, NONCE_BYTES);
  const tag = sealed.subarray(sealed.length - TAG_BYTES);
  const ciphertext = sealed.subarray(NONCE_BYTES, sealed.length - TAG_BYTES);
  const decipher = createDecipheriv(ALGORITHM, key, nonce);
  decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
