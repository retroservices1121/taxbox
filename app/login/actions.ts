"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { login, SESSION_COOKIE } from "@/lib/auth/staff-auth";
export async function loginAction(_:{error:string},form:FormData){const email=String(form.get("email")??""),password=String(form.get("password")??"");if(!email||!password)return{error:"Invalid email or password."};const h=await headers(),result=await login(email,password,{ip:h.get("x-forwarded-for")?.split(",")[0]?.trim()||undefined,userAgent:h.get("user-agent")||undefined});if(result.status==="totp_required"){const c=await cookies();c.set(SESSION_COOKIE,result.token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:300});redirect("/login/verify");}return{error:result.status==="throttled"?"Too many attempts. Try again later.":"Invalid email or password."};}
