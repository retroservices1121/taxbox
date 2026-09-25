import "dotenv/config";
import { eq, isNull } from "drizzle-orm";
import { db } from "../lib/db/client";
import { firms } from "../lib/db/schema";
import { generateFirmDek } from "../lib/security/document-crypto";

async function main(){
 const rows=await db.select({id:firms.id,name:firms.name}).from(firms).where(isNull(firms.dekCiphertext));
 if(!rows.length){console.log("All firms already have document encryption keys.");return;}
 for(const firm of rows){
  const dek=await generateFirmDek(firm.id);
  await db.update(firms).set({dekCiphertext:dek.ciphertext,dekKeyId:dek.keyId,updatedAt:new Date()}).where(eq(firms.id,firm.id));
  console.log(`Created document encryption key for firm: ${firm.name}`);
 }
}
main().catch(e=>{console.error(e);process.exit(1);});
