import type { ChecklistItem, TaxDocumentType } from "./domain";

export type IndividualOrganizerAnswers = {
  taxpayerW2Count?: number;
  spouseW2Count?: number;
  homeowner?: boolean;
  brokerage?: boolean;
  collegeDependentCount?: number;
  charitableGiving?: boolean;
  retirementIncome?: boolean;
  socialSecurityIncome?: boolean;
  selfEmployment?: boolean;
  rentalProperty?: boolean;
};

export type BusinessOrganizerAnswers = {
  entityType?: "SOLE_PROP" | "LLC" | "S_CORP" | "C_CORP" | "PARTNERSHIP" | "OTHER";
  employees?: boolean;
  contractors?: boolean;
  bankAccounts?: boolean;
  businessExpenses?: boolean;
  receivedK1?: boolean;
};

type DraftItem = Pick<ChecklistItem, "key" | "label" | "status" | "expectedDocumentType">;

function repeat(prefix: string, count: number, label: (i: number) => string, type: TaxDocumentType): DraftItem[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => ({
    key: `${prefix}_${index + 1}`,
    label: label(index + 1),
    status: "EXPECTED",
    expectedDocumentType: type
  }));
}

export function buildIndividualChecklist(a: IndividualOrganizerAnswers): DraftItem[] {
  const items: DraftItem[] = [
    ...repeat("taxpayer_w2", a.taxpayerW2Count ?? 0, i => `Taxpayer W-2 #${i}`, "W2"),
    ...repeat("spouse_w2", a.spouseW2Count ?? 0, i => `Spouse W-2 #${i}`, "W2")
  ];

  if (a.homeowner) items.push({ key: "mortgage_1098", label: "Mortgage Form 1098", status: "EXPECTED", expectedDocumentType: "1098" });
  if (a.brokerage) items.push({ key: "brokerage_1099", label: "Brokerage consolidated 1099", status: "EXPECTED", expectedDocumentType: "1099_B" });
  if (a.charitableGiving) items.push({ key: "charitable", label: "Charitable contribution records", status: "EXPECTED", expectedDocumentType: "CHARITABLE" });
  if (a.retirementIncome) items.push({ key: "retirement_1099r", label: "Form 1099-R", status: "EXPECTED", expectedDocumentType: "1099_R" });
  if (a.socialSecurityIncome) items.push({ key: "ssa_1099", label: "SSA-1099", status: "EXPECTED", expectedDocumentType: "SSA_1099" });
  if (a.selfEmployment) items.push({ key: "self_employment", label: "Self-employment income and expense records", status: "EXPECTED", expectedDocumentType: "BUSINESS_EXPENSE" });
  if (a.rentalProperty) items.push({ key: "rental", label: "Rental property income and expense records", status: "EXPECTED", expectedDocumentType: "OTHER" });

  items.push(...repeat("1098t", a.collegeDependentCount ?? 0, i => `Form 1098-T — student #${i}`, "1098_T"));
  return items;
}

export function buildBusinessChecklist(a: BusinessOrganizerAnswers): DraftItem[] {
  const items: DraftItem[] = [];
  if (a.bankAccounts) items.push({ key: "bank_statements", label: "Year-end business bank statements", status: "EXPECTED", expectedDocumentType: "BANK_STATEMENT" });
  if (a.businessExpenses) items.push({ key: "business_expenses", label: "Business expense records", status: "EXPECTED", expectedDocumentType: "BUSINESS_EXPENSE" });
  if (a.contractors) items.push({ key: "contractor_1099s", label: "Contractor 1099 records", status: "EXPECTED", expectedDocumentType: "1099_NEC" });
  if (a.receivedK1) items.push({ key: "k1", label: "Schedule K-1", status: "EXPECTED", expectedDocumentType: "K1" });
  return items;
}
