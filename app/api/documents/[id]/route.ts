import { NextRequest, NextResponse } from "next/server";
import { openTaxDocument, DocumentNotFoundError } from "@/lib/documents/access";
import { requireSession } from "@/lib/auth/require-session";

function safeFileName(name: string): string {
  return name.replace(/[\r\n"]/g, "_").slice(0, 180);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession(request);
    const { id } = await context.params;
    const download = request.nextUrl.searchParams.get("download") === "1";
    const document = await openTaxDocument(session, id, download ? "download" : "view");

    return new NextResponse(new Uint8Array(document.bytes), {
      status: 200,
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeFileName(document.fileName)}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox"
      }
    });
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[documents] failed to stream document", error);
    return NextResponse.json({ error: "Unable to open document" }, { status: 500 });
  }
}
