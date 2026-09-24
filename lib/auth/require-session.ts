import "server-only";
import type { NextRequest } from "next/server";
import type { Session } from "./session";

/**
 * This is intentionally fail-closed until the hardened TaxBox session store
 * is wired in. Never derive firmId/workspaceId from query parameters or headers.
 */
export class UnauthorizedError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "UnauthorizedError";
  }
}

export async function requireSession(_request: NextRequest): Promise<Session> {
  throw new UnauthorizedError();
}
