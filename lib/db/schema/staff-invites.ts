import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { inviteStatus, userRole } from "./enums";
import { timestamps, uuidPk } from "./_shared";
import { firms, users } from "./firms";

export const staffInvites = pgTable("staff_invites", {
  id: uuidPk(),
  firmId: uuid("firm_id").notNull().references(() => firms.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: userRole("role").notNull().default("PREPARER"),
  tokenHash: text("token_hash").notNull().unique(),
  status: inviteStatus("status").notNull().default("PENDING"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  invitedByUserId: uuid("invited_by_user_id").references(() => users.id, { onDelete: "set null" }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps
}, t => [index("staff_invites_firm_idx").on(t.firmId), index("staff_invites_email_idx").on(t.email)]);
