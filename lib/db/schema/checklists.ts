import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { checklistStatus } from "./enums";
import { timestamps, uuidPk } from "./_shared";
import { workspaces } from "./workspaces";

export const checklistItems = pgTable("checklist_items", {
  id: uuidPk(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  label: text("label").notNull(),
  expectedDocumentType: text("expected_document_type"),
  status: checklistStatus("status").notNull().default("EXPECTED"),
  requestedAt: text("requested_at"),
  receivedDocumentId: uuid("received_document_id"),
  ...timestamps
}, t => [
  index("checklist_workspace_idx").on(t.workspaceId)
]);
