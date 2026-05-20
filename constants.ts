import { RuleDefinition, NameException } from './types';

// RULE 1: Name Rule Worksheet Exceptions (Priority 1)
export const NAME_EXCEPTIONS: NameException[] = [
  {
    pdmNameJ: "特別例外ユニット",
    result: {
      plmPartCode: "S",
      plmDrawingPrefix: "SPEC",
      plmNameE: "SPECIAL_UNIT",
      plmNameJ: "特別例外ユニット",
      plmDrawingNameE: "SPECIAL_UNIT_DRAWING",
      remarks: ["Applied 'Name Rule Worksheet' Exception"]
    }
  }
];

// RULE: Machine Names to be removed
export const MACHINE_NAMES = [
  "TFC", "AGV", "AMR", "ROBOT_ARM"
];

// Extended Rule Definition to include "Type" for logic branching
export interface ExtendedRuleDefinition extends RuleDefinition {
  type: 'WIRING' | 'CABLE' | 'ASSY' | 'LAYOUT' | 'NAME_SEAL' | 'GENERIC' | 'SEED';
}

// RULE TABLE (Priority 2)
// Mapping PDM Code + Keywords -> PLM Data & Processing Type
export const CONVERSION_RULES: ExtendedRuleDefinition[] = [
  {
    pdmCode: "C",
    keywords: ["配線図", "WIRING"],
    plmPartCode: "E",
    plmDrawingPrefix: "CFWC",
    plmNameEBase: "WIRING",
    type: 'WIRING'
  },
  {
    pdmCode: "J",
    keywords: ["ケーブル", "CABLE"],
    plmPartCode: "C",
    plmDrawingPrefix: "CFWJ",
    plmNameEBase: "CABLE_ASSY.",
    type: 'CABLE'
  },
  {
    pdmCode: "B", // From Example 2 (Assy)
    keywords: ["組立図", "ASSY"],
    plmPartCode: "E",
    plmDrawingPrefix: "CFWE",
    plmNameEBase: "ASSY.",
    type: 'ASSY'
  },
  {
    pdmCode: "A", // Standard Assy code if different
    keywords: ["組立図", "ASSY"],
    plmPartCode: "A",
    plmDrawingPrefix: "CFWA",
    plmNameEBase: "ASSY.",
    type: 'ASSY'
  },
  {
    pdmCode: "E", // From Example 7 (Mounting)
    keywords: ["取付図", "MOUNTING"],
    plmPartCode: "E",
    plmDrawingPrefix: "CFWE",
    plmNameEBase: "ASSY.",
    type: 'ASSY' // Mounting handled as Assy
  },
  {
    pdmCode: "L",
    keywords: ["配置図", "LAYOUT"],
    plmPartCode: "L",
    plmDrawingPrefix: "CFWL",
    plmNameEBase: "LAYOUT",
    type: 'LAYOUT'
  },
  {
    pdmCode: "S", 
    keywords: ["銘板シール貼付図", "NAME SEAL"],
    plmPartCode: "S",
    plmDrawingPrefix: "CFWS",
    plmNameEBase: "NAME_SEAL_LAYOUT",
    type: 'NAME_SEAL'
  }
];

// Fallback rule
export const DEFAULT_RULE: ExtendedRuleDefinition = {
  pdmCode: "?",
  keywords: [],
  plmPartCode: "Z",
  plmDrawingPrefix: "CFWZ",
  plmNameEBase: "",
  type: 'GENERIC'
};

// Seed Fallback (Example 4)
export const SEED_RULE: ExtendedRuleDefinition = {
  pdmCode: "SEED_FALLBACK", 
  keywords: [],
  plmPartCode: "P",
  plmDrawingPrefix: "CFWP",
  plmNameEBase: "",
  type: 'GENERIC'
};