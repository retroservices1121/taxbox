import type { DocumentIntelligenceProvider, DocumentClassification } from "./types";
import type { TaxDocumentType } from "../domain";
import { mockDocumentIntelligence } from "./mock";

const TYPES: TaxDocumentType[]=["W2","1099_NEC","1099_MISC","1099_INT","1099_DIV","1099_B","1099_R","SSA_1099","1098","1098_T","K1","PROPERTY_TAX","CHARITABLE","BUSINESS_EXPENSE","BANK_STATEMENT","OTHER"];

type ApiResponse={output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};

function outputText(r:ApiResponse){
 if(r.output_text)return r.output_text;
 return r.output?.flatMap(o=>o.content??[]).find(c=>c.type==="output_text")?.text??"";
}

function cleanName(value:string){
 return value.replace(/[\\/:*?"<>|]+/g," ").replace(/\s+/g," ").trim().slice(0,120);
}

export const openAiDocumentIntelligence:DocumentIntelligenceProvider={
 async classify({fileName,mimeType,bytes,expectedTaxYear}):Promise<DocumentClassification>{
  const key=process.env.OPENAI_API_KEY;
  if(!key)throw new Error("OPENAI_API_KEY is required when DOCUMENT_AI_PROVIDER=openai");
  const model=process.env.OPENAI_DOCUMENT_MODEL||"gpt-5.6-luna";
  const data=Buffer.from(bytes).toString("base64");
  const filePart=mimeType==="application/pdf"
   ?{type:"input_file",filename:fileName,file_data:`data:application/pdf;base64,${data}`,detail:"high"}
   :{type:"input_image",image_url:`data:${mimeType};base64,${data}`,detail:"high"};
  const schema={type:"object",properties:{
   documentType:{type:"string",enum:TYPES},taxYear:{anyOf:[{type:"integer"},{type:"null"}]},
   issuer:{anyOf:[{type:"string"},{type:"null"}]},taxpayerName:{anyOf:[{type:"string"},{type:"null"}]},
   confidence:{type:"number",minimum:0,maximum:1},suggestedDisplayName:{type:"string"},
   reviewRequired:{type:"boolean"},possibleWrongYear:{type:"boolean"}
  },required:["documentType","taxYear","issuer","taxpayerName","confidence","suggestedDisplayName","reviewRequired","possibleWrongYear"],additionalProperties:false};
  const prompt=`Classify this uploaded tax document for a tax-preparation document intake system. Expected tax year: ${expectedTaxYear}. Identify only what is visible in the document. Do not provide tax advice and do not infer tax treatment. Use OTHER when the type is uncertain. Mark reviewRequired true when confidence is below 0.80, the document is ambiguous, or important text is unreadable. Mark possibleWrongYear true when a visible tax year differs from ${expectedTaxYear}. suggestedDisplayName should be concise, such as "2026 W-2 — Employer Name", and must not contain SSNs, EINs, account numbers, addresses, income amounts, or other sensitive identifiers.`;
  const res=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({
   model,input:[{role:"user",content:[{type:"input_text",text:prompt},filePart]}],
   text:{format:{type:"json_schema",name:"tax_document_classification",strict:true,schema}}
  })});
  if(!res.ok)throw new Error(`Document recognition failed (${res.status})`);
  const body=await res.json() as ApiResponse; const raw=outputText(body); if(!raw)throw new Error("Document recognition returned no result");
  const parsed=JSON.parse(raw) as DocumentClassification;
  return {...parsed,suggestedDisplayName:cleanName(parsed.suggestedDisplayName)||`${expectedTaxYear} Tax document`,reviewRequired:parsed.reviewRequired||parsed.confidence<0.8,possibleWrongYear:parsed.taxYear!==null&&parsed.taxYear!==expectedTaxYear};
 }
};

export function getDocumentIntelligenceProvider():DocumentIntelligenceProvider{
 const provider=(process.env.DOCUMENT_AI_PROVIDER||"mock").toLowerCase();
 if(provider==="openai")return openAiDocumentIntelligence;
 return mockDocumentIntelligence;
}
