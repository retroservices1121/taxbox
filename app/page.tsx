import Link from "next/link";
import { LanguageSelector } from "@/components/language-selector";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8"><div className="flex items-center justify-between"><div className="text-xl font-semibold">TaxBox</div><div className="flex items-center gap-3"><LanguageSelector/><Link href="/login" className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium">Log in</Link></div></div><div className="flex flex-1 items-center py-16">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex rounded-full border border-neutral-700 px-3 py-1 text-sm text-neutral-300">
            Tax-document intake built for preparers
          </div>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">Your clients' tax documents. Finally organized.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
            TaxBox helps accounting firms collect, organize, request, and track client tax documents before preparation begins.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/demo/firm" className="rounded-lg bg-white px-5 py-3 font-medium text-black">View firm dashboard</Link>
            <Link href="/demo/client" className="rounded-lg border border-neutral-700 px-5 py-3 font-medium">View client TaxBox</Link>
          </div>
          <p className="mt-8 text-sm text-neutral-500">Individual TaxBox $10 per season · Business TaxBox $20 per season</p>
        </div>
        </div>
      </div>
    </main>
  );
}
