"use client";
import { useActionState } from "react";
import { saveQuestionnaire, uploadClientDocument } from "./actions";

const initial:{error?:string;ok?:boolean}={};
const uploadInitial:{error?:string;ok?:boolean;message?:string}={};

function YesNo({name,label}:{name:string;label:string}){
 return <label className="block"><span className="text-sm font-medium">{label}</span><select name={name} defaultValue="no" className="mt-1 w-full rounded-lg border px-3 py-3"><option value="no">No</option><option value="yes">Yes</option></select></label>;
}

export function Questionnaire({token,type}:{token:string;type:"INDIVIDUAL"|"BUSINESS"}){
 const [state,action,pending]=useActionState(saveQuestionnaire,initial);
 if(state.ok)return <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">Your document list is ready. Refresh this page to view it.</div>;
 return <form action={action} className="space-y-4"><input type="hidden" name="token" value={token}/>
  {type==="INDIVIDUAL"?<>
   <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">How many W-2s do you have?<input name="taxpayerW2Count" type="number" min="0" max="20" defaultValue="0" className="mt-1 w-full rounded-lg border px-3 py-3"/></label><label className="block text-sm font-medium">Spouse W-2s<input name="spouseW2Count" type="number" min="0" max="20" defaultValue="0" className="mt-1 w-full rounded-lg border px-3 py-3"/></label></div>
   <YesNo name="homeowner" label="Did you pay mortgage interest?"/><YesNo name="brokerage" label="Did you have investment or brokerage activity?"/>
   <YesNo name="retirementIncome" label="Did you receive retirement income?"/><YesNo name="socialSecurityIncome" label="Did you receive Social Security income?"/>
   <YesNo name="selfEmployment" label="Did you have self-employment income?"/><YesNo name="rentalProperty" label="Did you have rental property income or expenses?"/>
   <YesNo name="charitableGiving" label="Do you have charitable contribution records?"/>
   <label className="block text-sm font-medium">College students with Form 1098-T<input name="collegeDependentCount" type="number" min="0" max="20" defaultValue="0" className="mt-1 w-full rounded-lg border px-3 py-3"/></label>
  </>:<>
   <YesNo name="employees" label="Did the business have employees?"/><YesNo name="contractors" label="Did the business pay contractors?"/>
   <YesNo name="bankAccounts" label="Do you have business bank statements to provide?"/><YesNo name="businessExpenses" label="Do you have business expense records?"/>
   <YesNo name="receivedK1" label="Did the business receive a Schedule K-1?"/>
  </>}
  {state.error&&<p className="text-sm text-red-600">{state.error}</p>}
  <button disabled={pending} className="w-full rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white">{pending?"Saving...":"Create my document list"}</button>
 </form>;
}

export function ClientUpload({token}:{token:string}){
 const [state,action,pending]=useActionState(uploadClientDocument,uploadInitial);
 return <form action={action} className="mt-4 space-y-3"><input type="hidden" name="token" value={token}/>
  <label className="block text-sm font-medium">Choose a tax document<input name="file" type="file" accept=".pdf,image/jpeg,image/png,image/webp" required className="mt-2 block w-full rounded-lg border bg-white p-3 text-sm"/></label>
  <p className="text-xs text-neutral-500">PDF, JPG, PNG or WebP. Maximum 25 MB.</p>
  {state.error&&<p className="text-sm text-red-600">{state.error}</p>}{state.message&&<p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{state.message}</p>}
  <button disabled={pending} className="w-full rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white">{pending?"Uploading...":"Upload document"}</button>
 </form>;
}
