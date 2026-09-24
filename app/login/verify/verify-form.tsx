"use client";
import { useActionState } from "react";
import { verifyAction } from "./actions";
export default function VerifyForm(){const [s,a,p]=useActionState(verifyAction,{error:""});return <form action={a} className="mt-7 space-y-4">{s.error?<div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{s.error}</div>:null}<label className="block text-sm font-medium">Authentication code<input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required className="mt-1 w-full rounded-lg border px-3 py-3 tracking-[0.4em]"/></label><button disabled={p} className="w-full rounded-lg bg-neutral-950 px-4 py-3 font-medium text-white">{p?"Verifying…":"Verify and sign in"}</button></form>;}
