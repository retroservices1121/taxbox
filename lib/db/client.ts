import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

/**
 * Next.js imports route modules while collecting page data during `next build`.
 * Creating the postgres-js client does not open a connection until a query runs,
 * so a non-routable build-only URL lets compilation complete without exposing or
 * requiring production database credentials in the image build.
 *
 * At runtime, real database operations still require DATABASE_URL.
 */
const url = process.env.DATABASE_URL ?? "postgresql://taxbox_build:taxbox_build@127.0.0.1:5432/taxbox_build";

const client = postgres(url, {
  max: 10,
  prepare: false,
  connect_timeout: 10
});

export const db = drizzle(client, { schema });
