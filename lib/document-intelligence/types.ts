import type { TaxDocumentType } from "../domain";

export type DocumentClassification = {
  documentType: TaxDocumentType;
  taxYear: number | null;
  issuer: string | null;
  taxpayerName: string | null;
  confidence: number;
  suggestedDisplayName: string;
  reviewRequired: boolean;
  possibleWrongYear: boolean;
};

export interface DocumentIntelligenceProvider {
  classify(input: {
    fileName: string;
    mimeType: string;
    bytes: Uint8Array;
    expectedTaxYear: number;
  }): Promise<DocumentClassification>;
}
