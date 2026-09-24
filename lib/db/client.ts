import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "postgresql://taxbox_build:taxbox_build@127.0.0.1:5432/taxbox_build";
const client = postgres(url, { max: 10, prepare: false, connect_timeout: 10 });
export const db = drizzle(client, { schema });
