// Deterministic parity matrix: every enum value / surface / boolean in isolation,
// plus curated tricky combinations, over the 6 representative templates.
import { VALID_TOOTH_SELECTION, VALID_ENDO,
  VALID_MOBILITY, VALID_PERIAPICAL_TYPE, VALID_CARIES, VALID_FILLING_MATERIAL, VALID_FILLING_SURFACES,
  VALID_MODS } from "../../odontogram";

// Frozen legacy vocabularies (Task 4 retired the live `crownMaterial`/`bridgeUnit`
// axes + their VALID_* exports and LOCAL_VALUE_MAPS entries). hydrateState's
// input-side migration branch still accepts these exact raw string values on
// import (backward compat), so the matrix hardcodes them here — verbatim, same
// order — to keep exercising that legacy path without depending on any exported
// vocabulary set. (Mirrors the pre-Task-4 LOCAL_VALUE_MAPS.crownMaterial /
// .bridgeUnit key order exactly, so the SVG golden fingerprints are unaffected.)
const LEGACY_CROWN_MATERIAL_VALUES = [
  "natural", "broken", "crownprep", "radix", "emax", "zircon", "metal", "temporary",
  "telescope", "healing-abutment", "locator", "locator-prosthesis", "bar", "bar-prosthesis",
];
const LEGACY_BRIDGE_UNIT_VALUES = ["none", "removable", "zircon", "metal", "temporary", "bar", "bar-prosthesis"];

const TEMPLATES: { toothNo: number; template: string; view: "front"|"occlusal" }[] = [
  { toothNo: 11, template: "11", view: "front" },
  { toothNo: 13, template: "13", view: "front" },
  { toothNo: 14, template: "14", view: "front" },
  { toothNo: 16, template: "16", view: "front" },
  { toothNo: 14, template: "14_occl", view: "occlusal" },
  { toothNo: 16, template: "16_occl", view: "occlusal" },
];

const BOOLEAN_FIELDS = [
  "pulpInflam","endoResection","rootResorption","fissureSealing","calculus","contactMesial","contactDistal",
  "bruxismWear","bruxismNeckWear","brokenMesial","brokenIncisal","brokenDistal","parapulpalPin","bridgePillar",
  "extractionWound","extractionPlan","crownReplace","crownNeeded","missingClosed",
];

const ENUM_FIELDS: [string, Iterable<string>][] = [
  ["toothSelection", VALID_TOOTH_SELECTION], ["crownMaterial", LEGACY_CROWN_MATERIAL_VALUES],
  ["endo", VALID_ENDO], ["bridgeUnit", LEGACY_BRIDGE_UNIT_VALUES], ["mobility", VALID_MOBILITY],
  ["periapicalType", VALID_PERIAPICAL_TYPE], ["fillingMaterial", VALID_FILLING_MATERIAL],
];

function baseState(): Record<string, unknown> { return { toothSelection: "tooth-base" }; }

