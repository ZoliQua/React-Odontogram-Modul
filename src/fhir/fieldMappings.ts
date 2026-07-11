/**
 * Declarative description of how each serialized tooth field becomes one or
 * more FHIR Observations. The generic emitter in toFhir.ts reads this table,
 * so adding coverage means adding a row here.
 */
export type FieldKind =
  | "enum"        // single coded value; emit if value present and not skipValue
  | "boolean"     // flag; emit when true
  | "set"         // string[]; one Observation, one component per member
  | "restoration"; // fillingMaterial + fillingSurfaces combined

interface BaseMapping {
  /** Key in the ToothRecord. */
  field: string;
  /** Local code for the finding TYPE (Observation.code). */
  findingCode: string;
  findingDisplay: string;
}

/**
 * Discriminated by `kind`. enum/set/restoration require a `valueGroup`, so the
 * emitter in toFhir.ts never needs a non-null assertion. `restoration` also
 * requires `surfacesField`; `boolean` carries no value decoding.
 */
export type FieldMapping =
  | (BaseMapping & { kind: "enum"; valueGroup: string; skipValue?: string })
  | (BaseMapping & { kind: "set"; valueGroup: string })
  | (BaseMapping & { kind: "restoration"; valueGroup: string; surfacesField: string; skipValue?: string })
  | (BaseMapping & { kind: "boolean" });

export const FIELD_MAPPINGS: FieldMapping[] = [
  { field: "toothSelection", kind: "enum", valueGroup: "toothSelection", skipValue: "tooth-base", findingCode: "tooth-status", findingDisplay: "Tooth status" },
  { field: "endo", kind: "enum", valueGroup: "endo", skipValue: "none", findingCode: "endodontic-status", findingDisplay: "Endodontic status" },
  { field: "toothSubstrate", kind: "enum", valueGroup: "toothSubstrate", skipValue: "natural", findingCode: "tooth-substrate", findingDisplay: "Tooth substrate" },
  { field: "restorationType", kind: "enum", valueGroup: "restorationType", skipValue: "none", findingCode: "restoration-type", findingDisplay: "Restoration type" },
  { field: "restorationMaterial", kind: "enum", valueGroup: "restorationMaterial", skipValue: "none", findingCode: "restoration-material", findingDisplay: "Restoration material" },
  { field: "prosthesis", kind: "enum", valueGroup: "prosthesis", skipValue: "none", findingCode: "prosthesis-type", findingDisplay: "Prosthesis / attachment" },
  { field: "mobility", kind: "enum", valueGroup: "mobility", skipValue: "none", findingCode: "tooth-mobility", findingDisplay: "Tooth mobility" },

  { field: "caries", kind: "set", valueGroup: "caries", findingCode: "caries", findingDisplay: "Dental caries" },
  { field: "mods", kind: "set", valueGroup: "mods", findingCode: "tooth-modifier", findingDisplay: "Tooth modifier" },
  { field: "calculus", kind: "boolean", findingCode: "calculus", findingDisplay: "Dental calculus" },
  { field: "periapicalType", kind: "enum", valueGroup: "periapicalType", skipValue: "none", findingCode: "periapical-lesion-type", findingDisplay: "Periapical lesion type" },

  { field: "fillingMaterial", kind: "restoration", valueGroup: "fillingMaterial", skipValue: "none", surfacesField: "fillingSurfaces", findingCode: "restoration", findingDisplay: "Dental restoration" },

  { field: "endoResection", kind: "boolean", findingCode: "apicoectomy", findingDisplay: "Apicoectomy / root resection" },
  { field: "fissureSealing", kind: "boolean", findingCode: "fissure-sealing", findingDisplay: "Fissure sealing" },
  { field: "contactMesial", kind: "boolean", findingCode: "contact-mesial", findingDisplay: "Mesial contact issue" },
  { field: "contactDistal", kind: "boolean", findingCode: "contact-distal", findingDisplay: "Distal contact issue" },
  { field: "bruxismWear", kind: "boolean", findingCode: "bruxism-wear", findingDisplay: "Bruxism wear" },
  { field: "bruxismNeckWear", kind: "boolean", findingCode: "bruxism-neck-wear", findingDisplay: "Cervical (neck) wear" },
  { field: "brokenMesial", kind: "boolean", findingCode: "broken-mesial", findingDisplay: "Mesial fracture" },
  { field: "brokenIncisal", kind: "boolean", findingCode: "broken-incisal", findingDisplay: "Incisal fracture" },
  { field: "brokenDistal", kind: "boolean", findingCode: "broken-distal", findingDisplay: "Distal fracture" },
  { field: "parapulpalPin", kind: "boolean", findingCode: "parapulpal-pin", findingDisplay: "Parapulpal pin" },
  { field: "bridgePillar", kind: "boolean", findingCode: "bridge-pillar", findingDisplay: "Bridge abutment (pillar)" },
  { field: "extractionWound", kind: "boolean", findingCode: "extraction-wound", findingDisplay: "Extraction wound" },
  { field: "extractionPlan", kind: "boolean", findingCode: "extraction-planned", findingDisplay: "Planned extraction" },
  { field: "crownReplace", kind: "boolean", findingCode: "crown-replace-planned", findingDisplay: "Planned crown replacement" },
  { field: "crownNeeded", kind: "boolean", findingCode: "crown-needed", findingDisplay: "Crown needed" },
  { field: "missingClosed", kind: "boolean", findingCode: "missing-gap-closed", findingDisplay: "Closed gap (missing tooth)" },
  { field: "crownLeakage", kind: "boolean", findingCode: "crown-leakage", findingDisplay: "Crown marginal leakage" },

  // SP4 Task 1: pulp/apical/resorption diagnosis axes (additive; see axes.ts).
  { field: "pulpDx", kind: "enum", valueGroup: "pulpDx", skipValue: "normal", findingCode: "pulp-diagnosis", findingDisplay: "Pulp diagnosis (AAE)" },
  { field: "pulpLatin", kind: "enum", valueGroup: "pulpLatin", skipValue: "none", findingCode: "pulp-diagnosis-latin", findingDisplay: "Pulp diagnosis (Latin, practical)" },
  { field: "apicalDx", kind: "enum", valueGroup: "apicalDx", skipValue: "normal", findingCode: "apical-diagnosis", findingDisplay: "Apical diagnosis (AAE)" },
  { field: "resorptionType", kind: "enum", valueGroup: "resorptionType", skipValue: "none", findingCode: "root-resorption-type", findingDisplay: "Root resorption type" },
];
