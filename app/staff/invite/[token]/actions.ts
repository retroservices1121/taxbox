"use server";
import { createHash, randomUUID } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { staffInvites, users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/security/password";
import { encryptTotpSecret } from "@/lib/security/totp-secret";
import { generateTotpSecret, totpUri } from "@/lib/auth/totp";
const hash=(s:string)=>createHash("sha256").update(s).digest("hex");
export async function acceptStaffInvite(_prev:{error?:string;ok?:boolean;secret?:string;uri?:string},formData:FormData){
 const token=String(formData.get("token")??""); const name=String(formData.get("name")??"").trim(); const password=String(formData.get("password")??"");
 if(!token||!name||password.length<12)return{error:"Enter your name and a password of at least 12 characters."};
 const [invite]=await db.select().from(staffInvites).where(and(eq(staffInvites.tokenHash,hash(token)),eq(staffInvites.status,"PENDING"),gt(staffInvites.expiresAt,new Date()))).limit(1);
 if(!invite)return{error:"This invitation is invalid or expired."};
 const exists=await db.select({id:users.id}).from(users).where(eq(users.email,invite.email)).limit(1); if(exists.length)return{error:"An account already exists for this email."};
 const userId=randomUUID(),secret=generateTotpSecret();
 const enc=await encryptTotpSecret(secret,invite.firmId,userId);
 await db.transaction(async tx=>{await tx.insert(users).values({id:userId,firmId:invite.firmId,email:invite.email,name,role:invite.role,passwordHash:hashPassword(password),totpSecretEnc:enc});await tx.update(staffInvites).set({status:"COMPLETED",completedAt:new Date()}).where(eq(staffInvites.id,invite.id));});
 return{ok:true,secret,uri:totpUri(secret,invite.email)};
}
