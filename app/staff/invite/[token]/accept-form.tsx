"use client";
import { useActionState } from "react";
import { acceptStaffInvite } from "./actions";

type AcceptState={error?:string;ok?:boolean;secret?:string;uri?:string};
const initialState:AcceptState={};

export function AcceptForm({token}:{token:string}){
 const [state,action,pending]=useActionState(acceptStaffInvite,initialState);
 if(state.ok)return <div><h1 className="text-2xl font-semibold">MFA setup</h1><p className="mt-3">Add this secret to your authenticator app, then sign in.</p><div className="mt-4 break-all rounded-lg bg-neutral-100 p-4 font-mono">{state.secret}</div><a href="/login" className="mt-6 inline-block rounded-lg bg-neutral-900 px-4 py-2 text-white">Continue to login</a></div>;
 return <form action={action} className="space-y-4"><input type="hidden" name="token" value={token}/><h1 className="text-2xl font-semibold">Join TaxBox</h1><p className="text-sm text-neutral-500">Create your staff account. MFA is required.</p><label className="block text-sm font-medium">Name<input name="name" required className="mt-1 w-full rounded-lg border px-3 py-2"/></label><label className="block text-sm font-medium">Password<input name="password" type="password" minLength={12} required className="mt-1 w-full rounded-lg border px-3 py-2"/></label>{state.error&&<p className="text-sm text-red-600">{state.error}</p>}<button disabled={pending} className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-white">{pending?"Creating...":"Create staff account"}</button></form>
}
