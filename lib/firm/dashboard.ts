import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { clients, workspaces } from "@/lib/db/schema";
import { withFirmScope } from "@/lib/db/scoped";

export async function getFirmDashboard(firmId:string,taxYear=2026){
 return withFirmScope(firmId,async db=>{
  const rows=await db.select({
   id:workspaces.id,name:clients.displayName,type:workspaces.clientType,status:workspaces.status,
   priceCents:workspaces.priceCents,updatedAt:workspaces.updatedAt
  }).from(workspaces).innerJoin(clients,eq(clients.id,workspaces.clientId))
   .where(and(eq(workspaces.firmId,firmId),eq(workspaces.taxYear,taxYear)))
   .orderBy(desc(workspaces.updatedAt)).limit(100);
  const counts=await db.select({status:workspaces.status,count:sql<number>`count(*)::int`})
   .from(workspaces).where(and(eq(workspaces.firmId,firmId),eq(workspaces.taxYear,taxYear))).groupBy(workspaces.status);
  return {rows,counts:Object.fromEntries(counts.map(x=>[x.status,x.count]))};
 });
}
