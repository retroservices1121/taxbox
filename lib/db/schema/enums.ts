import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["PLATFORM_ADMIN", "FIRM_ADMIN", "PREPARER"]);
export const accountStatus = pgEnum("account_status", ["ACTIVE", "SUSPENDED"]);
export const clientType = pgEnum("client_type", ["INDIVIDUAL", "BUSINESS"]);
export const workspaceStatus = pgEnum("workspace_status", [
  "NOT_STARTED",
  "COLLECTING",
  "MISSING_ITEMS",
  "READY_FOR_PREPARATION",
  "IN_PREPARATION",
  "ADDITIONAL_INFO_REQUESTED",
  "READY_TO_FILE",
  "FILED",
  "ARCHIVED"
]);
export const checklistStatus = pgEnum("checklist_status", ["EXPECTED", "RECEIVED", "NOT_APPLICABLE", "REQUESTED", "REVIEW_REQUIRED"]);
export const inviteStatus = pgEnum("invite_status", ["PENDING", "OPENED", "COMPLETED", "REVOKED", "EXPIRED"]);
export const documentReviewStatus = pgEnum("document_review_status", ["AUTO_MATCHED", "REVIEW_REQUIRED", "CONFIRMED", "REJECTED"]);
