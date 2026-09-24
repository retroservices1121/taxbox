import type { DocumentIntelligenceProvider } from "./types";
import type { TaxDocumentType } from "../domain";

function inferType(fileName: string): TaxDocumentType {
  const f = fileName.toLowerCase();
  if (f.includes("1098-t") || f.includes("1098t")) return "1098_T";
  if (f.includes("1098")) return "1098";
  if (f.includes("w-2") || f.includes("w2")) return "W2";
  if (f.includes("1099-nec") || f.includes("1099nec")) return "1099_NEC";
  if (f.includes("1099-r") || f.includes("1099r")) return "1099_R";
  if (f.includes("1099")) return "1099_MISC";
  if (f.includes("k-1") || f.includes("k1")) return "K1";
  return "OTHER";
}

export const mockDocumentIntelligence: DocumentIntelligenceProvider = {
  async classify({ fileName, expectedTaxYear }) {
    const documentType = inferType(fileName);
    const display = documentType === "OTHER" ? "Tax document" : documentType.replaceAll("_", "-");
    return {
      documentType,
      taxYear: expectedTaxYear,
      issuer: null,
      taxpayerName: null,
      confidence: documentType === "OTHER" ? 0.45 : 0.9,
      suggestedDisplayName: `${expectedTaxYear} ${display}`,
      reviewRequired: documentType === "OTHER",
      possibleWrongYear: false
    };
  }
};
