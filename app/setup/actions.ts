"use server";
import { db } from "@/lib/db/client";
import { firms, users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/security/password";
import { generateTotpSecret, totpUri } from "@/lib/auth/totp";

export async function setupFirmAdmin(_previousState:{error?:string;ok?:boolean;secret?:string;uri?:string},form:FormData){
 if(process.env.ALLOW_INITIAL_SETUP!=="true")return{error:"Initial setup is disabled."};
 const firmName=String(form.get("firmName")??"").trim(),name=String(form.get("name")??"").trim(),email=String(form.get("email")??"").trim().toLowerCase(),password=String(form.get("password")??"");
 if(!firmName||!name||!email||password.length<12)return{error:"Complete all fields. Password must be at least 12 characters."};
 const existing=await db.select({id:users.id}).from(users).limit(1);if(existing.length)return{error:"Initial setup has already been completed."};
 const slug=firmName.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,48)+"-"+Date.now().toString(36);
 const secret=generateTotpSecret();
 const [firm]=await db.insert(firms).values({name:firmName,slug,contactEmail:email}).returning({id:firms.id});
 await db.insert(users).values({firmId:firm.id,email,name,role:"FIRM_ADMIN",passwordHash:hashPassword(password),totpSecretEnc:secret});
 return{ok:true,secret,uri:totpUri(secret,email)};
}
