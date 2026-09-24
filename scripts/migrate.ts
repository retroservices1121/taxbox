import "dotenv/config";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

async function main(){
 const url=process.env.ADMIN_DATABASE_URL ?? process.env.DATABASE_URL;
 if(!url)throw new Error("ADMIN_DATABASE_URL or DATABASE_URL is required");
 const client=postgres(url,{max:1,prepare:false});
 try{
  const db=drizzle(client);
  await migrate(db,{migrationsFolder:"drizzle/generated"});
  const rls=await readFile("db/rls.sql","utf8");
  await client.unsafe(rls);
  console.log("TaxBox schema migrations and RLS policies applied.");
 } finally {await client.end();}
}
main().catch(error=>{console.error(error);process.exit(1);});
