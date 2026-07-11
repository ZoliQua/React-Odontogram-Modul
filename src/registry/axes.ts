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
  { id: "periapicalType", field: "periapicalType", kind: "enum", valueGroup: "periapicalType",
    skipValue: "none", finding: { local: "periapical-lesion-type", display: "Periapical lesion type" },
    values: withSvgLayer(valuesFrom("periapicalType"), {
      "granuloma": "granuloma",
      "cyst": "cysta",
      "abscess": "abscess",
    }),
    uiOptions: [
      { value: "none", labelKey: "periapical.type.none" }, { value: "granuloma", labelKey: "periapical.type.granuloma" },
      { value: "cyst", labelKey: "periapical.type.cyst" },
    ] },

  { id: "fillingMaterial", field: "fillingMaterial", kind: "restoration", valueGroup: "fillingMaterial",
    skipValue: "none", surfacesField: "fillingSurfaces", finding: { local: "restoration", display: "Dental restoration" },
    values: valuesFrom("fillingMaterial") },

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

  // SP4 Task 1: pulp/apical/resorption diagnosis axes (additive scaffolding —
  // registry/FHIR/i18n only; render + migration + retirement of the legacy
  // booleans land in later SP4 tasks). `resorptionType` below was wired up
  // (render + migration; replaced the retired `rootResorption` boolean) in
  // SP4 Task 2. `pulpDx` below was wired up (render + migration; replaced
  // the retired `pulpInflam` boolean) in SP4 Task 3 — its render is bespoke
  // (milktooth/permanent split in odontogram.ts), so unlike `resorptionType`
  // it deliberately carries no `svgLayer` metadata here (mirrors the retired
  // `pulpInflam` axis, which never had one either).
  // See docs/superpowers/specs/2026-07-13-odontogram-sp4-endo-pulp-diagnosis-design.md.
  { id: "pulpDx", field: "pulpDx", kind: "enum", valueGroup: "pulpDx",
    skipValue: "normal", finding: { local: "pulp-diagnosis", display: "Pulp diagnosis (AAE)" },
    values: valuesFrom("pulpDx") },
  { id: "pulpLatin", field: "pulpLatin", kind: "enum", valueGroup: "pulpLatin",
    skipValue: "none", flag: "latinPulpDetail",
    finding: { local: "pulp-diagnosis-latin", display: "Pulp diagnosis (Latin, practical)" },
    values: valuesFrom("pulpLatin") },
  { id: "apicalDx", field: "apicalDx", kind: "enum", valueGroup: "apicalDx",
    skipValue: "normal", finding: { local: "apical-diagnosis", display: "Apical diagnosis (AAE)" },
    values: valuesFrom("apicalDx") },
  { id: "resorptionType", field: "resorptionType", kind: "enum", valueGroup: "resorptionType",
    skipValue: "none", finding: { local: "root-resorption-type", display: "Root resorption type" },
    values: valuesFrom("resorptionType"),
    // Both `internal` and `external-cervical` render the single `endo-resorption`
    // layer (visually identical; only the data distinguishes them). This axis-
    // level svgLayer/appliesWhen is metadata only (kept for the clear-set +
    // svg-layers.test.ts coverage) — `applyFlagLayers` only auto-activates
    // boolean-kind axes, so the actual activation is explicit in
    // applyStateToSvgSingle (odontogram.ts), byte-identical to the retired
    // `rootResorption:true` boolean render (SP4 Task 2).
    svgLayer: "endo-resorption", appliesWhen: (c) => c.toothPresent },

  // SP11 Task 1: bruxismWear/bruxismNeckWear (booleans) retired in favor of the
  // wearEdge/wearCervical type enums (mirrors resorptionType above).
  { id: "wearEdge", field: "wearEdge", kind: "enum", valueGroup: "wearEdge",
    skipValue: "none", finding: { local: "tooth-wear-edge", display: "Incisal/occlusal wear" },
    values: valuesFrom("wearEdge"),
    // All types render the single `tooth-bruxism-wear` layer; the axis svgLayer is
    // metadata only (svg-layers.test coverage) — activation is explicit in
    // applyStateToSvgSingle (applyFlagLayers only auto-activates boolean axes).
    svgLayer: "tooth-bruxism-wear", appliesWhen: (c) => c.bruxismAllowed },
  { id: "wearCervical", field: "wearCervical", kind: "enum", valueGroup: "wearCervical",
    skipValue: "none", finding: { local: "tooth-wear-cervical", display: "Cervical wear" },
    values: valuesFrom("wearCervical"),
    svgLayer: "tooth-bruxism-neck-wear", appliesWhen: (c) => c.bruxismAllowed },

  // SP12 Task 1: discoloration foundation (registry/FHIR/i18n only; render lands
  // in a later SP12 task).
  { id: "discoloration", field: "discoloration", kind: "enum", valueGroup: "discoloration",
    skipValue: "none", finding: { local: "tooth-discoloration", display: "Tooth discoloration" },
    // No svgLayer: activation is explicit in applyStateToSvgSingle — it tints the
    // crown path's .style.fill (no layer toggle), so there is no layer to declare.
    values: valuesFrom("discoloration") },

  // SP5 Task 1: caries fields foundation (additive scaffolding — registry/FHIR/i18n
  // only; render + migration land in later SP5 tasks). `rootCaries` is a normal enum
  // axis. `secondaryCaries` (per-surface CARS 0-6) and `radiographicDepth`
  // (per-surface none/E1/E2/D1/D2/D3) are scalar-map fields handled the same way
  // `cariesDepths` is — special-cased outside AXES/FIELD_MAPPINGS entirely (see
  // registry/fhir.ts + registry/fromFhir.ts) — so they deliberately have no row here.
  { id: "rootCaries", field: "rootCaries", kind: "enum", valueGroup: "rootCaries",
    skipValue: "none", finding: { local: "root-caries", display: "Root caries" },
    values: valuesFrom("rootCaries"),
    svgLayer: "caries-root", appliesWhen: (c) => c.toothPresent },

  // SP8 Task 1: peri-implantitis foundation (registry/FHIR/i18n only; SVG layer +
  // render + migration land in later SP8 tasks).
  { id: "periImplant", field: "periImplant", kind: "enum", valueGroup: "periImplant",
    skipValue: "none", finding: { local: "peri-implant-status", display: "Peri-implant status" },
    // No svgLayer: activation is explicit in applyStateToSvgSingle (mucositis reuses
    // the `parodontal` glyph; peri-implantitis adds `peri-implant-bone-loss` at
    // severity-scaled opacity). The bone-loss layer exists only on the 4 implant
    // SVGs, so it must NOT be declared as an axis svgLayer (which svg-layers.test.ts
    // would expect on every tooth). Mirrors the apicalDx axis.
    values: valuesFrom("periImplant") },
];
