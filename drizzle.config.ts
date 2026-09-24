import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema/index.ts",
  out: "./drizzle/generated",
  dialect: "postgresql",
  dbCredentials: { url: process.env.ADMIN_DATABASE_URL ?? "" },
  verbose: true,
  strict: true
});
