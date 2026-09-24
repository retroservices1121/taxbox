import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { staffInvites, users } from "@/lib/db/schema";
import { resolveStaffSession, SESSION_COOKIE } from "@/lib/auth/staff-auth";
import { InviteStaffForm } from "./invite-form";
export const dynamic="force-dynamic";
export default async function StaffPage(){
 const session=await resolveStaffSession((await cookies()).get(SESSION_COOKIE)?.value); if(!session) redirect("/login");
 const people=await db.select({id:users.id,name:users.name,email:users.email,role:users.role,status:users.status,lastLoginAt:users.lastLoginAt}).from(users).where(eq(users.firmId,session.firmId)).orderBy(users.name);
 const pending=await db.select({id:staffInvites.id,email:staffInvites.email,role:staffInvites.role,status:staffInvites.status,expiresAt:staffInvites.expiresAt}).from(staffInvites).where(eq(staffInvites.firmId,session.firmId)).orderBy(desc(staffInvites.createdAt));
 const h=await headers(); const origin=`${h.get("x-forwarded-proto")||"https"}://${h.get("host")||""}`;
 return <main className="min-h-screen bg-neutral-100 px-6 py-10"><div className="mx-auto max-w-5xl"><a href="/firm" className="text-sm text-neutral-500">← Dashboard</a><h1 className="mt-4 text-2xl font-semibold">Staff</h1><p className="mt-1 text-neutral-500">Manage who can access this firm's TaxBox dashboard.</p>{session.role==="FIRM_ADMIN"&&<div className="mt-6"><InviteStaffForm origin={origin}/></div>}<div className="mt-6 rounded-xl border bg-white"><div className="border-b p-5 font-semibold">Active staff</div>{people.map(p=><div key={p.id} className="grid gap-2 border-b px-5 py-4 sm:grid-cols-4"><span className="font-medium">{p.name}</span><span>{p.email}</span><span>{p.role.replaceAll("_"," ")}</span><span>{p.status}</span></div>)}</div>{pending.length>0&&<div className="mt-6 rounded-xl border bg-white"><div className="border-b p-5 font-semibold">Invitations</div>{pending.map(i=><div key={i.id} className="grid gap-2 border-b px-5 py-4 sm:grid-cols-4"><span>{i.email}</span><span>{i.role.replaceAll("_"," ")}</span><span>{i.status}</span><span>Expires {i.expiresAt.toLocaleDateString()}</span></div>)}</div>}</div></main>;
}
