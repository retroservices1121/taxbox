import Link from "next/link";
import { LanguageSelector } from "@/components/language-selector";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-8"><div className="flex flex-wrap items-center justify-between gap-3"><div className="text-xl font-semibold">TaxBox</div><div className="flex flex-wrap items-center justify-end gap-2"><LanguageSelector/><Link href="/login" className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium">Log in</Link></div></div><div className="flex flex-1 items-center py-12 sm:py-16">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex rounded-full border border-neutral-700 px-3 py-1 text-sm text-neutral-300">
            Tax-document intake built for preparers
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">Your clients' tax documents. Finally organized.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
            TaxBox helps accounting firms collect, organize, request, and track client tax documents before preparation begins.
          </p>
          <div className="mt-8">
              <Link href="/login" className="inline-flex w-full items-center justify-center rounded-lg bg-white px-6 py-3 font-medium text-black sm:w-auto">Log in to TaxBox</Link>
            </div>
        </div>
        </div>
      </div>
    </main>
  );
}
