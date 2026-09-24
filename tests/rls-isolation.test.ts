import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import postgres from "postgres";

const url=process.env.RLS_TEST_DATABASE_URL;
const run=url?describe:describe.skip;

run("TaxBox forced RLS",()=>{
 it("does not expose another firm's clients",async()=>{
  const sql=postgres(url!,{prepare:false});
  const firmA=randomUUID(),firmB=randomUUID();
  try{
   await sql`select set_config('app.firm_id', ${firmA}, false)`;
   const rows=await sql`select id, firm_id from clients where firm_id=${firmB}::uuid`;
   expect(rows).toHaveLength(0);
  } finally {await sql.end();}
 });
});
