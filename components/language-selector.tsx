import { getLocale } from "@/lib/i18n";
import { LanguageSelectClient } from "./language-select-client";

export async function LanguageSelector(){
 const locale=await getLocale();
 return <LanguageSelectClient locale={locale}/>;
}
