import "dotenv/config";
import { readFile } from "node:fs/promises";
import postgres from "postgres";

async function main(){
 const url=process.env.ADMIN_DATABASE_URL ?? process.env.DATABASE_URL;
 if(!url)throw new Error("ADMIN_DATABASE_URL or DATABASE_URL is required");
 const client=postgres(url,{max:1,prepare:false});
 try{
  await client.unsafe(await readFile("db/schema.sql","utf8"));
  await client.unsafe(await readFile("db/rls.sql","utf8"));
  console.log("TaxBox schema and forced RLS policies applied.");
 } finally {await client.end();}
}
main().catch(error=>{console.error(error);process.exit(1);});
