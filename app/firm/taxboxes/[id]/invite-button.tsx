"use client";
import {useActionState} from "react";
import {createClientInvite} from "./actions";

type InviteState={error?:string;inviteUrl?:string};
const initialState:InviteState={};

export function InviteButton({workspaceId}:{workspaceId:string}){
 const [s,a,p]=useActionState(createClientInvite,initialState);
 return <div><form action={a}><input type="hidden" name="workspaceId" value={workspaceId}/><button disabled={p} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">{p?"Creating...":"Create client invitation"}</button></form>{s.error&&<p className="mt-3 text-sm text-red-600">{s.error}</p>}{s.inviteUrl&&<div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm"><div className="font-medium">Secure client link</div><div className="mt-1 break-all">{s.inviteUrl}</div><p className="mt-2 text-neutral-500">Send this link to the client. It expires in 14 days.</p></div>}</div>
}