// Curated tricky combinations (the 6 non-trivial render behaviors).
function trickyStates(): { label: string; state: Record<string, unknown> }[] {
  return [
    { label: "broken-mesial-incisal-distal", state: { toothSelection:"tooth-base", crownMaterial:"broken", brokenMesial:true, brokenIncisal:true, brokenDistal:true } },
    { label: "broken-mesial", state: { toothSelection:"tooth-base", crownMaterial:"broken", brokenMesial:true } },
    { label: "caries+filling-occlusal", state: { toothSelection:"tooth-base", caries:["caries-occlusal"], fillingMaterial:"amalgam", fillingSurfaces:["occlusal"], fillingSurfaceMaterials:{ occlusal:"amalgam" } } },
    { label: "periapical+inflammation", state: { toothSelection:"tooth-base", mods:["inflammation"], periapicalType:"cyst" } },
    { label: "inflammation+endo-resection", state: { toothSelection:"tooth-base", mods:["inflammation"], endoResection:true } },
    { label: "inflammation+root-resorption", state: { toothSelection:"tooth-base", mods:["inflammation"], rootResorption:true } },
    { label: "implant+metal-crown", state: { toothSelection:"implant", crownMaterial:"metal" } },
    { label: "removable-bridge", state: { toothSelection:"none", bridgeUnit:"removable" } },
    { label: "extraction-wound", state: { toothSelection:"none", extractionWound:true } },
    // crown-replace: gate needs crownMaterial in {emax,zircon,metal,temporary,telescope} (never active in base/enum rows)
    { label: "crown-replace-metal", state: { toothSelection:"tooth-base", crownMaterial:"metal", crownReplace:true } },
    { label: "crown-replace-emax", state: { toothSelection:"tooth-base", crownMaterial:"emax", crownReplace:true } },
    // missing-closed: gate needs toothSelection === "none"
    { label: "missing-closed", state: { toothSelection:"none", missingClosed:true } },
    // boolean appliesWhen SUPPRESSION: calculus must not render off a present tooth-base
    { label: "calculus-on-implant", state: { toothSelection:"implant", calculus:true } },
    { label: "calculus-on-extracted", state: { toothSelection:"none", extractionWound:true, calculus:true } },
  ];
}

// New-model restoration coverage: states authored DIRECTLY in the new axes
// (toothSubstrate / restorationType / restorationMaterial), bypassing the
// legacy `crownMaterial`/`bridgeUnit` hydrateState migration branch entirely
// (raw.restorationType !== undefined short-circuits it). These exercise
// materials/types the legacy `crownMaterial` enum cannot express: gold/gradia/
// metal-ceramic crowns, inlay/veneer across all their supported materials, a
// bridge on a non-legacy-enum material, and directly-authored toothSubstrate
// values. Applies to every template (front + occlusal) like the other
// per-template generators.
const NEW_MODEL_INLAY_VENEER_MATERIALS = ["emax", "gold", "gradia", "zircon", "temporary"];

