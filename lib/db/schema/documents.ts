import { boolean, index, integer, pgTable, real, text, uuid } from "drizzle-orm/pg-core";
import { documentReviewStatus } from "./enums";
import { bytea, timestamps, uuidPk } from "./_shared";
import { workspaces } from "./workspaces";

export const documents = pgTable("documents", {
  id: uuidPk(),
  workspaceId: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  originalFileName: text("original_file_name").notNull(),
  displayName: text("display_name").notNull(),
  mimeType: text("mime_type").notNull(),
  encryptedSizeBytes: integer("encrypted_size_bytes"),
  sha256: text("sha256"),
  documentType: text("document_type").notNull().default("OTHER"),
  taxYear: integer("tax_year"),
  issuer: text("issuer"),
  confidence: real("confidence"),
  reviewStatus: documentReviewStatus("review_status").notNull().default("REVIEW_REQUIRED"),
  wrongYearFlag: boolean("wrong_year_flag").notNull().default(false),
  encryptionIv: bytea("encryption_iv"),
  encryptionTag: bytea("encryption_tag"),
  ...timestamps
}, t => [
  index("documents_workspace_idx").on(t.workspaceId),
  index("documents_type_idx").on(t.documentType)
]);
