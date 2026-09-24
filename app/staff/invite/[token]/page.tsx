import { AcceptForm } from "./accept-form";
export default async function Page({params}:{params:Promise<{token:string}>}){const {token}=await params;return <main className="min-h-screen bg-neutral-100 px-4 py-8 sm:px-6 sm:py-12"><div className="mx-auto max-w-md rounded-xl border bg-white p-4 sm:p-6"><div className="mb-6 font-semibold">TaxBox</div><AcceptForm token={token}/></div></main>}
