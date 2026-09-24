"use server";
import { createHash, randomBytes } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { invites, workspaces } from "@/lib/db/schema";
import { withFirmScope } from "@/lib/db/scoped";
import { resolveStaffSession, SESSION_COOKIE } from "@/lib/auth/staff-auth";
const hash=(s:string)=>createHash("sha256").update(s).digest("hex");
export async function createClientInvite(_prev:{error?:string;inviteUrl?:string},formData:FormData){
 const session=await resolveStaffSession((await cookies()).get(SESSION_COOKIE)?.value);if(!session)redirect("/login");
 const workspaceId=String(formData.get("workspaceId")??"");
 const raw=randomBytes(32).toString("base64url");
 const email=await withFirmScope(session.firmId,async db=>{const [r]=await db.select({email:(await import("@/lib/db/schema")).clients.primaryEmail}).from(workspaces).innerJoin((await import("@/lib/db/schema")).clients,eq((await import("@/lib/db/schema")).clients.id,workspaces.clientId)).where(and(eq(workspaces.id,workspaceId),eq(workspaces.firmId,session.firmId))).limit(1);if(!r)throw new Error("TaxBox not found");await db.insert(invites).values({workspaceId,email:r.email,tokenHash:hash(raw),expiresAt:new Date(Date.now()+14*86400000)});return r.email;});
 const h=await headers();const origin=`${h.get("x-forwarded-proto")||"https"}://${h.get("host")||""}`;
 return{inviteUrl:`${origin}/client/invite/${raw}`};
}
