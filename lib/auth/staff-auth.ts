import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";
import { db } from "../db/client";
import { auditEvents, loginAttempts, staffSessions, users } from "../db/schema";
import { verifyPassword } from "../security/password";
import { decryptTotpSecret } from "../security/totp-secret";
import { verifyTotp } from "./totp";

const PENDING=300000,IDLE=1800000,ABSOLUTE=43200000,WINDOW=900000,MAX=5;
export const SESSION_COOKIE=process.env.NODE_ENV==="production"?"__Host-taxbox_session":"taxbox_session";
const hash=(s:string)=>createHash("sha256").update(s).digest("hex");
const newToken=()=>randomBytes(32).toString("base64url");
type Ctx={ip?:string;userAgent?:string};

async function failures(id:string){const [r]=await db.select({n:sql<number>`count(*)::int`}).from(loginAttempts).where(and(eq(loginAttempts.identifier,id),eq(loginAttempts.succeeded,false),gt(loginAttempts.createdAt,new Date(Date.now()-WINDOW))));return r?.n??0;}
async function attempt(id:string,ok:boolean,ip?:string){await db.insert(loginAttempts).values({identifier:id,succeeded:ok,ip:ip??null});}

export async function login(email:string,password:string,ctx:Ctx={}){
 const id=email.trim().toLowerCase();if(await failures(id)>=MAX)return{status:"throttled"} as const;
 const [u]=await db.select().from(users).where(eq(users.email,id)).limit(1);const ok=verifyPassword(password,u?.passwordHash??null);
 if(!u||!ok){await attempt(id,false,ctx.ip);if(u)await db.update(users).set({failedLoginCount:u.failedLoginCount+1,lockedUntil:u.failedLoginCount+1>=MAX?new Date(Date.now()+WINDOW):null}).where(eq(users.id,u.id));return{status:"invalid"} as const;}
 if(u.status!=="ACTIVE"||(u.lockedUntil&&u.lockedUntil>new Date()))return{status:"invalid"} as const;
 if(!u.totpSecretEnc)return{status:"setup_required"} as const;
 await attempt(id,true,ctx.ip);const raw=newToken(),now=Date.now();
 await db.insert(staffSessions).values({userId:u.id,tokenHash:hash(raw),expiresAt:new Date(now+PENDING),absoluteExpiresAt:new Date(now+PENDING),ip:ctx.ip??null,userAgent:ctx.userAgent??null});
 return{status:"totp_required",token:raw} as const;
}

export async function completeTotp(raw:string,code:string,ctx:Ctx={}){
 const [r]=await db.select({sid:staffSessions.id,uid:users.id,firmId:users.firmId,role:users.role,secret:users.totpSecretEnc,last:users.totpLastCounter,expires:staffSessions.expiresAt,revoked:staffSessions.revokedAt,verified:staffSessions.totpVerifiedAt}).from(staffSessions).innerJoin(users,eq(users.id,staffSessions.userId)).where(eq(staffSessions.tokenHash,hash(raw))).limit(1);
 if(!r||!r.firmId||!r.secret||r.revoked||r.verified||r.expires<=new Date())return{status:"expired"} as const;
 const secret=await decryptTotpSecret(r.secret,r.firmId,r.uid);
 const v=verifyTotp(secret,code,r.last);
 if(!v.valid){
   const [s]=await db.select({n:staffSessions.totpFailures}).from(staffSessions).where(eq(staffSessions.id,r.sid)).limit(1);
   const n=(s?.n??0)+1;
   await db.update(staffSessions).set({totpFailures:n,revokedAt:n>=MAX?new Date():null}).where(eq(staffSessions.id,r.sid));
   return n>=MAX?{status:"expired"} as const:{status:"invalid"} as const;
 }
 const spent=await db.update(users).set({totpLastCounter:v.counter!,failedLoginCount:0,lockedUntil:null,lastLoginAt:new Date()}).where(and(eq(users.id,r.uid),r.last==null?isNull(users.totpLastCounter):eq(users.totpLastCounter,r.last))).returning({id:users.id});
 if(!spent.length)return{status:"invalid"} as const;
 const fresh=newToken(),now=Date.now();
 await db.insert(staffSessions).values({userId:r.uid,tokenHash:hash(fresh),totpVerifiedAt:new Date(),expiresAt:new Date(now+IDLE),absoluteExpiresAt:new Date(now+ABSOLUTE),ip:ctx.ip??null,userAgent:ctx.userAgent??null});
 await db.update(staffSessions).set({revokedAt:new Date()}).where(eq(staffSessions.id,r.sid));
 await db.insert(auditEvents).values({firmId:r.firmId,actorUserId:r.uid,action:"LOGIN_SUCCESS",targetType:"USER",targetId:r.uid});
 return{status:"ok",token:fresh} as const;
}

export async function resolveStaffSession(raw:string|undefined,ctx:Ctx={}){
 if(!raw)return null;const [r]=await db.select({sid:staffSessions.id,uid:users.id,firmId:users.firmId,role:users.role,expires:staffSessions.expiresAt,absolute:staffSessions.absoluteExpiresAt,revoked:staffSessions.revokedAt,verified:staffSessions.totpVerifiedAt,status:users.status}).from(staffSessions).innerJoin(users,eq(users.id,staffSessions.userId)).where(eq(staffSessions.tokenHash,hash(raw))).limit(1);
 const now=new Date();if(!r||!r.firmId||r.revoked||!r.verified||r.expires<=now||r.absolute<=now||r.status!=="ACTIVE")return null;
 await db.update(staffSessions).set({lastSeenAt:now,expiresAt:new Date(Math.min(now.getTime()+IDLE,r.absolute.getTime()))}).where(eq(staffSessions.id,r.sid));
 return{kind:"staff" as const,userId:r.uid,firmId:r.firmId,role:r.role==="FIRM_ADMIN"?"FIRM_ADMIN" as const:"PREPARER" as const,ip:ctx.ip,userAgent:ctx.userAgent};
}

export async function logout(raw:string|undefined){if(!raw)return;await db.update(staffSessions).set({revokedAt:new Date()}).where(eq(staffSessions.tokenHash,hash(raw)));}
