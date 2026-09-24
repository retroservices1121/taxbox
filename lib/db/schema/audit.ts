import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { uuidPk } from "./_shared";
import { firms, users } from "./firms";

export const auditEvents = pgTable("audit_events", {
  id: uuidPk(),
  firmId: uuid("firm_id").references(() => firms.id, { onDelete: "set null" }),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  workspaceId: uuid("workspace_id"),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: uuid("target_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
}, t => [
  index("audit_firm_idx").on(t.firmId),
  index("audit_workspace_idx").on(t.workspaceId),
  index("audit_created_idx").on(t.createdAt)
]);
