import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { uuidPk } from "./_shared";
import { users } from "./firms";

export const staffSessions = pgTable("staff_sessions", {
  id: uuidPk(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  totpVerifiedAt: timestamp("totp_verified_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  absoluteExpiresAt: timestamp("absolute_expires_at", { withTimezone: true }).notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, t => [index("staff_sessions_user_idx").on(t.userId), index("staff_sessions_expiry_idx").on(t.expiresAt)]);

export const loginAttempts = pgTable("login_attempts", {
  id: uuidPk(),
  identifier: text("identifier").notNull(),
  ip: text("ip"),
  succeeded: boolean("succeeded").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, t => [index("login_attempts_identifier_idx").on(t.identifier, t.createdAt)]);
