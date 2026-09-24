"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { clients, workspaces } from "@/lib/db/schema";
import { withFirmScope } from "@/lib/db/scoped";

export async function createTaxBox(formData:FormData){
 const store=await cookies();
 const firmId=store.get("taxbox_dev_firm")?.value;
 if(!firmId) redirect("/login");
 const name=String(formData.get("name")??"").trim();
 const email=String(formData.get("email")??"").trim().toLowerCase();
 const type=String(formData.get("type"))==="BUSINESS"?"BUSINESS":"INDIVIDUAL";
 if(!name||!email)throw new Error("Client name and email are required");
 await withFirmScope(firmId,async db=>{
  const [client]=await db.insert(clients).values({firmId,type,displayName:name,primaryEmail:email}).returning({id:clients.id});
  await db.insert(workspaces).values({firmId,clientId:client.id,taxYear:2026,clientType:type,priceCents:type==="BUSINESS"?2000:1000,activatedAt:new Date()});
 });
 redirect("/firm");
}
