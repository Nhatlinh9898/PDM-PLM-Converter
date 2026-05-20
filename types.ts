export interface ConversionInput {
  pdmNameJ: string;
  pdmNameE: string;
  pdmCode: string; // The 4th digit of the PDM number
  partClassId?: string; // Optional: For the "1516" rule
}

export interface ConversionResult {
  plmPartCode: string;     // PLM品番 (4桁目)
  plmDrawingPrefix: string;// PLM図番 (頭4桁)
  plmNameE: string;        // PLM品名 (English)
  plmNameJ: string;        // PLM品名 (日本語)
  plmDrawingNameE: string; // PLM図面名称 (English)
  remarks: string[];       // Applied rules notes
}

export interface RuleDefinition {
  pdmCode: string;
  keywords: string[]; // Keywords to match in PDM Name J
  plmPartCode: string;
  plmDrawingPrefix: string;
  plmNameEBase: string;
  plmNameJBase?: string; // Optional override
  plmDrawingNameEBase?: string; // Optional override
}

export interface NameException {
  pdmNameJ: string;
  result: ConversionResult;
}