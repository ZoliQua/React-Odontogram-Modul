/**
 * Registry catalog coding data (SP2 Stage 0). One `ClinicalAxis` per
 * `FIELD_MAPPINGS` row (`src/fhir/fieldMappings.ts`), with finding codes and
 * value codings transcribed from `LOCAL_VALUE_MAPS` (`src/fhir/codesystems.ts`).
 * Enforced verbatim by `src/__tests__/parity.test.ts` ("registry catalog
 * matches today's tables"). No SNOMED/ICD codes populated (SP2 keeps them empty).
 */
import type { ClinicalAxis } from "./types";
import { LOCAL_VALUE_MAPS } from "../fhir/codesystems";

const valuesFrom = (group: string) =>
  Object.values(LOCAL_VALUE_MAPS[group]).map(e => ({ id: e.code, coding: { local: e.code, display: e.display } }));

export const AXES: ClinicalAxis[] = [
  { id: "toothSelection", field: "toothSelection", kind: "enum", valueGroup: "toothSelection",
    skipValue: "tooth-base", finding: { local: "tooth-status", display: "Tooth status" },
    values: valuesFrom("toothSelection") },
  { id: "endo", field: "endo", kind: "enum", valueGroup: "endo",
    skipValue: "none", finding: { local: "endodontic-status", display: "Endodontic status" },
    values: valuesFrom("endo") },
  { id: "crownMaterial", field: "crownMaterial", kind: "enum", valueGroup: "crownMaterial",
    skipValue: "natural", finding: { local: "crown-material", display: "Crown material" },
    values: valuesFrom("crownMaterial") },
  { id: "bridgeUnit", field: "bridgeUnit", kind: "enum", valueGroup: "bridgeUnit",
    skipValue: "none", finding: { local: "bridge-unit", display: "Prosthetic / bridge unit" },
    values: valuesFrom("bridgeUnit") },
  { id: "mobility", field: "mobility", kind: "enum", valueGroup: "mobility",
    skipValue: "none", finding: { local: "tooth-mobility", display: "Tooth mobility" },
    values: valuesFrom("mobility") },

  { id: "caries", field: "caries", kind: "set", valueGroup: "caries",
    finding: { local: "caries", display: "Dental caries" },
    values: valuesFrom("caries") },
  { id: "mods", field: "mods", kind: "set", valueGroup: "mods",
    finding: { local: "tooth-modifier", display: "Tooth modifier" },
    values: valuesFrom("mods") },
  { id: "calculus", field: "calculus", kind: "boolean",
    finding: { local: "calculus", display: "Dental calculus" } },
  { id: "rootResorption", field: "rootResorption", kind: "boolean",
    finding: { local: "root-resorption", display: "Root resorption" } },
  { id: "periapicalType", field: "periapicalType", kind: "enum", valueGroup: "periapicalType",
    skipValue: "none", finding: { local: "periapical-lesion-type", display: "Periapical lesion type" },
    values: valuesFrom("periapicalType") },

  { id: "fillingMaterial", field: "fillingMaterial", kind: "restoration", valueGroup: "fillingMaterial",
    skipValue: "none", finding: { local: "restoration", display: "Dental restoration" },
    values: valuesFrom("fillingMaterial") },

  { id: "pulpInflam", field: "pulpInflam", kind: "boolean",
    finding: { local: "pulp-inflammation", display: "Pulp inflammation" } },
  { id: "endoResection", field: "endoResection", kind: "boolean",
    finding: { local: "apicoectomy", display: "Apicoectomy / root resection" } },
  { id: "fissureSealing", field: "fissureSealing", kind: "boolean",
    finding: { local: "fissure-sealing", display: "Fissure sealing" } },
  { id: "contactMesial", field: "contactMesial", kind: "boolean",
    finding: { local: "contact-mesial", display: "Mesial contact issue" } },
  { id: "contactDistal", field: "contactDistal", kind: "boolean",
    finding: { local: "contact-distal", display: "Distal contact issue" } },
  { id: "bruxismWear", field: "bruxismWear", kind: "boolean",
    finding: { local: "bruxism-wear", display: "Bruxism wear" } },
  { id: "bruxismNeckWear", field: "bruxismNeckWear", kind: "boolean",
    finding: { local: "bruxism-neck-wear", display: "Cervical (neck) wear" } },
  { id: "brokenMesial", field: "brokenMesial", kind: "boolean",
    finding: { local: "broken-mesial", display: "Mesial fracture" } },
  { id: "brokenIncisal", field: "brokenIncisal", kind: "boolean",
    finding: { local: "broken-incisal", display: "Incisal fracture" } },
  { id: "brokenDistal", field: "brokenDistal", kind: "boolean",
    finding: { local: "broken-distal", display: "Distal fracture" } },
  { id: "parapulpalPin", field: "parapulpalPin", kind: "boolean",
    finding: { local: "parapulpal-pin", display: "Parapulpal pin" } },
  { id: "bridgePillar", field: "bridgePillar", kind: "boolean",
    finding: { local: "bridge-pillar", display: "Bridge abutment (pillar)" } },
  { id: "extractionWound", field: "extractionWound", kind: "boolean",
    finding: { local: "extraction-wound", display: "Extraction wound" } },
  { id: "extractionPlan", field: "extractionPlan", kind: "boolean",
    finding: { local: "extraction-planned", display: "Planned extraction" } },
  { id: "crownReplace", field: "crownReplace", kind: "boolean",
    finding: { local: "crown-replace-planned", display: "Planned crown replacement" } },
  { id: "crownNeeded", field: "crownNeeded", kind: "boolean",
    finding: { local: "crown-needed", display: "Crown needed" } },
  { id: "missingClosed", field: "missingClosed", kind: "boolean",
    finding: { local: "missing-gap-closed", display: "Closed gap (missing tooth)" } },
];
