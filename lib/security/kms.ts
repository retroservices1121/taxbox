import { createHash } from "node:crypto";
import { assertKey, openBytes, randomKey, sealBytes } from "./aes";

export interface DataKey {
  plaintext: Buffer;
  ciphertext: Buffer;
  keyId: string;
}

export interface KmsProvider {
  generateDataKey(context: Record<string, string>): Promise<DataKey>;
  decryptDataKey(ciphertext: Buffer, context: Record<string, string>): Promise<Buffer>;
}

function canonicalContext(context: Record<string, string>): string {
  return Object.keys(context).sort().map(k => `${k}=${context[k]}`).join("&");
}

class LocalKms implements KmsProvider {
  private masterKey: Buffer;
  private keyId: string;

  constructor(encoded: string) {
    if (!encoded) throw new Error("LOCAL_KMS_MASTER_KEY is required when KMS_PROVIDER=local");
    this.masterKey = assertKey(Buffer.from(encoded, "base64"), "LOCAL_KMS_MASTER_KEY");
    this.keyId = `local:${createHash("sha256").update(this.masterKey).digest("hex").slice(0, 16)}`;
  }

  async generateDataKey(context: Record<string, string>): Promise<DataKey> {
    const plaintext = randomKey();
    return {
      plaintext,
      ciphertext: sealBytes(this.masterKey, plaintext, canonicalContext(context)),
      keyId: this.keyId
    };
  }

  async decryptDataKey(ciphertext: Buffer, context: Record<string, string>): Promise<Buffer> {
    return assertKey(openBytes(this.masterKey, ciphertext, canonicalContext(context)), "unwrapped DEK");
  }
}

class VaultKms implements KmsProvider {
  private address: string;
  private token: string;
  private keyName: string;
  private mount: string;
  private namespace?: string;

  constructor() {
    if (!process.env.VAULT_ADDR || !process.env.VAULT_TOKEN) {
      throw new Error("KMS_PROVIDER=vault requires VAULT_ADDR and VAULT_TOKEN");
    }
    this.address = process.env.VAULT_ADDR.replace(/\/$/, "");
    this.token = process.env.VAULT_TOKEN;
    this.keyName = process.env.VAULT_TRANSIT_KEY ?? "taxbox";
    this.mount = process.env.VAULT_TRANSIT_MOUNT ?? "transit";
    this.namespace = process.env.VAULT_NAMESPACE;
  }

  private context(context: Record<string, string>): string {
    return Buffer.from(canonicalContext(context), "utf8").toString("base64");
  }

  private async post(path: string, body: Record<string, unknown>) {
    const headers: Record<string,string> = {
      "X-Vault-Token": this.token,
      "Content-Type": "application/json"
    };
    if (this.namespace) headers["X-Vault-Namespace"] = this.namespace;
    const response = await fetch(`${this.address}/v1/${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) throw new Error(`Vault returned ${response.status}`);
    const payload = await response.json() as { data?: Record<string, unknown> };
    if (!payload.data) throw new Error("Vault returned no data");
    return payload.data;
  }

  async generateDataKey(context: Record<string, string>): Promise<DataKey> {
    const data = await this.post(`${this.mount}/datakey/plaintext/${this.keyName}`, {
      bits: 256,
      context: this.context(context)
    });
    return {
      plaintext: assertKey(Buffer.from(String(data.plaintext), "base64"), "Vault data key"),
      ciphertext: Buffer.from(String(data.ciphertext), "utf8"),
      keyId: `vault:${this.mount}/${this.keyName}:v${String(data.key_version ?? 1)}`
    };
  }

  async decryptDataKey(ciphertext: Buffer, context: Record<string, string>): Promise<Buffer> {
    const data = await this.post(`${this.mount}/decrypt/${this.keyName}`, {
      ciphertext: ciphertext.toString("utf8"),
      context: this.context(context)
    });
    return assertKey(Buffer.from(String(data.plaintext), "base64"), "Vault data key");
  }
}

let singleton: KmsProvider | null = null;

export function getKms(): KmsProvider {
  if (singleton) return singleton;
  singleton = process.env.KMS_PROVIDER === "vault"
    ? new VaultKms()
    : new LocalKms(process.env.LOCAL_KMS_MASTER_KEY ?? "");
  return singleton;
}
