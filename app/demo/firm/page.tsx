import Link from "next/link";

const clients = [
  { name: "John Smith", type: "Individual", progress: "8/11", missing: 3, status: "Missing Items", updated: "Today" },
  { name: "Maria Rodriguez", type: "Individual", progress: "10/10", missing: 0, status: "Ready for Preparation", updated: "Today" },
  { name: "Smith Plumbing LLC", type: "Business", progress: "12/16", missing: 4, status: "Collecting", updated: "Yesterday" },
  { name: "Coastal Services Inc.", type: "Business", progress: "16/16", missing: 0, status: "In Preparation", updated: "Yesterday" }
];

export default function FirmDemo() {
  return (
    <main className="min-h-screen bg-neutral-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-xl font-semibold">TaxBox</div>
            <div className="text-sm text-neutral-500">ABC Tax & Accounting</div>
          </div>
          <Link href="/" className="text-sm text-neutral-600">Exit demo</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["TaxBoxes", "945+"],
            ["Ready", "187"],
            ["Missing Items", "103"],
            ["Not Started", "64"]
          ].map(([label,value]) => (
            <div key={label} className="rounded-xl border bg-white p-5">
              <div className="text-sm text-neutral-500">{label}</div>
              <div className="mt-2 text-3xl font-semibold">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border bg-white">
          <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold">2026 TaxBoxes</h1>
              <p className="text-sm text-neutral-500">Search, filter, request documents, and track readiness.</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg border px-4 py-2 text-sm">Import CSV</button>
              <button className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white">New TaxBox</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-5 py-3">Client</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Checklist</th><th className="px-5 py-3">Missing</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.name} className="border-t">
                    <td className="px-5 py-4 font-medium">{client.name}</td>
                    <td className="px-5 py-4">{client.type}</td>
                    <td className="px-5 py-4">{client.progress}</td>
                    <td className="px-5 py-4">{client.missing}</td>
                    <td className="px-5 py-4">{client.status}</td>
                    <td className="px-5 py-4 text-neutral-500">{client.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
