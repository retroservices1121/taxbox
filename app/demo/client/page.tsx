import Link from "next/link";

const checklist = [
  ["W-2 — US Marine Management LLC", true],
  ["W-2 — Spouse", true],
  ["Mortgage Form 1098", true],
  ["Property tax record", true],
  ["Form 1098-T — Student 1", true],
  ["Form 1098-T — Student 2", false],
  ["Brokerage consolidated 1099", false],
  ["Charitable contribution records", false]
] as const;

export default function ClientDemo() {
  const done = checklist.filter(([, complete]) => complete).length;
  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="mx-auto max-w-2xl px-5 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xl font-semibold">TaxBox</div>
          <Link href="/" className="text-sm text-neutral-600">Exit demo</Link>
        </div>

        <section className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-medium text-neutral-500">ABC Tax & Accounting</div>
          <h1 className="mt-2 text-3xl font-semibold">Your 2026 TaxBox</h1>
          <p className="mt-2 text-neutral-600">Upload your tax documents as you receive them. Your preparer can see what has arrived and what is still missing.</p>

          <div className="mt-6 rounded-xl bg-neutral-950 p-5 text-white">
            <div className="text-sm text-neutral-400">Checklist progress</div>
            <div className="mt-1 text-3xl font-semibold">{done} of {checklist.length} complete</div>
          </div>

          <button className="mt-5 w-full rounded-xl bg-neutral-900 px-5 py-4 font-medium text-white">Upload a document</button>

          <div className="mt-7">
            <h2 className="font-semibold">Your checklist</h2>
            <div className="mt-3 divide-y rounded-xl border">
              {checklist.map(([label, complete]) => (
                <div key={label} className="flex items-center gap-3 px-4 py-4">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${complete ? "bg-neutral-900 text-white" : "border text-neutral-400"}`}>
                    {complete ? "✓" : "!"}
                  </div>
                  <div className="flex-1">{label}</div>
                  <div className="text-sm text-neutral-500">{complete ? "Received" : "Needed"}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
