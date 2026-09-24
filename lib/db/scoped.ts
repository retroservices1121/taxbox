import "server-only";
import postgres from "postgres";
import { sql as drizzleSql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

type ScopedDb = ReturnType<typeof drizzle<typeof schema>>;

export async function withFirmScope<T>(
  firmId: string,
  fn: (tx: ScopedDb) => Promise<T>
): Promise<T> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required at runtime");

  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client, { schema });

  try {
    return await db.transaction(async tx => {
      await tx.execute(
        drizzleSql`select set_config('app.firm_id', ${firmId}, true)`
      );
      return await fn(tx as unknown as ScopedDb);
    });
  } finally {
    await client.end();
  }
}
