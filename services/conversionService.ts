import { ConversionInput, ConversionResult } from '../types';
import { CONVERSION_RULES, NAME_EXCEPTIONS, DEFAULT_RULE, MACHINE_NAMES, ExtendedRuleDefinition, SEED_RULE } from '../constants';

/**
 * Utility: Remove Machine Names (TFC, AGV, etc.)
 */
const removeMachineNames = (text: string): string => {
  let processed = text;
  MACHINE_NAMES.forEach(name => {
    // Case insensitive remove
    const regex = new RegExp(name, 'gi');
    processed = processed.replace(regex, '');
  });
  return processed.trim();
};

/**
 * Utility: Remove trailing numbers
 */
const removeTrailingNumbers = (text: string): string => {
  return text.replace(/\d+$/, '').trim();
};

/**
 * Utility: Apply underscore to consecutive alphanumeric blocks
 */
const applyUnderscoreRule = (text: string): string => {
  // Pattern: (AlphaNum/Symbol) Space? (AlphaNum/Symbol) -> Join with _
  let processed = text;
  
  // Regex to find two alphanumeric blocks separated by space
  const regex = /([A-Za-z0-9&.\-]+)(\s+)([A-Za-z0-9&.\-]+)/g;
  
  // Replace space with underscore. Repeat loop to handle chains (A B C -> A_B C -> A_B_C)
  let prev;
  do {
    prev = processed;
    processed = processed.replace(regex, '$1_$3');
  } while (processed !== prev);
  
  return processed;
};

/**
 * Utility: Clean English Name
 * Remove "DIAGRAM" (unless Wiring/System)
 */
const cleanNameE = (text: string): string => {
  let processed = text;
  if (!/(WIRING|SYSTEM)\s*DIAGRAM/i.test(processed)) {
    processed = processed.replace(/\s*DIAGRAM/gi, '');
  }
  // Also remove "Drawing" if present (implied by Diagram rule or general cleanup?)
  // Example 2: "Assembly Drawing" -> "ASSY." (Drawing word removed/replaced)
  processed = processed.replace(/\s*DRAWING/gi, '');
  return processed.trim();
};

/**
 * Main Conversion Logic
 */
