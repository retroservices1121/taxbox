"use client";
import { useRef } from "react";

export function LanguageSelectClient({locale}:{locale:"en"|"es"}){
 const formRef=useRef<HTMLFormElement>(null);
 return <form ref={formRef} action="/language" method="post">
  <select
   name="locale"
   defaultValue={locale}
   onChange={()=>formRef.current?.requestSubmit()}
   className="rounded-lg border bg-white px-2 py-2 text-sm text-black"
   aria-label="Language"
  >
   <option value="en">English</option>
   <option value="es">Español</option>
  </select>
 </form>;
}
