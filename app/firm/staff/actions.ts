"use server";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { staffInvites, users } from "@/lib/db/schema";
import { resolveStaffSession, SESSION_COOKIE } from "@/lib/auth/staff-auth";

const hash=(s:string)=>createHash("sha256").update(s).digest("hex");

export async function inviteStaff(_prev:{error?:string;inviteUrl?:string},formData:FormData){
 const session=await resolveStaffSession((await cookies()).get(SESSION_COOKIE)?.value);
 if(!session) redirect("/login");
 if(session.role!=="FIRM_ADMIN") return {error:"Only Firm Admins can invite staff."};
 const email=String(formData.get("email")??"").trim().toLowerCase();
 const role=String(formData.get("role"))==="FIRM_ADMIN"?"FIRM_ADMIN":"PREPARER";
 if(!email) return {error:"Email is required."};
 const existing=await db.select({id:users.id}).from(users).where(eq(users.email,email)).limit(1);
 if(existing.length) return {error:"A user with this email already exists."};
 const raw=randomBytes(32).toString("base64url");
 await db.insert(staffInvites).values({firmId:session.firmId,email,role,tokenHash:hash(raw),expiresAt:new Date(Date.now()+7*86400000),invitedByUserId:session.userId});
 const origin=String(formData.get("origin")??"").replace(/\/$/,"");
 return {inviteUrl:`${origin}/staff/invite/${raw}`};
}
