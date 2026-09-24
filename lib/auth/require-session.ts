import "server-only";
import type { NextRequest } from "next/server";
import { resolveStaffSession, SESSION_COOKIE } from "./staff-auth";
import type { Session } from "./session";
export class UnauthorizedError extends Error{constructor(){super("Authentication required");this.name="UnauthorizedError";}}
export async function requireSession(request:NextRequest):Promise<Session>{const raw=request.cookies.get(SESSION_COOKIE)?.value;const ip=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||request.headers.get("x-real-ip")||undefined;const userAgent=request.headers.get("user-agent")||undefined;const session=await resolveStaffSession(raw,{ip,userAgent});if(!session)throw new UnauthorizedError();return session;}
