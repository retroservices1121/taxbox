import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import postgres from "postgres";

const url = process.env.RLS_TEST_DATABASE_URL ?? process.env.ADMIN_DATABASE_URL;
const run = url ? describe : describe.skip;

run("TaxBox forced RLS", () => {
  const admin = postgres(url!, { prepare: false });
  const firmA = randomUUID();
  const firmB = randomUUID();
  const clientA = randomUUID();
  const clientB = randomUUID();
  const workspaceA = randomUUID();
  const workspaceB = randomUUID();
  const documentA = randomUUID();
  const documentB = randomUUID();

  beforeAll(async () => {
    await admin`insert into firms (id,name,slug) values
      (${firmA}::uuid,'RLS Firm A',${"rls-a-"+firmA}),
      (${firmB}::uuid,'RLS Firm B',${"rls-b-"+firmB})`;
    await admin`insert into clients (id,firm_id,type,display_name,primary_email) values
      (${clientA}::uuid,${firmA}::uuid,'INDIVIDUAL','Client A',${clientA+"@example.test"}),
      (${clientB}::uuid,${firmB}::uuid,'INDIVIDUAL','Client B',${clientB+"@example.test"})`;
    await admin`insert into workspaces (id,firm_id,client_id,tax_year,client_type,price_cents) values
      (${workspaceA}::uuid,${firmA}::uuid,${clientA}::uuid,2026,'INDIVIDUAL',1000),
      (${workspaceB}::uuid,${firmB}::uuid,${clientB}::uuid,2026,'INDIVIDUAL',1000)`;
    await admin`insert into documents (id,workspace_id,storage_key,original_file_name,display_name,mime_type) values
      (${documentA}::uuid,${workspaceA}::uuid,'rls/a','a.pdf','A','application/pdf'),
      (${documentB}::uuid,${workspaceB}::uuid,'rls/b','b.pdf','B','application/pdf')`;
  });

  afterAll(async () => {
    await admin`delete from firms where id in (${firmA}::uuid,${firmB}::uuid)`;
    await admin.end();
  });

  async function asFirm<T>(firmId: string, fn: (sql: postgres.TransactionSql) => Promise<T>) {
    return admin.begin(async sql => {
      await sql.unsafe("set local role app_firm");
      await sql`select set_config('app.firm_id', ${firmId}, true)`;
      return fn(sql);
    });
  }

  it("Firm A sees its client and not Firm B's client", async () => {
    await asFirm(firmA, async sql => {
      expect(await sql`select id from clients where id=${clientA}::uuid`).toHaveLength(1);
      expect(await sql`select id from clients where id=${clientB}::uuid`).toHaveLength(0);
    });
  });

  it("isolates nested workspace documents", async () => {
    await asFirm(firmA, async sql => {
      expect(await sql`select id from documents where id=${documentA}::uuid`).toHaveLength(1);
      expect(await sql`select id from documents where id=${documentB}::uuid`).toHaveLength(0);
    });
  });

  it("blocks cross-firm inserts", async () => {
    await expect(asFirm(firmA, sql =>
      sql`insert into clients (firm_id,type,display_name,primary_email) values
        (${firmB}::uuid,'INDIVIDUAL','Blocked','blocked@example.test')`
    )).rejects.toThrow();
  });

  it("cannot update Firm B through Firm A scope", async () => {
    await asFirm(firmA, async sql => {
      const result = await sql`update clients set display_name='Compromised' where id=${clientB}::uuid returning id`;
      expect(result).toHaveLength(0);
    });
    const [row] = await admin`select display_name from clients where id=${clientB}::uuid`;
    expect(row.display_name).toBe("Client B");
  });
});
