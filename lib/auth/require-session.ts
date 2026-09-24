import "server-only";
import type { NextRequest } from "next/server";
import type { Session } from "./session";
import { resolveStaffSession, SESSION_COOKIE } from "./staff-auth";

export class UnauthorizedError extends Error {
  constructor(){super("Authentication required");this.name="UnauthorizedError";}
}

export async function requireSession(request:NextRequest):Promise<Session>{
 const token=request.cookies.get(SESSION_COOKIE)?.value;
 const forwarded=request.headers.get("x-forwarded-for");
 const session=await resolveStaffSession(token,{ip:forwarded?.split(",")[0]?.trim()||request.headers.get("x-real-ip")||undefined,userAgent:request.headers.get("user-agent")||undefined});
 if(!session)throw new UnauthorizedError();
 return session;
}
