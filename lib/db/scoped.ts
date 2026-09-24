import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

export async function withFirmScope<T>(firmId:string, fn:(tx:ReturnType<typeof drizzle<typeof schema>>)=>Promise<T>):Promise<T>{
 const url=process.env.DATABASE_URL;
 if(!url)throw new Error("DATABASE_URL is required at runtime");
 const sql=postgres(url,{max:1,prepare:false});
 try{
  return await sql.begin(async raw=>{
   await raw`select set_config('app.firm_id', ${firmId}, true)`;
   const tx=drizzle(raw,{schema});
   return fn(tx);
  });
 } finally { await sql.end(); }
}
