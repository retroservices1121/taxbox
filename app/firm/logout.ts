"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logout, SESSION_COOKIE } from "@/lib/auth/staff-auth";
export async function logoutAction(){const c=await cookies();await logout(c.get(SESSION_COOKIE)?.value);c.delete(SESSION_COOKIE);redirect("/login");}
