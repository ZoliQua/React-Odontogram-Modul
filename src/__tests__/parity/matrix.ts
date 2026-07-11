// Deterministic parity matrix: every enum value / surface / boolean in isolation,
// plus curated tricky combinations, over the 6 representative templates.
import { VALID_TOOTH_SELECTION, VALID_CROWN_MATERIAL, VALID_ENDO, VALID_BRIDGE_UNIT,
  VALID_MOBILITY, VALID_PERIAPICAL_TYPE, VALID_CARIES, VALID_FILLING_MATERIAL, VALID_FILLING_SURFACES,
  VALID_MODS } from "../../odontogram";

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
  ["toothSelection", VALID_TOOTH_SELECTION], ["crownMaterial", VALID_CROWN_MATERIAL],
  ["endo", VALID_ENDO], ["bridgeUnit", VALID_BRIDGE_UNIT], ["mobility", VALID_MOBILITY],
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
    } } },
  ];
}
