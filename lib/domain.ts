export type ClientType = "INDIVIDUAL" | "BUSINESS";

export type TaxBoxStatus =
  | "NOT_STARTED"
  | "COLLECTING"
  | "MISSING_ITEMS"
  | "READY_FOR_PREPARATION"
  | "IN_PREPARATION"
  | "ADDITIONAL_INFO_REQUESTED"
  | "READY_TO_FILE"
  | "FILED"
  | "ARCHIVED";

export type ChecklistItemStatus =
  | "EXPECTED"
  | "RECEIVED"
  | "NOT_APPLICABLE"
  | "REQUESTED"
  | "REVIEW_REQUIRED";

export type TaxDocumentType =
  | "W2"
  | "1099_NEC"
  | "1099_MISC"
  | "1099_INT"
  | "1099_DIV"
  | "1099_B"
  | "1099_R"
  | "SSA_1099"
  | "1098"
  | "1098_T"
  | "K1"
  | "PROPERTY_TAX"
  | "CHARITABLE"
  | "BUSINESS_EXPENSE"
  | "BANK_STATEMENT"
  | "OTHER";

export const WORKSPACE_PRICE_CENTS: Record<ClientType, number> = {
  INDIVIDUAL: 1000,
  BUSINESS: 2000
};

export interface Firm {
  id: string;
  name: string;
  logoUrl?: string | null;
}

export interface Client {
  id: string;
  firmId: string;
  type: ClientType;
  displayName: string;
  email: string;
  phone?: string | null;
  externalId?: string | null;
}

export interface TaxBoxWorkspace {
  id: string;
  firmId: string;
  clientId: string;
  taxYear: number;
  clientType: ClientType;
  status: TaxBoxStatus;
  activatedAt?: Date | null;
  assignedStaffUserId?: string | null;
}

export interface ChecklistItem {
  id: string;
  workspaceId: string;
  key: string;
  label: string;
  status: ChecklistItemStatus;
  expectedDocumentType?: TaxDocumentType | null;
  requestedAt?: Date | null;
  receivedDocumentId?: string | null;
}

export interface TaxDocument {
  id: string;
  workspaceId: string;
  originalFileName: string;
  displayName: string;
  documentType: TaxDocumentType;
  taxYear?: number | null;
  issuer?: string | null;
  confidence?: number | null;
  reviewRequired: boolean;
}
