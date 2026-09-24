import { index, integer, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { clientType, workspaceStatus } from "./enums";
import { timestamps, uuidPk } from "./_shared";
import { clients } from "./clients";
import { firms, users } from "./firms";

export const workspaces = pgTable("workspaces", {
  id: uuidPk(),
  firmId: uuid("firm_id").notNull().references(() => firms.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  taxYear: integer("tax_year").notNull(),
  clientType: clientType("client_type").notNull(),
  status: workspaceStatus("status").notNull().default("NOT_STARTED"),
  priceCents: integer("price_cents").notNull(),
  activatedAt: timestamp("activated_at", { withTimezone: true }),
  assignedStaffUserId: uuid("assigned_staff_user_id").references(() => users.id, { onDelete: "set null" }),
  readyAt: timestamp("ready_at", { withTimezone: true }),
  filedAt: timestamp("filed_at", { withTimezone: true }),
  ...timestamps
}, t => [
  uniqueIndex("workspace_client_year_uq").on(t.clientId, t.taxYear),
  index("workspaces_firm_year_idx").on(t.firmId, t.taxYear),
  index("workspaces_status_idx").on(t.status)
]);
