import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { inviteStatus } from "./enums";
import { timestamps, uuidPk } from "./_shared";
import { workspaces } from "./workspaces";

export const invites = pgTable("invites", {
  id: uuidPk(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  status: inviteStatus("status").notNull().default("PENDING"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps
}, t => [index("invites_workspace_idx").on(t.workspaceId)]);
