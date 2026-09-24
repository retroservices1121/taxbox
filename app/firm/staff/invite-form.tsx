"use client";
import { useActionState } from "react";
import { inviteStaff } from "./actions";

type InviteState={error?:string;inviteUrl?:string};
const initialState:InviteState={};

export function InviteStaffForm({origin}:{origin:string}){
 const [state,action,pending]=useActionState(inviteStaff,initialState);
 return <div className="rounded-xl border bg-white p-4 sm:p-5"><h2 className="font-semibold">Invite staff</h2><p className="mt-1 text-sm text-neutral-500">Create a secure 7-day onboarding link.</p><form action={action} className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_auto]"><input type="hidden" name="origin" value={origin}/><input name="email" type="email" required placeholder="staff@example.com" className="min-w-0 rounded-lg border px-3 py-3 sm:py-2"/><select name="role" className="min-w-0 rounded-lg border px-3 py-3 sm:py-2"><option value="PREPARER">Preparer</option><option value="FIRM_ADMIN">Firm Admin</option></select><button disabled={pending} className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-white sm:w-auto sm:py-2">{pending?"Creating...":"Create invite"}</button></form>{state.error&&<p className="mt-3 text-sm text-red-600">{state.error}</p>}{state.inviteUrl&&<div className="mt-4 rounded-lg bg-neutral-50 p-3 text-sm"><div className="font-medium">Invitation link</div><div className="mt-1 break-all">{state.inviteUrl}</div><p className="mt-2 text-neutral-500">Send this link to the staff member. Email delivery will be wired to the production email provider next.</p></div>}</div>;
}
