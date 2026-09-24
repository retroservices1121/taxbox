import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { resolveStaffSession, SESSION_COOKIE } from "@/lib/auth/staff-auth";
import { getFirmDashboard } from "@/lib/firm/dashboard";
import { logoutAction } from "./logout";

export const dynamic="force-dynamic";

export default async function FirmPage(){
 const store=await cookies();
 const session=await resolveStaffSession(store.get(SESSION_COOKIE)?.value);
 if(!session) redirect("/login");
 const firmId=session.firmId;
 const {rows,counts}=await getFirmDashboard(firmId,2026);
 const total=rows.length;
 const ready=counts.READY_FOR_PREPARATION??0;
 const missing=counts.MISSING_ITEMS??0;
 const notStarted=counts.NOT_STARTED??0;
 return <main className="min-h-screen bg-neutral-100">
  <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><div><div className="text-xl font-semibold">TaxBox</div><div className="text-sm text-neutral-500">Firm dashboard · 2026</div></div><form action={logoutAction}><button className="rounded-lg border px-3 py-2 text-sm font-medium">Log out</button></form></div></header>
  <div className="mx-auto max-w-7xl px-6 py-8">
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["TaxBoxes",total],["Ready",ready],["Missing Items",missing],["Not Started",notStarted]].map(([l,v])=><div key={l} className="rounded-xl border bg-white p-5"><div className="text-sm text-neutral-500">{l}</div><div className="mt-2 text-3xl font-semibold">{v}</div></div>)}</div>
   <section className="mt-8 overflow-hidden rounded-xl border bg-white">
    <div className="flex items-center justify-between border-b p-5"><div><h1 className="text-xl font-semibold">2026 TaxBoxes</h1><p className="text-sm text-neutral-500">Real firm-scoped data protected by PostgreSQL RLS.</p></div><a href="/firm/new" className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">New TaxBox</a></div>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-neutral-50 text-neutral-500"><tr><th className="px-5 py-3">Client</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Updated</th></tr></thead><tbody>
    {rows.length?rows.map(r=><tr key={r.id} className="border-t"><td className="px-5 py-4 font-medium">{r.name}</td><td className="px-5 py-4">{r.type}</td><td className="px-5 py-4">{r.status.replaceAll("_"," ")}</td><td className="px-5 py-4">${(r.priceCents/100).toFixed(0)}</td><td className="px-5 py-4 text-neutral-500">{r.updatedAt.toLocaleDateString()}</td></tr>):<tr><td colSpan={5} className="px-5 py-12 text-center text-neutral-500">No TaxBoxes yet. Create the firm's first one.</td></tr>}
    </tbody></table></div>
   </section>
  </div>
 </main>;
}
