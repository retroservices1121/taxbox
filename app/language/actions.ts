"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
export async function setLanguage(formData:FormData){
 const locale=String(formData.get("locale"))==="es"?"es":"en";
 (await cookies()).set("taxbox_locale",locale,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:31536000});
 revalidatePath("/");
}
