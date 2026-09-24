"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { resolveStaffSession, SESSION_COOKIE } from "@/lib/auth/staff-auth";
import { clients, workspaces } from "@/lib/db/schema";
import { withFirmScope } from "@/lib/db/scoped";
export async function createTaxBox(formData:FormData){
 const session=await resolveStaffSession((await cookies()).get(SESSION_COOKIE)?.value);if(!session)redirect("/login");
 const name=String(formData.get("name")??"").trim(),email=String(formData.get("email")??"").trim().toLowerCase(),type=String(formData.get("type"))==="BUSINESS"?"BUSINESS":"INDIVIDUAL";
 if(!name||!email)throw new Error("Client name and email are required");
 const workspaceId=await withFirmScope(session.firmId,async db=>{const [client]=await db.insert(clients).values({firmId:session.firmId,type,displayName:name,primaryEmail:email}).returning({id:clients.id});const [workspace]=await db.insert(workspaces).values({firmId:session.firmId,clientId:client.id,taxYear:2026,clientType:type,priceCents:type==="BUSINESS"?2000:1000,activatedAt:new Date()}).returning({id:workspaces.id});return workspace.id;});
 redirect(`/firm/taxboxes/${workspaceId}`);
}