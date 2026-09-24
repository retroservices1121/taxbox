import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { accountStatus, userRole } from "./enums";
import { bytea, timestamps, uuidPk } from "./_shared";

export const firms = pgTable("firms", {
  id: uuidPk(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  contactEmail: text("contact_email"),
  dekCiphertext: bytea("dek_ciphertext"),
  dekKeyId: text("dek_key_id"),
  dekDestroyedAt: timestamp("dek_destroyed_at", { withTimezone: true }),
  status: accountStatus("status").notNull().default("ACTIVE"),
  ...timestamps
});

export const users = pgTable("users", {
  id: uuidPk(),
  firmId: uuid("firm_id").references(() => firms.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: userRole("role").notNull(),
  passwordHash: text("password_hash"),
  totpSecretEnc: text("totp_secret_enc"),
  status: accountStatus("status").notNull().default("ACTIVE"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps
}, t => [index("users_firm_idx").on(t.firmId)]);
