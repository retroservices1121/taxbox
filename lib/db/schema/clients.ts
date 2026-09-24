import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { clientType } from "./enums";
import { timestamps, uuidPk } from "./_shared";
import { firms, users } from "./firms";

export const clients = pgTable("clients", {
  id: uuidPk(),
  firmId: uuid("firm_id").notNull().references(() => firms.id, { onDelete: "cascade" }),
  type: clientType("type").notNull(),
  displayName: text("display_name").notNull(),
  primaryEmail: text("primary_email").notNull(),
  phone: text("phone"),
  externalId: text("external_id"),
  assignedStaffUserId: uuid("assigned_staff_user_id").references(() => users.id, { onDelete: "set null" }),
  ...timestamps
}, t => [
  index("clients_firm_idx").on(t.firmId),
  index("clients_assigned_staff_idx").on(t.assignedStaffUserId)
]);
