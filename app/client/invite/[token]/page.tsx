import { createHash } from "node:crypto";
import { and, eq, gt, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { checklistItems, clients, invites, workspaces, firms } from "@/lib/db/schema";

const hash=(s:string)=>createHash("sha256").update(s).digest("hex");
export const dynamic="force-dynamic";

export default async function Page({params}:{params:Promise<{token:string}>}){
 const {token}=await params;
 const tokenHash=hash(token);
 const [r]=await db.select({
  inviteId:invites.id,
  workspaceId:workspaces.id,
  inviteStatus:invites.status,
  openedAt:invites.openedAt,
  name:clients.displayName,
  year:workspaces.taxYear,
  type:workspaces.clientType,
  status:workspaces.status,
  firm:firms.name
 }).from(invites)
  .innerJoin(workspaces,eq(workspaces.id,invites.workspaceId))
  .innerJoin(clients,eq(clients.id,workspaces.clientId))
  .innerJoin(firms,eq(firms.id,workspaces.firmId))
  .where(and(eq(invites.tokenHash,tokenHash),inArray(invites.status,["PENDING","OPENED"]),gt(invites.expiresAt,new Date())))
  .limit(1);

 if(!r)return <main className="min-h-screen bg-neutral-100 px-4 py-8"><div className="mx-auto max-w-xl rounded-xl border bg-white p-5 sm:p-6"><div className="font-semibold">TaxBox</div><h1 className="mt-5 text-xl font-semibold">This link is no longer available</h1><p className="mt-2 text-neutral-600">Please contact your tax preparer for a new invitation.</p></div></main>;

 if(r.inviteStatus==="PENDING"){
  await db.update(invites).set({status:"OPENED",openedAt:r.openedAt??new Date()}).where(and(eq(invites.id,r.inviteId),eq(invites.status,"PENDING")));
 }

 const items=await db.select({id:checklistItems.id,label:checklistItems.label,status:checklistItems.status}).from(checklistItems).where(eq(checklistItems.workspaceId,r.workspaceId));
 const received=items.filter(i=>i.status==="RECEIVED").length;
 const missing=items.filter(i=>i.status==="EXPECTED"||i.status==="REQUESTED"||i.status==="REVIEW_REQUIRED");
 const friendlyStatus=r.status==="NOT_STARTED"?"Getting started":r.status==="COLLECTING"?"Collecting documents":r.status==="MISSING_ITEMS"?"Documents needed":r.status==="READY_FOR_PREPARATION"?"Ready for preparation":r.status.replaceAll("_"," ").toLowerCase();

 return <main className="min-h-screen bg-neutral-100 px-4 py-6 sm:px-6 sm:py-10">
  <div className="mx-auto max-w-3xl">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="font-semibold">TaxBox</div>
    <div className="rounded-full border bg-white px-3 py-1 text-sm capitalize">{friendlyStatus}</div>
   </div>
   <div className="mt-6 rounded-xl border bg-white p-5 sm:p-6">
    <p className="text-sm text-neutral-500">{r.firm} · {r.year} TaxBox</p>
    <h1 className="mt-2 text-2xl font-semibold">Welcome, {r.name}</h1>
    <p className="mt-2 text-neutral-600">Use your TaxBox to see what your preparer needs and keep your tax documents together.</p>
   </div>
   <div className="mt-5 grid gap-5 sm:grid-cols-2">
    <section className="rounded-xl border bg-white p-5">
     <h2 className="font-semibold">Your documents</h2>
     <div className="mt-4 text-3xl font-semibold">{received} / {items.length}</div>
     <p className="mt-1 text-sm text-neutral-500">documents received</p>
     {items.length===0?<p className="mt-5 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">Your preparer has not requested any documents yet.</p>:null}
    </section>
    <section className="rounded-xl border bg-white p-5">
     <h2 className="font-semibold">What you need to send</h2>
     {missing.length?<div className="mt-3 divide-y">{missing.map(item=><div key={item.id} className="py-3"><div className="font-medium">{item.label}</div><div className="mt-1 text-xs text-neutral-500">{item.status==="REQUESTED"?"Requested by your preparer":"Needed"}</div></div>)}</div>:<p className="mt-4 text-sm text-neutral-600">{items.length?"Nothing else is needed right now.":"Your document list will appear here when your preparer adds it."}</p>}
    </section>
   </div>
  </div>
 </main>;
}
