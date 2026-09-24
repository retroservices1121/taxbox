import { getLocale } from "@/lib/i18n";
import { setLanguage } from "@/app/language/actions";
export async function LanguageSelector(){
 const locale=await getLocale();
 return <form action={setLanguage}><select name="locale" defaultValue={locale} onChange={undefined} className="rounded-lg border bg-white px-2 py-2 text-sm"><option value="en">English</option><option value="es">Español</option></select><button className="ml-2 rounded-lg border px-2 py-2 text-sm">OK</button></form>;
}
