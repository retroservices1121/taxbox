"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { completeTotp, SESSION_COOKIE } from "@/lib/auth/staff-auth";

export async function verifyAction(_:{error:string},form:FormData){
 const code=String(form.get("code")??"");
 if(!/^\d{6}$/.test(code))return{error:"Enter a 6-digit code."};
 const c=await cookies(),raw=c.get(SESSION_COOKIE)?.value;
 if(!raw)redirect("/login");
 const h=await headers();
 const r=await completeTotp(raw,code,{ip:h.get("x-forwarded-for")?.split(",")[0]?.trim()||undefined,userAgent:h.get("user-agent")||undefined});
 if(r.status==="invalid")return{error:"Invalid authentication code. Try again."};
 if(r.status==="expired"){c.delete(SESSION_COOKIE);return{error:"This verification session expired. Sign in again."};}
 c.set(SESSION_COOKIE,r.token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:43200});
 redirect("/firm");
}