export const convertPdmToPlm = (input: ConversionInput): ConversionResult => {
  const remarks: string[] = [];

  // --- Priority 1: Name Rule Worksheet Exceptions ---
  const exceptionMatch = NAME_EXCEPTIONS.find(e => e.pdmNameJ === input.pdmNameJ);
  if (exceptionMatch) {
    return exceptionMatch.result;
  }

  // --- Pre-processing (Machine Names) ---
  let rawNameJ = removeMachineNames(input.pdmNameJ);
  let rawNameE = removeMachineNames(input.pdmNameE);

  // --- Priority 2: Drawing Type Rules ---
  let rule = CONVERSION_RULES.find(r => 
    r.pdmCode === input.pdmCode && 
    r.keywords.some(k => rawNameJ.includes(k) || rawNameE.toUpperCase().includes(k))
  );

  if (!rule) {
    // If no code match, maybe generic Seed check?
    if (!input.pdmCode) {
       rule = SEED_RULE; // Fallback for Seed examples where code is missing
    } else {
       rule = DEFAULT_RULE;
    }
  }

  // --- Type-Specific Logic & Basic Defs ---
  
  // Variables to build
  let plmPartCode = rule.plmPartCode;
  let plmDrawingPrefix = rule.plmDrawingPrefix;
  let plmNameE = rawNameE;
  let plmNameJ = rawNameJ;
  let plmDrawingNameE = rawNameE; // Default start

  // 1. Handle "Specifications" (仕様属性)
  // Rule: Keep only in Name J. Remove from others.
  // Logic: Extract (Content) if it contains Spec/仕様, keep in J, remove from E.
  // Regex for Japanese spec: （.*?仕様.*?）
  
  const specRegexJ = /（(.*?)仕様.*?）/g;
  let specString = "";
  if (specRegexJ.test(plmNameJ)) {
    // Extract the content (e.g. IP65)
    // Ex 6 output structure: "制御盤_IP65_LAYOUT"
    // Replace the bracketed part with just the content prefixed by _.
    plmNameJ = plmNameJ.replace(specRegexJ, (match, content) => {
      specString = content; // Store "IP65"
      return `_${content}`; // Return "_IP65"
    });
  }

  // Remove corresponding parentheses from English
  if (specString) {
    const escapedSpec = specString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const specRegexE = new RegExp(`\\s*\\(${escapedSpec}\\)`, 'gi');
    plmNameE = plmNameE.replace(specRegexE, '');
    plmDrawingNameE = plmDrawingNameE.replace(specRegexE, '');
  }

  // 2. Type Transformations
  const isSeed = rawNameJ.includes("種図"); // Check original for "種図"

  switch (rule.type) {
    case 'WIRING':
      // C -> 配線図 -> WIRING / WIRING_DIAGRAM
      // Enforce the base names if matched strictly, but usually we respect input components.
      // Ex 1: "Wiring Diagram" -> WIRING / WIRING_DIAGRAM
      // If the input was "Main Wiring Diagram", logic suggests keeping "Main".
      // But prompt Example 1 is simple.
      // We will perform cleaning which handles "Diagram".
      // "WIRING DIAGRAM" -> "WIRING" (Name E)
      // "WIRING DIAGRAM" -> "WIRING_DIAGRAM" (Drawing E) - Wait, cleanNameE removes Diagram.
      // Special Exception for WIRING:
      if (/WIRING\s*DIAGRAM/i.test(plmDrawingNameE)) {
        // Keep Diagram for Drawing Name
        // But Name E removes it? Ex 1: Name E: WIRING, Drawing E: WIRING_DIAGRAM.
        plmNameE = plmNameE.replace(/DIAGRAM/i, '');
      }
      break;

    case 'CABLE':
      // J -> Cable Assy
      // Ex 3: "Cable Assembly" -> Name E: "CABLE_ASSY.", Dwg E: "CABLE_ASSY."
      plmNameE = plmNameE.replace(/Assembly/gi, 'ASSY.');
      plmDrawingNameE = plmDrawingNameE.replace(/Assembly/gi, 'ASSY.');
      plmNameJ = plmNameJ.replace(/ケーブルASS['’]?Y/gi, 'ケーブルASSY.');
      break;

    case 'ASSY':
      // A/B/E -> Assy/Mounting
      // Ex 2: "Motor Unit Assembly Drawing" -> Name E: "MOTOR_UNIT_ASSY." / Dwg E: "MOTOR_UNIT_ASSY._DWG."
      
      // Name E Transformation
      plmNameE = plmNameE.replace(/Assembly/gi, 'ASSY.').replace(/Mounting/gi, 'ASSY.');
      plmNameE = cleanNameE(plmNameE); // Removes "Drawing"
      
      // Ensure it ends with ASSY.
      if (!plmNameE.toUpperCase().endsWith("ASSY.")) {
         // Some inputs might be "Front Cover" -> need to append ASSY.?
         // Ex 7: "Front Cover Mounting Drawing" -> "FRONT_COVER_ASSY."
         // Our replace handled "Mounting".
      }

      // Drawing Name E Transformation: Append _DWG.
      plmDrawingNameE = plmNameE + "_DWG.";
      
      // Name J Transformation
      // Replace 組立図/取付図 with ASSY.
      plmNameJ = plmNameJ.replace(/(組立|取付)図?/g, 'ASSY.');
      break;

    case 'LAYOUT':
      // L -> Layout
      // Ex 6: "Control Panel ... Layout" -> Name E "CONTROL_PANEL_LAYOUT"
      // Replace "配置図" with "LAYOUT" (J)
      plmNameJ = plmNameJ.replace(/配置図/g, '_LAYOUT'); 
      break;

    case 'NAME_SEAL':
      plmNameE = "NAME_SEAL_LAYOUT";
      plmNameJ = "銘板シールLAYOUT";
      plmDrawingNameE = "NAME_SEAL_LAYOUT";
      break;
      
    case 'GENERIC':
    default:
      break;
  }

  // 3. Common Cleanups
  
  // Remove "図" from Name J (Global)
  // Ex: "配線図" -> "配線" 
  plmNameJ = plmNameJ.replace(/図$/, '');

  // Remove "DIAGRAM" from Name E (Excluding Wiring/System) - already mostly handled by cleanNameE
  if (rule.type !== 'WIRING') {
    plmNameE = cleanNameE(plmNameE);
    plmDrawingNameE = cleanNameE(plmDrawingNameE);
  } else {
    // For Wiring, cleanNameE respects Wiring Diagram, but Name E needs to be just WIRING?
    // Ex 1: Name E: WIRING. Drawing E: WIRING_DIAGRAM.
    // Done in Type block.
  }
  
  // 4. Underscore Rule for Name J
  plmNameJ = applyUnderscoreRule(plmNameJ);

  // 5. Seed Rule
  // "種図" -> Add "_SEED" to Name E, Name J.
  if (isSeed) {
    plmNameJ = plmNameJ.replace(/種図/g, ''); 
    plmNameJ += "_SEED";
    
    plmNameE = plmNameE.replace(/SEED/gi, '').trim();
    plmNameE += "_SEED";

    // Drawing Name E: Only if Cable Assy
    if (rule.type === 'CABLE') {
      plmDrawingNameE = plmDrawingNameE.replace(/SEED/gi, '').trim();
      plmDrawingNameE += "_SEED";
    }
  }

  // 6. 1516 Rule (Overrides Name Generation)
  if (input.partClassId === "1516") {
    // Ex 9: "M8ボルト緩み止め塗布図" -> "M8ボルト"
    const boltNameJ = input.pdmNameJ.replace(/緩み止め塗布図?/, '').trim();
    const boltNameE = input.pdmNameE.replace(/Thread Lock/i, '').trim();
    
    plmNameJ = `${boltNameJ}_緩み止め塗布`;
    plmNameE = `${boltNameE}_THREAD_LOCK`;
    plmDrawingNameE = `${boltNameE}_THREAD_LOCK`;
    
    remarks.push("Applied Part Class 1516 Rule");
  }

  // 7. Trailing Numbers Removal (Final Step)
  plmNameE = removeTrailingNumbers(plmNameE);
  plmNameJ = removeTrailingNumbers(plmNameJ);
  plmDrawingNameE = removeTrailingNumbers(plmDrawingNameE);

  // 8. Formatting
  plmNameE = plmNameE.toUpperCase();
  plmDrawingNameE = plmDrawingNameE.toUpperCase();
  
  // Replace spaces with underscores
  plmNameE = plmNameE.replace(/\s+/g, '_');
  plmDrawingNameE = plmDrawingNameE.replace(/\s+/g, '_');
  
  // Clean double underscores & leading/trailing
  plmNameE = plmNameE.replace(/_+/g, '_').replace(/^_|_$/g, '');
  plmDrawingNameE = plmDrawingNameE.replace(/_+/g, '_').replace(/^_|_$/g, '');
  plmNameJ = plmNameJ.replace(/_+/g, '_').replace(/^_|_$/g, '');

  return {
    plmPartCode,
    plmDrawingPrefix,
    plmNameE,
    plmNameJ,
    plmDrawingNameE,
    remarks
  };
};