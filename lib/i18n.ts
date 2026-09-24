import "server-only";
import { cookies } from "next/headers";

export type Locale = "en" | "es";
export async function getLocale(): Promise<Locale> {
  const value=(await cookies()).get("taxbox_locale")?.value;
  return value==="es"?"es":"en";
}
export const messages={
 en:{
  dashboard:"Firm dashboard",taxboxes:"TaxBoxes",ready:"Ready",missing:"Missing Items",notStarted:"Not Started",
  newTaxBox:"New TaxBox",staff:"Staff",logout:"Log out",client:"Client",type:"Type",status:"Status",price:"Price",updated:"Updated",
  createTaxBox:"Create TaxBox",clientName:"Client name",email:"Email",taxBoxType:"TaxBox type",activate:"Activate 2026 TaxBox",
  individual:"Individual",business:"Business",backDashboard:"Dashboard",language:"Language"
 },
 es:{
  dashboard:"Panel de la firma",taxboxes:"TaxBoxes",ready:"Listos",missing:"Documentos faltantes",notStarted:"No iniciados",
  newTaxBox:"Nuevo TaxBox",staff:"Personal",logout:"Cerrar sesión",client:"Cliente",type:"Tipo",status:"Estado",price:"Precio",updated:"Actualizado",
  createTaxBox:"Crear TaxBox",clientName:"Nombre del cliente",email:"Correo electrónico",taxBoxType:"Tipo de TaxBox",activate:"Activar TaxBox 2026",
  individual:"Individual",business:"Negocio",backDashboard:"Panel",language:"Idioma"
 }
} as const;
export async function t(){return messages[await getLocale()];}
