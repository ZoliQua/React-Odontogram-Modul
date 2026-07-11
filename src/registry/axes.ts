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

/** Attach `svgLayer` (render metadata) to values whose activation is a clean id
 *  (or fixed id set) in today's render (`odontogram.ts`). Values not present in
 *  `layers` are returned unchanged (no `svgLayer`). */
const withSvgLayer = (
  values: ReturnType<typeof valuesFrom>,
  layers: Record<string, string | string[]>,
) => values.map(v => (v.id in layers ? { ...v, svgLayer: layers[v.id] } : v));

/** Maps each id in `ids` to itself — for axes whose value id equals its SVG layer id. */
const sameIdLayers = (ids: string[]): Record<string, string> =>
  Object.fromEntries(ids.map(id => [id, id]));

export const AXES: ClinicalAxis[] = [
  { id: "toothSelection", field: "toothSelection", kind: "enum", valueGroup: "toothSelection",
    skipValue: "tooth-base", finding: { local: "tooth-status", display: "Tooth status" },
    values: withSvgLayer(valuesFrom("toothSelection"), {
      "implant": "implant",
      "milktooth": "milktooth",
      "tooth-under-gum": "tooth-under-gum",
      "no-tooth-after-extraction": "no-tooth-after-extraction",
    }),
    uiOptions: [
      { value: "none", labelKey: "toothSelect.none" },
      { value: "tooth-base", labelKey: "toothSelect.permanent" },
      { value: "milktooth", labelKey: "toothSelect.milk" },
      { value: "implant", labelKey: "toothSelect.implant" },
      { value: "tooth-under-gum", labelKey: "toothSelect.underGum" },
    ] },
  { id: "endo", field: "endo", kind: "enum", valueGroup: "endo",
    skipValue: "none", finding: { local: "endodontic-status", display: "Endodontic status" },
    values: withSvgLayer(valuesFrom("endo"), {
      "endo-medical-filling": "endo-medical-filling",
      "endo-filling": "endo-filling",
      "endo-filling-incomplete": "endo-filling-incomplete",
      "endo-glass-pin": ["endo-filling", "endo-glass-pin"],
      "endo-metal-pin": ["endo-filling", "endo-metal-pin"],
    }),
    uiOptions: [
      { value: "none", labelKey: "endo.option.none" },
      { value: "endo-medical-filling", labelKey: "endo.option.medicalFilling" },
      { value: "endo-filling", labelKey: "endo.option.filling", when: (c) => !c.isMilktooth },
      { value: "endo-filling-incomplete", labelKey: "endo.option.incompleteFilling", when: (c) => !c.isMilktooth },
      { value: "endo-glass-pin", labelKey: "endo.option.glassPin", when: (c) => !c.isMilktooth },
      { value: "endo-metal-pin", labelKey: "endo.option.metalPin", when: (c) => !c.isMilktooth },
    ] },
  { id: "toothSubstrate", field: "toothSubstrate", kind: "enum", valueGroup: "toothSubstrate",
    skipValue: "natural", finding: { local: "tooth-substrate", display: "Tooth substrate" },
    values: valuesFrom("toothSubstrate") },
  { id: "restorationType", field: "restorationType", kind: "enum", valueGroup: "restorationType",
    skipValue: "none", finding: { local: "restoration-type", display: "Restoration type" },
    values: valuesFrom("restorationType") },
  { id: "restorationMaterial", field: "restorationMaterial", kind: "enum", valueGroup: "restorationMaterial",
    skipValue: "none", finding: { local: "restoration-material", display: "Restoration material" },
    values: valuesFrom("restorationMaterial") },
  { id: "prosthesis", field: "prosthesis", kind: "enum", valueGroup: "prosthesis",
    skipValue: "none", finding: { local: "prosthesis-type", display: "Prosthesis / attachment" },
    values: valuesFrom("prosthesis") },
  { id: "mobility", field: "mobility", kind: "enum", valueGroup: "mobility",
    skipValue: "none", finding: { local: "tooth-mobility", display: "Tooth mobility" },
    values: valuesFrom("mobility"),
    uiOptions: [
      { value: "none", labelKey: "mobility.none" }, { value: "m1", labelKey: "mobility.m1" },
      { value: "m2", labelKey: "mobility.m2" }, { value: "m3", labelKey: "mobility.m3" },
    ] },

  { id: "caries", field: "caries", kind: "set", valueGroup: "caries",
    finding: { local: "caries", display: "Dental caries" },
    values: withSvgLayer(valuesFrom("caries"), sameIdLayers([
      "caries-subcrown", "caries-buccal", "caries-lingual", "caries-mesial", "caries-distal", "caries-occlusal",
    ])) },
  { id: "mods", field: "mods", kind: "set", valueGroup: "mods",
    finding: { local: "tooth-modifier", display: "Tooth modifier" },
    values: withSvgLayer(valuesFrom("mods"), sameIdLayers(["inflammation", "parodontal", "mobility"])),
    uiOptions: [
      { value: "parodontal", labelKey: "mods.parodontal" },
      { value: "inflammation", labelKey: "mods.periapicalInflammation" },
    ] },
  { id: "calculus", field: "calculus", kind: "boolean",
    finding: { local: "calculus", display: "Dental calculus" },
    svgLayer: "calculus",
    appliesWhen: (c, s) => !c.isImplant && !c.underGum && !c.extraction && s.toothSelection !== "none" },
  { id: "rootResorption", field: "rootResorption", kind: "boolean",
    finding: { local: "root-resorption", display: "Root resorption" },
    svgLayer: "endo-resorption", appliesWhen: (c) => c.toothPresent },
  { id: "periapicalType", field: "periapicalType", kind: "enum", valueGroup: "periapicalType",
    skipValue: "none", finding: { local: "periapical-lesion-type", display: "Periapical lesion type" },
    values: withSvgLayer(valuesFrom("periapicalType"), {
      "granuloma": "granuloma",
      "cyst": "cysta",
      "abscess": "abscess",
    }),
    uiOptions: [
      { value: "none", labelKey: "periapical.type.none" }, { value: "granuloma", labelKey: "periapical.type.granuloma" },
      { value: "cyst", labelKey: "periapical.type.cyst" }, { value: "abscess", labelKey: "periapical.type.abscess" },
    ] },

  { id: "fillingMaterial", field: "fillingMaterial", kind: "restoration", valueGroup: "fillingMaterial",
    skipValue: "none", surfacesField: "fillingSurfaces", finding: { local: "restoration", display: "Dental restoration" },
    values: valuesFrom("fillingMaterial") },

  { id: "pulpInflam", field: "pulpInflam", kind: "boolean",
    finding: { local: "pulp-inflammation", display: "Pulp inflammation" } },
  { id: "endoResection", field: "endoResection", kind: "boolean",
    finding: { local: "apicoectomy", display: "Apicoectomy / root resection" },
    svgLayer: "endo-resection", appliesWhen: (c) => c.toothPresent && !c.underGum && !c.extraction },
  { id: "fissureSealing", field: "fissureSealing", kind: "boolean",
    finding: { local: "fissure-sealing", display: "Fissure sealing" },
    svgLayer: "fissure-sealing", appliesWhen: (c) => c.fissureAllowed },
  { id: "contactMesial", field: "contactMesial", kind: "boolean",
    finding: { local: "contact-mesial", display: "Mesial contact issue" },
    svgLayer: "mesial-no-contact-point", appliesWhen: (c) => c.contactAllowed },
  { id: "contactDistal", field: "contactDistal", kind: "boolean",
    finding: { local: "contact-distal", display: "Distal contact issue" },
    svgLayer: "distal-no-contact-point", appliesWhen: (c) => c.contactAllowed },
  { id: "bruxismWear", field: "bruxismWear", kind: "boolean",
    finding: { local: "bruxism-wear", display: "Bruxism wear" },
    svgLayer: "tooth-bruxism-wear", appliesWhen: (c) => c.bruxismAllowed },
  { id: "bruxismNeckWear", field: "bruxismNeckWear", kind: "boolean",
    finding: { local: "bruxism-neck-wear", display: "Cervical (neck) wear" },
    svgLayer: "tooth-bruxism-neck-wear", appliesWhen: (c) => c.bruxismAllowed },
  { id: "brokenMesial", field: "brokenMesial", kind: "boolean",
    finding: { local: "broken-mesial", display: "Mesial fracture" } },
  { id: "brokenIncisal", field: "brokenIncisal", kind: "boolean",
    finding: { local: "broken-incisal", display: "Incisal fracture" } },
  { id: "brokenDistal", field: "brokenDistal", kind: "boolean",
    finding: { local: "broken-distal", display: "Distal fracture" } },
  { id: "parapulpalPin", field: "parapulpalPin", kind: "boolean",
    finding: { local: "parapulpal-pin", display: "Parapulpal pin" },
    svgLayer: "parapulpal-pin", appliesWhen: (c) => c.toothPresent && !c.underGum && !c.extraction },
  { id: "bridgePillar", field: "bridgePillar", kind: "boolean",
    finding: { local: "bridge-pillar", display: "Bridge abutment (pillar)" } },
  { id: "extractionWound", field: "extractionWound", kind: "boolean",
    finding: { local: "extraction-wound", display: "Extraction wound" } },
  { id: "extractionPlan", field: "extractionPlan", kind: "boolean",
    finding: { local: "extraction-planned", display: "Planned extraction" },
    svgLayer: "extraction-plan", appliesWhen: (c) => c.extractionPlanAllowed },
  { id: "crownReplace", field: "crownReplace", kind: "boolean",
    finding: { local: "crown-replace-planned", display: "Planned crown replacement" },
    svgLayer: "crown-replace",
    appliesWhen: (c, s) => s.toothSelection === "tooth-base" && s.restorationType !== "none" },
  { id: "crownNeeded", field: "crownNeeded", kind: "boolean",
    finding: { local: "crown-needed", display: "Crown needed" },
    svgLayer: "crown-needed",
    appliesWhen: (c, s) => s.toothSelection === "tooth-base" && s.restorationType === "none" && ["natural","broken","crownprep"].includes(s.toothSubstrate) },
  { id: "missingClosed", field: "missingClosed", kind: "boolean",
    finding: { local: "missing-gap-closed", display: "Closed gap (missing tooth)" },
    svgLayer: "missing-closed", appliesWhen: (c) => c.isNone },
  // SP3b Task 6: crown-marginal-leakage toggle (spec §3.4). The SVG artwork has
  // shipped a dormant `crown-leakage` layer since v2.5.0 (never toggled — see
  // src/__tests__/svg-assets.test.ts), but no clinical axis or UI control ever
  // activated it until now.
  { id: "crownLeakage", field: "crownLeakage", kind: "boolean",
    finding: { local: "crown-leakage", display: "Crown marginal leakage" },
    svgLayer: "crown-leakage",
    appliesWhen: (c, s) => s.restorationType === "crown" || s.restorationType === "bridge" },
];
