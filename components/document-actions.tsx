type Props = {
  documentId: string;
};

export function DocumentActions({ documentId }: Props) {
  return (
    <div className="flex gap-2">
      <a
        href={`/api/documents/${documentId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border px-3 py-2 text-sm font-medium"
      >
        View
      </a>
      <a
        href={`/api/documents/${documentId}?download=1`}
        className="rounded-lg border px-3 py-2 text-sm font-medium"
      >
        Download
      </a>
    </div>
  );
}