function newModelRestorationCases(): { label: string; state: Record<string, unknown> }[] {
  const cases: { label: string; state: Record<string, unknown> }[] = [
    // Crown materials the legacy `crownMaterial` enum cannot name directly
    // (gold/gradia already reach "crown" via legacy migration; metal-ceramic
    // is the deliberate rename target of legacy "metal" — here authored raw).
    { label: "crown-gold-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"crown", restorationMaterial:"gold" } },
    { label: "crown-gradia-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"crown", restorationMaterial:"gradia" } },
    { label: "crown-metal-ceramic-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"crown", restorationMaterial:"metal-ceramic" } },
    // Bridge on a new (non-legacy-fixed) material.
    { label: "bridge-gold-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"bridge", restorationMaterial:"gold" } },
    { label: "bridge-gradia-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"bridge", restorationMaterial:"gradia" } },
    // toothSubstrate authored directly, with no restoration on top.
    { label: "substrate-radix-new", state: { toothSelection:"tooth-base", toothSubstrate:"radix" } },
    { label: "substrate-crownprep-new", state: { toothSelection:"tooth-base", toothSubstrate:"crownprep" } },
  ];
  for (const m of NEW_MODEL_INLAY_VENEER_MATERIALS) {
    cases.push({ label: `inlay-${m}-new`, state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"inlay", restorationMaterial:m } });
    cases.push({ label: `veneer-${m}-new`, state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"veneer", restorationMaterial:m } });
  }
  return cases;
}

// Onlay is occlusalOnly (RESTORATION_MATRIX) and its SVG layers only exist on
// the `*_occl` templates — pushed only for those templates, never for front.
function newModelOcclusalOnlyCases(): { label: string; state: Record<string, unknown> }[] {
  return NEW_MODEL_INLAY_VENEER_MATERIALS.map(m => ({
    label: `onlay-${m}-new`,
    state: { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"onlay", restorationMaterial:m },
  }));
}

export function svgCases() {
  const cases: { toothNo:number; view:"front"|"occlusal"; template:string; state:Record<string,unknown> }[] = [];
  for (const t of TEMPLATES) {
    cases.push({ ...t, state: baseState() });
    for (const [field, values] of ENUM_FIELDS)
      for (const v of values) cases.push({ ...t, state: { toothSelection:"tooth-base", [field]: v } });
    for (const b of BOOLEAN_FIELDS) cases.push({ ...t, state: { toothSelection:"tooth-base", [b]: true } });
    for (const c of Array.from(VALID_CARIES)) cases.push({ ...t, state: { toothSelection:"tooth-base", caries:[c] } });
    // Per-surface caries depth (ICDAS code -> opacity tier + "caries-deep" class):
    // codes <=2 -> tier1 (opacity 0.45), <=4 -> tier2 (opacity 0.7), else tier3
    // (opacity 1 + caries-deep). caries-subcrown has no depth encoding (skipped
    // by applyStateToSvgSingle before the depth block), so exclude it here.
    for (const c of Array.from(VALID_CARIES)) {
      if (c === "caries-subcrown") continue;
      const surface = c.replace("caries-", "");
      for (const d of [2, 4, 6])
        cases.push({ ...t, state: { toothSelection:"tooth-base", caries:[c], cariesDepths:{ [surface]: d } } });
    }
    for (const s of Array.from(VALID_FILLING_SURFACES)) cases.push({ ...t, state: { toothSelection:"tooth-base", fillingMaterial:"amalgam", fillingSurfaces:[s], fillingSurfaceMaterials:{ [s]:"amalgam" } } });
    for (const m of Array.from(VALID_MODS)) cases.push({ ...t, state: { toothSelection:"tooth-base", mods:[m] } });
    for (const tr of trickyStates()) cases.push({ ...t, state: tr.state });
    for (const nr of newModelRestorationCases()) cases.push({ ...t, state: nr.state });
    if (t.view === "occlusal") for (const oc of newModelOcclusalOnlyCases()) cases.push({ ...t, state: oc.state });
  }
  return cases;
}

export function payloadCases() {
  // One full-arch-ish payload built from a representative subset of svgCases states.
  const teeth: Record<string, unknown> = {};
  const sample = svgCases().filter(c => c.view === "front").slice(0, 40);
  sample.forEach((c, i) => { teeth[String(11 + i)] = c.state; });
  return [
    { name: "empty", payload: { version: "1.4", teeth: {} } },
    { name: "edentulous", payload: { version: "1.4", globals: { edentulous: true }, teeth: {} } },
    { name: "mixed", payload: { version: "1.4", teeth } },
    // Force the FHIR emit/parse branches the enum-only "mixed" sample never reaches:
    { name: "branches", payload: { version: "1.4", teeth: {
      "11": { toothSelection:"tooth-base", caries:["caries-occlusal"], cariesDepths:{ occlusal: 4 } },              // set -> valueInteger
      "12": { toothSelection:"tooth-base", fillingMaterial:"composite", fillingSurfaces:["mesial","occlusal"],
              fillingSurfaceMaterials:{ mesial:"composite", occlusal:"amalgam" } },                                  // restoration -> component
      "13": { toothSelection:"tooth-base", pulpInflam:true, calculus:true, extractionPlan:true },                    // boolean -> valueBoolean
      "14": { toothSelection:"none", missingClosed:true },                                                           // boolean on none
      // New-model restoration coding, authored directly (not via legacy
      // crownMaterial migration): toothSubstrate + restorationType +
      // restorationMaterial each emit their own enum-valued Observation.
      "15": { toothSelection:"tooth-base", toothSubstrate:"crownprep", restorationType:"crown", restorationMaterial:"metal-ceramic" },
    } } },
  ];
}
