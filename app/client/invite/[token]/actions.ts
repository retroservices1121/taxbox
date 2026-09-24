"use server";

import { createHash } from "node:crypto";
import { and, eq, gt, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { checklistItems, clients, documents, firms, invites, workspaces } from "@/lib/db/schema";
import { buildBusinessChecklist, buildIndividualChecklist } from "@/lib/checklists";
import { processTaxDocumentUpload } from "@/lib/documents/upload";
import { getDocumentIntelligenceProvider } from "@/lib/document-intelligence/openai";

const hash=(s:string)=>createHash("sha256").update(s).digest("hex");

async function resolveClient(token:string){
 const [row]=await db.select({
  inviteId:invites.id,workspaceId:workspaces.id,firmId:workspaces.firmId,year:workspaces.taxYear,
  type:workspaces.clientType,name:clients.displayName,firm:firms.name
 }).from(invites)
 .innerJoin(workspaces,eq(workspaces.id,invites.workspaceId))
 .innerJoin(clients,eq(clients.id,workspaces.clientId))
 .innerJoin(firms,eq(firms.id,workspaces.firmId))
 .where(and(eq(invites.tokenHash,hash(token)),inArray(invites.status,["PENDING","OPENED"]),gt(invites.expiresAt,new Date())))
 .limit(1);
 if(!row)throw new Error("This TaxBox link is no longer available.");
 return row;
}

const yes=(f:FormData,key:string)=>String(f.get(key)??"")==="yes";
const count=(f:FormData,key:string)=>Math.max(0,Math.min(20,Number(f.get(key)??0)||0));

export async function saveQuestionnaire(_prev:{error?:string;ok?:boolean},formData:FormData):Promise<{error?:string;ok?:boolean}>{
 try{
  const token=String(formData.get("token")??""); const ctx=await resolveClient(token);
  const existing=await db.select({id:checklistItems.id}).from(checklistItems).where(eq(checklistItems.workspaceId,ctx.workspaceId)).limit(1);
  if(existing.length)return {error:"Your document list has already been created. Contact your preparer if something needs to change."};
  const items=ctx.type==="BUSINESS"?buildBusinessChecklist({
   employees:yes(formData,"employees"),contractors:yes(formData,"contractors"),bankAccounts:yes(formData,"bankAccounts"),
   businessExpenses:yes(formData,"businessExpenses"),receivedK1:yes(formData,"receivedK1")
  }):buildIndividualChecklist({
   taxpayerW2Count:count(formData,"taxpayerW2Count"),spouseW2Count:count(formData,"spouseW2Count"),
   homeowner:yes(formData,"homeowner"),brokerage:yes(formData,"brokerage"),collegeDependentCount:count(formData,"collegeDependentCount"),
   charitableGiving:yes(formData,"charitableGiving"),retirementIncome:yes(formData,"retirementIncome"),
   socialSecurityIncome:yes(formData,"socialSecurityIncome"),selfEmployment:yes(formData,"selfEmployment"),rentalProperty:yes(formData,"rentalProperty")
  });
  if(items.length)await db.insert(checklistItems).values(items.map(i=>({workspaceId:ctx.workspaceId,key:i.key,label:i.label,expectedDocumentType:i.expectedDocumentType,status:"EXPECTED" as const})));
  await db.update(workspaces).set({status:items.length?"MISSING_ITEMS":"COLLECTING",updatedAt:new Date()}).where(eq(workspaces.id,ctx.workspaceId));
  return {ok:true};
 }catch(e){return {error:e instanceof Error?e.message:"We couldn't save your answers."};}
}

export async function uploadClientDocument(_prev:{error?:string;ok?:boolean;message?:string},formData:FormData):Promise<{error?:string;ok?:boolean;message?:string}>{
 try{
  const token=String(formData.get("token")??""); const ctx=await resolveClient(token);
  const file=formData.get("file"); if(!(file instanceof File)||file.size===0)return {error:"Choose a document to upload."};
  const bytes=Buffer.from(await file.arrayBuffer());
  const uploaded=await processTaxDocumentUpload({firmId:ctx.firmId,workspaceId:ctx.workspaceId,expectedTaxYear:ctx.year,fileName:file.name,mimeType:file.type,bytes,intelligence:getDocumentIntelligenceProvider()});
  const cl=uploaded.classification;
  const [doc]=await db.insert(documents).values({
   workspaceId:ctx.workspaceId,storageKey:uploaded.objectKey,originalFileName:file.name,displayName:cl.suggestedDisplayName,
   mimeType:file.type,encryptedSizeBytes:uploaded.encryptedSizeBytes,sha256:uploaded.sha256,documentType:cl.documentType,
   taxYear:cl.taxYear,issuer:cl.issuer,confidence:cl.confidence,reviewStatus:cl.reviewRequired?"REVIEW_REQUIRED":"AUTO_MATCHED",wrongYearFlag:cl.possibleWrongYear
  }).returning({id:documents.id});
  const [match]=await db.select({id:checklistItems.id}).from(checklistItems).where(and(eq(checklistItems.workspaceId,ctx.workspaceId),eq(checklistItems.expectedDocumentType,cl.documentType),inArray(checklistItems.status,["EXPECTED","REQUESTED","REVIEW_REQUIRED"]))).limit(1);
  if(match)await db.update(checklistItems).set({status:"RECEIVED",receivedDocumentId:doc.id,updatedAt:new Date()}).where(eq(checklistItems.id,match.id));
  const remaining=await db.select({id:checklistItems.id}).from(checklistItems).where(and(eq(checklistItems.workspaceId,ctx.workspaceId),inArray(checklistItems.status,["EXPECTED","REQUESTED","REVIEW_REQUIRED"]))).limit(1);
  await db.update(workspaces).set({status:remaining.length?"MISSING_ITEMS":"READY_FOR_PREPARATION",readyAt:remaining.length?null:new Date(),updatedAt:new Date()}).where(eq(workspaces.id,ctx.workspaceId));
  return {ok:true,message:match?"Document received and matched to your list.":"Document received. Your preparer can review it."};
 }catch(e){return {error:e instanceof Error?e.message:"We couldn't upload that document."};}
}
