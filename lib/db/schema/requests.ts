import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps, uuidPk } from "./_shared";
import { checklistItems } from "./checklists";
import { users } from "./firms";
import { workspaces } from "./workspaces";

export const documentRequests = pgTable("document_requests", {
  id: uuidPk(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  checklistItemId: uuid("checklist_item_id").references(() => checklistItems.id, { onDelete: "set null" }),
  requestedByUserId: uuid("requested_by_user_id").references(() => users.id, { onDelete: "set null" }),
  message: text("message"),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  fulfilledAt: timestamp("fulfilled_at", { withTimezone: true }),
  ...timestamps
}, t => [index("requests_workspace_idx").on(t.workspaceId)]);
