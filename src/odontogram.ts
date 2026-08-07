// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { STATUS_EXTRAS } from "./status_extras";
import { t, onI18nChange, getI18nLanguage } from "./i18n/useI18n";
import { toLabel, type NumberingSystem } from "./utils/numbering";
import { type OdontogramPlugin, getQuadrant, LAYER_Z } from "./plugin";
import { buildFhirBundle } from "./fhir/toFhir";
import { parseFhirBundle } from "./fhir/fromFhir";
import type { FhirExportOptions } from "./fhir/types";
import { allClearLayers } from "./registry/svgLayers";
import { applyFlagLayers, buildFlagCtx } from "./registry/svgActivate";
import { validValues, validSurfaces } from "./registry/validate";
import { optionsFor, isAxisFlagSatisfied } from "./registry/uiOptions";
import {
  composeRestorationLayers, restorationOptions, isValidRestoration, RESTORATION_MATRIX,
  type RestorationType, type RestorationMaterial,
} from "./registry/restorations";
import {
  renderBridgeOverlay,
  detectBridgeSpans,
  computeBridgeBars,
  barRect,
  tileRectFor,
  defaultMaterialColor,
  type BridgeToothState,
} from "./bridgeOverlay";
import { derivePerioClassification, type PerioClassification, type PerioDerivationInput, type ToothDerivationInput } from "./perioClassification";
import { buildPerioSvg } from "./perioExport";
import { assemblePdf, type PdfExportOptions, type PdfAssembleData, type PdfDocLike } from "./perioPdf";
// Tooth-template SVGs are imported with Vite's `?raw` suffix so their markup is
// INLINED into the JS bundle as string literals at build time — no runtime
// `fetch()` of an emitted asset URL. This is what makes the built library
// self-contained and portable to any consumer bundler (a fetched hashed asset
// URL would 404 in a downstream app). `TEMPLATES` therefore holds SVG *text*,
// not URLs.
import tooth11Svg from "./assets/teeth-svgs/11.svg?raw";
import tooth13Svg from "./assets/teeth-svgs/13.svg?raw";
import tooth14Svg from "./assets/teeth-svgs/14.svg?raw";
import tooth16Svg from "./assets/teeth-svgs/16.svg?raw";
import tooth14OcclSvg from "./assets/teeth-svgs/14_occl.svg?raw";
import tooth16OcclSvg from "./assets/teeth-svgs/16_occl.svg?raw";
/* Tooth SVG Test UI (v2) - vanilla JS */

// Exported (read-only use) so `perioGraphic.ts` can parse + clone the same
// tooth-base artwork for the perio "Dental Chart" tooth-row graphic without
// re-importing or duplicating this SVG text. Purely additive — no existing
// call site or behavior changes. Values are inlined SVG markup (see above).
export const TEMPLATES = {
  11: tooth11Svg,
  13: tooth13Svg,
  14: tooth14Svg,
  16: tooth16Svg,
};
const TEMPLATES_OCCL = {
  14: tooth14OcclSvg,
  16: tooth16OcclSvg,
};

// Tooth mapping in details:
// 11: 11,12 -> no rotate, no mirror; 21,22 -> no rotate, mirror Y
//     31,32 -> rotate 180; 41,42 -> rotate 180 + mirror Y
// 13: 13 -> no rotate; 23 -> mirror Y; 33 -> rotate 180; 43 -> rotate 180 + mirror Y
// 14: 14,15 -> no rotate; 24,25 -> mirror Y; 34,35 -> rotate 180; 44,45 -> rotate 180 + mirror Y
// 16: 16,17,18 -> no rotate; 26,27,28 -> mirror Y; 36,37,38 -> rotate 180; 46,47,48 -> rotate 180 + mirror Y
export const TOOTH_TEMPLATE = new Map([
  // 11 template
  [11, {tpl:11, rot:0, mirror:false}], [12,{tpl:11,rot:0,mirror:false}],
  [21,{tpl:11,rot:0,mirror:true}], [22,{tpl:11,rot:0,mirror:true}],
  [31, {tpl:11, rot:180, mirror:false}], [32,{tpl:11,rot:180,mirror:false}],
  [41,{tpl:11,rot:180,mirror:true}], [42,{tpl:11,rot:180,mirror:true}],
  // 13 template
  [13,{tpl:13,rot:0,mirror:false}],
  [23,{tpl:13,rot:0,mirror:true}],
  [33,{tpl:13,rot:180,mirror:false}],
  [43,{tpl:13,rot:180,mirror:true}],
  // 14 template
  [14,{tpl:14,rot:0,mirror:false}],[15,{tpl:14,rot:0,mirror:false}],
  [24,{tpl:14,rot:0,mirror:true}],[25,{tpl:14,rot:0,mirror:true}],
  [34,{tpl:14,rot:180,mirror:false}],[35,{tpl:14,rot:180,mirror:false}],
  [44,{tpl:14,rot:180,mirror:true}],[45,{tpl:14,rot:180,mirror:true}],
  // 16 template
  [16,{tpl:16,rot:0,mirror:false}],[17,{tpl:16,rot:0,mirror:false}],[18,{tpl:16,rot:0,mirror:false}],
  [26,{tpl:16,rot:0,mirror:true}],[27,{tpl:16,rot:0,mirror:true}],[28,{tpl:16,rot:0,mirror:true}],
  [36,{tpl:16,rot:180,mirror:false}],[37,{tpl:16,rot:180,mirror:false}],[38,{tpl:16,rot:180,mirror:false}],
  [46,{tpl:16,rot:180,mirror:true}],[47,{tpl:16,rot:180,mirror:true}],[48,{tpl:16,rot:180,mirror:true}],
]);

const ALL_TEETH = [
  18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
  48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38
];

const GROUPS = {
  fillingSurfaces: ["buccal","lingual","mesial","distal","occlusal"],
};

const MILKTOOTH_BLOCKED = new Set([16,17,18,26,27,28,36,37,38,46,47,48]);
const FISSURE_ALLOWED = new Set([16,17,26,27,36,37,46,47]);
const BROKEN_VARIANTS = new Set([
  "tooth-broken-incisal",
  "tooth-broken-distal-incisal",
  "tooth-broken-distal",
  "tooth-broken-mesial-incisal",
  "tooth-broken-mesial",
]);
const PRIMARY_MILK = new Set([11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45]);
const MIXED_PERMANENT = new Set([11,12,16,21,22,26,31,32,36,41,42,46]);
const MIXED_MILK = new Set([13,14,15,23,24,25,33,34,35,43,44,45]);
const MIXED_NONE = new Set([17,18,27,28,37,38,47,48]);

// SP6 Task 4 (§8): anterior teeth (incisors + canines) — FDI 11-13/21-23/31-33/
// 41-43. Drives the "occlusal" -> "incisal" display-only label swap; the
// stored surface value always stays "occlusal".
const ANTERIOR_TEETH = new Set([11,12,13,21,22,23,31,32,33,41,42,43]);
export function isAnteriorTooth(toothNo: number): boolean {
  return ANTERIOR_TEETH.has(toothNo);
}

// SP16 Task 2: arch helper (upper vs. lower jaw) — quadrants 1/2 (permanent
// upper) and 5/6 (milk upper) are "upper"; 3/4 (permanent lower) and 7/8
// (milk lower) are "lower". Drives the full-mode lingual->palatal swap.
export function isUpperTooth(toothNo: number): boolean {
  const q = Math.floor(toothNo / 10);
  return q === 1 || q === 2 || q === 5 || q === 6;
}

// SP-perio P2b Task 2: furcation entrance set for a given tooth, by FDI
// POSITION (`toothNo % 10`) + quadrant. Deliberately position-based only —
// it does NOT gate on whether the tooth is actually present/natural (that
// present-natural-tooth gate belongs to the render layer, added in a later
// task). Upper molars (position 6/7/8, quadrants 1-2: 16/17/18, 26/27/28)
// have 3 entrances (mesial/distal/buccal); lower molars (quadrants 3-4:
// 36/37/38, 46/47/48) have 2 (buccal/lingual); upper FIRST premolars only
// (14, 24 — position 4, quadrants 1-2) have 2 (mesial/distal), since the
// mesial root trunk on an upper first premolar can carry a furcation, unlike
// upper second premolars (15/25) or any lower premolar. Every other tooth
// (anteriors, lower premolars, upper 2nd premolars) has none. Returns a
// fresh array each call (safe to mutate); order matches the brief exactly.
export function furcationEntrances(toothNo: number): string[] {
  const position = toothNo % 10;
  const quadrant = Math.floor(toothNo / 10);
  const isUpperQuadrant = quadrant === 1 || quadrant === 2;
  const isLowerQuadrant = quadrant === 3 || quadrant === 4;
  const isMolarPosition = position === 6 || position === 7 || position === 8;
  if (isMolarPosition && isUpperQuadrant) return ["mesial", "distal", "buccal"];
  if (isMolarPosition && isLowerQuadrant) return ["buccal", "lingual"];
  if (position === 4 && isUpperQuadrant) return ["mesial", "distal"]; // 14/24 only
  return [];
}

const MOD_OPTIONS = optionsFor("mods");

function getPeriapicalTypeOptions(){
  return optionsFor("periapicalType").map(o => ({ value: o.value, label: t(o.labelKey) }));
}

const CARIES_OPTIONS = [
  { value: "caries-mesial", labelKey: "surface.mesial" },
  { value: "caries-distal", labelKey: "surface.distal" },
  { value: "caries-buccal", labelKey: "surface.buccal" },
  { value: "caries-lingual", labelKey: "surface.lingualPalatal" },
  { value: "caries-occlusal", labelKey: "surface.occlusal" },
  { value: "caries-subcrown", labelKey: "surface.subcrown" },
];

const FILLING_SURFACE_LABELS: Record<string, string> = {
  buccal: "surface.buccal",
  lingual: "surface.lingualPalatal",
  mesial: "surface.mesial",
  distal: "surface.distal",
  occlusal: "surface.occlusal",
};

type Any = any;

// Restoration material -> its SVG wrapper <g> id. Every material lives inside a
// per-material group in the artwork; activating the group lets its (individually
// toggled) crown/connector/inlay/onlay/veneer children paint. `temporary` uses a
// legacy group id; all others match the material id.
const RESTORATION_WRAPPER_GROUP: Record<string, string> = {
  emax: "emax", gold: "gold", gradia: "gradia", zircon: "zircon", metal: "metal",
  "metal-ceramic": "metal-ceramic", telescope: "telescope", temporary: "temporary-restorations",
};

// `prosthesis` axis value -> its i18n summary label. Implant attachments
// (healing-abutment/locator/bar) and removable/bar-retained dentures share this
// one map — used by both the per-tooth tooltip (getStateSummary) and the
// tooth-information panel (getOdontogramSummary).
const PROSTHESIS_SUMMARY_KEY: Record<string, string> = {
  "healing-abutment": "prosthesis.type.healingAbutment",
  locator: "prosthesis.type.locator",
  "locator-denture": "prosthesis.type.locatorDenture",
  bar: "prosthesis.type.bar",
  "bar-denture": "prosthesis.type.barDenture",
  "removable-partial": "prosthesis.type.removablePartial",
  "removable-full": "prosthesis.type.removableFull",
};

// SP-perio P1 Task 1: canonical 6-site periodontal probing order — buccal row
// (mesio-buccal, buccal, disto-buccal), then lingual/palatal row (mesio-
// lingual, lingual/palatal, disto-lingual). Shared verbatim by the data core
// here and every later perio task (UI charting grid, FHIR mapping) — the
// exact array identity/order those tasks key their per-site controls to.
export const PERIO_SITES = ["MB", "B", "DB", "ML", "L", "DL"] as const;
export type PerioSite = typeof PERIO_SITES[number];

function defaultState(){
  return {
    toothSelection: "tooth-base", // none | tooth-base | milktooth | implant | variants
    endoResection: false,
    mods: new Set(),
    periapicalType: "none", // none | granuloma | cyst | abscess (qualifies mods "inflammation")
    endo: "none", // none | endo-medical-filling | endo-filling | endo-glass-pin | endo-metal-pin
    caries: new Set(),
    cariesActiveDepth: 2, // canonical ICDAS code (2 = superficial representative)
    // SP6 Task 1: the single unified per-surface caries severity (0..6). Read as
    // ICDAS on a primary-caries surface (no filling → drives `caries-{surface}`
    // opacity/`caries-deep`) and as CARS on a recurrent surface (filling present
    // → drives `subcaries-{surface}` opacity). Replaces the two SP5 fields
    // `cariesDepths` (ICDAS) + `secondaryCaries` (CARS), which are now read only
    // from the raw payload during migration (see hydrateState).
    cariesSeverity: new Map(), // surface -> unified severity 0..6
    fillingMaterial: "none", // active material chosen in the dropdown (applied on surface tap)
    fillingSurfaces: new Set(), // buccal/mesial/distal/occlusal (= keys of fillingSurfaceMaterials)
    fillingSurfaceMaterials: new Map(), // surface -> amalgam|composite|gic|temporary
    fissureSealing: false,
    calculus: false,
    contactMesial: false,
    contactDistal: false,
    wearEdge: "none", // none | attrition | erosion  (incisal/occlusal)
    wearCervical: "none", // none | abrasion | abfraction | erosion  (cervical)
    discoloration: "none", // none | tetracycline | fluorosis | nonvital | extrinsic | other
    // SP14 Task 1: orthodontic axes foundation (additive; render lands in Task 2).
    orthoAppliance: "none", // none | bracket | band
    orthoDrift: "none", // none | mesial | distal
    orthoVertical: "none", // none | extrusion | intrusion
    orthoRotation: false,
    brokenMesial: false,
    brokenIncisal: false,
    brokenDistal: false,
    extractionWound: false,
    extractionPlan: false,
    parapulpalPin: false,
    crownReplace: false,
    crownNeeded: false,
    missingClosed: false,
    bridgePillar: false,
    prosthesis: "none", // none | healing-abutment | locator | locator-denture | bar | bar-denture | removable-partial | removable-full
    mobility: "none", // none | m1 | m2 | m3
    toothSubstrate: "natural",  // natural | radix | broken | crownprep
    restorationType: "none",    // none | crown | inlay | onlay | veneer | bridge
    restorationMaterial: "none", // none | emax | gold | gradia | zircon | metal | metal-ceramic | telescope | temporary
    crownLeakage: false, // marginal leakage on a crown/bridge restoration (SP3b Task 6)
    // SP4 Task 1: pulp/apical/resorption diagnosis axes. pulpLatin/apicalDx
    // are additive scaffolding — not yet rendered/wired to UI or migration;
    // see later SP4 tasks. resorptionType was wired up (render + migration;
    // replaced the retired `rootResorption` boolean) in SP4 Task 2. pulpDx
    // was wired up (render + migration; replaced the retired `pulpInflam`
    // boolean) in SP4 Task 3.
    pulpDx: "normal", // normal | reversible-pulpitis | irreversible-pulpitis | necrosis (replaces the legacy `pulpInflam` boolean)
    pulpLatin: "none", // none | pulpa-sana | hyperaemia-pulpae | pulpitis-acuta-serosa | pulpitis-acuta-purulenta | pulpitis-chronica-clausa | pulpitis-chronica-ulcerosa | pulpitis-chronica-hyperplastica | necrosis-pulpae | gangraena-pulpae
    apicalDx: "normal", // normal | symptomatic-apical-periodontitis | asymptomatic-apical-periodontitis | acute-apical-abscess | chronic-apical-abscess | condensing-osteitis
    resorptionType: "none", // none | internal | external-cervical (replaces the legacy `rootResorption` boolean)
    // SP5 Task 1: caries fields foundation. `rootCaries` is a normal enum axis.
    // `radiographicDepth` is a per-surface scalar map (independent of the visual
    // severity — the radiographic-vs-visual split). The SP5 `secondaryCaries`
    // CARS map was retired in SP6 Task 1 (folded into the unified
    // `cariesSeverity` above; still read from the raw payload on migration).
    rootCaries: "none", // none | active | arrested | active-cavitated
    radiographicDepth: new Map(), // surface -> none | E1 | E2 | D1 | D2 | D3
    fillingDefect: new Map(), // surface -> none | marginal | fracture | wear (on a filled surface)
    // SP8 Task 1 foundation, wired up (render + migration) in Task 3: implant-only
    // peri-implant disease axis. none | mucositis | peri-implantitis-mild |
    // peri-implantitis-moderate | peri-implantitis-severe.
    periImplant: "none",
    // SP-perio PG-C Task 2: two per-tooth categorical DATA axes (registry/FHIR/
    // payload only; the Dental Chart rows/UI land in PG-C Task 3). Both default
    // "none" and are omit-when-none on serialize; NO svgLayer, so neither renders.
    cejVisibility: "none", // none | detectable | not-detectable
    rootConcavity: "none", // none | mild | deep
    // SP-perio PG-D Task 3: two per-tooth categorical DATA axes (registry/FHIR/
    // payload only; the Dental Chart rows/UI land in later PG-D tasks). Both
    // are omit-when-skip on serialize; NO svgLayer, so neither renders.
    gingivalThickness: "unknown", // unknown | thin | medium | thick
    millerClass: "none", // none | i | ii | iii | iv
    // SP-perio P1 Task 1: per-tooth, per-site periodontal probing data —
    // deliberately a SEPARATE sub-record from the 5-surface caries maps
    // above (perio sites are a different geometry: 6 fixed probing points,
    // not tooth surfaces). `pd` (probing depth, mm) is the CHARTING key: a
    // site exists in this record iff `pd` has an entry for it — "absence
    // means not charted", never zero. `gm` (gingival margin offset, mm;
    // signed — positive = recession, negative = coronal/pseudopocket)
    // defaults to 0 when unset. Clinical attachment level (CAL = pd + gm) is
    // ALWAYS derived (see getToothCal()) — never stored. `bop`/`sup`
    // (bleeding/suppuration on probing) are membership-only Sets, and are
    // only ever meaningful for a charted site (see setPerioSite()).
    perio: { pd: new Map(), gm: new Map(), bop: new Set(), sup: new Set() },
    // SP-perio P2b Task 2: per-entrance Glickman furcation involvement grade
    // (I-IV, stored as integer 1-4). Keyed by entrance ("mesial"/"distal"/
    // "buccal"/"lingual" — see furcationEntrances()); an entrance absent
    // from this map is "not recorded", never grade 0. Separate sub-record
    // from `perio` (different geometry: furcation entrances, not the 6
    // fixed probing sites) but follows the exact same omit-when-empty /
    // dual-state conventions.
    furcation: new Map(), // entrance -> grade 1-4
    // SP-perio P2b Task 3: per-surface O'Leary plaque-index presence — a
    // plain 4-surface membership Set (surface in the set = plaque present on
    // it; absence = clean/not recorded — NOT "known absent", same
    // "absence means not charted" convention `perio`/`furcation` use). The
    // 4 surfaces (VALID_PLAQUE_SURFACE below) are the SAME fixed set for
    // EVERY tooth — deliberately distinct from both the 6-site perio-probing
    // geometry and the 5-surface caries/filling geometry, and unlike
    // furcation's position-gated entrance set, no per-tooth gating function
    // is needed here.
    plaque: new Set(), // Set<"mesial"|"distal"|"buccal"|"lingual">
    // SP-perio PG-D Task 1: Silness-Löe Plaque Index (`pi`) and Löe-Silness
    // Gingival Index (`gi`) — per-surface GRADED indices (1-3), over the
    // SAME 4 fixed surfaces as the O'Leary `plaque` boolean above but
    // DELIBERATELY SEPARATE from it (different clinical instrument; a tooth
    // can carry both). Grade 0 (healthy/absent) is never stored — a surface
    // absent from the map means grade 0, same "absence means not charted"
    // convention `perio`/`furcation`/`plaque` all use.
    pi: new Map(), // surface -> Silness-Löe plaque grade 1-3 (absent = 0)
    gi: new Map(), // surface -> Löe-Silness gingival grade 1-3 (absent = 0)
    mpi: new Map(), // implant-only: Mombelli modified plaque index, surface -> grade 1-3 (absent = 0)
    mbi: new Map(), // implant-only: Mombelli modified sulcus bleeding index, surface -> grade 1-3
    // SP-perio PG-D Task 2: keratinized gingiva width — a single per-tooth
    // BUCCAL mm scalar (integer, clamped 0-15), deliberately NOT per-site/
    // per-surface unlike pi/gi/perio above. `null` = not charted (never a
    // stored 0 vs "uncharted" ambiguity — see clampKg()/setKeratinizedWidth()).
    kg: null as number | null,
    customStates: {} as Record<string, unknown>,
    note: "",
  };
}

// ---- DOM helpers ----
const $ = (sel: string, el: ParentNode = document) => el.querySelector(sel) as any;
const $$ = (sel: string, el: ParentNode = document) => Array.from(el.querySelectorAll(sel)) as any[];

function el(tag: Any, attrs: Any = {}, children: Any[] = []){
  const n=document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){
    if(k==="class") n.className=v;
    else if(k==="text") n.textContent=v;
    else if(k.startsWith("on") && typeof v==="function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k,v);
  }
  for(const c of children) n.appendChild(c);
  return n;
}

function setActive(node: Any, on: Any){
  if(!node) return;
  node.setAttribute("data-active", on ? "1":"0");
}

function stripDisplayNoneToDataActive(root: Any){
  // Convert inline style display:none -> data-active=0, and remove display property from style.
  const nodes = $$("[id]", root);
  for(const n of nodes){
    const style = n.getAttribute("style");
    if(style && /display\s*:\s*none/i.test(style)){
      n.setAttribute("data-active","0");
      // remove display: none; (and possible surrounding semicolons/spaces)
      const newStyle = style
        .replace(/display\s*:\s*none\s*;?/ig, "")
        .replace(/;;+/g,";")
        .trim();
      if(newStyle) n.setAttribute("style", newStyle);
      else n.removeAttribute("style");
    }
  }
}

function ensureDataActiveForSwitchables(root: Any){
  // Every element that is inside these switchable groups and has an id should get data-active (default 0 if missing)
  const switchableGroups = ["mods","tooth-variants","endos","surfaces","restorations","specials"];
  for(const gId of switchableGroups){
    const g = root.getElementById ? root.getElementById(gId) : $("#"+gId, root);
    if(!g) continue;
    for(const n of $$("[id]", g)){
      if(!n.hasAttribute("data-active")) n.setAttribute("data-active","0");
    }
  }
  // Tooth base + pulps should also be consistent
  for(const id of ["tooth-base","tooth-healthy-pulp","tooth-inflam-pulp","milktooth-base","milktooth-beauty","milktooth-healthy-pulp","milktooth-inflam-pulp","tooth-bruxism-wear","tooth-bruxism-neck-wear"]){
    const n = $("#"+id, root);
    if(n && !n.hasAttribute("data-active")) n.setAttribute("data-active","0");
  }
}

function rotate180(svgRoot: Any){
  // rotate around center using a wrapper group
  const vb = svgRoot.getAttribute("viewBox") || "0 0 32 64";
  const parts = vb.trim().split(/\s+/).map(Number);
  const cx = parts[0] + parts[2]/2;
  const cy = parts[1] + parts[3]/2;
  // wrap existing content into a new group
  const g = document.createElementNS("http://www.w3.org/2000/svg","g");
  while(svgRoot.firstChild){
    g.appendChild(svgRoot.firstChild);
  }
  g.setAttribute("transform", `rotate(180 ${cx} ${cy})`);
  svgRoot.appendChild(g);
}

function mirrorVertical(svgRoot: Any){
  // mirror vertically (left-right) around center using a wrapper group
  const vb = svgRoot.getAttribute("viewBox") || "0 0 32 64";
  const parts = vb.trim().split(/\s+/).map(Number);
  const cx = parts[0] + parts[2]/2;
  const g = document.createElementNS("http://www.w3.org/2000/svg","g");
  while(svgRoot.firstChild){
    g.appendChild(svgRoot.firstChild);
  }
  g.setAttribute("transform", `scale(-1 1) translate(${-2*cx} 0)`);
  svgRoot.appendChild(g);
}

function svgGetById(root: Any, id: Any){
  return root.getElementById ? root.getElementById(id) : $("#"+id, root);
}

// ---- App state ----
// R2-A Task 1: dual-state core. The chart now carries two PARALLEL per-case
// states — "status" (findings as they are) and "plan" (proposed treatment) —
// stored in `charts`. `toothState` is kept as a module-scoped, REASSIGNABLE
// ALIAS to whichever chart is currently active, so every existing
// `toothState.get/set/has/delete/clear/keys/values/entries`/`for...of
// toothState` site (~78 of them) keeps compiling and operating on the active
// chart unchanged — only the declaration (`const` -> `let`) and the addition
// of `setChartMode()` reassigning it are new. Render/edit logic is untouched.
// Map key is typed `Any` (not `number`) deliberately: the pre-existing
// `const toothState = new Map()` had NO type parameters, so both key and
// value inferred as `any` — several long-standing call sites pass an
// untyped `Set`/array element (e.g. `selectedTeeth`, declared `Set()` with
// no type param) as the key. Typing the key `number` here would newly
// reject those ~78-unchanged call sites under `tsc -b --noEmit`, which is
// exactly the compile-unchanged guarantee this task must preserve.
const charts: Record<"status" | "plan", Map<Any, Any>> = {
  status: new Map(),
  plan: new Map(),
};
let toothState = charts.status; // active-chart ALIAS — reassigned by setChartMode()
export type ChartMode = "status" | "plan";
let chartMode: ChartMode = "status";

// ---- P4a Task 1: case-level metadata object -------------------------------
// The engine's FIRST case-level object: a single SHARED module-level record
// (NOT per-tooth, NOT part of the status/plan dual-state) for chart-independent
// case context — patient age, smoking, diabetes/HbA1c, and perio summary stats
// (tooth loss attributable to periodontitis, max radiographic bone loss %).
// Mirrors the existing top-level `globals` payload key: one shared block,
// serialized once into the payload's top-level `case` key (omit-when-empty),
// hydrated in the shared `hydrateImportedCharts` data-path used by both
// `importStatus()` and `__hydrateImportedChartsForTest()`.
type CaseMeta = {
  age: number | null;
  smokingStatus: "unknown" | "never" | "former" | "current";
  cigarettesPerDay: number | null;
  diabetesStatus: "unknown" | "none" | "present";
  hba1c: number | null;
  toothLossPerio: number | null;
  maxRblPercent: number | null;
  /** P4b Task 2: per-axis clinician overrides for the 2017 World Workshop
   *  periodontal classification (`getPerioClassification()`). Each is either
   *  a valid enum value for that axis or `null` (not overridden — the
   *  derived value from `derivePerioClassification` wins). Shared caseMeta
   *  fields exactly like the rest of this object — NOT DS-1 gated. */
  diagnosisOverride: string | null;
  stageOverride: string | null;
  gradeOverride: string | null;
  extentOverride: string | null;
  /** UI-3b: PDF-report identity — patient display name + exam date (ISO
   *  `YYYY-MM-DD`). Additive caseMeta fields; NOT emitted to FHIR. */
  patientName: string | null;
  /** 2.2.1: patient date of birth (ISO `YYYY-MM-DD`). PDF-report identity
   *  only, like patientName/examDate — additive, NOT emitted to FHIR. */
  patientDob: string | null;
  examDate: string | null;
};
function defaultCaseMeta(): CaseMeta {
  return { age: null, smokingStatus: "unknown", cigarettesPerDay: null,
    diabetesStatus: "unknown", hba1c: null, toothLossPerio: null, maxRblPercent: null,
    diagnosisOverride: null, stageOverride: null, gradeOverride: null, extentOverride: null,
    patientName: null, patientDob: null, examDate: null };
}
let caseMeta: CaseMeta = defaultCaseMeta();
const VALID_SMOKING = new Set(["unknown", "never", "former", "current"]);
const VALID_DIABETES = new Set(["unknown", "none", "present"]);
/** P4b Task 2: valid enum values for the four classification override axes —
 *  mirrors `PerioDiagnosis`/`PerioStage`/`PerioGrade`/`PerioExtent` in
 *  `perioClassification.ts` MINUS their non-authorable derived-only values
 *  (`"na"`, `"indeterminate"`) — an override always names a concrete clinical
 *  value, never one of those computed placeholders. */
const VALID_DIAGNOSIS = new Set(["health", "gingivitis", "periodontitis"]);
const VALID_STAGE = new Set(["I", "II", "III", "IV"]);
const VALID_GRADE = new Set(["A", "B", "C"]);
const VALID_EXTENT = new Set(["localized", "generalized", "molar-incisor"]);
function clampInt(v: unknown, lo: number, hi: number): number | null {
  const n = Number(v);
  if(!Number.isFinite(n)) return null;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}
function setNumField(cur: number | null, v: unknown, lo: number, hi: number): number | null {
  // non-finite (bad keystroke) is a no-op: keep current; explicit null clears.
  if(v === null) return null;
  const c = clampInt(v, lo, hi);
  return c === null ? cur : c;
}
/** Current shared case-level metadata (age/smoking/diabetes/HbA1c/perio
 *  summary stats). Not part of the status/plan dual-state — chart-independent. */
export function getCaseMeta(): CaseMeta { return { ...caseMeta }; }
export function setCaseAge(v: number | null): void { const n = setNumField(caseMeta.age, v, 0, 120); if(n !== caseMeta.age){ caseMeta.age = n; notifyStateChange(); } }
export function setCigarettesPerDay(v: number | null): void { const n = setNumField(caseMeta.cigarettesPerDay, v, 0, 99); if(n !== caseMeta.cigarettesPerDay){ caseMeta.cigarettesPerDay = n; notifyStateChange(); } }
export function setToothLossPerio(v: number | null): void { const n = setNumField(caseMeta.toothLossPerio, v, 0, 32); if(n !== caseMeta.toothLossPerio){ caseMeta.toothLossPerio = n; notifyStateChange(); } }
export function setMaxRblPercent(v: number | null): void { const n = setNumField(caseMeta.maxRblPercent, v, 0, 100); if(n !== caseMeta.maxRblPercent){ caseMeta.maxRblPercent = n; notifyStateChange(); } }
export function setHba1c(v: number | null): void {
  // one-decimal % in 3.0–20.0; non-finite no-op, null clears.
  if(v === null){ if(caseMeta.hba1c !== null){ caseMeta.hba1c = null; notifyStateChange(); } return; }
  const n = Number(v);
  if(!Number.isFinite(n)) return;
  const clamped = Math.max(3, Math.min(20, Math.round(n * 10) / 10));
  if(clamped !== caseMeta.hba1c){ caseMeta.hba1c = clamped; notifyStateChange(); }
}
export function setSmokingStatus(v: string): void { if(VALID_SMOKING.has(v) && v !== caseMeta.smokingStatus){ caseMeta.smokingStatus = v as CaseMeta["smokingStatus"]; notifyStateChange(); } }
export function setDiabetesStatus(v: string): void { if(VALID_DIABETES.has(v) && v !== caseMeta.diabetesStatus){ caseMeta.diabetesStatus = v as CaseMeta["diabetesStatus"]; notifyStateChange(); } }
/** P4b Task 2: per-axis classification override setters. Each accepts either
 *  a valid enum value for that axis (see `VALID_DIAGNOSIS`/`VALID_STAGE`/
 *  `VALID_GRADE`/`VALID_EXTENT`) OR `null` (clears the override, reverting
 *  that axis to the derived value). An invalid non-null value is a silent
 *  no-op — mirrors `setSmokingStatus`/`setDiabetesStatus` above. Shared
 *  caseMeta fields, NOT DS-1 gated (same as every other caseMeta setter). */
export function setDiagnosisOverride(v: string | null): void {
  if(v === null){ if(caseMeta.diagnosisOverride !== null){ caseMeta.diagnosisOverride = null; notifyStateChange(); } return; }
  if(VALID_DIAGNOSIS.has(v) && v !== caseMeta.diagnosisOverride){ caseMeta.diagnosisOverride = v; notifyStateChange(); }
}
export function setStageOverride(v: string | null): void {
  if(v === null){ if(caseMeta.stageOverride !== null){ caseMeta.stageOverride = null; notifyStateChange(); } return; }
  if(VALID_STAGE.has(v) && v !== caseMeta.stageOverride){ caseMeta.stageOverride = v; notifyStateChange(); }
}
export function setGradeOverride(v: string | null): void {
  if(v === null){ if(caseMeta.gradeOverride !== null){ caseMeta.gradeOverride = null; notifyStateChange(); } return; }
  if(VALID_GRADE.has(v) && v !== caseMeta.gradeOverride){ caseMeta.gradeOverride = v; notifyStateChange(); }
}
export function setExtentOverride(v: string | null): void {
  if(v === null){ if(caseMeta.extentOverride !== null){ caseMeta.extentOverride = null; notifyStateChange(); } return; }
  if(VALID_EXTENT.has(v) && v !== caseMeta.extentOverride){ caseMeta.extentOverride = v; notifyStateChange(); }
}
/** UI-3b Task 1: patient display name + exam date setters. Mirror the
 *  existing caseMeta setter pattern — trim, `null`-clears, malformed
 *  exam-date values are a silent no-op (mirrors `setSmokingStatus`). */
export function setPatientName(v: string | null): void {
  const next = (v === null) ? null : (v.trim() === "" ? null : v.trim());
  if(next !== caseMeta.patientName){ caseMeta.patientName = next; notifyStateChange(); }
}
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export function setExamDate(v: string | null): void {
  if(v === null){ if(caseMeta.examDate !== null){ caseMeta.examDate = null; notifyStateChange(); } return; }
  if(v.trim() === ""){ if(caseMeta.examDate !== null){ caseMeta.examDate = null; notifyStateChange(); } return; }
  if(!ISO_DATE.test(v.trim())) return;  // malformed → no-op (mirrors setSmokingStatus)
  const next = v.trim();
  if(next !== caseMeta.examDate){ caseMeta.examDate = next; notifyStateChange(); }
}
/** 2.2.1: patient date-of-birth setter — same ISO-validate/null-clear contract
 *  as {@link setExamDate}; malformed values are a silent no-op. */
export function setPatientDob(v: string | null): void {
  if(v === null){ if(caseMeta.patientDob !== null){ caseMeta.patientDob = null; notifyStateChange(); } return; }
  if(v.trim() === ""){ if(caseMeta.patientDob !== null){ caseMeta.patientDob = null; notifyStateChange(); } return; }
  if(!ISO_DATE.test(v.trim())) return;  // malformed → no-op
  const next = v.trim();
  if(next !== caseMeta.patientDob){ caseMeta.patientDob = next; notifyStateChange(); }
}
export function resetCaseMeta(): void { caseMeta = defaultCaseMeta(); }
function caseMetaIsEmpty(c: CaseMeta): boolean {
  return c.age === null && c.smokingStatus === "unknown" && c.cigarettesPerDay === null
    && c.diabetesStatus === "unknown" && c.hba1c === null && c.toothLossPerio === null && c.maxRblPercent === null
    && c.diagnosisOverride === null && c.stageOverride === null && c.gradeOverride === null && c.extentOverride === null
    && c.patientName === null && c.patientDob === null && c.examDate === null;
}
function serializeCaseMeta(c: CaseMeta): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  if(c.age !== null) o.age = c.age;
  if(c.smokingStatus !== "unknown") o.smokingStatus = c.smokingStatus;
  if(c.cigarettesPerDay !== null) o.cigarettesPerDay = c.cigarettesPerDay;
  if(c.diabetesStatus !== "unknown") o.diabetesStatus = c.diabetesStatus;
  if(c.hba1c !== null) o.hba1c = c.hba1c;
  if(c.toothLossPerio !== null) o.toothLossPerio = c.toothLossPerio;
  if(c.maxRblPercent !== null) o.maxRblPercent = c.maxRblPercent;
  if(c.diagnosisOverride !== null) o.diagnosisOverride = c.diagnosisOverride;
  if(c.stageOverride !== null) o.stageOverride = c.stageOverride;
  if(c.gradeOverride !== null) o.gradeOverride = c.gradeOverride;
  if(c.extentOverride !== null) o.extentOverride = c.extentOverride;
  if(c.patientName !== null) o.patientName = c.patientName;
  if(c.patientDob !== null) o.patientDob = c.patientDob;
  if(c.examDate !== null) o.examDate = c.examDate;
  return o;
}
function hydrateCaseMeta(raw: Any): void {
  caseMeta = defaultCaseMeta();
  if(!raw || typeof raw !== "object") return;
  caseMeta.age = clampInt(raw.age, 0, 120);
  if(VALID_SMOKING.has(raw.smokingStatus)) caseMeta.smokingStatus = raw.smokingStatus;
  caseMeta.cigarettesPerDay = clampInt(raw.cigarettesPerDay, 0, 99);
  if(VALID_DIABETES.has(raw.diabetesStatus)) caseMeta.diabetesStatus = raw.diabetesStatus;
  { const n = Number(raw.hba1c); caseMeta.hba1c = Number.isFinite(n) ? Math.max(3, Math.min(20, Math.round(n * 10) / 10)) : null; }
  caseMeta.toothLossPerio = clampInt(raw.toothLossPerio, 0, 32);
  caseMeta.maxRblPercent = clampInt(raw.maxRblPercent, 0, 100);
  caseMeta.diagnosisOverride = VALID_DIAGNOSIS.has(raw.diagnosisOverride) ? raw.diagnosisOverride : null;
  caseMeta.stageOverride = VALID_STAGE.has(raw.stageOverride) ? raw.stageOverride : null;
  caseMeta.gradeOverride = VALID_GRADE.has(raw.gradeOverride) ? raw.gradeOverride : null;
  caseMeta.extentOverride = VALID_EXTENT.has(raw.extentOverride) ? raw.extentOverride : null;
  caseMeta.patientName = (typeof raw.patientName === "string" && raw.patientName.trim() !== "") ? raw.patientName.trim() : null;
  caseMeta.patientDob = (typeof raw.patientDob === "string" && ISO_DATE.test(raw.patientDob.trim())) ? raw.patientDob.trim() : null;
  caseMeta.examDate = (typeof raw.examDate === "string" && ISO_DATE.test(raw.examDate.trim())) ? raw.examDate.trim() : null;
}
/** P4a Task 2: builds the compact, labelled case-context fragment
 *  (e.g. "Age 54 · current smoker (12/day) · diabetic (HbA1c 7.8%) · max
 *  RBL 45% · 3 teeth lost to perio") appended to {@link getOdontogramSummary}'s
 *  `periodontalText` whenever `!caseMetaIsEmpty(caseMeta)`. Skips any field
 *  still at its default (age null, smoking/diabetes "unknown") — never claims
 *  a case fact that wasn't actually charted. */
function caseContextSummaryFragment(c: CaseMeta): string {
  const parts: string[] = [];
  if(c.age !== null) parts.push(t("case.summary.age", { age: c.age }));
  if(c.smokingStatus === "never") parts.push(t("case.summary.smokingNever"));
  else if(c.smokingStatus === "former") parts.push(t("case.summary.smokingFormer"));
  else if(c.smokingStatus === "current"){
    parts.push(c.cigarettesPerDay !== null
      ? t("case.summary.smokingCurrentCigs", { n: c.cigarettesPerDay })
      : t("case.summary.smokingCurrent"));
  }
  if(c.diabetesStatus === "none") parts.push(t("case.summary.diabetesNone"));
  else if(c.diabetesStatus === "present"){
    parts.push(c.hba1c !== null
      ? t("case.summary.diabetesPresentHba1c", { value: c.hba1c })
      : t("case.summary.diabetesPresent"));
  }
  if(c.maxRblPercent !== null) parts.push(t("case.summary.rbl", { value: c.maxRblPercent }));
  if(c.toothLossPerio !== null){
    parts.push(t(`case.summary.toothLoss${c.toothLossPerio === 1 ? "One" : "Other"}`, { n: c.toothLossPerio }));
  }
  return parts.join(" · ");
}
// Plan chart is lazily deep-cloned from status the FIRST time plan mode is
// entered; subsequent entries reuse whatever is already in charts.plan (so
// plan edits are never silently overwritten by re-cloning from status).
let planInitialized = false;

/** Current active chart mode ("status" | "plan"). */
export function getChartMode(): ChartMode { return chartMode; }

/** Deep-copy every tooth from `src` into `dst` via the proven
 *  serializeState/hydrateState round-trip, so the two charts never share
 *  Sets/Maps/objects (mutating one tooth's state can never leak into the
 *  other chart's copy). */
function cloneChart(src: Map<Any, Any>, dst: Map<Any, Any>): void {
  dst.clear();
  for(const [n, s] of src) dst.set(n, hydrateState(serializeState(s)));
}

// ---- DS-1 Task 1: status->plan edit gate + propagation --------------------
// The set of teeth that have been EXPLICITLY edited while `chartMode === "plan"`.
// Runtime-only — NEVER serialized (parity: SVG/FHIR/roundtrip goldens are
// unaffected). It records which plan teeth the user has intentionally diverged
// from status, so a later STATUS edit on such a tooth is allowed to diverge
// (rather than silently overwriting the plan by mirroring). A tooth NOT in this
// set still has its plan tracking status, so a status edit safely mirrors into
// plan (keeping the two charts in sync until the user deliberately plans that
// tooth). Cleared whenever the plan is (re)initialized, reset, or replaced by
// an import — a fresh plan carries no plan-edits.
let planEditedTeeth = new Set<number>();

/** Deep-copy tooth `toothNo`'s STATUS state into the PLAN chart via the proven
 *  serializeState -> hydrateState round-trip (fresh Maps/Sets, no shared refs —
 *  same guarantee as {@link cloneChart}). Passes `false` for
 *  `inferLegacySecondaryCaries`: the source is a live, fully-hydrated in-memory
 *  state whose recurrent-caries severities are already explicit, so no legacy
 *  inference is wanted. A status tooth with no entry mirrors a `defaultState()`
 *  into the plan (so the plan tooth exists and matches "sound"). */
function mirrorStatusToPlan(toothNo: number): void {
  charts.plan.set(toothNo, hydrateState(serializeState(charts.status.get(toothNo) ?? defaultState()), false));
}

/** DS-1 central edit GATE for a SINGLE interactive per-tooth edit. Every
 *  interactive per-tooth mutator routes its mutation through here so the
 *  status<->plan propagation policy lives in exactly one place. See the
 *  `planEditedTeeth` comment above for the policy. When the plan is
 *  uninitialized this is a pure passthrough (byte-identical to the
 *  pre-dual-state behavior). `applyFn` performs the actual mutation (+ any
 *  render) on the ACTIVE chart. */
function gateToothEdit(toothNo: number, applyFn: () => boolean | void): void {
  // `applyFn` may report `false` to signal it made NO change (a rejected /
  // no-op edit — e.g. an out-of-range perio value): in that case the tooth is
  // neither marked plan-edited nor mirrored. Any other return (incl. void) is
  // treated as a real edit.
  if(chartMode === "plan"){
    if(applyFn() !== false) planEditedTeeth.add(toothNo);
    return;
  }
  // chartMode === "status"
  if(!planInitialized || !planEditedTeeth.has(toothNo)){
    const changed = applyFn() !== false;
    if(planInitialized && changed) mirrorStatusToPlan(toothNo);
    return;
  }
  // status edit on a plan-edited tooth -> the status edit would DIVERGE from the
  // plan (the user has deliberately planned this tooth). T2: confirm BEFORE
  // applying. `applyFn` is deferred — accept applies it (status only; the plan
  // stays as planned, so they diverge and the diff shows it), cancel re-syncs
  // the active tooth's controls so the just-changed control snaps back.
  requestDualStateConfirm(
    () => { applyFn(); },
    revertActiveControls,
  );
}

/** DS-1 central edit GATE for a BATCH interactive edit spanning several teeth
 *  (e.g. `applyToSelected`). `applyFn` mutates ALL `toothNos` in one pass. In
 *  plan mode every touched tooth is marked plan-edited; in status mode (plan
 *  initialized) every tooth NOT already plan-edited mirrors status->plan after
 *  the batch (planned teeth diverge). Uninitialized plan -> pure passthrough.
 *  T2: a batch touching >=1 plan-edited tooth is CONFIRMED ONCE before applying
 *  (accept applies all + mirrors the un-planned teeth; cancel applies none +
 *  re-syncs the active tooth's controls). */
function gateToothEditBatch(toothNos: number[], applyFn: () => void): void {
  if(chartMode === "plan"){
    applyFn();
    for(const toothNo of toothNos) planEditedTeeth.add(toothNo);
    return;
  }
  // chartMode === "status"
  if(!planInitialized){
    applyFn();
    return;
  }
  const mirrorUnplanned = () => {
    for(const toothNo of toothNos){
      if(!planEditedTeeth.has(toothNo)) mirrorStatusToPlan(toothNo);
    }
  };
  // A batch touching >=1 plan-edited tooth would DIVERGE the plan -> confirm
  // ONCE before applying. Otherwise apply immediately and mirror the un-planned
  // teeth (T1 behavior — planned teeth diverge, un-planned mirror).
  if(toothNos.some(toothNo => planEditedTeeth.has(toothNo))){
    requestDualStateConfirm(
      () => { applyFn(); mirrorUnplanned(); },
      revertActiveControls,
    );
    return;
  }
  applyFn();
  mirrorUnplanned();
}

// ---- DS-1 Task 2: blocking confirm before a status edit on a plan-edited
// tooth ---------------------------------------------------------------------
// A status-mode edit on a tooth the user has deliberately planned (a member of
// `planEditedTeeth`) must be CONFIRMED before it applies, because it makes the
// status chart DIVERGE from the plan. The actual mutation (`apply`) and the
// control-revert (`revert`) are DEFERRED: the gate stores them here and
// notifies, the host surfaces a modal (driven by `isDualStateConfirmPending()`),
// and the user's choice runs exactly one of them. Runtime-only — never
// serialized (SVG/FHIR/roundtrip goldens are unaffected).
let pendingDualStateConfirm: { apply: () => void; revert: () => void } | null = null;

/** Whether a status-vs-plan divergence confirm is awaiting the user's choice. */
export function isDualStateConfirmPending(): boolean {
  return pendingDualStateConfirm !== null;
}

/** Store a deferred confirm (apply/revert) and notify so the host opens the
 *  modal. A second request while one is already pending is ignored — the modal
 *  is blocking so this cannot happen from the UI; the guard is defensive. */
function requestDualStateConfirm(apply: () => void, revert: () => void): void {
  if(pendingDualStateConfirm) return;
  pendingDualStateConfirm = { apply, revert };
  notifyStateChange();
}

/** User accepted the divergence: run the deferred edit (status only — the plan
 *  stays as planned), then notify (post-edit refresh + close the modal). No-op
 *  when nothing is pending. */
export function acceptDualStateConfirm(): void {
  const pending = pendingDualStateConfirm;
  pendingDualStateConfirm = null;
  if(pending) pending.apply();
  notifyStateChange();
}

/** User cancelled: do NOT apply the edit; re-sync the active tooth's controls
 *  from stored state so the control the user just changed snaps back (no stale
 *  UI), then notify (refresh + close the modal). No-op when nothing is pending. */
export function cancelDualStateConfirm(): void {
  const pending = pendingDualStateConfirm;
  pendingDualStateConfirm = null;
  if(pending) pending.revert();
  notifyStateChange();
}

/** Re-sync the active tooth's DOM controls from its stored state (the revert
 *  used on cancel). Null-safe: with no active tooth (headless module tests) it
 *  is a no-op; in the live app the full control DOM always exists. */
function revertActiveControls(): void {
  if(activeTooth != null) syncControlsFromState(toothState.get(activeTooth));
}

/** R2-A Task 3: sync the `Status | Plan` toggle in the chart-header with the
 *  current `chartMode` — `.is-active` on whichever of #chartModeStatus /
 *  #chartModePlan matches, `.plan-mode` on the chart card (`.chart`, the
 *  visual border/tint cue), and the "TERV/PLAN" badge's `.hidden` class.
 *  Every lookup is null-safe: `setChartMode()` (and therefore this function)
 *  is exercised by module-state tests (e.g. r2a-dual-state.test.ts) with no
 *  DOM mounted at all, so a missing toggle/card/badge must be a silent no-op,
 *  not a throw. Not part of the public API. */
function syncChartModeUi(): void {
  const isPlan = chartMode === "plan";
  const statusBtn = $("#chartModeStatus") as HTMLElement | null;
  const planBtn = $("#chartModePlan") as HTMLElement | null;
  const chartCard = $(".chart") as HTMLElement | null;
  const badge = $("#chartModePlanBadge") as HTMLElement | null;
  if(statusBtn){
    statusBtn.classList.toggle("is-active", !isPlan);
    statusBtn.setAttribute("aria-selected", String(!isPlan));
  }
  if(planBtn){
    planBtn.classList.toggle("is-active", isPlan);
    planBtn.setAttribute("aria-selected", String(isPlan));
  }
  if(chartCard) chartCard.classList.toggle("plan-mode", isPlan);
  if(badge) badge.classList.toggle("hidden", !isPlan);
}

/**
 * Switch the active chart between "status" (current findings) and "plan"
 * (proposed treatment). The first time "plan" is entered, it is deep-cloned
 * from "status" (see {@link cloneChart}); later switches reuse the existing
 * plan chart untouched. Re-renders every tooth from the newly active chart
 * via the SAME full-repaint mechanism `importStatus()` uses, so no new
 * render path is introduced and SVG output stays byte-identical to the
 * single-chart render (parity is unaffected — only WHICH chart is active
 * changes, never how a chart renders).
 *
 * @param mode - "status" or "plan"; any other value is ignored.
 */
export function setChartMode(mode: ChartMode): void {
  if(mode !== "status" && mode !== "plan") return;
  if(mode === chartMode) return;
  if(mode === "plan" && !planInitialized){
    cloneChart(charts.status, charts.plan);
    planInitialized = true;
    // DS-1: a freshly-cloned plan exactly matches status -> no plan-edits yet.
    planEditedTeeth.clear();
  }
  chartMode = mode;
  toothState = charts[mode];
  // Full repaint-all, reused verbatim from importStatus()'s post-populate loop.
  for(const toothNo of ALL_TEETH){
    applyStateToSvg(toothNo);
    updateToothTileNumber(toothNo);
    updateToothLabelNoteIcon(toothNo);
  }
  // 2.2.1: the tooth-base picker's option set is mode-dependent (Plan omits
  // milk/subgingival) — rebuild it whenever the mode changes.
  refreshToothSelectOptions();
  if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
  notifyStateChange();
  syncChartModeUi();
}

const toothSvgRoot = new Map(); // toothNo -> [svg elements]
const toothTile = new Map(); // toothNo -> [tile elements]
// Original DOM position of each SVG's "inflammation" group, so it can be
// restored after being temporarily lifted above the tooth (see z-order fix
// in applyStateToSvgSingle). Keyed by the group node itself.
const inflammationHome: Any = new WeakMap();
const toothLabelUpper = new Map(); // toothNo -> label element
const toothLabelLower = new Map(); // toothNo -> label element
let activeTooth = null;
let selectedTeeth = new Set();
let edentulous = false;
let wisdomVisible = true;
let showBase = true;
let occlusalVisible = true;
let showHealthyPulp = true;
let suppressEdentulousSync = false;
let numberingSystem: NumberingSystem = "FDI";
let readOnly = false;
let notesEnabled = false;
/** UI-4: per-card collapse state — a plain Record mapping card id to its
 *  collapsed (true) / expanded (false) status. Keys mirror the btnToggle*
 *  button ids sans the "btnToggle" prefix, lowercased: controls, status,
 *  caries, filling, rootPeriodontium. Persisted in the payload under
 *  `ui.collapsedCards` so the panel layout survives export/import cycles.
 *  Non-serialized session flags (pulpDetailLevel, surfaceNotation, etc.)
 *  remain unaffected — this is purely about which sections are open. */
const VALID_CARD_IDS = new Set(["controls", "status", "caries", "filling", "rootPeriodontium"]);
let collapsedCards: Record<string, boolean> = {};
export function getCollapsedCards(): Record<string, boolean> { return { ...collapsedCards }; }
export function isCardCollapsed(id: string): boolean {
  return VALID_CARD_IDS.has(id) ? !!collapsedCards[id] : false;
}
export function setCollapsedCard(id: string, collapsed: boolean): void {
  if(!VALID_CARD_IDS.has(id)) return;
  collapsedCards[id] = !!collapsed;
  notifyStateChange();
}
export function toggleCollapsedCard(id: string): void {
  if(!VALID_CARD_IDS.has(id)) return;
  collapsedCards[id] = !collapsedCards[id];
  notifyStateChange();
}
let icdasEnabled = false;
export function setIcdasEnabled(value: boolean){ icdasEnabled = !!value; if(activeTooth) syncControlsFromState(toothState.get(activeTooth)); }
export function getIcdasEnabled(): boolean { return icdasEnabled; }
// SP4 Task 5: pulp-detail level drives how the pulp control presents the pulp
// diagnosis — "simple" (healthy/pulpitis), "aae" (4 AAE pulpDx values, default)
// or "latin" (9 practical-Latin pulpLatin subtypes). Changing it re-syncs the
// active tooth's controls (the stored value is re-displayed collapsed to the
// new level; state is not mutated). Mirrors the `icdasEnabled` accessor pattern.
let pulpDetailLevel: PulpDetailLevel = "aae";
export function setPulpDetailLevel(value: PulpDetailLevel){
  const next = (value === "simple" || value === "latin") ? value : "aae";
  if(next === pulpDetailLevel) return;
  pulpDetailLevel = next;
  if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
  // SP17 Task 1 Fix #1: pulpDiagnosisLabel() reads getPulpDetailLevel() live to
  // pick Latin vs AAE wording — the whole-mouth summary panel and every
  // per-tooth tooltip must refresh too, not just the active tooth's picker.
  // Mirrors setSurfaceNotation() below exactly (same bug class, SP16 fix).
  notifyStateChange();
  for(const toothNo of ALL_TEETH){
    updateToothTooltip(toothNo);
  }
}
export function getPulpDetailLevel(): PulpDetailLevel { return pulpDetailLevel; }

// SP13 Task 2: wear/discoloration detail-level settings — each switches its
// control between the full-option <select> ("complex", default) and a
// yes/no checkbox ("simple"). wearDetailLevel drives BOTH wearEdge and
// wearCervical (one shared setting); discolorationDetailLevel is independent.
// Mirrors the pulpDetailLevel accessor pattern above: sanitize to the literal
// set, re-sync the active tooth's controls, never mutate stored state.
export type ToothDetailLevel = "simple" | "complex";
let wearDetailLevel: ToothDetailLevel = "complex";
export function setWearDetailLevel(value: ToothDetailLevel){
  wearDetailLevel = value === "simple" ? "simple" : "complex";
  if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
}
export function getWearDetailLevel(): ToothDetailLevel { return wearDetailLevel; }
let discolorationDetailLevel: ToothDetailLevel = "complex";
export function setDiscolorationDetailLevel(value: ToothDetailLevel){
  discolorationDetailLevel = value === "simple" ? "simple" : "complex";
  if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
}
export function getDiscolorationDetailLevel(): ToothDetailLevel { return discolorationDetailLevel; }

// SP16 Task 2: surface-notation setting — "full" (default) makes the
// caries/filling surface letters + captions POSITION-AWARE (incisal on an
// anterior tooth, labial on an anterior buccal surface, palatal on an upper
// lingual surface); "simple" always shows the tooth-independent B/O/L set.
// Mirrors the wearDetailLevel/discolorationDetailLevel accessor pattern
// above: sanitize to the literal set, re-sync the active tooth's controls,
// never mutate stored state.
export type SurfaceNotation = "simple" | "full";
let surfaceNotation: SurfaceNotation = "full";
export function setSurfaceNotation(value: SurfaceNotation){
  const next = value === "simple" ? "simple" : "full";
  if(next === surfaceNotation) return;
  surfaceNotation = next;
  if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
  // The new notation changes the caries/filling-defect LETTERS shown in the
  // whole-mouth summary panel and every per-tooth tooltip (both resolve
  // through surfaceLetter()/summarySurfaceLetter(), which read the module-
  // level `surfaceNotation`) — refresh both so they don't show stale letters
  // until the next tooth edit. notifyStateChange() fires the onStateChange
  // listeners the App uses to re-run getOdontogramSummary(); the per-tooth
  // loop mirrors the registerPlugins() pattern above.
  notifyStateChange();
  for(const toothNo of ALL_TEETH){
    updateToothTooltip(toothNo);
  }
}
export function getSurfaceNotation(): SurfaceNotation { return surfaceNotation; }

// SP5 Task 5: caries-granularity settings (modes). Each mode governs ONLY the
// option list its authoring control offers; it never mutates stored state.
// Non-collapsing: a stored value outside the current mode's list is preserved
// and re-displayed when the mode widens again (the SP4 pulpLatin pattern).
// `cariesDepthEnabled` additionally gates the visual caries-depth tier
// (opacity + deep contour) in the SVG render; `radiographicDepthMode !== "off"`
// gates the per-surface `data-radio` indicator badge. Each accessor re-syncs
// the active tooth's controls, mirroring `icdasEnabled`/`pulpDetailLevel`.
export type SecondaryCariesMode = "simple" | "standard" | "full";
export type RootCariesMode = "simple" | "severity";
export type RadiographicDepthMode = "off" | "threeLevel" | "detailed";

let secondaryCariesMode: SecondaryCariesMode = "standard";
export function setSecondaryCariesMode(value: SecondaryCariesMode){
  secondaryCariesMode = (value === "simple" || value === "full") ? value : "standard";
  if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
}
export function getSecondaryCariesMode(): SecondaryCariesMode { return secondaryCariesMode; }

let rootCariesMode: RootCariesMode = "simple";
export function setRootCariesMode(value: RootCariesMode){
  rootCariesMode = (value === "severity") ? value : "simple";
  if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
}
export function getRootCariesMode(): RootCariesMode { return rootCariesMode; }

let radiographicDepthMode: RadiographicDepthMode = "off";
export function setRadiographicDepthMode(value: RadiographicDepthMode){
  radiographicDepthMode = (value === "threeLevel" || value === "detailed") ? value : "off";
  if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
}
export function getRadiographicDepthMode(): RadiographicDepthMode { return radiographicDepthMode; }

let cariesDepthEnabled = true;
export function setCariesDepthEnabled(value: boolean){
  cariesDepthEnabled = value !== false;
  if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
}
export function getCariesDepthEnabled(): boolean { return cariesDepthEnabled; }

let i18nUnsubscribe: (() => void) | null = null;

// ---- State-change subscription ----
// Listeners are notified after any change to tooth state (edits, edentulous
// toggle, import), so consumers like the "tooth information" panel can refresh.
const stateChangeListeners = new Set<() => void>();

/**
 * Subscribe to odontogram state changes. The callback runs after any tooth
 * state edit, the edentulous toggle, or an import.
 *
 * @param cb - Callback invoked on each change.
 * @returns An unsubscribe function.
 */
export function onStateChange(cb: () => void): () => void {
  stateChangeListeners.add(cb);
  return () => { stateChangeListeners.delete(cb); };
}

function notifyStateChange(){
  for(const cb of stateChangeListeners){
    try{ cb(); }
    catch(e){ console.error("odontogram state-change listener failed", e); }
  }
  // Redraw the multi-tooth bridge overlay after per-tooth renders settle.
  // notifyStateChange() is synchronous and is always invoked at the END of a
  // mutation batch (single edit :~1570, edentulous :~2298, import :~2850, init
  // :~3753), so tile geometry is current by this point. renderBridgeOverlay is
  // internally guarded, but wrap defensively so a geometry hiccup can never
  // break state notification.
  try{ updateBridgeOverlay(); }
  catch(e){ console.error("odontogram bridge overlay render failed", e); }
}

/** Read a tooth's state as the minimal shape the bridge overlay consumes. */
function bridgeStateFor(toothNo: number): BridgeToothState | undefined {
  return toothState.get(toothNo) as BridgeToothState | undefined;
}

/** (Re)draw the engine-owned multi-tooth bridge overlay over `#toothGrid`. */
function updateBridgeOverlay(){
  const grid = $("#toothGrid") as HTMLElement | null;
  renderBridgeOverlay({ grid, getState: bridgeStateFor, materialColor: defaultMaterialColor });
}

// ---- Bridge overlay resize handling ----
let bridgeOverlayResizeObserver: ResizeObserver | null = null;
let bridgeOverlayResizeTimer: ReturnType<typeof setTimeout> | null = null;

/** Observe `#toothGrid` and re-run the bridge overlay (debounced) on resize. */
function setupBridgeOverlayResize(){
  if(typeof ResizeObserver === "undefined") return;
  const grid = $("#toothGrid") as HTMLElement | null;
  if(!grid) return;
  teardownBridgeOverlayResize();
  bridgeOverlayResizeObserver = new ResizeObserver(() => {
    if(bridgeOverlayResizeTimer) clearTimeout(bridgeOverlayResizeTimer);
    bridgeOverlayResizeTimer = setTimeout(() => {
      bridgeOverlayResizeTimer = null;
      try{ updateBridgeOverlay(); }
      catch(e){ console.error("odontogram bridge overlay resize render failed", e); }
    }, 100);
  });
  bridgeOverlayResizeObserver.observe(grid);
}

/** Disconnect the bridge-overlay resize observer and cancel any pending redraw. */
function teardownBridgeOverlayResize(){
  if(bridgeOverlayResizeObserver){ bridgeOverlayResizeObserver.disconnect(); bridgeOverlayResizeObserver = null; }
  if(bridgeOverlayResizeTimer){ clearTimeout(bridgeOverlayResizeTimer); bridgeOverlayResizeTimer = null; }
}

// ---- Plugin state ----
let registeredPlugins: OdontogramPlugin[] = [];
// Map: toothNo -> Map: pluginId -> <g> element (inside the tooth SVG)
const pluginOverlays = new Map<number, Map<string, SVGGElement>>();

// ---- Touch state ----
const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;
let touchStartTime = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;
let longPressTimer: ReturnType<typeof setTimeout> | null = null;
const LONG_PRESS_MS = 500;
const TOUCH_MOVE_THRESHOLD = 10;

// Pinch state
let pinchStartDist = 0;
let pinchScale = 1;
let isPinching = false;

// Arch toggle state
let archMode: "both" | "upper" | "lower" = "both";
let archToggleBar: HTMLElement | null = null;

// ---- UI builders ----
function buildRadios(container: Any, name: Any, options: Any, onChange: Any){
  container.innerHTML = "";
  for(const opt of options){
    const id = `${name}-${opt.value}`;
    const label = el("label", {}, [
      el("input", { type:"radio", name, id, value:opt.value }),
      el("span", { text: opt.label })
    ]);
    const input = label.querySelector("input") as HTMLInputElement;
    input.addEventListener("change", (e)=>onChange((e.target as HTMLInputElement).value));
    container.appendChild(label);
  }
}

function buildChecks(container: Any, items: Any, onToggle: Any){
  container.innerHTML = "";
  for(const it of items){
    const id = `chk-${it.value}`;
    const labelId = `lbl-${it.value}`;
    const labelText = it.labelKey ? t(it.labelKey) : it.label;
    const label = el("label", {}, [
      el("input", { type:"checkbox", id, value:it.value }),
      el("span", { id: labelId, text: labelText })
    ]);
    const input = label.querySelector("input") as HTMLInputElement;
    input.addEventListener("change", (e)=>onToggle(it.value, (e.target as HTMLInputElement).checked));
    if(container.id === "cariesChecks" && it.value === "caries-subcrown"){
      setDisabled(input, true);
    }
    container.appendChild(label);
  }
}

/**
 * Render surface toggles in an anatomical cross/plus layout:
 * buccal (top), mesial (left), occlusal (center), distal (right), lingual (bottom).
 * Each item: { value, labelKey?, label?, letter, pos }. `pos` is one of
 * buccal|mesial|occlusal|distal|lingual and drives grid placement via a CSS class.
 * Keeps a hidden checkbox input (value=item.value) so existing state-sync works.
 */
export function buildSurfaceCross(container: Any, items: Any, onToggle: Any){
  container.innerHTML = "";
  const cross = el("div", { class: "surface-cross" });
  for(const it of items){
    const id = `chk-${it.value}`;
    const labelId = `lbl-${it.value}`;
    const labelText = it.labelKey ? t(it.labelKey) : it.label;
    const label = el("label", { class: `surface-cell pos-${it.pos}` }, [
      el("input", { type:"checkbox", id, value:it.value }),
      el("span", { class:"surf-letter", text: it.letter }),
      el("span", { id: labelId, class:"surf-name", text: labelText }),
    ]);
    const input = label.querySelector("input") as HTMLInputElement;
    input.addEventListener("change", (e)=>onToggle(it.value, (e.target as HTMLInputElement).checked));
    cross.appendChild(label);
  }
  container.appendChild(cross);
}

function buildSelect(selectEl: Any, options: Any, onChange: Any){
  selectEl.innerHTML = "";
  for(const opt of options){
    const o = el("option", { value: opt.value, text: opt.label });
    if(opt.title) o.title = opt.title;
    selectEl.appendChild(o);
  }
  selectEl.addEventListener("change", (e)=>onChange((e.target as HTMLSelectElement).value));
}

// `data-icon-src` carries inlined SVG markup (from a `?raw` import in App.tsx),
// parsed directly — never fetched — so inline icons ship inside the JS bundle.
async function loadInlineIcon(button: Any){
  if(!button) return;
  const src = button.dataset.iconSrc;
  if(!src) return;
  try{
    const parser = new DOMParser();
    const doc = parser.parseFromString(src, "image/svg+xml");
    const svg = doc.documentElement;
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.classList.add("icon-svg");
    button.innerHTML = "";
    button.appendChild(svg);
  }catch(_e){
    // ignore icon parse failures
  }
}

function syncIconXLine(button: Any){
  if(!button || !button.dataset.xline) return;
  const pressed = button.getAttribute("aria-pressed") === "true";
  const line = button.querySelector("#x-line");
  if(line) line.style.display = pressed ? "none" : "";
}

function updateWarnings(state: Any){
  updateWarningsFromState(state);
}

function getControlLabel(control: Any){
  if(!control) return null;
  const wrapped = control.closest ? control.closest("label") : null;
  if(wrapped) return wrapped;
  if(control.id){
    return document.querySelector(`label[for="${control.id}"]`);
  }
  return null;
}

function syncControlLabelVisibility(control: Any){
  const label = getControlLabel(control);
  if(!label) return;
  label.style.display = control.disabled ? "none" : "";
}

function setDisabled(control: Any, disabled: Any){
  if(!control) return;
  control.disabled = !!disabled;
  syncControlLabelVisibility(control);
}

function setToggleButton(btn: Any, on: Any){
  if(!btn) return;
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  syncIconXLine(btn);
}

function getToggleLabel(labelKey: Any, collapsed: Any){
  return t(collapsed ? "actions.expand" : "actions.collapse", { label: t(labelKey) });
}

function applyToggleA11y(btn: Any, labelKey: Any, collapsed: Any){
  if(!btn) return;
  const text = getToggleLabel(labelKey, collapsed);
  btn.setAttribute("title", text);
  btn.setAttribute("aria-label", text);
}

// Maps each collapse-toggle button id to the i18n key used for its a11y label.
const CARD_TOGGLE_LABELS: Record<string, string> = {
  btnToggleStatusCard: "status.title",
  btnToggleCariesCard: "caries.title",
  btnToggleFillingCard: "filling.title",
  btnToggleRootPeriodontiumCard: "card.rootPeriodontium",
};

// Delegated handler for all card collapse toggles. Attached once to `document`
// so it survives React StrictMode double-mount and async init timing — per-button
// listeners wired in wireControls() proved unreliable under those conditions.
const BTN_TO_CARD_ID: Record<string, string> = {
  btnToggleControlsCard: "controls",
  btnToggleStatusCard: "status",
  btnToggleCariesCard: "caries",
  btnToggleFillingCard: "filling",
  btnToggleRootPeriodontiumCard: "rootPeriodontium",
};

function onCardToggleClick(e: Any){
  const target = e.target as Any;
  const btn = target?.closest?.(".icon-btn");
  if(!btn) return;
  const icon = btn.querySelector(".toggle-icon");
  const cardId = BTN_TO_CARD_ID[btn.id];
  if(!cardId) return; // not a recognised toggle button
  // Controls card collapses its actions container (uses `.hidden`), not the card.
  if(btn.id === "btnToggleControlsCard"){
    const actions = document.querySelector("#controlsActions");
    if(!actions) return;
    const hidden = actions.classList.toggle("hidden");
    applyToggleA11y(btn, "panel.controls", hidden);
    if(icon) icon.textContent = hidden ? "+" : "−";
    collapsedCards.controls = hidden;
    return;
  }
  const labelKey = CARD_TOGGLE_LABELS[btn.id];
  if(!labelKey) return; // not a card collapse toggle
  const card = btn.closest(".card");
  if(!card) return;
  const collapsed = card.classList.toggle("collapsed");
  applyToggleA11y(btn, labelKey, collapsed);
  if(icon) icon.textContent = collapsed ? "+" : "−";
  collapsedCards[cardId] = collapsed;
  notifyStateChange();
}

// Delegated handler for the global `setX(!current)` visibility toggles. A stable
// reference so addEventListener de-duplicates it — see onCardToggleClick.
function onGlobalToggleClick(e: Any){
  const btn = (e.target as Any)?.closest?.("button");
  if(!btn) return;
  switch(btn.id){
    case "btnWisdomVisible": setWisdomVisible(!wisdomVisible); break;
    case "btnOcclView": setOcclusalVisible(!occlusalVisible); break;
    case "btnBoneVisible": setShowBase(!showBase); break;
    case "btnPulpVisible": setHealthyPulpVisible(!showHealthyPulp); break;
    case "btnEdentulous": setEdentulous(!edentulous); break;
  }
}

function isToothPresent(sel: Any){
  return sel !== "none" && sel !== "implant";
}

/** SP7 Task 5 (extended by SP15 Task 3 / B4): hide the `mods.inflammation`
 *  checkbox's row (built by buildChecks() as a <label> wrapping the checkbox
 *  input) inside `#modsChecks` for a PRESENT tooth (tooth-base/milktooth) —
 *  apicalDx now drives the periapical glyph there, so the checkbox would be a
 *  redundant/confusing second control — AND for an implant, where the
 *  dedicated `periImplant` axis (peri-implantitis) already covers implant
 *  inflammation, making this toggle redundant there too. It stays VISIBLE for
 *  a missing tooth (`toothSelection === "none"`) and for an extraction-socket
 *  (`toothSelection === "no-tooth-after-extraction"`), where it marks
 *  periodontal inflammation in the socket — a finding neither `apicalDx` nor
 *  `periImplant` cover there (the label itself swaps to "periodontal
 *  inflammation" for that case — see the `#lbl-inflammation` relabel in
 *  syncControlsFromState()). MUST run AFTER syncPeriImplantVisibility() in
 *  syncControlsFromState(): that function's implant-only loop also toggles
 *  this same checkbox's `.hidden` class, so whichever of the two runs last
 *  wins for the inflammation checkbox specifically — this one is the
 *  authoritative, final word. */
function syncInflammationModVisibility(container: Element | null, toothSelection: Any): void {
  if(!container) return;
  const inflChk = container.querySelector('input[value="inflammation"]') as HTMLInputElement | null;
  if(!inflChk) return;
  const inflLabel = inflChk.closest("label") || inflChk.parentElement;
  // Hidden for a present tooth or an implant; visible for missing/socket.
  // isToothPresent() alone can't express the socket case: it returns true for
  // "no-tooth-after-extraction" (neither "none" nor "implant"), so isExtraction()
  // carves that value back out of the "present" bucket to keep it visible.
  const hidden = toothSelection === "implant"
    || (isToothPresent(toothSelection) && !isExtraction(toothSelection));
  if(inflLabel) inflLabel.classList.toggle("hidden", hidden);
}

/** TEST-ONLY: apply {@link syncInflammationModVisibility} to a hand-built
 *  `#modsChecks` DOM fragment, without requiring a live initOdontogram(). Not
 *  part of the public API. */
export function __syncInflammationModVisibilityForTest(container: Element, toothSelection: string): void {
  syncInflammationModVisibility(container, toothSelection);
}

/** SP8 Task 5: on an implant, the dedicated `periImplant` axis supersedes the
 *  parodontal/inflammation mods (they're migrated away for implants — see
 *  hydrateState's implant-mods migration), so show `#periImplantRow` only for
 *  an implant and hide BOTH mod checkboxes' rows there. Composes with
 *  {@link syncInflammationModVisibility} for the `parodontal` checkbox (order
 *  doesn't matter there — nothing else touches it). For `inflammation`,
 *  though, this function's blanket implant-only rule (visible for EVERY
 *  non-implant selection, including a present tooth) is deliberately
 *  overridden by syncInflammationModVisibility's more specific present/socket
 *  rule (SP15 Task 3 / B4) — syncControlsFromState() calls this function
 *  FIRST and syncInflammationModVisibility() AFTER, so the latter always has
 *  the final say for `inflammation`. */
function syncPeriImplantVisibility(periImplantRow: Element | null, modsContainer: Element | null, toothSelection: Any): void {
  const isImplantSel = toothSelection === "implant";
  if(periImplantRow) periImplantRow.classList.toggle("hidden", !isImplantSel);
  if(!modsContainer) return;
  for(const val of ["parodontal", "inflammation"]){
    const chk = modsContainer.querySelector(`input[value="${val}"]`) as HTMLInputElement | null;
    const lbl = chk ? (chk.closest("label") || chk.parentElement) : null;
    if(lbl) lbl.classList.toggle("hidden", isImplantSel);
  }
}

/** TEST-ONLY: apply {@link syncPeriImplantVisibility} to hand-built DOM
 *  fragments, without requiring a live initOdontogram(). Not part of the
 *  public API. */
export function __syncPeriImplantVisibilityForTest(periImplantRow: Element | null, modsContainer: Element | null, toothSelection: string): void {
  syncPeriImplantVisibility(periImplantRow, modsContainer, toothSelection);
}

function isUnderGum(sel: Any){
  return sel === "tooth-under-gum";
}

function isExtraction(sel: Any){
  return sel === "no-tooth-after-extraction";
}

// SP-perio P1 Task 2: #perioRow gate. Periodontal probing applies only to a
// tooth actually present in the mouth chairside — missing/implant/under-gum/
// extraction-socket teeth have no probing site to chart at all, so (unlike
// mobilityRowHidden, which stays visible-but-disabled for some of those) this
// hides the whole row outright. `!isToothPresent(sel)` covers BOTH "none"
// (missing) and "implant" in one check; isUnderGum/isExtraction carve out the
// remaining two non-present-but-not-"none" selections.
function perioRowHidden(s: Any): boolean {
  const sel = s?.toothSelection;
  return !isToothPresent(sel) || isUnderGum(sel) || isExtraction(sel);
}
export function __perioRowHiddenForTest(s: Record<string, unknown>): boolean {
  return perioRowHidden(s);
}

function getDisplayedToothNumber(toothNo: Any){
  const s = toothState.get(toothNo);
  if(!s || s.toothSelection !== "milktooth") return toothNo;
  const firstDigit = Math.floor(toothNo / 10);
  const secondDigit = toothNo % 10;
  const mappedFirst = firstDigit === 1 ? 5 : firstDigit === 2 ? 6 : firstDigit === 3 ? 7 : 8;
  return mappedFirst * 10 + secondDigit;
}

function updateToothTileNumber(toothNo: Any){
  const tiles = toothTile.get(toothNo);
  if(!tiles) return;
  const text = toLabel(getDisplayedToothNumber(toothNo), numberingSystem);
  const upper = toothLabelUpper.get(toothNo);
  if(upper) upper.textContent = text;
  const lower = toothLabelLower.get(toothNo);
  if(lower) lower.textContent = text;
  // Setting textContent above wipes the note icon span; re-add it if the tooth
  // still has a note, so the icon persists across state/label updates.
  updateToothLabelNoteIcon(toothNo);
}

function updateAllToothTileNumbers(){
  for(const toothNo of ALL_TEETH){
    updateToothTileNumber(toothNo);
  }
}

function setSelectOptions(selectEl: Any, options: Any, value: Any){
  if(!selectEl) return;
  selectEl.innerHTML = "";
  for(const opt of options){
    const o = el("option", { value: opt.value, text: opt.label });
    if(opt.title) o.title = opt.title;
    selectEl.appendChild(o);
  }
  if(options.some(o => o.value === value)){
    selectEl.value = value;
  }else{
    selectEl.value = options[0]?.value ?? "";
  }
}

function getEndoOptions(isMilktooth: Any){
  return optionsFor("endo", { isMilktooth: !!isMilktooth }).map(o => ({ value: o.value, label: t(o.labelKey) }));
}

function getFillingOptions(isMilktooth: Any){
  if(isMilktooth){
    return [
      {value:"none", label:t("filling.option.none")},
      {value:"composite", label:t("filling.option.composite")},
      {value:"gic", label:t("filling.option.gic")},
      {value:"temporary", label:t("filling.option.temporary")},
    ];
  }
  return [
    {value:"none", label:t("filling.option.none")},
    {value:"amalgam", label:t("filling.option.amalgam")},
    {value:"composite", label:t("filling.option.composite")},
    {value:"gic", label:t("filling.option.gic")},
    {value:"temporary", label:t("filling.option.temporary")},
  ];
}

// Teeth that render an occlusal view (premolars + molars); their restoration
// dropdown offers occlusal-only types (onlay).
const OCCLUSAL_TEETH = new Set([14,15,24,25,34,35,44,45,16,17,18,26,27,28,36,37,38,46,47,48]);
function restorationViewFor(toothNo: Any): "front" | "occlusal"{
  return typeof toothNo === "number" && OCCLUSAL_TEETH.has(toothNo) ? "occlusal" : "front";
}

// Tooth-substrate control options (natural / radix / broken / crown-prep).
function getSubstrateOptions(){
  return [
    {value:"natural", label:t("substrate.natural")},
    {value:"radix", label:t("substrate.radix")},
    {value:"broken", label:t("substrate.broken")},
    {value:"crownprep", label:t("substrate.crownprep")},
  ];
}

// Combined restoration dropdown, generated from RESTORATION_MATRIX via
// restorationOptions(). Each option encodes `${type}|${material}` so a single
// select writes BOTH restorationType and restorationMaterial.
function getRestorationOptions(view: "front" | "occlusal", ctx: { isImplant?: boolean; toothSelection?: string } = {}){
  return restorationOptions(view, { isImplant: !!ctx.isImplant, view, toothSelection: ctx.toothSelection }).map(o => {
    // "Kivehető:" (removable) entry — encoded distinctly so the change handler
    // writes `s.prosthesis` (and clears restorationType/material) instead.
    if(o.prosthesis){
      return {
        value: `prosthesis|${o.prosthesis}`,
        label: `${t(o.prefixKey ?? "restoration.prefix.removable")}: ${t(PROSTHESIS_SUMMARY_KEY[o.prosthesis] ?? o.prosthesis)}`,
      };
    }
    return {
      value: `${o.restorationType}|${o.restorationMaterial}`,
      label: o.restorationType === "none"
        ? t(o.labelKey)
        : `${t(o.prefixKey ?? "restoration.prefix.fixed")}: ${t(o.typeLabelKey ?? "")} – ${t(o.materialLabelKey ?? "")}`,
    };
  });
}

// SP15 Task 1 (B5/B7): #restorationRow visibility gate — extracted as a
// standalone predicate (mirrors wearRowAllowed) so it's independently unit
// testable. An implant IS allowed here (restorationOptions already restricts
// it to a crown/bridge + attachment set); milk teeth, under-gum,
// extraction-socket teeth, and a radix substrate (a broken root can't carry a
// restoration) are not.
function restorationRowHidden(s: Any): boolean {
  const isMilktooth = s?.toothSelection === "milktooth";
  const underGum = isUnderGum(s?.toothSelection);
  const extraction = isExtraction(s?.toothSelection) || (s?.toothSelection === "none" && s?.extractionWound);
  return isMilktooth || underGum || extraction || s?.toothSubstrate === "radix";
}
export function __restorationRowHiddenForTest(s: Record<string, unknown>): boolean {
  return restorationRowHidden(s);
}

// Apply a combined-dropdown value to a tooth state. The value is either a fixed
// restoration `${type}|${material}` or a "Kivehető:" prosthesis `prosthesis|<value>`.
// A tooth ends up with EITHER a fixed restoration OR a prosthesis, never both
// (coherence mirrored in hydrateState's FIX 4 guard). Pure mutation, shared by the
// #restorationSelect change handler and covered by __applyRestorationSelectionForTest.
function applyRestorationSelection(s: Any, value: string){
  if(value.startsWith("prosthesis|")){
    // "Kivehető:" entry — set the prosthesis axis, clear the fixed restoration.
    s.prosthesis = value.slice("prosthesis|".length);
    s.restorationType = "none";
    s.restorationMaterial = "none";
    s.bridgePillar = false;
    s.crownReplace = false;
  }else{
    const [type, material] = value.split("|");
    s.restorationType = type || "none";
    s.restorationMaterial = material || "none";
    s.prosthesis = "none";
    if(s.restorationType === "none"){
      s.bridgePillar = false;
      s.crownReplace = false;
    }else{
      s.crownNeeded = false;
    }
  }
  // FIX 3: crown-leakage is a crown/bridge-only finding — clear it whenever the
  // restoration is no longer a crown or bridge (prevents a stale crown-leakage
  // FHIR finding on a non-crown tooth).
  if(s.restorationType !== "crown" && s.restorationType !== "bridge"){
    s.crownLeakage = false;
  }
}

/** TEST-ONLY: apply a combined restoration-dropdown value to a state object,
 *  exactly as the #restorationSelect change handler does. Not part of the public API. */
export function __applyRestorationSelectionForTest(s: Record<string, unknown>, value: string): void {
  applyRestorationSelection(s, value);
}

// "Type – Material" label for a fixed restoration (crown/inlay/onlay/veneer/bridge),
// shared by the tooltip summary and the tooth-information prosthetics section.
// Mirrors the label composition used by getRestorationOptions() above.
function restorationSummaryLabel(type: Any, material: Any): string {
  const materialKey = `restoration.material.${material === "metal-ceramic" ? "metalCeramic" : material}`;
  return `${t(`restoration.type.${type}`)} – ${t(materialKey)}`;
}

// SP9: shared clinical-axis summary labels, reused by the tooltip (getStateSummary)
// and the whole-mouth panel (getOdontogramSummary). Each returns null at the axis's
// skip value. Reuse the existing per-value i18n label families.
function pulpDiagnosisLabel(state: Any): string | null {
  if(getPulpDetailLevel() === "latin"){
    if(state.pulpLatin && state.pulpLatin !== "none"){
      return t("pulpLatin." + kebabToCamel(state.pulpLatin));
    }
    // FIX 2: latin mode but pulpLatin is unset ("none") — resolve the Latin
    // representative for the stored pulpDx (mirrors pulpDisplayValue's latin
    // branch) instead of falling through to the AAE label, so the tooltip/panel
    // never mix nomenclatures within the same detail level.
    if(state.pulpDx && state.pulpDx !== "normal"){
      const latinRepresentative = PULP_DX_TO_LATIN[state.pulpDx];
      if(latinRepresentative) return t("pulpLatin." + kebabToCamel(latinRepresentative));
    }
  }
  if(state.pulpDx && state.pulpDx !== "normal") return t("pulpDx." + kebabToCamel(state.pulpDx));
  return null;
}
function apicalDiagnosisLabel(state: Any): string | null {
  if(!state.apicalDx || state.apicalDx === "normal") return null;
  let label = t("apicalDx." + kebabToCamel(state.apicalDx));
  if(state.periapicalType && state.periapicalType !== "none"){
    label += " (" + t("periapical.type." + kebabToCamel(state.periapicalType)) + ")";
  }
  return label;
}
function resorptionDiagnosisLabel(state: Any): string | null {
  if(!state.resorptionType || state.resorptionType === "none") return null;
  return t("resorption.type." + kebabToCamel(state.resorptionType));
}
// FIX 3: peri-implant status only applies to implants — a stray `periImplant`
// value on a non-implant tooth must render nothing, matching the SVG render
// (which gates the peri-implant-bone-loss layer on isImplant).
function periImplantSummaryLabel(state: Any): string | null {
  if(state.toothSelection !== "implant") return null;
  if(!state.periImplant || state.periImplant === "none") return null;
  return t("periImplant." + kebabToCamel(state.periImplant));
}
// SP-perio PG-C Task 3: CEJ visibility + root concavity — periodontal
// root-surface data axes (T2 shipped set/get, no svgLayer). Surfaced the same
// way as periImplantSummaryLabel/getToothRecessionType above: a periodontal
// PRESENCE line, not a pulp/apical/resorption diagnosis, so these are pushed
// alongside peri-implant status / recession type (see getStateSummary /
// getOdontogramSummary's "inflamed" bucket below), never through
// diagnosisSummaryLabels.
function cejVisibilitySummaryLabel(state: Any): string | null {
  if(!state.cejVisibility || state.cejVisibility === "none") return null;
  return t("perio.cej." + kebabToCamel(state.cejVisibility));
}
function rootConcavitySummaryLabel(state: Any): string | null {
  if(!state.rootConcavity || state.rootConcavity === "none") return null;
  return t("perio.rootConcavity." + kebabToCamel(state.rootConcavity));
}
// SP-perio PG-D Task 5: PI/GI (per-surface graded 1-3) + KG (mm) + GT
// (biotype) + Miller (recession class) per-tooth summary lines — same
// periodontal DATA-axis grouping as cejVisibilitySummaryLabel/
// rootConcavitySummaryLabel above (surfaced in BOTH getStateSummary's
// tooltip and getOdontogramSummary's "inflamed" bucket, never through
// diagnosisSummaryLabels). Take `toothNo` (not `state`) since all five read
// through their own public getter (mirrors getToothRecessionType's
// toothNo-based call style, already used alongside the state-based helpers
// at the very same call sites).
/** PI/GI: summarize only the CHARTED (non-zero graded) surfaces of the fixed
 *  4-surface set, in the same display order the rest of the file's per-
 *  surface summaries use. `null` when nothing is charted on this tooth for
 *  this axis — never a "(PI)" line with an empty surface list. */
function graduatedSurfaceSummaryLine(toothNo: number, getter: (toothNo: number, surface: string) => 0|1|2|3, rowLabelKey: string): string | null {
  const parts: string[] = [];
  for(const surface of SUMMARY_SURFACE_ORDER){
    if(!VALID_PLAQUE_SURFACE.has(surface)) continue;
    const grade = getter(toothNo, surface);
    if(grade > 0) parts.push(`${summarySurfaceLetter(surface, toothNo)}: ${grade}`);
  }
  if(parts.length === 0) return null;
  return `${t(rowLabelKey)} (${parts.join(", ")})`;
}
function plaqueIndexSummaryLine(toothNo: number): string | null {
  return graduatedSurfaceSummaryLine(toothNo, getPlaqueIndex, "perio.pi.row");
}
function gingivalIndexSummaryLine(toothNo: number): string | null {
  return graduatedSurfaceSummaryLine(toothNo, getGingivalIndex, "perio.gi.row");
}
// SP-perio PG-E Task 3: mPI/mBI (Mombelli peri-implant indices) — same
// per-surface graded summary-line shape as PI/GI above, reusing
// graduatedSurfaceSummaryLine. Implant-gated at the setter (a non-implant
// tooth's mpi/mbi maps are always empty), so no extra guard is needed here:
// graduatedSurfaceSummaryLine already returns null when nothing is charted.
function periImplantPlaqueSummaryLine(toothNo: number): string | null {
  return graduatedSurfaceSummaryLine(toothNo, getPeriImplantPlaque, "perio.mpi.row");
}
function periImplantBleedingSummaryLine(toothNo: number): string | null {
  return graduatedSurfaceSummaryLine(toothNo, getPeriImplantBleeding, "perio.mbi.row");
}
/** KG: `null` when not charted (mirrors {@link getKeratinizedWidth}'s own
 *  "absence = not charted" semantics — never distinct from a stored 0mm). */
function keratinizedWidthSummaryLine(toothNo: number): string | null {
  const mm = getKeratinizedWidth(toothNo);
  if(mm === null) return null;
  return `${t("perio.kg.row")}: ${mm} mm`;
}
/** GT: skip value is `"unknown"` (not `"none"`, unlike every other enum axis
 *  here) — mirrors {@link getGingivalThickness}'s own default. */
function gingivalThicknessSummaryLabel(toothNo: number): string | null {
  const gt = getGingivalThickness(toothNo);
  if(gt === "unknown") return null;
  return t("perio.gt." + gt);
}
function millerClassSummaryLabel(toothNo: number): string | null {
  const mc = getMillerClass(toothNo);
  if(mc === "none") return null;
  return t("perio.miller." + mc);
}
/** All non-empty clinical diagnosis labels for a tooth, in a stable order.
 *  FIX 1: peri-implant status is deliberately NOT included here — it belongs to
 *  the periodontal grouping (see getOdontogramSummary's `inflamed` list and
 *  getStateSummary's dedicated push), not the pulp/apical/resorption diagnoses
 *  section, so an implant's periodontal state is reported consistently in one
 *  place instead of contradicting it elsewhere. */
function diagnosisSummaryLabels(state: Any): string[] {
  return [
    pulpDiagnosisLabel(state),
    apicalDiagnosisLabel(state),
    resorptionDiagnosisLabel(state),
  ].filter((x): x is string => !!x);
}
/** Coarse 3-tier caries-severity qualifier (max across caried surfaces), or null. */
function cariesSeverityTierLabel(state: Any): string | null {
  if(!state.caries || state.caries.size === 0 || !state.cariesSeverity) return null;
  let max = 0;
  for(const c of state.caries){
    const surface = String(c).replace(/^caries-/, "");
    const sev = state.cariesSeverity.get(surface);
    if(typeof sev === "number" && sev > max) max = sev;
  }
  if(max <= 0) return null;
  const tier = max <= 2 ? "superficial" : max <= 4 ? "moderate" : "deep";
  return t("summary.severity." + tier);
}
/** Fracture presence label, or null. */
function fractureSummaryLabel(state: Any): string | null {
  if(!(state.brokenMesial || state.brokenIncisal || state.brokenDistal)) return null;
  return t("summary.fracture");
}

function getBrokenCrownVariant(state: Any){
  const m = !!state.brokenMesial;
  const i = !!state.brokenIncisal;
  const d = !!state.brokenDistal;
  if(m && d && i) return "tooth-broken-mesial-distal-incisal";
  if(m && d) return "tooth-broken-mesial-distal";
  if(d && i) return "tooth-broken-distal-incisal";
  if(m && i) return "tooth-broken-mesial-incisal";
  if(d) return "tooth-broken-distal";
  if(m) return "tooth-broken-mesial";
  if(i) return "tooth-broken-incisal";
  return null;
}

function getToothSelectOptions(){
  const all = optionsFor("toothSelection").map(o => ({ value: o.value, label: t(o.labelKey) }));
  if(getChartMode() !== "plan") return all;
  // 2.2.1 Plan-mode: a plan records what a dentist will DO, so the only base
  // states that make sense as a PLAN are extract (Missing), keep/restore a
  // permanent tooth, or place an Implant. Primary (milk) teeth and subgingival
  // remnants are status-only findings — omit them from the Plan base picker.
  // The active tooth's CURRENT base is always kept in the list so an
  // already-charted milk/under-gum tooth still displays (never silently blank).
  const allowed = new Set(["none", "tooth-base", "implant"]);
  const current = activeTooth ? toothState.get(activeTooth)?.toothSelection : undefined;
  if(current) allowed.add(current);
  return all.filter(o => allowed.has(o.value));
}

function getStatusExtras(){
  if(!STATUS_EXTRAS || !Array.isArray(STATUS_EXTRAS.options)) return [];
  return STATUS_EXTRAS.options.map((opt)=>({
    ...opt,
    label: t(opt.labelKey),
  }));
}

function getStatusExtrasMeta(){
  return STATUS_EXTRAS?.arches || null;
}

function getMobilityOptions(){
  return optionsFor("mobility").map(o => ({ value: o.value, label: t(o.labelKey) }));
}

// SP15 Task 1 (B5): #mobilityRow / #mobilitySelect gates — standard tooth
// mobility grading (Miller) applies to a natural tooth's periodontal
// ligament; an implant is osseointegrated and has no PDL, so the control is
// hidden/disabled there. Extracted as standalone predicates (mirrors
// wearRowAllowed) so they're independently unit testable. Hiding the control
// is enough — any previously stored mobility value is left untouched.
function mobilityRowHidden(s: Any): boolean {
  const isImplant = s?.toothSelection === "implant";
  const underGum = isUnderGum(s?.toothSelection);
  const extraction = isExtraction(s?.toothSelection) || (s?.toothSelection === "none" && s?.extractionWound);
  return isImplant || underGum || extraction;
}
export function __mobilityRowHiddenForTest(s: Record<string, unknown>): boolean {
  return mobilityRowHidden(s);
}

function mobilityDisabled(s: Any): boolean {
  const isImplant = s?.toothSelection === "implant";
  const extraction = isExtraction(s?.toothSelection) || (s?.toothSelection === "none" && s?.extractionWound);
  return s?.toothSelection === "none" || extraction || isImplant;
}
export function __mobilityDisabledForTest(s: Record<string, unknown>): boolean {
  return mobilityDisabled(s);
}

const VALID_ICDAS = new Set([1,2,3,4,5,6]);
export function icdasTier(code: number): 1|2|3 { return code <= 2 ? 1 : code <= 4 ? 2 : 3; }
export function threeLevelToIcdas(level: string): number { return level === "deep" ? 6 : level === "dentin" ? 4 : 2; }
export function icdasToThreeLevel(code: number): string { const t = icdasTier(code); return t === 3 ? "deep" : t === 2 ? "dentin" : "surface"; }

function getCariesDepthOptions(): Array<{ value: number; label: string; title?: string }>{
  if(icdasEnabled){
    return [1,2,3,4,5,6].map((n)=>({ value:n, label:`${n} — ${t(`icdas.code.${n}`)}`, title:t(`icdas.desc.${n}`) }));
  }
  return [
    {value:2, label:t("caries.depth.surface")},
    {value:4, label:t("caries.depth.dentin")},
    {value:6, label:t("caries.depth.deep")},
  ];
}

// ---- SP5 Task 5: caries-granularity option builders + surface-write helpers ----
// (kebabToCamel / VALID_ROOT_CARIES are declared below; both are resolved at
// call time, so the forward reference is safe.)
// SP6 Task 2 (step 5): the CARS 0..6 picker now reads the dedicated
// `caries.cars.{n}` ICDAS-based names (all 9 languages). Kept as a map so the
// score→key mapping stays explicit and unit-checkable.
const SECONDARY_CARS_LABEL_KEY: Record<number, string> = {
  0: "caries.cars.0",
  1: "caries.cars.1",
  2: "caries.cars.2",
  3: "caries.cars.3",
  4: "caries.cars.4",
  5: "caries.cars.5",
  6: "caries.cars.6",
};

/** CARS-score options for the per-surface secondary-caries picker at a given
 *  granularity mode (defaults to the module setting). simple -> [0,3];
 *  standard -> [0,1,3,6]; full -> [0..6]. Score 0 clears the surface. Pure. */
export function secondaryCariesOptions(mode: SecondaryCariesMode = secondaryCariesMode): { value: number; label: string }[]{
  const values = mode === "simple" ? [0, 3] : mode === "full" ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 3, 6];
  return values.map((v) => ({ value: v, label: t(SECONDARY_CARS_LABEL_KEY[v]) }));
}

/** Root-caries options at a given mode (defaults to the module setting).
 *  simple -> none / present (present writes the canonical "active-cavitated"
 *  enum — SP6 Task 3: the most-severe value, so simple-mode "present" renders
 *  at full opacity); severity -> the full rootCaries enum. Pure. */
export function rootCariesOptions(mode: RootCariesMode = rootCariesMode): { value: string; label: string }[]{
  if(mode === "severity"){
    return Array.from(VALID_ROOT_CARIES).map((v) => ({ value: v, label: t("rootCaries." + kebabToCamel(v)) }));
  }
  return [
    { value: "none", label: t("rootCaries.none") },
    { value: "active-cavitated", label: t("rootCaries.present") },
  ];
}

/** The rootCaries option value to SHOW for a stored value at a given mode
 *  (display-only collapse; never mutates state). simple buckets every non-none
 *  severity into the single "present" (=active-cavitated) option — matching the
 *  canonical value rootCariesOptions("simple") now writes (SP6 Task 3) — so the
 *  select's selected option always matches one of its own values; severity
 *  shows it verbatim. Mirrors pulpDisplayValue. */
export function rootCariesDisplayValue(mode: RootCariesMode, stored: string): string {
  if(mode === "simple") return stored && stored !== "none" ? "active-cavitated" : "none";
  return stored || "none";
}

/** Radiographic-depth options at a given mode (defaults to the module setting).
 *  off -> [] (the control is hidden); threeLevel -> none + superficial/middle/
 *  deep buckets (writing the representative E1/D1/D3 codes); detailed -> the
 *  full none/E1/E2/D1/D2/D3 scale. "none" clears the surface. Pure. */
export function radiographicDepthOptions(mode: RadiographicDepthMode = radiographicDepthMode): { value: string; label: string }[]{
  if(mode === "off") return [];
  if(mode === "threeLevel"){
    return [
      { value: "none", label: t("radiographicDepth.none") },
      { value: "E1", label: t("radiographicDepth.superficial") },
      { value: "D1", label: t("radiographicDepth.middle") },
      { value: "D3", label: t("radiographicDepth.deep") },
    ];
  }
  return ["none", "E1", "E2", "D1", "D2", "D3"].map((v) => ({ value: v, label: t("radiographicDepth." + v) }));
}

/** Set/clear a per-surface CARS secondary-caries score on `map` (score 0
 *  clears). Extracted so the surface-write path is unit-testable without the
 *  DOM. */
export function applySecondaryCariesScore(map: Map<string, number>, surface: string, score: number): void {
  if(score > 0) map.set(surface, score);
  else map.delete(surface);
}

/** SP6 Task 2: the recurrent (secondary) caries transition on a FILLED surface.
 *  The CARS group of the contextual popup drives the caries state-machine on a
 *  surface that carries a filling:
 *   - score 0 (Sound)  → remove the caries from the surface (revert to a plain
 *     filling) and clear its severity;
 *   - score > 0        → add the caries to the surface (becomes recurrent /
 *     `subcaries-{surface}`) and store the CARS value as its severity.
 *  Guarded on the filling actually being present, so a CARS score never lands
 *  on a surface without a filling (that would be primary caries, authored via
 *  the depth group instead). Mutates `state.caries` (Set of `caries-{surface}`)
 *  and `state.cariesSeverity` (Map surface→0..6). Extracted so the two
 *  transitions are unit-testable without the DOM. */
export function applyRecurrentCariesScore(
  state: { caries: Set<string>; cariesSeverity: Map<string, number>; fillingSurfaceMaterials: Map<string, string> },
  surface: string,
  score: number,
): void {
  if(!state.fillingSurfaceMaterials.has(surface)) return;
  const key = `caries-${surface}`;
  if(score > 0){
    state.caries.add(key);
    state.cariesSeverity.set(surface, score);
  }else{
    state.caries.delete(key);
    state.cariesSeverity.delete(surface);
  }
}

/** Set/clear a per-surface radiographic-depth value on `map` ("none"/empty
 *  clears). Extracted for unit-testing the surface-write path. */
export function applyRadiographicDepth(map: Map<string, string>, surface: string, value: string): void {
  if(value && value !== "none") map.set(surface, value);
  else map.delete(surface);
}

/** Set/clear a per-surface filling-defect value on `map` ("none"/empty clears).
 *  Extracted for unit-testing the surface-write path. */
export function applyFillingDefect(map: Map<string, string>, surface: string, value: string): void {
  if(value && value !== "none") map.set(surface, value);
  else map.delete(surface);
}

// ---- SP4 Task 5: pulp/apical/resorption diagnosis authoring ----
export type PulpDetailLevel = "simple" | "aae" | "latin";

// kebab-case value id -> camelCase i18n key suffix. Matches the keys Task 1
// added to translations.ts (e.g. "reversible-pulpitis" -> "reversiblePulpitis",
// "external-cervical" -> "externalCervical").
function kebabToCamel(id: string): string {
  return String(id).replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
}

// Each practical-Latin pulp subtype collapses to exactly one AAE `pulpDx`
// parent (spec §3.2 clinical grouping): pulpa-sana = normal; hyperaemia =
// reversible; every "pulpitis acuta/chronica" = irreversible; necrosis /
// gangraena = necrosis. "none" (no Latin subtype recorded) maps to the
// healthy parent.
export const PULP_LATIN_PARENT: Record<string, string> = {
  "none": "normal",
  "pulpa-sana": "normal",
  "hyperaemia-pulpae": "reversible-pulpitis",
  "pulpitis-acuta-serosa": "irreversible-pulpitis",
  "pulpitis-acuta-purulenta": "irreversible-pulpitis",
  "pulpitis-chronica-clausa": "irreversible-pulpitis",
  "pulpitis-chronica-ulcerosa": "irreversible-pulpitis",
  "pulpitis-chronica-hyperplastica": "irreversible-pulpitis",
  "necrosis-pulpae": "necrosis",
  "gangraena-pulpae": "necrosis",
};

// Representative Latin subtype per AAE parent — used ONLY to display an
// AAE/simple-authored value (pulpLatin:"none") when the panel is in "latin"
// mode. Never written back to state (display-only collapse).
const PULP_DX_TO_LATIN: Record<string, string> = {
  "normal": "pulpa-sana",
  "reversible-pulpitis": "hyperaemia-pulpae",
  "irreversible-pulpitis": "pulpitis-acuta-serosa",
  "necrosis": "necrosis-pulpae",
};

/** Option {value,labelKey} list for the pulp control at a given detail level.
 *  simple -> 2 (healthy / pulpitis); aae -> the 4 pulpDx values; latin -> the 9
 *  pulpLatin subtypes. The "latin" branch consults `ClinicalAxis.flag`
 *  (`isAxisFlagSatisfied` — the first consumer of the registry feature-flag
 *  gate). Pure; reads no module state. */
export function pulpSelectOptionValues(level: PulpDetailLevel): { value: string; labelKey: string }[] {
  if(level === "latin" && isAxisFlagSatisfied("pulpLatin", { latinPulpDetail: true })){
    return Array.from(VALID_PULP_LATIN).filter(v => v !== "none")
      .map(v => ({ value: v, labelKey: "pulpLatin." + kebabToCamel(v) }));
  }
  if(level === "simple"){
    return [
      { value: "normal", labelKey: "pulpDx.normal" },
      { value: "irreversible-pulpitis", labelKey: "pulpDx.irreversiblePulpitis" },
    ];
  }
  return Array.from(VALID_PULP_DX).map(v => ({ value: v, labelKey: "pulpDx." + kebabToCamel(v) }));
}

/** Maps a pulp-control selection to the {pulpDx,pulpLatin} it writes. At "latin"
 *  the selected Latin value sets `pulpLatin` and its parent `pulpDx`; at
 *  "simple"/"aae" the value is a `pulpDx` and `pulpLatin` is cleared to "none". */
/** SP7: the periapical lesion subtype (granuloma / cyst) is a refinement of
 *  apical periodontitis, so its row (#periapicalTypeRow) shows only when the
 *  apical diagnosis is symptomatic or asymptomatic apical periodontitis. Other
 *  apicalDx values (abscess forms, condensing osteitis, normal) carry no
 *  granuloma/cyst refinement. Non-present teeth keep apicalDx="normal" (their
 *  glyph is driven by mods.inflammation in the render, unchanged) so the row is
 *  hidden for them — subtype authoring on implant/missing is deferred to the
 *  peri-implantitis sub-project. */
export function periapicalRowVisible(state: Any): boolean {
  return state.apicalDx === "symptomatic-apical-periodontitis"
    || state.apicalDx === "asymptomatic-apical-periodontitis";
}

export function pulpSelectionToState(level: PulpDetailLevel, value: string): { pulpDx: string; pulpLatin: string }{
  if(level === "latin"){
    return { pulpLatin: value, pulpDx: PULP_LATIN_PARENT[value] ?? "normal" };
  }
  return { pulpDx: value, pulpLatin: "none" };
}

/** The option value to SHOW for a stored state at a given level (display-only
 *  collapse; never mutates state). latin -> stored pulpLatin (or a representative
 *  for pulpDx when only pulpDx is set); aae -> pulpDx; simple -> healthy vs. the
 *  single pulpitis bucket. */
export function pulpDisplayValue(level: PulpDetailLevel, state: { pulpDx?: string; pulpLatin?: string }): string {
  const pulpDx = state.pulpDx ?? "normal";
  const pulpLatin = state.pulpLatin ?? "none";
  if(level === "simple") return pulpDx === "normal" ? "normal" : "irreversible-pulpitis";
  if(level === "latin") return pulpLatin !== "none" ? pulpLatin : (PULP_DX_TO_LATIN[pulpDx] ?? "pulpa-sana");
  return pulpDx;
}

function getPulpOptions(): { value: string; label: string }[]{
  return pulpSelectOptionValues(pulpDetailLevel).map(o => ({ value: o.value, label: t(o.labelKey) }));
}

// SP7 Task 4: a value belongs to the "treated (endo)" branch iff it is a non-"none"
// endo value; otherwise it is a vital pulp value. `endo`/`pulpDx` never share
// a value, so this disambiguation is total.
export function isEndoValue(value: string): boolean {
  return value !== "none" && VALID_ENDO.has(value);
}

// SP7 Task 4: the merged selector's displayed value. A treated tooth shows its
// endo value; otherwise the pulp value collapsed to the active detail level.
export function pulpEndoDisplayValue(state: Any): string {
  if(state.endo && state.endo !== "none") return state.endo;
  return pulpDisplayValue(pulpDetailLevel, state);
}

// SP7 Task 4: build/refresh the grouped #pulpEndoSelect. Two <optgroup>s: vital
// pulp diagnoses (at the active detail level) and treated endo options
// (non-"none", milktooth-filtered). Selection is applied by pulpEndoOnSelect.
export function buildPulpEndoSelect(sel: Any, isMilktooth: boolean, selected: string, omitPulpDx: boolean = false): void {
  if(!sel) return;
  sel.innerHTML = "";
  const mkGroup = (labelKey: string, opts: { value: string; label: string }[]) => {
    const g = document.createElement("optgroup");
    g.label = t(labelKey);
    for(const o of opts){
      const el = document.createElement("option");
      el.value = o.value; el.textContent = o.label;
      g.appendChild(el);
    }
    sel.appendChild(g);
  };
  if(!omitPulpDx){
    // Status: the vital-pulp DIAGNOSIS group + the treated-endo group.
    mkGroup("pulpEndo.groupVital", getPulpOptions());
    mkGroup("pulpEndo.groupTreated", getEndoOptions(isMilktooth).filter(o => o.value !== "none"));
    sel.value = selected;
  }else{
    // 2.2.1 Plan-mode: an ENDO TREATMENT picker only — the vital-pulp diagnosis
    // group (pulpitis/necrosis) is a status finding, out of scope for a plan.
    // A standalone "none" (no endo planned) plus the treated-endo options; the
    // displayed value collapses any non-endo (healthy/diseased-pulp) state to
    // "none" so a plan never shows a pulp diagnosis.
    const endoOpts = getEndoOptions(isMilktooth);
    const none = endoOpts.find(o => o.value === "none");
    if(none){
      const el = document.createElement("option");
      el.value = none.value; el.textContent = none.label;
      sel.appendChild(el);
    }
    mkGroup("pulpEndo.groupTreated", endoOpts.filter(o => o.value !== "none"));
    sel.value = isEndoValue(selected) ? selected : "none";
  }
}

// SP7 Task 4: apply a merged-selector choice, enforcing the mutual-exclusion
// invariant (mirrors the hydrate-time normalize at s.endo assignment, above).
export function pulpEndoOnSelect(s: Any, value: string): void {
  if(value === "none"){
    // 2.2.1 Plan-mode "no endo planned": clear the endo treatment, leave the
    // (Plan-hidden) pulp diagnosis untouched. In Status the vital group's
    // healthy option is used instead, so this branch is Plan-only in practice.
    s.endo = "none";
    return;
  }
  if(isEndoValue(value)){
    s.endo = value;
    s.pulpDx = "normal";
    s.pulpLatin = "none";
  }else{
    s.endo = "none";
    const mapped = pulpSelectionToState(pulpDetailLevel, value);
    s.pulpDx = mapped.pulpDx;
    s.pulpLatin = mapped.pulpLatin;
  }
}

function getApicalDxOptions(): { value: string; label: string }[]{
  return Array.from(VALID_APICAL_DX).map(v => ({ value: v, label: t("apicalDx." + kebabToCamel(v)) }));
}
function getResorptionOptions(): { value: string; label: string }[]{
  return Array.from(VALID_RESORPTION_TYPE).map(v => ({ value: v, label: t("resorption.type." + kebabToCamel(v)) }));
}
function getWearEdgeOptions(): { value: string; label: string }[]{
  return Array.from(VALID_WEAR_EDGE).map(v => ({ value: v, label: t("wearType." + v) }));
}
function getWearCervicalOptions(): { value: string; label: string }[]{
  return Array.from(VALID_WEAR_CERVICAL).map(v => ({ value: v, label: t("wearType." + v) }));
}
function getDiscolorationOptions(): { value: string; label: string }[]{
  return Array.from(VALID_DISCOLORATION).map(v => ({ value: v, label: t("discoloration." + v) }));
}

// SP14 Task 1: orthodontic axes foundation (additive; render lands in Task 2).
function getOrthoApplianceOptions(): { value: string; label: string }[]{
  return Array.from(VALID_ORTHO_APPLIANCE).map(v => ({ value: v, label: t("ortho.appliance." + v) }));
}
function getOrthoDriftOptions(): { value: string; label: string }[]{
  return Array.from(VALID_ORTHO_DRIFT).map(v => ({ value: v, label: t("ortho.drift." + v) }));
}
function getOrthoVerticalOptions(): { value: string; label: string }[]{
  return Array.from(VALID_ORTHO_VERTICAL).map(v => ({ value: v, label: t("ortho.vertical." + v) }));
}

// SP11 Task 3: #bruxismRow visibility gate — aligned to the render gate
// (__renderActiveLayers' wearAllowed, ~line 1355) by requiring
// toothSubstrate === "natural" too; the row gate previously omitted it.
function wearRowAllowed(s: Any): boolean{
  return s?.toothSelection === "tooth-base" && s?.restorationType === "none" && s?.toothSubstrate === "natural";
}
export function __wearRowAllowedForTest(s: Record<string, unknown>): boolean {
  return wearRowAllowed(s);
}

// SP12: discoloration crown tint. Fill is NOT recorded by the SVG-fingerprint
// (collectActiveLayers captures id/opacity/cls only) — parity-safe. Applies to the
// natural crown of a permanent OR milk tooth (no restoration, natural substrate).
const DISCOLORATION_TINT: Record<string, string> = {
  tetracycline: "#9c8f7a", fluorosis: "#d9c9a3", nonvital: "#a89a8a", extrinsic: "#c2a86a", other: "#b5a894",
};
function discolorationAllowed(s: Any): boolean {
  return (s?.toothSelection === "tooth-base" || s?.toothSelection === "milktooth")
    && s?.restorationType === "none" && s?.toothSubstrate === "natural";
}
export function __discolorationAllowedForTest(s: Record<string, unknown>): boolean { return discolorationAllowed(s); }
// SP12 Task 3: named alias for the #discolorationRow visibility-gate test seam
// (mirrors __wearRowAllowedForTest); same underlying predicate as the render
// gate above — the row's visibility must never contradict the chart.
export function __discolorationRowAllowedForTest(s: Record<string, unknown>): boolean { return discolorationAllowed(s); }

// SP14: orthodontic glyphs (appliance/drift/vertical/rotation) — gated to a
// present natural tooth (permanent or milk), same shape as discolorationAllowed
// above minus the restoration/substrate constraints (ortho hardware can sit on
// a restored tooth). ONE shared predicate reused by the Task 3 UI picker and
// the Task 4 whole-mouth summary (SP9/10/11 lesson: don't fork the gate).
function orthoAllowed(s: Any): boolean {
  return s?.toothSelection === "tooth-base" || s?.toothSelection === "milktooth";
}
export function __orthoAllowedForTest(s: Record<string, unknown>): boolean { return orthoAllowed(s); }
// SP14 Task 3: named alias for the #orthoCard visibility-gate test seam
// (mirrors __discolorationRowAllowedForTest); same underlying predicate as
// the render gate above — the card's visibility must never contradict the
// chart.
export function __orthoCardAllowedForTest(s: Record<string, unknown>): boolean { return orthoAllowed(s); }

function getPeriImplantOptions(): { value: string; label: string }[]{
  return Array.from(VALID_PERI_IMPLANT).map(v => ({ value: v, label: t("periImplant." + kebabToCamel(v)) }));
}

// Pure mutation for #periImplantSelect's change handler — mirrors
// applyRestorationSelection's role/shape and __applyRestorationSelectionForTest.
function applyPeriImplantSelection(s: Any, value: string){
  s.periImplant = value;
}

/** TEST-ONLY: apply a #periImplantSelect value to a state object, exactly as
 *  the change handler does. Not part of the public API. */
export function __applyPeriImplantSelectionForTest(s: Record<string, unknown>, value: string): void {
  applyPeriImplantSelection(s, value);
}

// SP7 (fixed post-review): symmetrically set the 8 flame sublayers (and their
// "-N1" variants) of the tooth-inflam-pulp / milktooth-inflam-pulp group to
// `active`. The mild (reversible) tier turns them OFF, every other diseased
// tier turns them ON. Must be called unconditionally on every diseased-pulp
// render — the live app reuses one persistent SVG DOM node per tooth, so a
// one-directional (deactivate-only) helper left the flames stuck off after a
// mild render even when a later render is full-severity. Missing ids no-op
// (setActive tolerates null), so teeth without the full set are unaffected.
function setPulpInflamPaths(svg: Any, active: boolean){
  for(let n = 1; n <= 8; n++){
    setActive(svgGetById(svg, "pulp-inflam-path-" + n), active);
    setActive(svgGetById(svg, "pulp-inflam-path-" + n + "1"), active);
  }
}

// ---- SVG apply logic ----
function applyStateToSvgSingle(toothNo: Any, svg: Any, state: Any = toothState.get(toothNo)){
  if(!state || !svg) return;

  // 0) Start from a clean baseline: turn OFF all switchables, then apply ON flags.
  // (Base stays as in SVG; we don't toggle #base)
  const switchable = ["mods","tooth-variants","endos","surfaces","restorations","tooth"];
  for(const gId of switchable){
    const g = svgGetById(svg, gId);
    if(!g) continue;
    // Keep group itself active; we toggle children by id
    // But for simplicity, if group has data-active, keep at 1 so children can show.
    if(g.hasAttribute("data-active")) g.setAttribute("data-active","1");
  }

  // Turn OFF all known switchable layers (derived from the registry + fixed non-axis set).
  for (const id of allClearLayers()) setActive(svgGetById(svg, id), false);

  const hasCrown = state.restorationType !== "none";
  const brokenVariant = state.toothSubstrate === "broken" ? getBrokenCrownVariant(state) : null;
  const isImplant = state.toothSelection === "implant";
  const isMilktooth = state.toothSelection === "milktooth";
  const underGum = isUnderGum(state.toothSelection);
  const extraction = isExtraction(state.toothSelection) || (state.toothSelection === "none" && state.extractionWound);
  const hasRemovable = state.toothSelection === "none"
    && (state.prosthesis === "removable-partial" || state.prosthesis === "removable-full");
  const isNone = state.toothSelection === "none";
  const hasRestoration = hasCrown || hasRemovable;
  // Occlusal-view SVGs are the only templates carrying `*-onlay` layers; the
  // presence of one tells composeRestorationLayers to include occlusal-only types.
  const restorationView: "front" | "occlusal" = svg.querySelector('[id$="-onlay"]') ? "occlusal" : "front";

  const flagDeps = {
    setActive, svgGetById, isToothPresent, isUnderGum, isExtraction,
    fissureAllowedTeeth: FISSURE_ALLOWED, brokenVariants: BROKEN_VARIANTS,
  };
  applyFlagLayers(svg, state, buildFlagCtx(state, toothNo, flagDeps), flagDeps);

  // SP4 Task 2: resorptionType (enum) replaces the retired rootResorption
  // boolean. applyFlagLayers only auto-activates boolean-kind axes' svgLayer,
  // so this enum axis needs explicit activation here. Both "internal" and
  // "external-cervical" render the SAME endo-resorption layer (visually
  // identical; only the data model distinguishes them) — byte-identical to
  // the retired rootResorption:true render (same appliesWhen: toothPresent).
  if(state.resorptionType !== "none" && isToothPresent(state.toothSelection)){
    setActive(svgGetById(svg, "endo-resorption"), true);
  }

  // SP11: tooth wear (per location; reuses the two existing wear layers). Same
  // gate the retired booleans used (bruxismAllowed) so migrated legacy states
  // render byte-identically.
  const wearAllowed = state.toothSelection === "tooth-base" && state.restorationType === "none" && state.toothSubstrate === "natural";
  if(wearAllowed){
    if(state.wearEdge !== "none") setActive(svgGetById(svg, "tooth-bruxism-wear"), true);
    if(state.wearCervical !== "none") setActive(svgGetById(svg, "tooth-bruxism-neck-wear"), true);
  }

  // SP5 Task 2: rootCaries (enum) wires the previously-dormant `caries-root`
  // artwork layer (present since v2.5.0, but only in the 4 main-view templates
  // — 11/13/14/16 — never in the 2 occlusal templates, and never toggled by
  // any code until now). Same enum-explicit-activation pattern as
  // resorptionType above: applyFlagLayers only auto-activates boolean-kind
  // axes, so this enum axis (appliesWhen: toothPresent, mirrored from
  // src/registry/axes.ts) needs an explicit setActive here. Additionally
  // gated on restorationView === "front" (the same occlusal-vs-main-view
  // detection composeRestorationLayers uses, see :952) since the occlusal
  // templates carry no caries-root artwork at all — svgGetById would return
  // null there and setActive is a no-op on null, but the explicit gate keeps
  // intent clear and matches the brief.
  if(state.rootCaries !== "none" && isToothPresent(state.toothSelection) && restorationView === "front"){
    const rootEl = svgGetById(svg, "caries-root") as SVGElement | null;
    setActive(rootEl, true);
    // SP6 Task 3: severity-based opacity, same style.opacity mechanism as the
    // caries-surface / subcaries opacity above. `active-cavitated` is the most
    // severe (fully opaque); `active` is the least severe (most translucent).
    // Simple-mode "present" is stored canonically as `active-cavitated` (see
    // rootCariesOptions), so it renders at full opacity like severity mode's
    // most-severe option.
    if(rootEl){
      rootEl.style.opacity = state.rootCaries === "active" ? "0.5"
        : state.rootCaries === "arrested" ? "0.7"
        : "1";
    }
  }

  // SP8: peri-implant disease (implants only). mucositis = soft-tissue inflammation
  // (reuse the existing `parodontal` gum glyph); peri-implantitis adds crestal bone
  // loss at severity-scaled opacity. Set both the active flag and opacity every
  // render (the live app reuses one SVG DOM node per tooth — SP7 lesson).
  if(isImplant && state.periImplant !== "none"){
    setActive(svgGetById(svg, "parodontal"), true);
    const boneEl = svgGetById(svg, "peri-implant-bone-loss") as SVGElement | null;
    const boneOpacity = state.periImplant === "peri-implantitis-mild" ? "0.4"
      : state.periImplant === "peri-implantitis-moderate" ? "0.7"
      : state.periImplant === "peri-implantitis-severe" ? "1"
      : ""; // mucositis → no bone loss
    setActive(boneEl, boneOpacity !== "");
    if(boneEl && boneOpacity !== "") boneEl.style.opacity = boneOpacity;
  }

  // SP4 Task 3: pulpDx (enum) replaces the retired pulpInflam boolean. Any
  // non-"normal" pulpDx value is clinically "diseased pulp" for rendering
  // purposes — the same single condition the old boolean encoded — so a
  // plain boolean gate here is byte-identical to the retired render. The
  // bespoke milktooth/permanent split + showHealthyPulp gating below is
  // otherwise unchanged.
  const pulpDiseased = state.pulpDx !== "normal";

  // SP7: reversible pulpitis (and its Latin equivalent, hyperaemia pulpae) is a
  // mild, reversible state — render a reduced glyph (the base inflamed-pulp
  // shape without the flame sublayers). Every other diseased state renders the
  // full glyph, as before. Checking both fields keeps this correct in aae and
  // latin modes regardless of the Latin->AAE parent mapping.
  const pulpTierMild = state.pulpDx === "reversible-pulpitis" || state.pulpLatin === "hyperaemia-pulpae";
  // SP7: a root-treated tooth has no vital pulp — its endo artwork represents
  // the canal, so suppress both pulp glyphs.
  const endoTreated = state.endo !== "none";

  // base visibility toggle
  setActive(svgGetById(svg, "base"), showBase);

  // 1) Tooth selection
  setActive(svgGetById(svg, "implant"), isImplant);
  setActive(svgGetById(svg, "milktooth"), isMilktooth);

  if(isImplant){
    setActive(svgGetById(svg, "implant-base"), true);
  }else if(isMilktooth){
    setActive(svgGetById(svg, "milktooth-base"), true);
    setActive(svgGetById(svg, "milktooth-beauty"), true);
    if(pulpDiseased){
      if(!endoTreated){
        setActive(svgGetById(svg, "milktooth-inflam-pulp"), true);
        setPulpInflamPaths(svg, !pulpTierMild);
      }
    }else if(showHealthyPulp){
      setActive(svgGetById(svg, "milktooth-healthy-pulp"), true);
    }
  }else if(isToothPresent(state.toothSelection)){
    if(state.toothSelection === "tooth-base"){
      setActive(svgGetById(svg, "tooth-base"), true);
      // Gloss only on an intact natural crown — not on broken/radix/prepared
      // substrates or a prosthetic restoration.
      setActive(svgGetById(svg, "tooth-base-beauty"), state.toothSubstrate === "natural" && state.restorationType === "none");
    }else{
      setActive(svgGetById(svg, state.toothSelection), true);
    }
    if(!underGum && !extraction){
      // Pulpa: a diseased-pulp glyph is suppressed on an endodontically treated
      // tooth (the endo artwork represents the filled canal). The healthy-pulp
      // glyph is unchanged (legacy behaviour — a treated tooth may still show it
      // under the endo layer).
      if(pulpDiseased){
        if(!endoTreated){
          setActive(svgGetById(svg, "tooth-inflam-pulp"), true);
          setPulpInflamPaths(svg, !pulpTierMild);
        }
      }else if(showHealthyPulp){
        setActive(svgGetById(svg, "tooth-healthy-pulp"), true);
      }
    }
  }
  if(brokenVariant && state.toothSelection === "tooth-base"){
    setActive(svgGetById(svg, "tooth-base"), false);
    setActive(svgGetById(svg, brokenVariant), true);
  }
  if(state.toothSubstrate === "radix" && state.toothSelection === "tooth-base"){
    setActive(svgGetById(svg, "tooth-base"), false);
    setActive(svgGetById(svg, "tooth-radix"), true);
  }
  // "Prepared for crown" is a substrate state on a permanent tooth: hide the
  // natural crown and show the crown-prep layer. Its properties mirror "broken".
  if(state.toothSubstrate === "crownprep" && state.toothSelection === "tooth-base"){
    setActive(svgGetById(svg, "tooth-base"), false);
    setActive(svgGetById(svg, "tooth-crownprep"), true);
  }
  if(state.toothSelection === "none" && state.extractionWound){
    setActive(svgGetById(svg, "no-tooth-after-extraction"), true);
  }

  // SP12: discoloration — tint the shown natural crown's fill. Symmetric: reset
  // BOTH crown paths every render so a reused per-tooth node never keeps a stale
  // tint (permanent<->milk switch, or cleared). Fill isn't fingerprinted (parity-safe).
  //
  // IMPORTANT: each crown path carries its base color ONLY as an inline `style`
  // attribute baked into the SVG asset (e.g. tooth-base: "fill: #ebebeb; ...";
  // milktooth-base: "fill: #fff; ..."); no CSS rule supplies it. Setting
  // `el.style.fill = ""` DELETES the inline `fill` longhand (CSSOM), it does NOT
  // revert to the asset's original color — the crown falls back to the SVG
  // initial value (black). Since this block runs on every render and
  // `discoloration` defaults to "none", clearing to "" would blacken every
  // tooth's crown on first render. Instead, capture each element's own
  // asset-original fill ONCE (this block is the sole writer of these elements'
  // `.style.fill` — verified via grep) and restore THAT on every non-tinted
  // render. The capture is stashed in a `data-base-fill` attribute so it
  // survives the reused-node lifecycle; that attribute is not part of the
  // parity fingerprint (collectActiveLayers only reads id/opacity/class).
  {
    const tintOn = discolorationAllowed(state) && state.discoloration !== "none";
    const tint = tintOn ? (DISCOLORATION_TINT[state.discoloration] || "") : "";
    const activeId = state.toothSelection === "milktooth" ? "milktooth-base" : "tooth-base";
    for(const id of ["tooth-base", "milktooth-base"]){
      const el = svgGetById(svg, id) as SVGElement | null;
      if(!el) continue;
      if(el.getAttribute("data-base-fill") === null){
        el.setAttribute("data-base-fill", el.style.fill || "");
      }
      const base = el.getAttribute("data-base-fill") || "";
      el.style.fill = (tintOn && id === activeId) ? tint : base;
    }
  }

  // SP14: orthodontic glyphs (dormant since v2.5.0). Explicit + symmetric; null-guarded
  // (occlusal templates lack ring/bracket/up/down — 4 of the 7 ids — so every lookup
  // must be guarded). Gate: present natural tooth (orthoAllowed, shared w/ Task 3/4).
  //
  // extrusion/intrusion <-> arrow-up/arrow-down binding (verified from 11.svg geometry,
  // viewBox "0 0 39.2 62.7"): the crown/incisal edge sits at LARGER y (e.g. crown-needed
  // spans y~34.5-61, near the bottom of the 62.7-tall canvas) and the root/apex at
  // SMALLER y. Group "arrow-up" has its 2-line chevron vertex (tip) at y~60.2-60.3 with
  // the shaft's tail at y~53.6 — tip toward LARGER y (incisal edge) => this glyph visually
  // points toward the crown => extrusion. Group "arrow-down" has its chevron vertex at
  // y~54.5-54.7 with the shaft's tail at y~61.2 — tip toward SMALLER y (apex) => this
  // glyph visually points toward the root => intrusion. (The layer *ids* arrow-up/
  // arrow-down don't literally match their visual direction; binding by drawn geometry,
  // not by id text, per Step 1's instruction.)
  {
    const ok = orthoAllowed(state);
    const set = (id: string, on: boolean) => { const el = svgGetById(svg, id); if(el) setActive(el, on); };
    set("ortho-bracket", ok && state.orthoAppliance === "bracket");
    set("ortho-ring",    ok && state.orthoAppliance === "band");
    set("arrow-mesial",  ok && state.orthoDrift === "mesial");
    set("arrow-distal",  ok && state.orthoDrift === "distal");
    set("arrow-up",      ok && state.orthoVertical === "extrusion");
    set("arrow-down",    ok && state.orthoVertical === "intrusion");
    set("arrow-rotation",ok && state.orthoRotation === true);
  }

  // 2) Mods — periapical glyph.
  // SP4 Task 4: on a PRESENT tooth the `apicalDx` clinical axis (not
  // `mods.inflammation`) drives the periapical glyph. On a NON-present tooth
  // (missing / implant) `mods.inflammation` retains its SECOND, PERIODONTAL
  // role and still drives the glyph exactly as before — the label switches to
  // "periodontal inflammation" in updateInflammationSection, but the glyph is
  // unchanged. This split is byte-identical to the pre-rewrite single block:
  // migration derives apicalDx from a present tooth's legacy mods.inflammation
  // (and strips that mod), while a non-present tooth keeps mods.inflammation
  // with apicalDx left at "normal". `periapicalType` still selects the lesion
  // subtype glyph; when it is unset, apicalDx suggests abscess-vs-granuloma.
  // SP8: an implant no longer shows the periapical (apical-lesion) glyph — its
  // inflammation is expressed via the periImplant axis. Missing / extraction-socket
  // teeth keep the mods.inflammation-driven periapical/residual glyph (SP4).
  const periapicalGlyphActive = isToothPresent(state.toothSelection)
    ? state.apicalDx !== "normal"
    : (state.toothSelection === "implant" ? false : state.mods.has("inflammation"));
  if(periapicalGlyphActive){
    // The `inflammation` container group is the glyph's parent; collectActiveLayers
    // hides any child whose ancestor is inactive. On the non-present path it is
    // already activated by applyFlagLayers via the `mods.inflammation` set entry;
    // on the present (apicalDx) path — where migration has stripped that mod —
    // we must activate the group here so the glyph is not hidden. Idempotent when
    // both fire, so the collected layers stay byte-identical to the old render.
    setActive(svgGetById(svg, "inflammation"), true);
    const glyph = state.periapicalType === "cyst" ? "cysta"
      : (state.periapicalType === "abscess"
          || state.apicalDx === "acute-apical-abscess"
          || state.apicalDx === "chronic-apical-abscess") ? "abscess"
      : "granuloma"; // default incl. "none" and "granuloma"
    setActive(svgGetById(svg, glyph), true);
  } else if(isImplant){
    // SP8: applyFlagLayers (the generic mods-set pass) unconditionally activates
    // the shared "inflammation" container for ANY tooth carrying a legacy/imported
    // `mods.inflammation` entry, independent of periapicalGlyphActive above. Since
    // an implant's periapical glyph is retired (finding now expressed via
    // periImplant), explicitly retire the container too, so a stray implant
    // mods.inflammation entry renders no glyph at all instead of an orphaned
    // empty-of-children-but-active "inflammation" group.
    setActive(svgGetById(svg, "inflammation"), false);
  }
  // SP15 wholebranch fix: mobilityRowHidden() also hides the mobility control
  // on an implant (osseointegrated, no PDL) — gate the render the same way.
  // The stored value is deliberately left untouched (T1's choice), just not
  // drawn/summarized on an implant.
  if(state.mobility !== "none" && state.toothSelection !== "none" && !extraction && !isImplant){
    setActive(svgGetById(svg, "mobility"), true);
  }

  // 3) Endo exclusivity (only if tooth present)
  if(isToothPresent(state.toothSelection) && !underGum && !extraction){
    if(state.endo === "endo-medical-filling"){
      setActive(svgGetById(svg, "endo-medical-filling"), true);
    } else if(state.endo === "endo-filling"){
      setActive(svgGetById(svg, "endo-filling"), true);
    } else if(state.endo === "endo-glass-pin"){
      setActive(svgGetById(svg, "endo-filling"), true);
      setActive(svgGetById(svg, "endo-glass-pin"), true);
    } else if(state.endo === "endo-filling-incomplete"){
      setActive(svgGetById(svg, "endo-filling-incomplete"), true);
    } else if(state.endo === "endo-metal-pin"){
      setActive(svgGetById(svg, "endo-filling"), true);
      setActive(svgGetById(svg, "endo-metal-pin"), true);
    }
  }

  // 4) Removable prosthesis
  if(hasRemovable){
    setActive(svgGetById(svg, "prosthesis"), true);
    setActive(svgGetById(svg, "prosthesis-crown"), true);
    setActive(svgGetById(svg, "prosthesis-connector"), true);
  }

  // Implant attachments (healing-abutment / locator / bar) — SP3b: render off the
  // dedicated `prosthesis` axis (field-move from the legacy `crownMaterial`,
  // byte-identical to the pre-move layer sets). Fixed implant crowns/bridges
  // (Task 3) are first-class in the restoration model: only the connector is
  // implant-specific here — the crown/bridge material layers themselves flow
  // through the shared restoration composition below (same as non-implant teeth).
  if(isImplant){
    if(state.prosthesis === "healing-abutment"){
      setActive(svgGetById(svg, "implant-healing-abutment"), true);
    } else if(state.restorationType === "crown" || state.restorationType === "bridge"){
      setActive(svgGetById(svg, "implant-connector"), true);
    } else if(state.prosthesis === "locator"){
      setActive(svgGetById(svg, "restorations"), true);
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-connector"), true);
      setActive(svgGetById(svg, "implant-locator-screw"), true);
    } else if(state.prosthesis === "locator-denture"){
      setActive(svgGetById(svg, "restorations"), true);
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-connector"), true);
      setActive(svgGetById(svg, "implant-locator-screw"), true);
      setActive(svgGetById(svg, "prosthesis-implant"), true);
      setActive(svgGetById(svg, "prosthesis-implant-crown"), true);
      setActive(svgGetById(svg, "prosthesis-implant-gum"), true);
    } else if(state.prosthesis === "bar"){
      setActive(svgGetById(svg, "restorations"), true);
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-connector"), true);
      setActive(svgGetById(svg, "implant-locator-screw"), true);
      setActive(svgGetById(svg, "implant-bar"), true);
    } else if(state.prosthesis === "bar-denture"){
      setActive(svgGetById(svg, "restorations"), true);
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-connector"), true);
      setActive(svgGetById(svg, "implant-locator-screw"), true);
      setActive(svgGetById(svg, "implant-bar"), true);
      setActive(svgGetById(svg, "prosthesis-implant"), true);
      setActive(svgGetById(svg, "prosthesis-implant-crown"), true);
      setActive(svgGetById(svg, "prosthesis-implant-gum"), true);
    }
  }
  if(isNone){
    setActive(svgGetById(svg, "restorations"), true);
    // Removable/bar prosthesis on a gap — SP3b: render off `prosthesis` (field-move
    // from the legacy `bridgeUnit`). Fixed bridge values flow through the
    // composition below. Note this branch's layer set intentionally differs from
    // the isImplant "bar"/"bar-denture" branch above (no connector/locator-screw
    // on a gap tooth) — matches the pre-move `bridgeUnit` render exactly.
    if(state.prosthesis === "bar"){
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-bar"), true);
    } else if(state.prosthesis === "bar-denture"){
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-bar"), true);
      setActive(svgGetById(svg, "prosthesis-implant"), true);
      setActive(svgGetById(svg, "prosthesis-implant-crown"), true);
      setActive(svgGetById(svg, "prosthesis-implant-gum"), true);
    }
  }

  // Restoration composition (crown / inlay / onlay / veneer / bridge × material).
  // composeRestorationLayers is the single source of truth for which SVG layer
  // ids activate; the chosen material's wrapper <g> is turned on so its children
  // (cleared to off in the clear-set) become visible. `restorations` stays on.
  if(state.restorationType !== "none" && state.restorationMaterial !== "none"){
    const wrapper = RESTORATION_WRAPPER_GROUP[state.restorationMaterial];
    const ids = composeRestorationLayers(state.restorationType, state.restorationMaterial, restorationView);
    if(wrapper && ids.length){
      setActive(svgGetById(svg, "restorations"), true);
      setActive(svgGetById(svg, wrapper), true);
      for(const id of ids) setActive(svgGetById(svg, id), true);
    }
  }

  // 5) Surfaces
  if(!isImplant && !underGum && !extraction && state.toothSelection !== "none"){
    // Caries: if any restoration active => disable surface caries (except subcrown allowed)
    for(const id of state.caries){
      if(id === "caries-subcrown"){
        if(hasCrown){
          setActive(svgGetById(svg, "caries-subcrown"), true);
        }
        continue;
      }
      if(hasRestoration || hasCrown) continue;
      // SP6 Task 1: per-surface caries STATE MACHINE. A caried surface is either
      // PRIMARY caries (no filling) or RECURRENT/secondary caries (a filling on
      // the same surface). Recurrence is DERIVED from the filling — never a
      // separate stored flag — so a surface is NEVER both `caries-X` and
      // `subcaries-X`. The single `state.cariesSeverity` score (default 2) is
      // read as CARS when a filling is present and as ICDAS otherwise.
      const surface = id.replace("caries-", ""); // e.g. caries-mesial -> mesial
      const hasFilling = state.fillingSurfaceMaterials.has(surface);
      const sev = state.cariesSeverity.get(surface) ?? 2; // ICDAS-2 / CARS-2 representative
      if(hasFilling){
        // Recurrent path: the `subcaries-{surface}` layer, opacity encodes the
        // CARS score (score 1 -> 0.30 … score 6 -> 1.0). The primary
        // `caries-{surface}` layer is deliberately NOT activated here.
        const subEl = svgGetById(svg, `subcaries-${surface}`) as SVGElement | null;
        setActive(subEl, true);
        if(subEl && sev > 0){
          const carsOpacity = 0.30 + ((sev - 1) / 5) * 0.70;
          subEl.style.opacity = String(Math.round(carsOpacity * 100) / 100);
        }
      }else{
        const surfEl = svgGetById(svg, id) as SVGElement | null;
        setActive(surfEl, true);
        // Primary caries depth: opacity encodes the ICDAS depth; "deep" recolors
        // the contour. SP5 Task 5: the whole depth-tier encoding is gated by the
        // `cariesDepthEnabled` setting — with it OFF, caried surfaces render at
        // the SVG default (no opacity/contour tier). Default ON = unchanged.
        if(surfEl && cariesDepthEnabled){
          const tier = icdasTier(sev);
          surfEl.style.opacity = tier === 3 ? "1" : tier === 2 ? "0.7" : "0.45";
          surfEl.classList.toggle("caries-deep", tier === 3);
        }
      }
    }

    // Fillings: each surface rendered with its own material
    if(state.fillingSurfaceMaterials.size > 0 && !hasCrown){
      for(const [s, mat] of state.fillingSurfaceMaterials){
        setActive(svgGetById(svg, `filling-${mat}-${s}`), true);
      }
    }

    // SP10: per-surface filling defect — activate the (already-present, dormant)
    // defect-{surface} marker on a filled surface with a recorded defect. Generic
    // marker (type lives in the data / summary), no opacity. Independent of
    // secondary caries (both may be active on the same surface).
    if(state.fillingDefect && state.fillingDefect.size > 0 && !hasCrown){
      for(const [s, val] of state.fillingDefect){
        if(val && val !== "none" && state.fillingSurfaceMaterials.has(s)){
          setActive(svgGetById(svg, `defect-${s}`), true);
        }
      }
    }

  }

  // Periapical inflammation lives in the `mods` group, which paints beneath the
  // `tooth` group — so an active endo-resection or endo-resorption layer (both
  // inside `tooth`) would cover the glyph. ONLY when inflammation coincides with
  // one of those two layers, lift the inflammation group to the end of the SVG
  // so the glyph stays on top; in every other case keep its original position.
  const inflammation = svgGetById(svg, "inflammation");
  if(inflammation){
    if(!inflammationHome.has(inflammation) && inflammation.parentElement){
      inflammationHome.set(inflammation, { parent: inflammation.parentElement, next: inflammation.nextSibling });
    }
    const resectionActive = state.endoResection && isToothPresent(state.toothSelection) && !underGum && !extraction;
    const resorptionActive = state.resorptionType !== "none" && isToothPresent(state.toothSelection);
    // SP4 Task 4: the lift now keys off the SAME `periapicalGlyphActive`
    // predicate that gates the glyph render above (was `mods.inflammation`).
    // Both resection/resorption are toothPresent-gated, so this reduces to
    // `apicalDx !== "normal"` on a present tooth — byte-identical to the old
    // `mods.inflammation` gate after migration moves that lesion into apicalDx.
    const lift = (resectionActive || resorptionActive) && periapicalGlyphActive;
    if(lift){
      // Move inflammation to the END of the `tooth` group's own parent, so it
      // paints in front of the whole tooth group (including the endo-resection /
      // endo-resorption layers, and the `endos` root-filling group that usually
      // accompanies a resection). Using tooth's parent — not the svg root —
      // keeps the glyph inside the lower-tooth mirroring <g transform> wrapper,
      // so it stays correctly positioned.
      const toothGroup = svgGetById(svg, "tooth");
      const container = (toothGroup && toothGroup.parentElement) || svg;
      if(container.lastElementChild !== inflammation){
        container.appendChild(inflammation);
      }
    }else{
      const home = inflammationHome.get(inflammation);
      if(home && home.parent){
        const ref = home.next && home.next.parentElement === home.parent ? home.next : null;
        if(inflammation.parentElement !== home.parent || inflammation.nextSibling !== ref){
          home.parent.insertBefore(inflammation, ref);
        }
      }
    }
  }

  updateWarnings(state);
}

// R2-C Task 1: proposed-layer styling. In Plan mode, a layer that is active
// in the PLAN chart but NOT in the STATUS chart (a "plan add" — e.g. a crown
// proposed on a tooth that is sound in status) gets a distinct dashed+tinted
// look, so a plan reads as PROPOSED treatment rather than as-if-already-done
// findings. PARITY IS SACRED: `collectActiveLayers` (below) fingerprints only
// id/opacity/class, so this marking uses ONLY `style.strokeDasharray` +
// `style.stroke` — never `style.opacity` and never a CSS class — and the
// whole pass is gated on `chartMode === "plan" && planInitialized`, so
// status-mode rendering (including the parity capture, which always renders
// in status mode) is a byte-identical no-op.
const PROPOSED_DASH = "4 2";
const PROPOSED_TINT = "#5b7a9d";

/** Restore every previously-marked layer in `svg` to its captured base style,
 *  then drop the `data-proposed` marker. Runs FIRST on every
 *  `applyProposedStyling` call (symmetric reset — SP12 discoloration
 *  capture-once pattern, see the discoloration tint block above): this is
 *  what un-dashes a layer when switching plan -> status, or when a plan edit
 *  is reverted back to match status. */
function clearProposedStyling(svg: Any){
  const marked = svg.querySelectorAll ? svg.querySelectorAll('[data-proposed="1"]') : [];
  for(const el of Array.from(marked) as Any[]){
    if(el.getAttribute("data-base-dash") !== null){ el.style.strokeDasharray = el.getAttribute("data-base-dash") || ""; }
    if(el.getAttribute("data-base-pstroke") !== null){ el.style.stroke = el.getAttribute("data-base-pstroke") || ""; }
    el.removeAttribute("data-proposed");
  }
}

/** Mark `el` as a proposed (plan-only) layer: capture its base
 *  strokeDasharray/stroke ONCE (data-base-dash/data-base-pstroke — mirrors
 *  the SP12 `data-base-fill` pattern so a reused node's second render doesn't
 *  capture an already-tinted value as "base"), then apply the dashed+tint
 *  treatment. Neither captured/written attribute is part of the SVG
 *  fingerprint (`collectActiveLayers` reads only id/opacity/class). */
function markProposed(el: Any){
  if(el.getAttribute("data-proposed") === "1") return;
  if(el.getAttribute("data-base-dash") === null) el.setAttribute("data-base-dash", el.style.strokeDasharray || "");
  if(el.getAttribute("data-base-pstroke") === null) el.setAttribute("data-base-pstroke", el.style.stroke || "");
  el.style.strokeDasharray = PROPOSED_DASH;
  el.style.stroke = PROPOSED_TINT;
  el.setAttribute("data-proposed", "1");
}

/** Compute which of `svg`'s currently-active layers (already painted with
 *  the ACTIVE chart's state by the caller — see `applyStateToSvg`) are
 *  present in the PLAN chart but absent from the STATUS chart, and mark only
 *  those as "proposed". Always resets first (symmetric — see
 *  `clearProposedStyling`), then gates on Plan mode being active. The
 *  `charts.status.get(toothNo) ?? defaultState()` fallback is required: an
 *  absent status tooth passed as `undefined` makes `applyStateToSvgSingle`
 *  early-return, which would leave the clone showing the (already-painted)
 *  PLAN layers — collapsing statusIds to planIds and marking nothing. */
function applyProposedStyling(toothNo: Any, svg: Any){
  clearProposedStyling(svg);
  if(chartMode !== "plan" || !planInitialized) return;
  const planIds = new Set(collectActiveLayers(svg).map((l) => l.id));
  const clone = svg.cloneNode(true); // detached; getElementById/querySelectorAll work on the clone's own subtree
  applyStateToSvgSingle(toothNo, clone, charts.status.get(toothNo) ?? defaultState());
  const statusIds = new Set(collectActiveLayers(clone).map((l) => l.id));
  for(const id of planIds){
    if(statusIds.has(id)) continue;
    const el = svgGetById(svg, id);
    if(el) markProposed(el);
  }
}

/** TEST-ONLY: invoke `applyProposedStyling` directly on a detached, already-
 *  painted svg node (as returned by `__parseSvgForTest` + `__renderActiveLayersOnNode`),
 *  without requiring a live grid (`toothSvgRoot`/`applyStateToSvg` needs
 *  registered DOM roots — see addTile()). Reads the module's live
 *  `charts`/`chartMode`/`planInitialized`, exactly as the real
 *  `applyStateToSvg` roots loop does. Not part of the public API. */
export function __applyProposedStylingForTest(toothNo: Any, svg: Any): void {
  applyProposedStyling(toothNo, svg);
}

function applyStateToSvg(toothNo: Any){
  const roots = toothSvgRoot.get(toothNo);
  if(!roots) return;
  for(const svg of roots){
    applyStateToSvgSingle(toothNo, svg);
    applyProposedStyling(toothNo, svg); // R2-C Task 1: dashed+tint plan-only layers (Plan mode only)
  }
  applyPluginOverlays(toothNo);
  updateToothTooltip(toothNo);
}

/** Collect, IN DOCUMENT ORDER (not sorted — order captures z-order/re-parenting),
 *  one entry per id'd element that is visible after render: self and every ancestor
 *  have data-active !== "0", excluding <defs> and non-visual defs elements. Each
 *  entry also carries the element's inline `opacity` (parsed from the style
 *  attribute, "" if none) and its `class` ("" if none), so per-surface caries-depth
 *  encoding (style.opacity / classList "caries-deep") is visible to the fingerprint. */
function collectActiveLayers(svg: Any): { id: string; opacity: string; cls: string }[] {
  const NONVISUAL = new Set(["defs","linearGradient","radialGradient","stop","clipPath","mask","style","title","desc","metadata"]);
  const localName = (el: Element) => el.tagName.replace(/^.*:/, "").toLowerCase();
  const out: { id: string; opacity: string; cls: string }[] = [];
  for (const n of Array.from(svg.querySelectorAll("[id]")) as Element[]) {
    if (NONVISUAL.has(localName(n))) continue;
    let inDefs = false, hidden = false;
    for (let cur: Element | null = n; cur && cur !== (svg.parentElement as Element | null); cur = cur.parentElement) {
      if (localName(cur) === "defs") { inDefs = true; break; }
      if (cur.getAttribute && cur.getAttribute("data-active") === "0") { hidden = true; break; }
    }
    if (inDefs || hidden) continue;
    const style = n.getAttribute("style") || "";
    const m = style.match(/opacity:\s*([0-9.]+)/);
    out.push({ id: n.getAttribute("id") as string, opacity: m ? m[1] : "", cls: n.getAttribute("class") || "" });
  }
  return out; // document order — NOT sorted
}

/** TEST-ONLY: render `serialized` state onto a fresh copy of `rawSvgText` and return the
 *  in-document-order active-layer fingerprint (id + opacity + class per element). Used by
 *  the SP2 parity harness; not part of the public API. */
export function __renderActiveLayers(rawSvgText: string, toothNo: number, serialized: Record<string, unknown>): { id: string; opacity: string; cls: string }[] {
  const parsed = new DOMParser().parseFromString(rawSvgText, "image/svg+xml");
  const svg = parsed.documentElement as unknown as Any;
  stripDisplayNoneToDataActive(svg);
  ensureDataActiveForSwitchables(svg);
  const state = hydrateState(serialized as Any);
  applyStateToSvgSingle(toothNo, svg, state);
  return collectActiveLayers(svg);
}

/** TEST-ONLY: parse `rawSvgText` once (same prep `__renderActiveLayers` does —
 *  strip display:none to data-active, seed missing data-active defaults) and
 *  return the live parsed element. Pair with `__renderActiveLayersOnNode` to
 *  render multiple states onto the SAME node, reproducing how the live app
 *  reuses one persistent SVG DOM node per tooth across renders (unlike
 *  `__renderActiveLayers`, which re-parses a fresh node every call and so
 *  cannot catch a render that fails to reset state a prior render left
 *  behind). Not part of the public API. */
export function __parseSvgForTest(rawSvgText: string): Any {
  const parsed = new DOMParser().parseFromString(rawSvgText, "image/svg+xml");
  const svg = parsed.documentElement as unknown as Any;
  stripDisplayNoneToDataActive(svg);
  ensureDataActiveForSwitchables(svg);
  return svg;
}

/** TEST-ONLY: hydrate `serialized` and render it onto an already-parsed `svg`
 *  node (as returned by `__parseSvgForTest`), reusing that SAME node — see
 *  `__parseSvgForTest` for why this matters. Returns the in-document-order
 *  active-layer fingerprint, same shape as `__renderActiveLayers`. Not part
 *  of the public API. */
export function __renderActiveLayersOnNode(svg: Any, toothNo: number, serialized: Record<string, unknown>): { id: string; opacity: string; cls: string }[] {
  const state = hydrateState(serialized as Any);
  applyStateToSvgSingle(toothNo, svg, state);
  return collectActiveLayers(svg);
}

/** TEST-ONLY: hydrate `raw` and store it as `toothNo`'s state directly in the
 *  module-level state map, bypassing all DOM/UI wiring (no initOdontogram()
 *  required). Lets summary/warning getters be exercised without a live SVG grid.
 *  Not part of the public API. */
export function __setToothStateForTest(toothNo: number, raw: Record<string, unknown>, version?: string): void {
  // `version` drives FIX 1's legacy secondary-caries gate exactly as importStatus
  // does (per-tooth call of the same decision). Omitting it → legacy (infer),
  // preserving every existing caller's default-true behavior.
  toothState.set(toothNo, hydrateState(raw, isLegacyPayloadVersion(version)));
}

/** TEST-ONLY: convert a hydrated state object to a plain object (Sets/Maps
 *  converted to arrays/objects for easy assertions). Shared by
 *  __getToothStateForTest and the R2-A __getStatusStateForTest/
 *  __getPlanStateForTest seams below. Not part of the public API. */
function __plainStateForTest(s: Any): Record<string, unknown> {
  return {
    ...s,
    caries: Array.from(s.caries ?? []),
    fillingSurfaces: Array.from(s.fillingSurfaces ?? []),
    fillingSurfaceMaterials: Object.fromEntries(s.fillingSurfaceMaterials ?? []),
    cariesSeverity: Object.fromEntries(s.cariesSeverity ?? []),
    fillingDefect: Object.fromEntries(s.fillingDefect ?? []),
    mods: Array.from(s.mods ?? []),
  };
}

/** TEST-ONLY: read back a tooth's current state as a plain object (Sets/Maps
 *  converted to arrays/objects for easy assertions). Not part of the public API. */
export function __getToothStateForTest(toothNo: number): Record<string, unknown> | undefined {
  const s = toothState.get(toothNo);
  if(!s) return undefined;
  return __plainStateForTest(s);
}

/** TEST-ONLY (R2-A Task 1 seam, kept until T2's public getStatusChart()
 *  supersedes it): read back a tooth's state from the STATUS chart
 *  regardless of which chart is currently active. Not part of the public API. */
export function __getStatusStateForTest(toothNo: number): Record<string, unknown> | undefined {
  const s = charts.status.get(toothNo);
  if(!s) return undefined;
  return __plainStateForTest(s);
}

/** TEST-ONLY (R2-A Task 1 seam, kept until T2's public getPlanChart()
 *  supersedes it): read back a tooth's state from the PLAN chart regardless
 *  of which chart is currently active. Not part of the public API. */
export function __getPlanStateForTest(toothNo: number): Record<string, unknown> | undefined {
  const s = charts.plan.get(toothNo);
  if(!s) return undefined;
  return __plainStateForTest(s);
}

/** TEST-ONLY (R2-A Task 1 seam): fully reset the dual-chart container —
 *  clears BOTH charts, drops `planInitialized`, and returns to "status"
 *  mode — without requiring a live DOM/initToken the way destroyOdontogram()
 *  does. Lets each test in a suite start from a clean slate instead of
 *  leaking `planInitialized`/chart contents across tests in the same module
 *  instance. Not part of the public API. */
export function __resetChartStateForTest(): void {
  charts.status.clear();
  charts.plan.clear();
  planInitialized = false;
  planEditedTeeth.clear();
  pendingDualStateConfirm = null;
  chartMode = "status";
  toothState = charts.status;
  resetCaseMeta();
  collapsedCards = {};
}

/** TEST-ONLY (DS-1 Task 2 seam): set the active tooth (and lazily vivify its
 *  state) so a control-revert test can exercise `revertActiveControls()`
 *  against a real active tooth without going through the DOM tooth grid. Not
 *  part of the public API. */
export function __setActiveToothForTest(toothNo: number | null): void {
  activeTooth = toothNo;
  if(toothNo != null && !toothState.get(toothNo)) toothState.set(toothNo, defaultState());
}

/** TEST-ONLY (DS-1 Task 1 seam): snapshot of the teeth currently flagged as
 *  plan-edited (a COPY — mutating it never touches module state). Not part of
 *  the public API. */
export function __planEditedTeethForTest(): number[] {
  return Array.from(planEditedTeeth);
}

/** TEST-ONLY (DS-1 Task 1 seam): invoke {@link mirrorStatusToPlan} directly so
 *  the deep-copy behavior can be exercised without going through the gate. Not
 *  part of the public API. */
export function __mirrorStatusToPlanForTest(toothNo: number): void {
  mirrorStatusToPlan(toothNo);
}

/** TEST-ONLY (DS-1 review-fix seam): drive {@link setEdentulous} directly so the
 *  gated whole-mouth structural edit can be exercised without a live DOM/
 *  initOdontogram() token. Not part of the public API. */
export function __setEdentulousForTest(on: boolean): void {
  setEdentulous(on);
}

/** TEST-ONLY (DS-1 review-fix seam): drive the single-tooth reset through the
 *  same code path as the zoom-popover / context-menu reset buttons, without a
 *  live DOM/initOdontogram() token. Not part of the public API. */
export function __resetToothForTest(toothNo: number): void {
  resetToothGated(toothNo);
}

/** TEST-ONLY (DS-1 review-fix seam): drive the multi-tooth (selection) reset
 *  through the same code path as the "Reset selected teeth" button, without a
 *  live DOM/initOdontogram() token. Not part of the public API. */
export function __resetTeethForTest(toothNos: number[]): void {
  resetTeethGated(toothNos);
}

/** TEST-ONLY (DS-1 review-fix seam): drive a dentition preset through the same
 *  code path as the #btnPrimaryDentition / #btnMixedDentition buttons, without a
 *  live DOM/initOdontogram() token. Not part of the public API. */
export function __applyDentitionPresetForTest(kind: "primary" | "mixed"): void {
  if(kind === "primary") applyPrimaryDentition();
  else applyMixedDentition();
}

/** TEST-ONLY: set the module-level `showHealthyPulp` flag directly, without the
 *  DOM/all-teeth side effects `setHealthyPulpVisible` performs (button toggle
 *  state, re-rendering every tooth in `ALL_TEETH`) — needed so `__renderActiveLayers`
 *  callers can exercise both the "healthy pulp shown" and "hidden" render paths
 *  in isolation. Not part of the public API. */
export function __setShowHealthyPulpForTest(on: boolean): void {
  showHealthyPulp = !!on;
}

// ---- Plugin overlay rendering ----
function applyPluginOverlays(toothNo: number){
  if(registeredPlugins.length === 0) return;
  const roots = toothSvgRoot.get(toothNo);
  if(!roots) return;
  const state = toothState.get(toothNo);
  const quadrant = getQuadrant(toothNo);

  for(const svg of roots){
    let overlayMap = pluginOverlays.get(toothNo);
    if(!overlayMap){
      overlayMap = new Map();
      pluginOverlays.set(toothNo, overlayMap);
    }

    for(const plugin of registeredPlugins){
      // Remove previous overlay for this plugin
      const existing = overlayMap.get(plugin.id);
      if(existing && existing.parentElement) existing.remove();

      const customState = state?.customStates?.[plugin.id];
      let svgContent: string | null | undefined;
      try{
        svgContent = plugin.renderSvg(toothNo, quadrant, customState);
      }catch(_e){
        // Plugin render error — skip silently
        continue;
      }
      if(!svgContent) continue;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("data-plugin", plugin.id);
      g.setAttribute("data-layer", plugin.layer);
      g.innerHTML = svgContent;

      // Insert into SVG at the correct z-position based on layer
      insertPluginGroup(svg, g, plugin.layer);
      overlayMap.set(plugin.id, g);
    }
  }
}

function insertPluginGroup(svg: SVGElement, g: SVGGElement, layer: string){
  const z = LAYER_Z[layer as keyof typeof LAYER_Z] ?? 6;
  // Find the right insertion point based on layer order:
  // base(0) < tooth(1) < endo(2) < restoration(3) < crown(4) < caries(5) < overlay(6)
  // Plugin groups are appended; overlay goes last, base goes first.
  const existingPlugins = svg.querySelectorAll("g[data-plugin]");
  let inserted = false;
  for(const ep of existingPlugins){
    const epLayer = ep.getAttribute("data-layer") || "overlay";
    const epZ = LAYER_Z[epLayer as keyof typeof LAYER_Z] ?? 6;
    if(epZ > z){
      ep.parentElement?.insertBefore(g, ep);
      inserted = true;
      break;
    }
  }
  if(!inserted){
    // For overlay: append at end. For base: insert before first child group.
    if(layer === "base" && svg.firstChild){
      svg.insertBefore(g, svg.firstChild);
    }else{
      svg.appendChild(g);
    }
  }
}

// ---- State tooltip ----
function getStateSummary(toothNo: number): string[]{
  const state = toothState.get(toothNo);
  if(!state) return [];
  const summary: string[] = [];

  // Tooth base
  if(state.toothSelection === "none") summary.push(t("toothSelect.none"));
  else if(state.toothSelection === "milktooth") summary.push(t("toothSelect.milk"));
  else if(state.toothSelection === "implant") summary.push(t("toothSelect.implant"));
  else if(state.toothSelection === "tooth-under-gum") summary.push(t("toothSelect.underGum"));

  // Tooth substrate (radix / broken / crown-prep) — independent of any restoration.
  if(state.toothSubstrate !== "natural"){
    summary.push(t(`substrate.${state.toothSubstrate}`));
  }

  // Fixed restoration (crown / inlay / onlay / veneer / bridge)
  if(state.restorationType !== "none"){
    summary.push(restorationSummaryLabel(state.restorationType, state.restorationMaterial));
  }

  // Prosthesis / implant attachment (healing-abutment/locator/bar attachments and
  // removable/bar-retained dentures) — SP3b: reads the dedicated `prosthesis` axis
  // (field-move from the legacy `crownMaterial`/`bridgeUnit`).
  if(state.prosthesis !== "none"){
    const prosthesisKey = PROSTHESIS_SUMMARY_KEY[state.prosthesis];
    if(prosthesisKey) summary.push(t(prosthesisKey));
  }

  // Endo
  if(state.endo !== "none"){
    const endoKey = {
      "endo-medical-filling": "endo.option.medicalFilling",
      "endo-filling": "endo.option.filling",
      "endo-filling-incomplete": "endo.option.incompleteFilling",
      "endo-glass-pin": "endo.option.glassPin",
      "endo-metal-pin": "endo.option.metalPin",
    }[state.endo];
    if(endoKey) summary.push(t(endoKey));
  }

  // Filling
  if(state.fillingMaterial !== "none"){
    const fillKey = {
      amalgam: "filling.option.amalgam", composite: "filling.option.composite",
      gic: "filling.option.gic", temporary: "filling.option.temporary",
    }[state.fillingMaterial];
    if(fillKey) summary.push(t(fillKey));
  }

  // SP10: filling defects (per filled surface). Gated on !hasCrown to match
  // the render (applyStateToSvgSingle), which suppresses fillings/defects
  // entirely under a crown/bridge — a crowned tooth's stored filling defect
  // must not be surfaced here when the chart shows nothing for it.
  if(state.fillingDefect && state.fillingDefect.size > 0 && state.restorationType === "none"){
    for(const [surf, val] of state.fillingDefect){
      if(val && val !== "none" && state.fillingSurfaceMaterials.has(surf)){
        summary.push(`${t("fillingDefect.label")} (${summarySurfaceLetter(surf, toothNo)}: ${t("fillingDefect." + val)})`);
      }
    }
  }

  // Caries (+ SP9 coarse severity qualifier)
  if(state.caries.size > 0){
    const sev = cariesSeverityTierLabel(state);
    summary.push(sev ? `${t("caries.title")} (${sev})` : t("caries.title"));
  }
  // Root caries — SP9: show the value (active/arrested/active-cavitated), not just the generic label.
  if(state.rootCaries && state.rootCaries !== "none"){
    summary.push(`${t("caries.rootLabel")} (${t("rootCaries." + kebabToCamel(state.rootCaries))})`);
  }
  // SP9: clinical diagnoses (pulp / apical / resorption / peri-implant).
  for(const dx of diagnosisSummaryLabels(state)) summary.push(dx);

  // Mods
  if(state.mods.size > 0){
    for(const mod of state.mods){
      if(mod === "parodontal") summary.push(t("mods.parodontal"));
      else if(mod === "inflammation") summary.push(t("mods.periapicalInflammation"));
    }
  }
  // SP15 wholebranch fix: mobilityRowHidden() hides the mobility control on
  // an implant — the summary must not contradict that hidden control, so
  // suppress the line there too (stored value stays untouched, per T1).
  if(state.mobility !== "none" && state.toothSelection !== "implant") summary.push(t("inflammation.mobilityLabel") + " " + t(`mobility.${state.mobility}`));

  // SP9: previously-invisible findings.
  if(state.calculus) summary.push(t("calculus.label"));
  // FIX 1(d): peri-implant status is no longer in diagnosisSummaryLabels (it now
  // groups with periodontal findings), so push it here explicitly to keep the
  // tooltip showing it, alongside the other periodontal presence lines.
  { const pi = periImplantSummaryLabel(state); if(pi) summary.push(pi); }
  // SP-perio PG-C Task 1: derived Cairo recession TYPE (RT1-3), a periodontal
  // presence line alongside peri-implant status above — never stored, just
  // read via getToothRecessionType (see its doc comment for the rule).
  { const rt = getToothRecessionType(toothNo); if(rt !== "none") summary.push(t(`perio.recession.${rt}`)); }
  // SP-perio PG-C Task 3: CEJ visibility / root concavity — same periodontal
  // presence grouping as peri-implant status / recession type above.
  { const cej = cejVisibilitySummaryLabel(state); if(cej) summary.push(cej); }
  { const rc = rootConcavitySummaryLabel(state); if(rc) summary.push(rc); }
  // SP-perio PG-D Task 5: PI/GI (per-surface graded) + KG (mm) + GT
  // (biotype) + Miller (recession class) — same periodontal-presence
  // grouping as CEJ visibility / root concavity above.
  { const pi = plaqueIndexSummaryLine(toothNo); if(pi) summary.push(pi); }
  { const gi = gingivalIndexSummaryLine(toothNo); if(gi) summary.push(gi); }
  { const kg = keratinizedWidthSummaryLine(toothNo); if(kg) summary.push(kg); }
  { const gt = gingivalThicknessSummaryLabel(toothNo); if(gt) summary.push(gt); }
  { const mc = millerClassSummaryLabel(toothNo); if(mc) summary.push(mc); }
  // SP-perio PG-E Task 3: mPI/mBI (Mombelli peri-implant indices) — same
  // periodontal-presence grouping as PI/GI/KG/GT/Miller above.
  { const mpi = periImplantPlaqueSummaryLine(toothNo); if(mpi) summary.push(mpi); }
  { const mbi = periImplantBleedingSummaryLine(toothNo); if(mbi) summary.push(mbi); }
  // SP17 Task 1 Fix #2 (gate-parity follow-up): gate on the SAME FULL predicate
  // the #crownLeakageRow control uses (crownLeakageAllowed, ~line 2974) —
  // !restorationRowHidden(state) AND crown/bridge. Checking crown/bridge alone
  // is not enough: a tooth reachable via import/hydrate with a stale
  // restorationType of "crown"/"bridge" but a hidden restoration row (e.g.
  // milktooth, under-gum, extraction socket, or radix substrate) must not
  // show this line either. The stored crownLeakage value is left untouched.
  if(state.crownLeakage && !restorationRowHidden(state) && (state.restorationType === "crown" || state.restorationType === "bridge")) summary.push(t("crownLeakage.label"));
  if(state.endoResection) summary.push(t("endo.resection"));
  if(state.fissureSealing) summary.push(t("filling.fissureSealing"));
  if(state.parapulpalPin) summary.push(t("endo.parapulpalPin"));
  { const fx = fractureSummaryLabel(state); if(fx) summary.push(fx); }
  if(state.contactMesial) summary.push(t("tooth.contact.mesialMissing"));
  if(state.contactDistal) summary.push(t("tooth.contact.distalMissing"));
  // Review fix (post-SP11): gate wear on the same wearRowAllowed predicate the
  // render/UI row use — a crowned/non-natural-substrate tooth must not surface
  // a stored wearEdge/wearCervical value that the chart itself hides.
  if(wearRowAllowed(state)){
    if(state.wearEdge !== "none") summary.push(`${t("tooth.bruxism.edgeWear")}: ${t("wearType." + state.wearEdge)}`);
    if(state.wearCervical !== "none") summary.push(`${t("tooth.bruxism.neckWear")}: ${t("wearType." + state.wearCervical)}`);
  }
  // SP12 Task 4: gate discoloration on the same discolorationAllowed predicate
  // the render tint and UI row use — a crowned/non-natural-substrate tooth must
  // not surface a stored discoloration value that the chart itself hides.
  if(discolorationAllowed(state) && state.discoloration !== "none"){
    summary.push(`${t("discoloration.label")}: ${t("discoloration." + state.discoloration)}`);
  }
  // SP14 Task 4: gate orthodontic findings on the same orthoAllowed predicate
  // the render glyphs and the Ortho UI card use — an implant/missing/pontic
  // tooth must not surface a stored ortho value the chart itself hides.
  if(orthoAllowed(state)){
    if(state.orthoAppliance !== "none") summary.push(`${t("ortho.appliance.label")}: ${t("ortho.appliance." + state.orthoAppliance)}`);
    if(state.orthoDrift !== "none") summary.push(`${t("ortho.drift.label")}: ${t("ortho.drift." + state.orthoDrift)}`);
    if(state.orthoVertical !== "none") summary.push(`${t("ortho.vertical.label")}: ${t("ortho.vertical." + state.orthoVertical)}`);
    if(state.orthoRotation === true) summary.push(t("ortho.rotation.label"));
  }

  // Flags
  if(state.extractionPlan) summary.push(t("tooth.extractionPlan"));
  if(state.crownReplace) summary.push(t("tooth.crownReplace"));
  if(state.crownNeeded) summary.push(t("tooth.crownNeeded"));
  if(state.bridgePillar) summary.push(t("tooth.bridgePillar"));
  if(state.extractionWound) summary.push(t("tooth.extractionWound"));
  if(state.missingClosed) summary.push(t("tooth.missingClosed"));

  // Plugin states
  const lang = getI18nLanguage();
  for(const plugin of registeredPlugins){
    const cs = state.customStates?.[plugin.id];
    if(cs !== undefined && cs !== null){
      const label = plugin.label[lang] || plugin.label["en"] || plugin.id;
      summary.push(label);
    }
  }

  return summary;
}

function updateToothTooltip(toothNo: number){
  const tiles = toothTile.get(toothNo);
  if(!tiles) return;
  const summary = getStateSummary(toothNo);
  const state = toothState.get(toothNo);
  const note = notesEnabled && state?.note ? state.note : "";
  let text = summary.length > 0 ? summary.join(" · ") : "";
  if(note) text = text ? text + "\n\u{1F4DD} " + note : "\u{1F4DD} " + note;
  for(const tile of tiles){
    if(text) tile.setAttribute("title", text);
    else tile.removeAttribute("title");
  }
}

function updateToothLabelNoteIcon(toothNo: number){
  const state = toothState.get(toothNo);
  const hasNote = notesEnabled && !!state?.note;
  // Update both upper and lower label maps
  for(const labelMap of [toothLabelUpper, toothLabelLower]){
    const cell = labelMap.get(toothNo);
    if(!cell) continue;
    let icon = cell.querySelector(".tooth-note-icon") as HTMLElement | null;
    if(hasNote){
      if(!icon){
        icon = el("span", { class: "tooth-note-icon", "aria-hidden": "true" });
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>';
        cell.appendChild(icon);
      }
    }else{
      if(icon) icon.remove();
    }
  }
}

// ---- State validation ----
function getStateWarnings(state: Any): string[]{
  const warnings: string[] = [];
  const isPresent = isToothPresent(state.toothSelection);
  const isNone = state.toothSelection === "none";
  const isImplant = state.toothSelection === "implant";

  // Endo on missing or implant tooth
  if(state.endo !== "none" && (isNone || isImplant)){
    warnings.push(t("warn.endoOnMissing"));
  }
  // Filling on missing tooth
  if(state.fillingMaterial !== "none" && isNone){
    warnings.push(t("warn.fillingOnMissing"));
  }
  // Crown replace without a fixed restoration present (mirrors the crownReplace
  // axis's appliesWhen in src/registry/axes.ts: tooth-base + restorationType !== "none").
  if(state.crownReplace && !(state.toothSelection === "tooth-base" && state.restorationType !== "none")){
    warnings.push(t("warn.crownReplaceNoCrown"));
  }
  // Caries on missing tooth
  if(state.caries.size > 0 && isNone){
    warnings.push(t("warn.cariesOnMissing"));
  }
  // Bridge pillar without a fixed restoration present (same tooth-base + restoration gate).
  if(state.bridgePillar && !(state.toothSelection === "tooth-base" && state.restorationType !== "none")){
    warnings.push(t("warn.pillarNoCrown"));
  }
  // Invalid restoration type/material combo (SP3b Task 6, spec §9 gap). Defense
  // in depth: hydrateState() already coerces an invalid pair on import, so this
  // should never fire for a state that only ever went through hydrateState —
  // but it reuses the SAME warning mechanism as every other check here as a
  // safety net for any other path (plugins, direct programmatic state writes)
  // that could still produce one. View-agnostic ("occlusal") for the same
  // reason as hydrateState's coercion: view is a render/UI concern, not a
  // data-validity one.
  if(!isValidRestoration(state.restorationType, state.restorationMaterial, "occlusal")){
    warnings.push(t("warn.invalidRestorationCombo"));
  }

  return warnings;
}

/** TEST-ONLY: run the clinical-consistency warning checks against a plain state
 *  object (no DOM/SVG involved). Not part of the public API. */
export function __getStateWarnings(state: Any): string[]{
  return getStateWarnings(state);
}

function updateWarningsFromState(state: Any){
  const w = $("#warnings");
  if(!w) return;
  const warnings = getStateWarnings(state);
  w.innerHTML = "";
  for(const msg of warnings){
    const item = el("div", { class: "warning-item", text: "⚠ " + msg });
    w.appendChild(item);
  }
}

// ---- Control sync ----

/** Apply the per-surface caries-depth indicator attributes to one
 *  `.surface-cell` (the ICDAS/3-bar `data-depth`/`data-icdas` badge, plus the
 *  SP5 Task 4 `data-radio` radiographic-depth attribute) for `cell`'s surface,
 *  read off `state`. `radiographicDepth` is a SEPARATE, independent per-surface
 *  scale from the unified visual severity `cariesSeverity` — no crosswalk between them
 *  (constitution); `data-radio` never touches `data-depth`/`data-icdas`/opacity
 *  or the SVG-fingerprint render (it lives outside `__renderActiveLayers`).
 *  Extracted out of `syncControlsFromState` so it can be exercised without the
 *  full DOM/asset-fetch wiring `initOdontogram()` needs (see
 *  `__syncSurfaceDepthIndicatorForTest`). */
function syncSurfaceDepthIndicator(cell: Element, state: Any): void {
  const c = cell.querySelector("input[type=checkbox]") as HTMLInputElement | null;
  const ind = cell.querySelector(".surf-depth") as HTMLElement | null;
  if(c && ind){
    const surface = String(c.value).replace("caries-", "");
    const code = state.cariesSeverity.get(surface) || 2;
    ind.setAttribute("data-depth", icdasToThreeLevel(code)); // drives 3-bar CSS
    ind.setAttribute("data-icdas", String(code));            // drives the badge
    ind.classList.toggle("icdas", icdasEnabled);
    ind.textContent = ""; // clear
    if(icdasEnabled){ ind.textContent = String(code); }      // badge number
    else { ind.innerHTML = "<i></i><i></i><i></i>"; }        // 3 bars
    // SP5 Task 5: `data-radio` reflects the surface's `radiographicDepth` value
    // (when set and not "none"), but ONLY when the radiographic-depth mode is on
    // (`!== "off"`). With the mode off (default) the badge is never emitted.
    const radio = state.radiographicDepth?.get(surface);
    if(radiographicDepthMode !== "off" && radio && radio !== "none"){ ind.setAttribute("data-radio", radio); }
    else { ind.removeAttribute("data-radio"); }
  }
}

/** TEST-ONLY: apply `syncSurfaceDepthIndicator`'s per-surface indicator-attribute
 *  logic (ICDAS `data-depth`/`data-icdas` badge + SP5 Task 4 `data-radio`) to a
 *  single hand-built `.surface-cell` element, without requiring a live grid /
 *  `initOdontogram()` (which needs real SVG-asset fetches). Not part of the
 *  public API. */
export function __syncSurfaceDepthIndicatorForTest(cell: Element, state: Record<string, unknown>): void {
  syncSurfaceDepthIndicator(cell, state as Any);
}

/** SP6 Task 2 (step 2): sync the recurrent-caries indicator on ONE
 *  filling-surface `.surface-cell`. The `.surf-depth` span is shown by CSS
 *  whenever the filling checkbox is checked (a filling exists on the surface),
 *  so the picker is always reachable to author recurrent caries. When the
 *  surface ALSO carries caries (`caries ∩ fillingSurfaceMaterials` → recurrent /
 *  `subcaries-{surface}`) it gets the `.has-subcaries` dark border and shows the
 *  CARS severity badge/bars; otherwise it renders a neutral (empty) affordance.
 *  Extracted for DOM-free unit testing. */
function syncFillingSubcariesIndicator(cell: Element, state: Any): void {
  const c = cell.querySelector("input[type=checkbox]") as HTMLInputElement | null;
  const ind = cell.querySelector(".surf-depth") as HTMLElement | null;
  if(!c || !ind) return;
  const surface = String(c.value);
  const hasSubcaries = !!state.fillingSurfaceMaterials?.has(surface) && !!state.caries?.has(`caries-${surface}`);
  ind.classList.toggle("has-subcaries", hasSubcaries);
  if(hasSubcaries){
    const code = state.cariesSeverity.get(surface) || 2;
    ind.setAttribute("data-depth", icdasToThreeLevel(code));
    ind.setAttribute("data-icdas", String(code));
    ind.classList.toggle("icdas", icdasEnabled);
    ind.textContent = "";
    if(icdasEnabled){ ind.textContent = String(code); }
    else { ind.innerHTML = "<i></i><i></i><i></i>"; }
  }else{
    // Neutral affordance: no CARS badge, just the faint 3-bar hint to click.
    ind.removeAttribute("data-depth");
    ind.removeAttribute("data-icdas");
    ind.classList.remove("icdas");
    ind.innerHTML = "<i></i><i></i><i></i>";
  }
}

/** TEST-ONLY sibling of {@link __syncSurfaceDepthIndicatorForTest} for the
 *  filling-surface recurrent-caries indicator. Not part of the public API. */
export function __syncFillingSubcariesIndicatorForTest(cell: Element, state: Record<string, unknown>): void {
  syncFillingSubcariesIndicator(cell, state as Any);
}

/** SP10 Task 3: sync the LEFT-side structural filling-defect indicator on ONE
 *  filling-surface `.surface-cell` (`.surf-defect`, mirroring the RIGHT-side
 *  `.surf-depth` / {@link syncFillingSubcariesIndicator}). A surface carries a
 *  defect only when it BOTH has a filling (`fillingSurfaceMaterials`) AND a
 *  non-"none" `fillingDefect` value — a defect value on an un-filled surface
 *  (stale/orphaned state) is defensively ignored. Extracted for DOM-free unit
 *  testing. */
function syncFillingDefectIndicator(cell: Element, state: Any): void {
  const c = cell.querySelector("input[type=checkbox]") as HTMLInputElement | null;
  const ind = cell.querySelector(".surf-defect") as HTMLElement | null;
  if(!c || !ind) return;
  const surface = String(c.value);
  const val = state.fillingDefect?.get(surface);
  const hasDefect = !!state.fillingSurfaceMaterials?.has(surface) && !!val && val !== "none";
  ind.classList.toggle("has-defect", hasDefect);
  if(hasDefect) ind.setAttribute("data-defect", String(val));
  else ind.removeAttribute("data-defect");
}

/** TEST-ONLY sibling of {@link __syncFillingSubcariesIndicatorForTest} for the
 *  filling-defect indicator. Not part of the public API. */
export function __syncFillingDefectIndicatorForTest(cell: Element, state: Record<string, unknown>): void {
  syncFillingDefectIndicator(cell, state as Any);
}

/** A minimal shape covering what {@link subcariesLettersForTooth} and
 *  {@link computeFillingSubcariesSummaryLine} read from a tooth state. */
type SubcariesStateLike = { caries?: Set<string>; fillingSurfaceMaterials?: Map<string, string> } | undefined | null;

/** SP6 Task 4 (§7): the recurrent ("sub") caries surfaces on ONE tooth — a
 *  surface carries BOTH caries and a filling (`state.caries` has
 *  `caries-{surface}` AND `state.fillingSurfaceMaterials` has `{surface}`).
 *  Returns the surfaces' letters, in the codebase's existing anatomical order
 *  (`SUMMARY_SURFACE_ORDER`: B, M, O, D, L), concatenated with no separator
 *  (e.g. "MOD", "B"); "" when the tooth has no recurrent-caries surface.
 *  On an anterior tooth (§8) the occlusal/incisal surface's letter is "I"
 *  instead of "O" (the stored value is still plain "occlusal"). Pure and
 *  exported for direct unit testing. */
export function subcariesLettersForTooth(toothNo: number, state: SubcariesStateLike): string {
  if(!state || !state.caries || !state.fillingSurfaceMaterials) return "";
  const letters: string[] = [];
  for(const surface of SUMMARY_SURFACE_ORDER){
    if(surface === "subcrown") continue; // fillings never target subcrown
    if(state.caries.has(`caries-${surface}`) && state.fillingSurfaceMaterials.has(surface)){
      letters.push(summarySurfaceLetter(surface, toothNo));
    }
  }
  return letters.join("");
}

/** SP6 Task 4 (§7): the "Fillings and restorative" panel's informational
 *  subcaries-summary line — one entry per SELECTED tooth that has recurrent
 *  caries (see {@link subcariesLettersForTooth}), in `ALL_TEETH` order, styled
 *  "{FDI} ({letters})" and joined with ", ". Uses the singular phrasing
 *  (`filling.subcariesSummarySingle`) for exactly one such tooth, the plural
 *  (`filling.subcariesSummaryMultiple`) for more than one, and returns "" (no
 *  line — purely informational, hidden when empty) when none of the selected
 *  teeth have a recurrent-caries surface.
 *
 *  Pure/testable: takes the selected tooth numbers and a state lookup instead
 *  of reading the module's `selectedTeeth`/`toothState` globals directly. */
export function computeFillingSubcariesSummaryLine(
  selectedToothNos: Iterable<number>,
  getState: (toothNo: number) => SubcariesStateLike,
): string {
  const selected = new Set(selectedToothNos);
  const entries: string[] = [];
  for(const toothNo of ALL_TEETH){
    if(!selected.has(toothNo)) continue;
    const letters = subcariesLettersForTooth(toothNo, getState(toothNo));
    if(letters) entries.push(`${toothNo} (${letters})`);
  }
  if(entries.length === 0) return "";
  const key = entries.length > 1 ? "filling.subcariesSummaryMultiple" : "filling.subcariesSummarySingle";
  return t(key, { teeth: entries.join(", ") });
}

/** DOM sync for the fillings-panel subcaries-summary line (`#fillingSubcariesSummary`).
 *  No-op when the element isn't present (e.g. in a DOM-free test harness). */
function updateFillingSubcariesSummary(): void {
  const lineEl = $("#fillingSubcariesSummary");
  if(!lineEl) return;
  const line = computeFillingSubcariesSummaryLine(Array.from(selectedTeeth) as number[], (toothNo) => toothState.get(toothNo));
  lineEl.textContent = line;
  lineEl.classList.toggle("hidden", !line);
}

/** A minimal shape covering what {@link fillingDefectLettersForTooth} and
 *  {@link computeFillingDefectSummaryLine} read from a tooth state. */
type FillingDefectStateLike =
  | { fillingDefect?: Map<string, string>; fillingSurfaceMaterials?: Map<string, string>; restorationType?: string }
  | undefined
  | null;

/** SP16 Task 1: the filling-defect surfaces on ONE tooth, parallel to
 *  {@link subcariesLettersForTooth} — a surface carries a defect when it is
 *  BOTH present in `fillingSurfaceMaterials` AND has a non-"none"
 *  `fillingDefect` entry, gated the SAME way the existing whole-mouth
 *  filling-defect summary is (`restorationType === "none"`, i.e. defects are
 *  suppressed under a crown/bridge — see the `defects` derivation in
 *  {@link getOdontogramSummary}). Returns the surfaces' letters in
 *  `SUMMARY_SURFACE_ORDER`, concatenated with no separator; "" when the tooth
 *  has no defect surface (or no state). Pure and exported for direct unit
 *  testing. */
export function fillingDefectLettersForTooth(toothNo: number, state: FillingDefectStateLike): string {
  if(!state || !state.fillingDefect || !state.fillingSurfaceMaterials) return "";
  if(state.restorationType && state.restorationType !== "none") return "";
  const letters: string[] = [];
  for(const surface of SUMMARY_SURFACE_ORDER){
    if(surface === "subcrown") continue; // fillings never target subcrown
    if(state.fillingDefect.has(surface) && state.fillingSurfaceMaterials.has(surface)){
      letters.push(summarySurfaceLetter(surface, toothNo));
    }
  }
  return letters.join("");
}

/** SP16 Task 1: the "Fillings and restorative" panel's informational
 *  filling-defect-summary line, parallel to {@link computeFillingSubcariesSummaryLine}
 *  — one entry per SELECTED tooth that has a filling-defect surface (see
 *  {@link fillingDefectLettersForTooth}), in `ALL_TEETH` order, styled
 *  "{FDI} ({letters})" and joined with ", ". Uses the singular phrasing
 *  (`filling.fillingDefectSummarySingle`) for exactly one such tooth, the
 *  plural (`filling.fillingDefectSummaryMultiple`) for more than one, and
 *  returns "" (no line — purely informational, hidden when empty) when none
 *  of the selected teeth have a defect surface.
 *
 *  Pure/testable: takes the selected tooth numbers and a state lookup instead
 *  of reading the module's `selectedTeeth`/`toothState` globals directly. */
export function computeFillingDefectSummaryLine(
  selectedToothNos: Iterable<number>,
  getState: (toothNo: number) => FillingDefectStateLike,
): string {
  const selected = new Set(selectedToothNos);
  const entries: string[] = [];
  for(const toothNo of ALL_TEETH){
    if(!selected.has(toothNo)) continue;
    const letters = fillingDefectLettersForTooth(toothNo, getState(toothNo));
    if(letters) entries.push(`${toothNo} (${letters})`);
  }
  if(entries.length === 0) return "";
  const key = entries.length > 1 ? "filling.fillingDefectSummaryMultiple" : "filling.fillingDefectSummarySingle";
  return t(key, { teeth: entries.join(", ") });
}

/** DOM sync for the fillings-panel filling-defect-summary line
 *  (`#fillingDefectSummary`), parallel to {@link updateFillingSubcariesSummary}.
 *  No-op when the element isn't present (e.g. in a DOM-free test harness). */
function updateFillingDefectSummary(): void {
  const lineEl = $("#fillingDefectSummary");
  if(!lineEl) return;
  const line = computeFillingDefectSummaryLine(Array.from(selectedTeeth) as number[], (toothNo) => toothState.get(toothNo));
  lineEl.textContent = line;
  lineEl.classList.toggle("hidden", !line);
}

/** SP13 Task 2: toggle the wear (edge + cervical, shared wearDetailLevel) and
 *  discoloration (own discolorationDetailLevel) controls between their
 *  "complex" <select> and "simple" checkbox presentation, and derive each
 *  checkbox's `.checked` from the stored value. Non-collapsing: this ONLY
 *  flips `.hidden`/`.checked` — it never mutates `state`, so switching levels
 *  back and forth cannot lose/rewrite a stored value. Mirrors
 *  syncInflammationModVisibility / syncPeriImplantVisibility (small
 *  standalone syncs called from syncControlsFromState, independently
 *  testable since no full-DOM initOdontogram() mount harness exists for the
 *  tooth panel — see __syncInflammationModVisibilityForTest). */
function syncToothDetailControls(state: Any): void {
  const wearSimple = getWearDetailLevel() === "simple";
  $("#wearEdgeSelectLabel").classList.toggle("hidden", wearSimple);
  $("#wearEdgeToggleLabel").classList.toggle("hidden", !wearSimple);
  $("#wearCervicalSelectLabel").classList.toggle("hidden", wearSimple);
  $("#wearCervicalToggleLabel").classList.toggle("hidden", !wearSimple);
  ($("#wearEdgeToggle") as HTMLInputElement).checked = state.wearEdge !== "none";
  ($("#wearCervicalToggle") as HTMLInputElement).checked = state.wearCervical !== "none";
  const discoSimple = getDiscolorationDetailLevel() === "simple";
  $("#discolorationSelectLabel").classList.toggle("hidden", discoSimple);
  $("#discolorationToggleLabel").classList.toggle("hidden", !discoSimple);
  ($("#discolorationToggle") as HTMLInputElement).checked = state.discoloration !== "none";
}

/** TEST-ONLY: apply {@link syncToothDetailControls} to a hand-built DOM
 *  fragment (the wear/discoloration select+toggle labels and checkboxes),
 *  without requiring a live initOdontogram(). Mirrors
 *  __syncInflammationModVisibilityForTest. Not part of the public API. */
export function __syncToothDetailControlsForTest(state: Record<string, unknown>): void {
  syncToothDetailControls(state);
}

/**
 * SP-perio P1 Task 2: sync the #perioRow six-site PD/GM/BOP/SUP grid (built
 * once by {@link buildPerioGrid}) + the live derived read-out (per-site CAL,
 * tooth %BOP) for `toothNo`. Values are read via the SAME public
 * getToothPerio()/getToothCal() API the write path (buildPerioGrid's change
 * listeners) and later FHIR/export tasks use — this never re-derives CAL or
 * %BOP itself, it only formats what those functions already return. The row
 * is hidden via {@link perioRowHidden} (missing/implant/under-gum/
 * extraction-socket teeth have no probing site to chart); when hidden (or
 * `toothNo` is unset — e.g. no active tooth yet) the per-input sync is
 * skipped, mirroring syncToothDetailControls' small-standalone-sync shape.
 * Null-safe throughout (no-op when the grid/row/readout elements aren't
 * mounted — e.g. a DOM-free test harness), exactly like every other small
 * sync helper called from syncControlsFromState.
 */
function syncPerioRow(state: Any, toothNo: Any = activeTooth): void {
  const row = $("#perioRow");
  const hidden = perioRowHidden(state);
  if(row) row.classList.toggle("hidden", hidden);
  if(hidden || toothNo == null) return;
  const perio = getToothPerio(toothNo);
  const cal = getToothCal(toothNo);
  for(const site of PERIO_SITES){
    const pdInput = $(`#perio-pd-${site}`) as HTMLInputElement | null;
    if(!pdInput) continue; // grid not built (e.g. DOM-free test harness)
    const gmInput = $(`#perio-gm-${site}`) as HTMLInputElement;
    const bopInput = $(`#perio-bop-${site}`) as HTMLInputElement;
    const supInput = $(`#perio-sup-${site}`) as HTMLInputElement;
    const charted = Object.prototype.hasOwnProperty.call(perio.pd, site);
    pdInput.value = charted ? String(perio.pd[site]) : "";
    gmInput.value = (charted && Object.prototype.hasOwnProperty.call(perio.gm, site)) ? String(perio.gm[site]) : "";
    bopInput.checked = perio.bop.includes(site);
    supInput.checked = perio.sup.includes(site);
    // GM/BOP/SUP only ever apply to an already-charted site (see
    // setPerioSite's own contract) — disable them until PD is set, so an
    // edit there can never be a silent no-op the user doesn't understand.
    setDisabled(gmInput, !charted);
    setDisabled(bopInput, !charted);
    setDisabled(supInput, !charted);
  }
  const readoutEl = $("#perioReadout");
  if(readoutEl){
    const chartedSites = (PERIO_SITES as readonly string[]).filter((s) => Object.prototype.hasOwnProperty.call(perio.pd, s));
    if(chartedSites.length === 0){
      readoutEl.textContent = t("perio.readout.empty");
    }else{
      const calStr = chartedSites.map((s) => `${s} ${t("perio.cal")} ${cal.get(s)}`).join("   ");
      const bopCount = perio.bop.length;
      const pct = Math.round((bopCount / chartedSites.length) * 1000) / 10;
      readoutEl.textContent = `${calStr}   ${t("perio.bopPercent")} ${pct}% (${bopCount}/${chartedSites.length})`;
    }
  }
}

/** TEST-ONLY: apply {@link syncPerioRow} to a hand-built #perioRow DOM
 *  fragment for a given `toothNo`, without requiring a live initOdontogram()
 *  or a real `activeTooth`. Mirrors __syncToothDetailControlsForTest /
 *  __syncInflammationModVisibilityForTest. Not part of the public API. */
export function __syncPerioRowForTest(state: Record<string, unknown>, toothNo: number): void {
  syncPerioRow(state, toothNo);
}

/**
 * SP-perio P1 Task 2: build the static 6-site PD/GM/BOP/SUP grid ONCE — site
 * identities never change across teeth, mirroring buildSurfaceCross/
 * buildChecks building their option lists once in wireControls(); per-tooth
 * VALUES are synced separately by {@link syncPerioRow} (called from
 * syncControlsFromState on tooth select), exactly like the caries/filling
 * surface checkboxes' `.checked` is synced from state while the surface list
 * itself is built once. Two site-group rows in PERIO_SITES' own canonical
 * order (buccal MB/B/DB, then lingual/palatal ML/L/DL). Every control calls
 * setPerioSite(activeTooth, site, patch) DIRECTLY — NOT applyToSelected():
 * perio is inherently single-tooth, per-site data, not a bulk-across-
 * selection axis like mobility/caries — then re-syncs the row immediately,
 * since setPerioSite deliberately never touches DOM/SVG itself (see its own
 * doc comment).
 */
function buildPerioGrid(container: Any): void {
  if(!container) return;
  container.innerHTML = "";
  const buildSiteRow = (sites: readonly string[], rowClass: string) => {
    const rowEl = el("div", { class: `perio-site-row ${rowClass}` });
    for(const site of sites){
      const cell = el("div", { class: "perio-site-cell", "data-site": site }, [
        el("div", { class: "perio-site-label", title: t(`perio.site.${site}`), text: site }),
      ]);

      const pdInput = el("input", { type: "number", id: `perio-pd-${site}`, "data-site": site, "data-field": "pd", min: "1", max: "15", step: "1" });
      cell.appendChild(el("label", { class: "perio-field" }, [ el("span", { text: t("perio.pd") }), pdInput ]));

      const gmInput = el("input", { type: "number", id: `perio-gm-${site}`, "data-site": site, "data-field": "gm", min: "-10", max: "20", step: "1" });
      cell.appendChild(el("label", { class: "perio-field" }, [ el("span", { text: t("perio.gm") }), gmInput ]));

      const bopInput = el("input", { type: "checkbox", id: `perio-bop-${site}`, "data-site": site, "data-field": "bop" });
      cell.appendChild(el("label", { class: "perio-check" }, [ bopInput, el("span", { text: t("perio.bop") }) ]));

      const supInput = el("input", { type: "checkbox", id: `perio-sup-${site}`, "data-site": site, "data-field": "sup" });
      cell.appendChild(el("label", { class: "perio-check" }, [ supInput, el("span", { text: t("perio.sup") }) ]));

      const resync = () => {
        if(activeTooth == null) return;
        syncPerioRow(toothState.get(activeTooth), activeTooth);
      };
      pdInput.addEventListener("change", ()=>{
        if(activeTooth == null) return;
        const raw = pdInput.value.trim();
        setPerioSite(activeTooth, site, { pd: raw === "" ? null : Number(raw) });
        resync();
      });
      gmInput.addEventListener("change", ()=>{
        if(activeTooth == null) return;
        const raw = gmInput.value.trim();
        if(raw === "") return; // no explicit gm edit -> no-op (gm has no "unset" signal)
        setPerioSite(activeTooth, site, { gm: Number(raw) });
        resync();
      });
      bopInput.addEventListener("change", ()=>{
        if(activeTooth == null) return;
        setPerioSite(activeTooth, site, { bop: bopInput.checked });
        resync();
      });
      supInput.addEventListener("change", ()=>{
        if(activeTooth == null) return;
        setPerioSite(activeTooth, site, { sup: supInput.checked });
        resync();
      });

      rowEl.appendChild(cell);
    }
    container.appendChild(rowEl);
  };
  buildSiteRow(PERIO_SITES.slice(0, 3), "perio-buccal-row");
  buildSiteRow(PERIO_SITES.slice(3, 6), "perio-lingual-row");
}

/** TEST-ONLY: apply {@link buildPerioGrid} to a hand-built container, without
 *  requiring a live initOdontogram() (there is no full-DOM mount harness for
 *  the tooth panel — see sp14-ortho-ui.test.ts's header comment). Lets a test
 *  verify the real grid-building DOM shape (ids/data-attributes/types) that
 *  production wireControls() builds once at init. Not part of the public API. */
export function __buildPerioGridForTest(container: Element): void {
  buildPerioGrid(container);
}

function syncControlsFromState(state: Any){
  // 2.2.1 Plan-mode gating: the Plan chart records TREATMENT ("what a dentist
  // will DO"), so diagnosis-only / status-only controls are hidden while in
  // Plan. Woven into the individual show/hide predicates below (Base picker,
  // caries, wear, discoloration, pulp/apical/resorption diagnosis, and the
  // whole perio block) rather than a single post-hoc sweep, so each control's
  // Status behavior is untouched. See the tagged sites for specifics.
  const isPlan = getChartMode() === "plan";
  // SP4 Task 5: apical (AAE) diagnosis picker.
  setSelectOptions($("#apicalDxSelect"), getApicalDxOptions(), state.apicalDx);
  if($("#apicalDxSelect").value !== state.apicalDx){
    state.apicalDx = $("#apicalDxSelect").value;
  }
  $("#endoResection").checked = !!state.endoResection;
  $("#fissureSealing").checked = !!state.fissureSealing;
  $("#contactMesial").checked = !!state.contactMesial;
  $("#contactDistal").checked = !!state.contactDistal;
  setSelectOptions($("#wearEdgeSelect"), getWearEdgeOptions(), state.wearEdge);
  if($("#wearEdgeSelect").value !== state.wearEdge) state.wearEdge = $("#wearEdgeSelect").value;
  setSelectOptions($("#wearCervicalSelect"), getWearCervicalOptions(), state.wearCervical);
  if($("#wearCervicalSelect").value !== state.wearCervical) state.wearCervical = $("#wearCervicalSelect").value;
  setSelectOptions($("#discolorationSelect"), getDiscolorationOptions(), state.discoloration);
  if($("#discolorationSelect").value !== state.discoloration) state.discoloration = $("#discolorationSelect").value;
  setSelectOptions($("#orthoApplianceSelect"), getOrthoApplianceOptions(), state.orthoAppliance);
  if($("#orthoApplianceSelect").value !== state.orthoAppliance) state.orthoAppliance = $("#orthoApplianceSelect").value;
  setSelectOptions($("#orthoDriftSelect"), getOrthoDriftOptions(), state.orthoDrift);
  if($("#orthoDriftSelect").value !== state.orthoDrift) state.orthoDrift = $("#orthoDriftSelect").value;
  setSelectOptions($("#orthoVerticalSelect"), getOrthoVerticalOptions(), state.orthoVertical);
  if($("#orthoVerticalSelect").value !== state.orthoVertical) state.orthoVertical = $("#orthoVerticalSelect").value;
  ($("#orthoRotationToggle") as HTMLInputElement).checked = state.orthoRotation === true;
  syncToothDetailControls(state);
  $("#brokenMesial").checked = !!state.brokenMesial;
  $("#brokenIncisal").checked = !!state.brokenIncisal;
  $("#brokenDistal").checked = !!state.brokenDistal;
  $("#extractionWound").checked = !!state.extractionWound;
  $("#extractionPlan").checked = !!state.extractionPlan;
  $("#parapulpalPin").checked = !!state.parapulpalPin;
  $("#crownReplace").checked = !!state.crownReplace;
  $("#crownNeeded").checked = !!state.crownNeeded;
  $("#missingClosed").checked = !!state.missingClosed;
  $("#bridgePillar").checked = !!state.bridgePillar;
  $("#crownLeakage").checked = !!state.crownLeakage;
  const isMilktooth = state.toothSelection === "milktooth";
  const isImplant = state.toothSelection === "implant";
  const underGum = isUnderGum(state.toothSelection);
  const extraction = isExtraction(state.toothSelection) || (state.toothSelection === "none" && state.extractionWound);

  // tooth selection
  $("#toothSelect").value = state.toothSelection;

  // Substrate control (natural / radix / broken / crown-prep).
  setSelectOptions($("#substrateSelect"), getSubstrateOptions(), state.toothSubstrate);
  if($("#substrateSelect").value !== state.toothSubstrate){
    state.toothSubstrate = $("#substrateSelect").value;
  }

  // Combined restoration dropdown — one <select> encodes `${type}|${material}`
  // and writes BOTH fields. Options are filtered by the active tooth's view.
  const restoView = restorationViewFor(activeTooth);
  // The ONE dropdown reflects EITHER a fixed restoration OR a "Kivehető:"
  // prosthesis (never both — FIX 4 coherence). Prefer the prosthesis encoding
  // when one is set.
  const restoSelected = state.prosthesis && state.prosthesis !== "none"
    ? `prosthesis|${state.prosthesis}`
    : `${state.restorationType}|${state.restorationMaterial}`;
  setSelectOptions($("#restorationSelect"), getRestorationOptions(restoView, { isImplant, toothSelection: state.toothSelection }), restoSelected);
  {
    const val = String($("#restorationSelect").value);
    if(val.startsWith("prosthesis|")){
      const p = val.slice("prosthesis|".length);
      if(state.prosthesis !== p){ state.prosthesis = p; }
      state.restorationType = "none";
      state.restorationMaterial = "none";
    }else{
      const [selType, selMat] = val.split("|");
      if(selType !== state.restorationType || selMat !== state.restorationMaterial){
        state.restorationType = selType || "none";
        state.restorationMaterial = selMat || "none";
      }
      if(state.prosthesis !== "none"){ state.prosthesis = "none"; }
    }
  }

  // Gating: milktooth / under-gum / extraction / radix substrate carry no
  // fixed restoration (mirrors the old crownMaterial="natural" reset).
  // Implants are exempt — a fixed crown/bridge on an abutment is
  // first-class (Task 3): the restorationOptions(ctx) call above already
  // restricts an implant's dropdown to crown/bridge × material. A radix
  // substrate (root remnant) is included here (SP15 wholebranch fix): the
  // restoration row is hidden for it (restorationRowHidden above), so a
  // stored crown must be cleared too — otherwise it keeps rendering
  // (emax-crown over tooth-radix) with no control left to clear it.
  if(isMilktooth || underGum || extraction || state.toothSubstrate === "radix"){
    state.restorationType = "none";
    state.restorationMaterial = "none";
    $("#restorationSelect").value = "none|none";
  }
  // Substrate applies only to a present permanent tooth.
  if(state.toothSelection !== "tooth-base"){
    state.toothSubstrate = "natural";
    $("#substrateSelect").value = "natural";
  }
  // SP7 Task 4: merged pulp/endo status selector (two optgroups). Displayed
  // value derives from (endo, pulpDx) via pulpEndoDisplayValue; the change
  // handler (wireControls) routes selection through pulpEndoOnSelect, which
  // enforces the mutual-exclusion invariant, so no post-sync normalization is
  // needed here (unlike the old #endoSelect block this replaces).
  buildPulpEndoSelect($("#pulpEndoSelect"), isMilktooth, pulpEndoDisplayValue(state), isPlan);
  setSelectOptions($("#fillingSelect"), getFillingOptions(isMilktooth), state.fillingMaterial);
  if($("#fillingSelect").value !== state.fillingMaterial){
    state.fillingMaterial = $("#fillingSelect").value;
  }
  setSelectOptions($("#mobilitySelect"), getMobilityOptions(), state.mobility);
  if($("#mobilitySelect").value !== state.mobility){
    state.mobility = $("#mobilitySelect").value;
  }
  // mods
  $$("#modsChecks input[type=checkbox]").forEach(c => c.checked = state.mods.has(c.value));
  // SP4: the periapical lesion-subtype row follows the apical diagnosis on a
  // present tooth (apicalDx !== "normal"). A non-present tooth (implant/missing)
  // never derives apicalDx but CAN still carry `mods.inflammation` (peri-implant /
  // periodontal, still toggleable) — for those, keep the pre-SP4 behaviour and
  // show the subtype row when the inflammation mod is set, so the lesion subtype
  // stays authorable (regression fix).
  $("#periapicalTypeRow").classList.toggle("hidden", !periapicalRowVisible(state) || isPlan);
  setSelectOptions($("#periapicalTypeSelect"), getPeriapicalTypeOptions(), state.periapicalType);
  if($("#periapicalTypeSelect").value !== state.periapicalType){
    state.periapicalType = $("#periapicalTypeSelect").value;
  }
  $("#calculusToggle").checked = !!state.calculus;
  const calculusAllowed = state.toothSelection === "tooth-base" || state.toothSelection === "milktooth";
  $("#calculusRow").classList.toggle("hidden", !calculusAllowed);
  // SP8 Task 5: periImplant (enum) is authored via a picker, shown only for an
  // implant; on an implant it also supersedes the parodontal/inflammation mods.
  setSelectOptions($("#periImplantSelect"), getPeriImplantOptions(), state.periImplant);
  if($("#periImplantSelect").value !== state.periImplant){
    state.periImplant = $("#periImplantSelect").value;
  }
  syncPeriImplantVisibility($("#periImplantRow"), $("#modsChecks"), state.toothSelection);
  // SP7 Task 5 (extended by SP15 Task 3 / B4): the periapical-inflammation mod
  // is retired as an authoring control on a PRESENT tooth (apicalDx drives the
  // glyph) AND on an implant (periImplant covers implant inflammation). It
  // stays visible for a missing tooth or an extraction-socket, where it marks
  // periodontal inflammation that neither apicalDx nor periImplant cover.
  // MUST run after syncPeriImplantVisibility() above — see that function's and
  // syncInflammationModVisibility's doc comments for why the order matters.
  syncInflammationModVisibility($("#modsChecks"), state.toothSelection);
  // SP4 Task 5: resorptionType (enum) is authored via a none/internal/
  // external-cervical picker (both subtypes render identically; the picker only
  // records which). Replaces the interim on/off checkbox.
  setSelectOptions($("#resorptionSelect"), getResorptionOptions(), state.resorptionType);
  if($("#resorptionSelect").value !== state.resorptionType){
    state.resorptionType = $("#resorptionSelect").value;
  }

  // caries (cross surfaces + the separate subcrown row) + per-surface depth indicator
  // (ICDAS `data-depth`/`data-icdas` badge + SP5 Task 4 `data-radio` — see
  // syncSurfaceDepthIndicator())
  $$("#cariesChecks input[type=checkbox], #cariesSubcrownRow input[type=checkbox]").forEach(c => c.checked = state.caries.has(c.value));
  $$("#cariesChecks .surface-cell").forEach(cell => syncSurfaceDepthIndicator(cell, state));

  // Depth selector at the top sets the DEFAULT depth for newly tapped surfaces.
  // SP5 Task 5: the whole visual caries-depth UI is gated by `cariesDepthEnabled`.
  $("#cariesDepthRow").classList.toggle("hidden", !cariesDepthEnabled || isPlan);
  setSelectOptions($("#cariesDepthSelect"), getCariesDepthOptions(), state.cariesActiveDepth);
  if($("#cariesDepthSelect").value !== String(state.cariesActiveDepth)){
    state.cariesActiveDepth = Number($("#cariesDepthSelect").value);
  }

  // SP5 Task 5: per-tooth root-caries picker. Options come from the current
  // `rootCariesMode`; the stored value is displayed collapsed to that list but
  // NEVER written back (non-collapsing — widening the mode reveals it again).
  // Shown only on a present tooth (mirrors the endo/pulp per-tooth controls).
  setSelectOptions($("#rootCariesSelect"), rootCariesOptions(), rootCariesDisplayValue(rootCariesMode, state.rootCaries));
  $("#rootCariesRow").classList.toggle("hidden", !isToothPresent(state.toothSelection) || isPlan);

  // filling surfaces
  $$("#fillingSurfaceChecks input[type=checkbox]").forEach(c => {
    c.checked = state.fillingSurfaceMaterials.has(c.value);
    const cell = c.closest(".surface-cell") as HTMLElement | null;
    if(cell){
      const mat = state.fillingSurfaceMaterials.get(c.value);
      cell.setAttribute("data-material", mat || "");
    }
  });
  // SP6 Task 2 (step 2): recurrent-caries dark-border indicator on filled surfaces.
  $$("#fillingSurfaceChecks .surface-cell").forEach(cell => syncFillingSubcariesIndicator(cell, state));
  // SP10 Task 3: structural filling-defect dark-border indicator (LEFT side).
  $$("#fillingSurfaceChecks .surface-cell").forEach(cell => syncFillingDefectIndicator(cell, state));

  // disable logic in UI
  const hasCrown = state.restorationType !== "none";
  const hasRemovable = state.toothSelection === "none"
    && (state.prosthesis === "removable-partial" || state.prosthesis === "removable-full");
  const hasRestoration = hasCrown || hasRemovable;
  $$("#cariesChecks input[type=checkbox], #cariesSubcrownRow input[type=checkbox]").forEach(c => {
    if(c.value === "caries-subcrown") setDisabled(c, !hasCrown);
    else setDisabled(c, hasRestoration || hasCrown);
  });
  const showFillingSurfaces = state.fillingMaterial !== "none" && !hasCrown;
  $("#fillingSurfaceChecks").classList.toggle("hidden", !showFillingSurfaces);

  // endo only if tooth present
  const endoDisabled = !isToothPresent(state.toothSelection) || underGum || extraction;
  setDisabled($("#pulpEndoSelect"), endoDisabled);
  setDisabled($("#apicalDxSelect"), endoDisabled);
  setDisabled($("#resorptionSelect"), endoDisabled);
  setDisabled($("#endoResection"), endoDisabled);
  setDisabled($("#parapulpalPin"), endoDisabled);
  setDisabled($("#mobilitySelect"), mobilityDisabled(state));

  const selectedArr = selectedTeeth.size > 0 ? Array.from(selectedTeeth) : [];
  const hiddenSelected = selectedArr.length > 0 && selectedArr.some(tn => {
    const sel = toothState.get(tn)?.toothSelection;
    return sel === "implant" || sel === "none" || sel === "tooth-under-gum" || sel === "no-tooth-after-extraction";
  });
  const hideByBase = state.toothSelection === "implant" || state.toothSelection === "none" || underGum || extraction || hiddenSelected;
  const noneSelected = selectedArr.length > 0 && selectedArr.some(tn => toothState.get(tn)?.toothSelection === "none");
  const hideByNone = state.toothSelection === "none" || noneSelected;
  const hideByRadix = state.toothSubstrate === "radix";
  // 2.2.1 Plan-mode: caries is a status finding (a diagnosis), so the whole
  // caries section is hidden in Plan — a filling/restoration is still plannable
  // via the Fillings + Restoration controls, which stay visible.
  $("#cariesSection").classList.toggle("hidden", hideByBase || hideByRadix || isPlan);
  const hideFillingsByCrown = state.toothSelection === "tooth-base" && hasCrown;
  $("#fillingSection").classList.toggle("hidden", hideByBase || hideFillingsByCrown);
  // Combined restoration dropdown: available on a present permanent tooth and on
  // a gap (bridge pontic); hidden for milk/implant/under-gum/extraction.
  const hideRestorationRow = restorationRowHidden(state);
  $("#restorationRow").classList.toggle("hidden", hideRestorationRow);
  // Substrate control: only for a present permanent tooth.
  const hideSubstrateRow = state.toothSelection !== "tooth-base";
  $("#substrateRow").classList.toggle("hidden", hideSubstrateRow);
  $("#brokenCrownRow").classList.toggle("hidden", state.toothSubstrate !== "broken" || hideSubstrateRow);
  $("#extractionRow").classList.toggle("hidden", state.toothSelection !== "none");
  // SP7 Task 5: the merged Root+Periodontium card reconciles the two original
  // cards' different hide predicates — the root block (endo/apical/lesion/
  // resorption/resection/pin) keeps the old #endoSection predicate
  // (hideByBase), the perio block (mobility/mods/calculus) keeps the old
  // #inflammationSection predicate (hideByNone); the card itself only
  // collapses away when BOTH blocks would be empty.
  $("#rpRootBlock").classList.toggle("hidden", hideByBase);
  // 2.2.1 Plan-mode: the entire periodontal block (mobility, 6-site probing
  // grid, inflammation/parodontal mods, calculus, peri-implant status) is
  // status-only diagnosis — hidden in Plan. The root block stays visible so
  // endo TREATMENT remains plannable.
  $("#rpPerioBlock").classList.toggle("hidden", hideByNone || isPlan);
  // Section collapses only when BOTH blocks are gone; in Plan the root block
  // still shows, so the section stays (unless the base already hides it).
  $("#rootPeriodontiumSection").classList.toggle("hidden", hideByBase && (hideByNone || isPlan));
  // 2.2.1 Plan-mode: inside the still-visible root block, hide the diagnosis-
  // only rows (apical diagnosis, periapical lesion subtype above, root
  // resorption). Endo TREATMENT (root canal/post via #pulpEndoSelect,
  // apicoectomy, parapulpal pin) stays plannable.
  $("#apicalDxRow").classList.toggle("hidden", isPlan);
  $("#resorptionRow").classList.toggle("hidden", isPlan);
  const selectedList = selectedArr.length > 0 ? selectedArr : (activeTooth ? [activeTooth] : []);
  const contactAllowed = selectedList.length > 0 && selectedList.every(tn => {
    const s = toothState.get(tn);
    const allowedBase = s && (s.toothSelection === "tooth-base" || s.toothSelection === "milktooth" || BROKEN_VARIANTS.has(s.toothSelection));
    if(!allowedBase) return false;
    if(s.toothSelection === "tooth-base" && s.restorationType !== "none") return false;
    return true;
  });
  // 2.2.1 Plan-mode: tooth wear is a status finding — not plannable treatment.
  const bruxismAllowed = !isPlan && selectedList.length > 0 && selectedList.every(tn => {
    const s = toothState.get(tn);
    return s && wearRowAllowed(s);
  });
  // SP12 Task 3: #discolorationRow visibility gate — reuses the same
  // discolorationAllowed predicate the render tint and tooltip use, so the
  // dropdown's visibility never contradicts the chart (SP9/10/11 lesson).
  // 2.2.1 Plan-mode: discoloration is a status finding — hidden in Plan.
  const discolorationRowAllowed = !isPlan && selectedList.length > 0 && selectedList.every(tn => {
    const s = toothState.get(tn);
    return s && discolorationAllowed(s);
  });
  // SP14 Task 3: #orthoCard visibility gate — reuses the same orthoAllowed
  // predicate the render glyphs and tooltip use (Task 2/4), so the card's
  // visibility never contradicts the chart (SP9/10/11 lesson).
  const orthoCardAllowed = selectedList.length > 0 && selectedList.every(tn => {
    const s = toothState.get(tn);
    return s && orthoAllowed(s);
  });
  const fissureAllowed = selectedList.length > 0 && selectedList.every(tn => {
    const s = toothState.get(tn);
    return s && s.toothSelection === "tooth-base" && FISSURE_ALLOWED.has(tn);
  });
  $("#contactPointRow").classList.toggle("hidden", !contactAllowed);
  $("#bruxismRow").classList.toggle("hidden", !bruxismAllowed);
  $("#discolorationRow").classList.toggle("hidden", !discolorationRowAllowed);
  $("#orthoCard").classList.toggle("hidden", !orthoCardAllowed);
  $("#fissureSealingRow").classList.toggle("hidden", !fissureAllowed);
  const extractionPlanAllowed = selectedList.length > 0 && selectedList.every(tn => {
    const s = toothState.get(tn);
    return s && ["tooth-base","milktooth","implant","tooth-under-gum"].includes(s.toothSelection);
  });
  $("#extractionPlanRow").classList.toggle("hidden", !extractionPlanAllowed);
  // crown-replace: visible when permanent tooth carries a fixed restoration
  const crownReplaceAllowed = selectedList.length > 0 && selectedList.every(tn => {
    const s = toothState.get(tn);
    return s && s.toothSelection === "tooth-base" && s.restorationType !== "none";
  });
  $("#crownReplaceRow").classList.toggle("hidden", !crownReplaceAllowed);
  // crown-needed: visible when permanent tooth has no restoration yet (natural/broken/crown-prep substrate)
  const crownNeededAllowed = selectedList.length > 0 && selectedList.every(tn => {
    const s = toothState.get(tn);
    return s && s.toothSelection === "tooth-base" && s.restorationType === "none" && ["natural","broken","crownprep"].includes(s.toothSubstrate);
  });
  $("#crownNeededRow").classList.toggle("hidden", !crownNeededAllowed);
  // missing-closed: visible when foghiány
  const missingClosedAllowed = selectedList.length > 0 && selectedList.every(tn => {
    const s = toothState.get(tn);
    return s && s.toothSelection === "none";
  });
  $("#missingClosedRow").classList.toggle("hidden", !missingClosedAllowed);
  const restorationRowCurrentlyHidden = $("#restorationRow").classList.contains("hidden");
  const bridgePillarAllowed = !restorationRowCurrentlyHidden && state.restorationType !== "none";
  $("#bridgePillarRow").classList.toggle("hidden", !bridgePillarAllowed);
  // Crown-leakage toggle: only meaningful on a fixed crown/bridge restoration
  // (mirrors the crownLeakage axis's appliesWhen in src/registry/axes.ts).
  const crownLeakageAllowed = !restorationRowCurrentlyHidden && (state.restorationType === "crown" || state.restorationType === "bridge");
  $("#crownLeakageRow").classList.toggle("hidden", !crownLeakageAllowed);

  const extractionPlanRow = $("#extractionPlanRow");
  const brokenCrownRow = $("#brokenCrownRow");
  const bruxismRow = $("#bruxismRow");
  const crownActionsRow = $("#crownActionsRow");
  if(extractionPlanRow && brokenCrownRow && bruxismRow && crownActionsRow){
    const brokenMode = state.toothSubstrate === "broken" && state.toothSelection === "tooth-base";
    if(brokenMode){
      if(extractionPlanRow.parentElement !== brokenCrownRow){
        brokenCrownRow.appendChild(extractionPlanRow);
      }
      crownActionsRow.classList.add("hidden");
    }else if(!bruxismRow.classList.contains("hidden")){
      if(extractionPlanRow.parentElement !== bruxismRow){
        bruxismRow.appendChild(extractionPlanRow);
      }
      crownActionsRow.classList.add("hidden");
    }else{
      if(extractionPlanRow.parentElement !== crownActionsRow){
        crownActionsRow.appendChild(extractionPlanRow);
      }
      crownActionsRow.classList.toggle("hidden", !extractionPlanAllowed);
    }
    extractionPlanRow.classList.toggle("hidden", !extractionPlanAllowed);
  }
  // SP8 Task 5: the dedicated periImplant axis now owns "peri-implantitis";
  // the parodontal mod keeps its plain label on every tooth type.
  const parodontLabel = $("#lbl-parodontal");
  if(parodontLabel){ parodontLabel.textContent = t("mods.parodontal"); }

  const milkOption = $("#toothSelect").querySelector('option[value="milktooth"]');
  if(milkOption){
    const anyBlocked = selectedArr.length > 0
      ? selectedArr.some(tn => MILKTOOTH_BLOCKED.has(Number(tn)))
      : (activeTooth ? MILKTOOTH_BLOCKED.has(activeTooth) : false);
    milkOption.disabled = anyBlocked;
  }

  const inflammationLabel = $("#lbl-inflammation");
  if(inflammationLabel){
    inflammationLabel.textContent = extraction ? t("mods.periodontalInflammation") : t("mods.periapicalInflammation");
  }
  $("#mobilityRow").classList.toggle("hidden", mobilityRowHidden(state));
  // SP-perio P1 Task 2: sync the #perioRow six-site grid + derived read-out
  // from state on every syncControlsFromState() call — i.e. on tooth select,
  // mirroring exactly how mobility syncs its own control above.
  syncPerioRow(state);
  const parodontalInput = $("#chk-parodontal");
  if(parodontalInput){
    setDisabled(parodontalInput, extraction);
  }
  if(extraction){
    const inflammationInput = $("#chk-inflammation");
    if(inflammationInput) setDisabled(inflammationInput, false);
  }

  // SP6 Task 4 (§8): re-resolve the "occlusal"/"incisal" surface-picker labels
  // for the (possibly just-changed) active tooth — anterior vs. posterior only
  // affects the displayed label, never the stored surface value.
  refreshCheckLabels();
  // SP6 Task 4 (§7): the "Fillings and restorative" panel's informational
  // subcaries-summary line depends on ALL selected teeth, not just the active
  // one, so it reads `selectedTeeth`/`toothState` directly rather than `state`.
  updateFillingSubcariesSummary();
  // SP16 Task 1: parallel filling-defect-summary line, same all-selected-teeth
  // rationale as updateFillingSubcariesSummary above.
  updateFillingDefectSummary();
}

// ---- Event handlers ----
function applyAndSync(toothNo: Any){
  applyStateToSvg(toothNo);
  updateToothTileNumber(toothNo);
  if(toothNo === activeTooth){
    syncControlsFromState(toothState.get(toothNo));
  }
  if(edentulous && !suppressEdentulousSync){
    setEdentulous(false);
  }
  updateSelectionFilterButtons();
}

function applyToSelected(fn: Any){
  if(selectedTeeth.size === 0) return;
  // DS-1: route the whole selection edit through the batch gate — in plan mode
  // every selected tooth is marked plan-edited; in status mode (plan
  // initialized) every selected tooth that is NOT already plan-edited mirrors
  // status->plan after the batch (planned teeth diverge). Uninitialized plan is
  // a pure passthrough (byte-identical to the pre-dual-state behavior).
  const toothNos = Array.from(selectedTeeth) as number[];
  gateToothEditBatch(toothNos, () => {
    for(const toothNo of toothNos){
      const s = toothState.get(toothNo);
      if(!s) continue;
      fn(s, toothNo);
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    if(activeTooth && selectedTeeth.has(activeTooth)){
      syncControlsFromState(toothState.get(activeTooth));
    }
    if(edentulous && !suppressEdentulousSync){
      setEdentulous(false);
    }
    updateSelectionFilterButtons();
    notifyStateChange();
  });
}

/** DS-1 (review Fix 1): reset a SINGLE tooth to `defaultState()`, routed through
 *  the edit {@link gateToothEdit} so a per-tooth reset behaves like every other
 *  edit — on an un-planned tooth it mirrors status->plan (no spurious diff), on
 *  a plan-edited tooth it CONFIRMS before applying (parity with clearing the
 *  tooth via the restoration dropdown). Render + control-sync live INSIDE the
 *  gated closure so on the deferred-confirm path they run only on Accept.
 *  Shared by the zoom-popover and context-menu single-tooth reset buttons + the
 *  `__resetToothForTest` seam. */
function resetToothGated(toothNo: number): void {
  gateToothEdit(toothNo, () => {
    toothState.set(toothNo, defaultState());
    applyStateToSvg(toothNo);
    updateToothTileNumber(toothNo);
    if(activeTooth === toothNo) syncControlsFromState(toothState.get(toothNo));
  });
}

/** DS-1 (review Fix 1): reset a SET of selected teeth to `defaultState()`,
 *  routed through {@link gateToothEditBatch} — one confirm covers the whole set
 *  when it touches a plan-edited tooth; un-planned teeth mirror status->plan.
 *  The `edentulous` flip + render + control-sync all live INSIDE the gated
 *  closure so on the deferred-confirm path they take effect only on Accept
 *  (no flag/teeth mismatch on Cancel — same rationale as `setEdentulous` and
 *  the dentition presets). Shared by the "Reset selected teeth" button + the
 *  `__resetTeethForTest` seam. */
function resetTeethGated(toothNos: number[]): void {
  if(toothNos.length === 0) return;
  gateToothEditBatch(toothNos, () => {
    if(edentulous){
      edentulous = false;
      setToggleButton($("#btnEdentulous"), edentulous);
    }
    for(const toothNo of toothNos){
      toothState.set(toothNo, defaultState());
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    if(activeTooth){
      setControlsEnabled(true);
      syncControlsFromState(toothState.get(activeTooth));
    }
    notifyStateChange();
  });
}

/** DS-1: apply the PRIMARY (deciduous) dentition preset — a STRUCTURAL
 *  interactive edit (not a reset), routed through the batch gate. `targetFor`
 *  is the state each tooth ends up in; only teeth that actually change are
 *  passed to the gate so unchanged teeth are not marked plan-edited / mirrored
 *  (per-tooth no-op signaling). Uninitialized plan stays a pure passthrough.
 *  DS-1 (review Fix 3): the `edentulous` flip + button state live INSIDE the
 *  gated closure so on the deferred-confirm path they take effect only on
 *  Accept — otherwise Cancel would leave `edentulous` flipped while every tooth
 *  is untouched (flag/teeth mismatch). `notifyStateChange()` moves inside too so
 *  the whole-mouth refresh fires when the batch actually applies. */
function applyPrimaryDentition(): void {
  const targetFor = (toothNo: number)=>{
    const s = defaultState();
    s.toothSelection = PRIMARY_MILK.has(toothNo) ? "milktooth" : "none";
    return s;
  };
  const changed = ALL_TEETH.filter(tn => JSON.stringify(serializeState(toothState.get(tn) ?? defaultState())) !== JSON.stringify(serializeState(targetFor(tn))));
  gateToothEditBatch(changed, ()=>{
    edentulous = false;
    setToggleButton($("#btnEdentulous"), edentulous);
    suppressEdentulousSync = true;
    for(const toothNo of ALL_TEETH){
      toothState.set(toothNo, targetFor(toothNo));
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    suppressEdentulousSync = false;
    if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
    notifyStateChange();
  });
}

/** DS-1: apply the MIXED dentition preset — see {@link applyPrimaryDentition};
 *  gated STRUCTURAL edit with per-tooth no-op signaling and (Fix 3) the
 *  `edentulous` flip inside the gated closure. */
function applyMixedDentition(): void {
  const targetFor = (toothNo: number)=>{
    const s = defaultState();
    if(MIXED_PERMANENT.has(toothNo)){
      s.toothSelection = "tooth-base";
    }else if(MIXED_MILK.has(toothNo)){
      s.toothSelection = "milktooth";
    }else if(MIXED_NONE.has(toothNo)){
      s.toothSelection = "none";
    }
    return s;
  };
  const changed = ALL_TEETH.filter(tn => JSON.stringify(serializeState(toothState.get(tn) ?? defaultState())) !== JSON.stringify(serializeState(targetFor(tn))));
  gateToothEditBatch(changed, ()=>{
    edentulous = false;
    setToggleButton($("#btnEdentulous"), edentulous);
    suppressEdentulousSync = true;
    for(const toothNo of ALL_TEETH){
      toothState.set(toothNo, targetFor(toothNo));
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    suppressEdentulousSync = false;
    if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
    notifyStateChange();
  });
}

function updateActiveLabel(){
  const label = $("#activeToothLabel");
  if(!label) return;
  if(selectedTeeth.size === 0){
    label.textContent = t("selection.none");
  }else if(selectedTeeth.size === 1){
    const toothNo = activeTooth ?? Array.from(selectedTeeth)[0];
    label.textContent = toLabel(getDisplayedToothNumber(toothNo), numberingSystem);
  }else{
    label.textContent = t("selection.count", { count: selectedTeeth.size });
  }
}

function updateSelectionFilterButtons(){
  let hasPresent = false;
  let hasMissing = false;
  let hasPermanent = false;
  let hasMilk = false;
  let hasImplant = false;
  for(const toothNo of ALL_TEETH){
    const sel = toothState.get(toothNo)?.toothSelection;
    if(sel === "none"){
      hasMissing = true;
    }else{
      hasPresent = true;
    }
    if(sel === "tooth-base") hasPermanent = true;
    if(sel === "milktooth") hasMilk = true;
    if(sel === "implant") hasImplant = true;
  }
  $("#btnSelectAllPresent")?.classList.toggle("is-hidden", !hasPresent);
  $("#btnSelectAllMissing")?.classList.toggle("is-hidden", !hasMissing);
  $("#btnSelectPermanent")?.classList.toggle("is-hidden", !hasPermanent);
  $("#btnSelectMilk")?.classList.toggle("is-hidden", !hasMilk);
  $("#btnSelectImplants")?.classList.toggle("is-hidden", !hasImplant);
}

function setControlsEnabled(enabled: Any){
  $$(".panel-body input, .panel-body select").forEach(el => {
    if(el.id === "statusExtraSelect") return;
    setDisabled(el, !enabled);
  });
}

function refreshCheckLabels(){
  for(const opt of MOD_OPTIONS){
    const label = $(`#lbl-${opt.value}`);
    if(label) label.textContent = t(opt.labelKey);
  }
  for(const opt of CARIES_OPTIONS){
    const label = $(`#lbl-${opt.value}`);
    if(!label) continue;
    const surface = opt.value.replace("caries-", "");
    // SP6 Task 4 (§8) / SP16 Task 2: occlusal, buccal, and lingual all resolve
    // through surfaceLabelKey — arch/anterior-aware in "full" notation mode
    // ("incisal"/"labial"/"palatal"); mesial/distal/subcrown are
    // position-independent and keep their own generic labelKey.
    const key = (surface === "occlusal" || surface === "buccal" || surface === "lingual")
      ? surfaceLabelKey(surface, activeTooth)
      : opt.labelKey;
    label.textContent = t(key);
    // SP16 Task 2: the boxed `.surf-letter` span is set once at build time
    // (buildSurfaceCross) and was never refreshed per-tooth — rewrite it here
    // too, so it tracks the active tooth's position + the surfaceNotation
    // setting (subcrown has no `.surf-letter` sibling, so this is a no-op there).
    const letterEl = label.parentElement?.querySelector(".surf-letter");
    if(letterEl) letterEl.textContent = surfaceLetter(surface, activeTooth);
  }
  for(const surface of GROUPS.fillingSurfaces){
    const label = $(`#lbl-${surface}`);
    if(!label) continue;
    // SP6 Task 4 (§8) / SP16 Task 2: mirrors the caries-picker swap above.
    const key = (surface === "occlusal" || surface === "buccal" || surface === "lingual")
      ? surfaceLabelKey(surface, activeTooth)
      : (FILLING_SURFACE_LABELS[surface] || "surface.mesial");
    label.textContent = t(key);
    const letterEl = label.parentElement?.querySelector(".surf-letter");
    if(letterEl) letterEl.textContent = surfaceLetter(surface, activeTooth);
  }
}

function refreshToothSelectOptions(){
  const toothSelect = $("#toothSelect");
  if(!toothSelect) return;
  const value = toothSelect.value;
  setSelectOptions(toothSelect, getToothSelectOptions(), value);
}

function refreshStatusExtraOptions(){
  const selectEl = $("#statusExtraSelect");
  if(!selectEl) return;
  const statusExtras = getStatusExtras();
  if(!statusExtras.length) return;
  const options = statusExtras.map((opt)=>({ value: opt.id, label: opt.label }));
  const value = selectEl.value || options[0]?.value;
  setSelectOptions(selectEl, options, value);
}

function refreshToggleLabels(){
  const statusCard = $("#statusCard");
  const statusToggle = $("#btnToggleStatusCard");
  if(statusCard && statusToggle){
    applyToggleA11y(statusToggle, "status.title", statusCard.classList.contains("collapsed"));
  }
  const controlsActions = $("#controlsActions");
  const controlsToggle = $("#btnToggleControlsCard");
  if(controlsActions && controlsToggle){
    applyToggleA11y(controlsToggle, "panel.controls", controlsActions.classList.contains("hidden"));
  }
  const cardConfig = [
    { card: "#cariesSection", btn: "#btnToggleCariesCard", labelKey: "caries.title" },
    { card: "#fillingSection", btn: "#btnToggleFillingCard", labelKey: "filling.title" },
    { card: "#rootPeriodontiumSection", btn: "#btnToggleRootPeriodontiumCard", labelKey: "card.rootPeriodontium" },
  ];
  for(const cfg of cardConfig){
    const cardEl = $(cfg.card);
    const btnEl = $(cfg.btn);
    if(!cardEl || !btnEl) continue;
    applyToggleA11y(btnEl, cfg.labelKey, cardEl.classList.contains("collapsed"));
  }
}

function refreshAllSelectOptions(){
  refreshToothSelectOptions();
  refreshStatusExtraOptions();
  const state = activeTooth ? toothState.get(activeTooth) : null;
  const isMilktooth = state?.toothSelection === "milktooth";
  const substrateEl = $("#substrateSelect");
  if(substrateEl) setSelectOptions(substrateEl, getSubstrateOptions(), substrateEl.value);
  const restorationEl = $("#restorationSelect");
  if(restorationEl) setSelectOptions(restorationEl, getRestorationOptions(restorationViewFor(activeTooth), { isImplant: state?.toothSelection === "implant", toothSelection: state?.toothSelection }), restorationEl.value);
  const fillingEl = $("#fillingSelect");
  if(fillingEl) setSelectOptions(fillingEl, getFillingOptions(isMilktooth), fillingEl.value);
  const mobilityEl = $("#mobilitySelect");
  if(mobilityEl) setSelectOptions(mobilityEl, getMobilityOptions(), mobilityEl.value);
  const periapicalEl = $("#periapicalTypeSelect");
  if(periapicalEl) setSelectOptions(periapicalEl, getPeriapicalTypeOptions(), periapicalEl.value);
  // SP7 Task 4: merged pulp/endo selector — rebuild both optgroups, preserving
  // the currently selected value (mirrors the other re-localize-in-place calls
  // in this function).
  const pulpEndoEl = $("#pulpEndoSelect");
  if(pulpEndoEl) buildPulpEndoSelect(pulpEndoEl, isMilktooth, pulpEndoEl.value);
  const apicalEl = $("#apicalDxSelect");
  if(apicalEl) setSelectOptions(apicalEl, getApicalDxOptions(), apicalEl.value);
  const resorptionEl = $("#resorptionSelect");
  if(resorptionEl) setSelectOptions(resorptionEl, getResorptionOptions(), resorptionEl.value);
  const cariesDepthEl = $("#cariesDepthSelect");
  if(cariesDepthEl) setSelectOptions(cariesDepthEl, getCariesDepthOptions(), Number(cariesDepthEl.value));
}

function refreshLocalizedContent(){
  refreshAllSelectOptions();
  refreshCheckLabels();
  refreshToggleLabels();
  updateActiveLabel();
  refreshArchToggleLabels();
  if(activeTooth){
    syncControlsFromState(toothState.get(activeTooth));
  }
}

function updateSelectionUI(){
  $$(".tooth-tile").forEach(tile => {
    const toothNo = Number(tile.dataset.tooth);
    const isSelected = selectedTeeth.has(toothNo);
    tile.classList.toggle("active", isSelected);
    if(tile.hasAttribute("role")) tile.setAttribute("aria-selected", String(isSelected));
  });
  updateSelectionFilterButtons();
  updateActiveLabel();
  if(activeTooth && selectedTeeth.has(activeTooth)){
    setControlsEnabled(true);
    syncControlsFromState(toothState.get(activeTooth));
  }else{
    syncControlsFromState(defaultState());
    setControlsEnabled(false);
  }
}

// ---- Touch: Zoom Popover ----
function showZoomPopover(toothNo: number){
  hideZoomPopover();
  hideContextMenu();
  const svgs = toothSvgRoot.get(toothNo);
  const sideSvg = svgs?.find((_s: Any, i: number) => {
    const tiles = toothTile.get(toothNo);
    return tiles?.[i]?.classList.contains("side-view");
  }) || svgs?.[0];
  if(!sideSvg) return;

  const overlay = el("div", { class: "odon-zoom-overlay" });
  const popover = el("div", { class: "odon-zoom-popover" });

  // Header
  const label = toLabel(toothNo, numberingSystem);
  const header = el("div", { class: "odon-zoom-header" });
  const title = el("span", { class: "odon-zoom-title", text: t("touch.zoom.title", { tooth: label }) });
  const closeBtn = el("button", { class: "odon-zoom-close", text: "✕" });
  closeBtn.addEventListener("click", hideZoomPopover);
  header.appendChild(title);
  header.appendChild(closeBtn);

  // SVG clone
  const svgWrap = el("div", { class: "odon-zoom-svg" });
  const clonedSvg = sideSvg.cloneNode(true) as SVGElement;
  svgWrap.appendChild(clonedSvg);

  // Actions
  const actions = el("div", { class: "odon-zoom-actions" });

  const isSelected = selectedTeeth.has(toothNo);
  const selectBtn = el("button", {
    class: isSelected ? "odon-zoom-btn active" : "odon-zoom-btn",
    text: isSelected ? t("touch.zoom.deselect") : t("touch.zoom.select"),
  });
  selectBtn.addEventListener("click", () => {
    if(selectedTeeth.has(toothNo)){
      selectedTeeth.delete(toothNo);
      if(activeTooth === toothNo) activeTooth = selectedTeeth.values().next().value ?? null;
    }else{
      selectedTeeth.add(toothNo);
      activeTooth = toothNo;
    }
    updateSelectionUI();
    hideZoomPopover();
  });

  const infoBtn = el("button", { class: "odon-zoom-btn", text: t("touch.zoom.info") });
  infoBtn.addEventListener("click", () => {
    selectedTeeth = new Set([toothNo]);
    activeTooth = toothNo;
    updateSelectionUI();
    hideZoomPopover();
    // Scroll controls panel into view
    const panel = $("#controlsActions");
    if(panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const resetBtn = el("button", { class: "odon-zoom-btn danger", text: t("touch.ctx.reset") });
  resetBtn.addEventListener("click", () => {
    resetToothGated(toothNo);
    hideZoomPopover();
  });

  const closeActionBtn = el("button", { class: "odon-zoom-btn", text: t("touch.zoom.close") });
  closeActionBtn.addEventListener("click", hideZoomPopover);

  actions.appendChild(selectBtn);
  actions.appendChild(infoBtn);
  if(notesEnabled && !readOnly){
    const noteBtn = el("button", { class: "odon-zoom-btn", text: t("note.title") });
    noteBtn.addEventListener("click", () => {
      hideZoomPopover();
      showNoteEditor(toothNo);
    });
    actions.appendChild(noteBtn);
  }
  actions.appendChild(resetBtn);
  actions.appendChild(closeActionBtn);

  popover.appendChild(header);
  popover.appendChild(svgWrap);
  popover.appendChild(actions);

  overlay.addEventListener("click", (e) => {
    if(e.target === overlay) hideZoomPopover();
  });

  overlay.appendChild(popover);
  document.body.appendChild(overlay);
}

function hideZoomPopover(){
  const overlay = document.querySelector(".odon-zoom-overlay");
  if(overlay) overlay.remove();
}

// ---- Touch: Context Menu ----
function showContextMenu(toothNo: number, touch: Touch){
  hideContextMenu();
  hideZoomPopover();

  const menu = el("div", { class: "odon-ctx-menu" });
  const isSelected = selectedTeeth.has(toothNo);

  if(isSelected){
    const multiItem = el("button", { class: "odon-ctx-item", text: t("touch.ctx.deselect") });
    multiItem.addEventListener("click", () => {
      selectedTeeth.delete(toothNo);
      if(activeTooth === toothNo) activeTooth = selectedTeeth.values().next().value ?? null;
      updateSelectionUI();
      hideContextMenu();
    });
    menu.appendChild(multiItem);
  }else{
    const selectItem = el("button", { class: "odon-ctx-item", text: t("touch.ctx.select") });
    selectItem.addEventListener("click", () => {
      selectedTeeth = new Set([toothNo]);
      activeTooth = toothNo;
      updateSelectionUI();
      hideContextMenu();
    });
    menu.appendChild(selectItem);

    if(selectedTeeth.size > 0){
      const multiItem = el("button", { class: "odon-ctx-item", text: t("touch.ctx.multiSelect") });
      multiItem.addEventListener("click", () => {
        selectedTeeth.add(toothNo);
        activeTooth = toothNo;
        updateSelectionUI();
        hideContextMenu();
      });
      menu.appendChild(multiItem);
    }
  }

  menu.appendChild(el("div", { class: "odon-ctx-divider" }));

  const resetItem = el("button", { class: "odon-ctx-item danger", text: t("touch.ctx.reset") });
  resetItem.addEventListener("click", () => {
    resetToothGated(toothNo);
    hideContextMenu();
  });
  menu.appendChild(resetItem);

  // Position the menu near the touch point
  const x = Math.min(touch.clientX, window.innerWidth - 200);
  const y = Math.min(touch.clientY - 10, window.innerHeight - 200);
  menu.style.left = x + "px";
  menu.style.top = y + "px";

  document.body.appendChild(menu);

  // Close on outside tap
  const closeHandler = (e: Event) => {
    if(!menu.contains(e.target as Node)){
      hideContextMenu();
      document.removeEventListener("touchstart", closeHandler, true);
      document.removeEventListener("click", closeHandler, true);
    }
  };
  setTimeout(() => {
    document.addEventListener("touchstart", closeHandler, true);
    document.addEventListener("click", closeHandler, true);
  }, 50);
}

function hideContextMenu(){
  const menu = document.querySelector(".odon-ctx-menu");
  if(menu) menu.remove();
}

// ---- Note Editor Popover ----
function showNoteEditor(toothNo: number){
  hideNoteEditor();
  if(!notesEnabled || readOnly) return;
  const state = toothState.get(toothNo);
  if(!state) return;

  // Find the side-view tile for positioning
  const tiles = toothTile.get(toothNo);
  const anchorTile = tiles?.find((t: HTMLElement) => t.classList.contains("side-view")) || tiles?.[0];

  const label = toLabel(toothNo, numberingSystem);
  const popover = el("div", { class: "odon-note-popover" });

  const header = el("div", { class: "odon-note-header" });
  const title = el("span", { class: "odon-note-title", text: t("note.title") + " \u2014 " + label });
  const closeBtn = el("button", { class: "odon-zoom-close", text: "\u2715" });
  closeBtn.addEventListener("click", hideNoteEditor);
  header.appendChild(title);
  header.appendChild(closeBtn);

  const textarea = document.createElement("textarea");
  textarea.className = "odon-note-textarea";
  textarea.value = state.note || "";
  textarea.placeholder = t("note.placeholder");
  textarea.rows = 3;

  const actions = el("div", { class: "odon-note-actions" });
  const saveBtn = el("button", { class: "odon-zoom-btn", text: t("note.save") });
  saveBtn.addEventListener("click", () => {
    state.note = textarea.value.trim();
    updateToothTooltip(toothNo);
    updateToothLabelNoteIcon(toothNo);
    hideNoteEditor();
  });
  const deleteBtn = el("button", { class: "odon-zoom-btn danger", text: t("note.delete") });
  deleteBtn.addEventListener("click", () => {
    state.note = "";
    updateToothTooltip(toothNo);
    updateToothLabelNoteIcon(toothNo);
    hideNoteEditor();
  });
  actions.appendChild(saveBtn);
  actions.appendChild(deleteBtn);

  popover.appendChild(header);
  popover.appendChild(textarea);
  popover.appendChild(actions);

  // Backdrop
  const backdrop = el("div", { class: "odon-note-backdrop" });
  backdrop.addEventListener("click", hideNoteEditor);
  backdrop.appendChild(popover);
  document.body.appendChild(backdrop);

  popover.addEventListener("click", (e) => e.stopPropagation());

  // Position popover near the tooth tile
  if(anchorTile){
    const rect = anchorTile.getBoundingClientRect();
    const pw = 320; // popover width
    let left = rect.left + rect.width / 2 - pw / 2;
    let top = rect.bottom + 8;
    // Clamp to viewport
    if(left < 8) left = 8;
    if(left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
    if(top + 200 > window.innerHeight) top = rect.top - 208;
    popover.style.position = "fixed";
    popover.style.left = left + "px";
    popover.style.top = top + "px";
  }

  textarea.focus();
}

function hideNoteEditor(){
  const backdrop = document.querySelector(".odon-note-backdrop");
  if(backdrop) backdrop.remove();
}

function hideCariesDepthPopup(){
  const p = document.querySelector(".odon-depth-popup");
  if(p) p.remove();
}

/** Popup to author a single caries surface on the selected teeth. Beyond the
 *  original visual caries-depth (ICDAS/3-level) picker it now offers, in the
 *  SAME anchored popup (SP5 Task 5): a per-surface secondary-caries CARS-score
 *  picker and — only when `radiographicDepthMode !== "off"` — a per-surface
 *  radiographic-depth picker. Each group's option list follows its granularity
 *  mode; the depth group itself is hidden when `cariesDepthEnabled` is off. */
/** SP16 Task 2: resolves the DISPLAY LETTER for a caries/filling surface,
 *  respecting the `surfaceNotation` setting ("full", default) and — in full
 *  mode — the tooth's arch (upper/lower) and anterior/posterior position.
 *
 *  FULL: occlusal -> "I" (incisal) on an anterior tooth, else "O" (occlusal);
 *  buccal -> "L" (labial) on an anterior tooth, else "B" (buccal); lingual ->
 *  "P" (palatal) on an upper tooth, else "L" (lingual) — on a LOWER ANTERIOR
 *  tooth this means BOTH buccal(labial) and lingual(lingual) letter as "L"
 *  (ratified: position in the surface-cross and the caption disambiguate; a
 *  "(L, L)"-style summary is inherently ambiguous, which is accepted).
 *  mesial -> "M", distal -> "D", subcrown -> "SC" always.
 *
 *  SIMPLE: always the tooth-independent B/M/O/D/L/SC set, regardless of
 *  position. Exported so both {@link summarySurfaceLetter} and the live
 *  surface-cross UI (buildSurfaceCross/refreshCheckLabels) share one source
 *  of truth. */
export function surfaceLetter(surface: string, toothNo?: number | null): string {
  if(surface === "subcrown") return "SC";
  if(surfaceNotation === "simple"){
    const map: Record<string, string> = { buccal: "B", mesial: "M", occlusal: "O", distal: "D", lingual: "L" };
    return map[surface] || surface;
  }
  const anterior = toothNo != null && isAnteriorTooth(toothNo);
  const upper = toothNo != null && isUpperTooth(toothNo);
  if(surface === "occlusal") return anterior ? "I" : "O";
  if(surface === "buccal") return anterior ? "L" : "B";
  if(surface === "lingual") return upper ? "P" : "L";
  if(surface === "mesial") return "M";
  if(surface === "distal") return "D";
  return surface;
}

/** Maps a caries surface identifier to its existing i18n surface-label key,
 *  so the popup header can read e.g. "Caries details – Buccal". Falls back to
 *  the raw surface string for any (unexpected) unmapped value.
 *
 *  SP6 Task 4 (§8): when `toothNo` is given and is an anterior tooth
 *  (incisor/canine), the "occlusal" surface DISPLAYS as "incisal"
 *  (`surface.incisal`) instead of `surface.occlusal` — the stored surface
 *  value is unaffected, this only changes which i18n key the label resolves
 *  to.
 *
 *  SP16 Task 2: extended to be arch/anterior-aware for ALL of
 *  occlusal/buccal/lingual, gated on the `surfaceNotation` setting. In
 *  "full" mode (default): occlusal -> incisal (anterior), buccal -> labial
 *  (anterior), lingual -> palatal (upper) / lingual (lower, a NEW key
 *  separate from the combined `surface.lingualPalatal`). In "simple" mode
 *  the generic, tooth-independent keys are always used
 *  (buccal/occlusal/lingualPalatal). Exported so it can be unit-tested
 *  directly. */
export function surfaceLabelKey(surface: string, toothNo?: number | null): string {
  if(surfaceNotation === "full"){
    const anterior = toothNo != null && isAnteriorTooth(toothNo);
    const upper = toothNo != null && isUpperTooth(toothNo);
    if(surface === "occlusal") return anterior ? "surface.incisal" : "surface.occlusal";
    if(surface === "buccal") return anterior ? "surface.labial" : "surface.buccal";
    if(surface === "lingual") return upper ? "surface.palatal" : "surface.lingual";
  }
  const map: Record<string, string> = {
    buccal: "surface.buccal",
    lingual: "surface.lingualPalatal",
    mesial: "surface.mesial",
    distal: "surface.distal",
    occlusal: "surface.occlusal",
  };
  return map[surface] || surface;
}

function showCariesDepthPopup(surface: string, anchor: HTMLElement, toothNo?: number | null){
  hideCariesDepthPopup();
  const rect = anchor.getBoundingClientRect();
  const popup = el("div", { class: "odon-depth-popup" });
  const active = activeTooth != null ? toothState.get(activeTooth) : null;
  // SP6 Task 2 (step 1): the popup is CONTEXTUAL. A surface that carries a
  // filling is a (potential) recurrent-caries surface → show the CARS group and
  // the "Recurrent caries – {surface}" title; a filling-free surface is primary
  // caries → show the depth group and the "Caries – {surface}" title. Never both.
  const hasFilling = !!active?.fillingSurfaceMaterials?.has(surface);
  const titleKey = hasFilling ? "caries.recurrentTitle" : "caries.primaryTitle";
  popup.appendChild(el("div", { class: "odon-depth-title", text: `${t(titleKey)} – ${t(surfaceLabelKey(surface, toothNo))}` }));
  const addGroup = (
    labelKey: string,
    options: Array<{ value: Any; label: string; title?: string }>,
    current: Any,
    onPick: (value: Any) => void,
  ) => {
    if(!options || options.length === 0) return;
    popup.appendChild(el("div", { class: "odon-depth-group-label", text: t(labelKey) }));
    for(const opt of options){
      const btn = el("button", { class: "odon-depth-option", text: opt.label }) as HTMLButtonElement;
      btn.title = opt.title || "";
      if(current != null && String(opt.value) === String(current)) btn.classList.add("is-active");
      btn.addEventListener("click", (e: Any)=>{
        e.stopPropagation();
        onPick(opt.value);
        hideCariesDepthPopup();
      });
      popup.appendChild(btn);
    }
  };

  // SP6 Task 2 (step 1): show exactly ONE severity group by context. Both groups
  // write the single unified `cariesSeverity` (read as ICDAS on a primary
  // surface, CARS on a recurrent one); the context — filling present or not —
  // decides which labels the user sees and which transition a pick performs.
  if(hasFilling){
    // Recurrent (secondary) caries: CARS 0..6 only. Score 0 removes the caries
    // from the surface (revert to a plain filling); score > 0 adds it (→ becomes
    // recurrent, `subcaries-{surface}`). A filling-only surface reaches this via
    // its own dark-border indicator, so recurrent caries can be authored here.
    addGroup("caries.secondaryLabel", secondaryCariesOptions(), active?.cariesSeverity?.get(surface) ?? 0, (value)=>{
      applyToSelected((s)=>{ applyRecurrentCariesScore(s, surface, Number(value)); });
    });
  }else if(cariesDepthEnabled){
    // Primary caries: visual depth (ICDAS / 3-level) only — gated by
    // `cariesDepthEnabled`. Writes the ICDAS value onto the caried surface.
    addGroup("caries.depthLabel", getCariesDepthOptions(), active?.cariesSeverity?.get(surface), (value)=>{
      applyToSelected((s)=>{
        if(s.caries.has(`caries-${surface}`)) s.cariesSeverity.set(surface, Number(value));
      });
    });
  }
  // Radiographic depth — only when the mode is on (else options is []).
  addGroup("caries.radiographicLabel", radiographicDepthOptions(), active?.radiographicDepth?.get(surface) ?? "none", (value)=>{
    applyToSelected((s)=>{ applyRadiographicDepth(s.radiographicDepth, surface, String(value)); });
  });

  document.body.appendChild(popup);
  // Position below-right of the indicator, clamped to the viewport.
  const pw = popup.offsetWidth || 140;
  const left = Math.min(rect.left, window.innerWidth - pw - 8);
  const top = Math.min(rect.bottom + 4, window.innerHeight - popup.offsetHeight - 8);
  popup.style.left = `${Math.max(8, left)}px`;
  popup.style.top = `${Math.max(8, top)}px`;
  // Close on outside click / Escape.
  const onDoc = (e: Any)=>{ if(!popup.contains(e.target)){ cleanup(); } };
  const onKey = (e: Any)=>{ if(e.key === "Escape") cleanup(); };
  function cleanup(){
    hideCariesDepthPopup();
    document.removeEventListener("mousedown", onDoc, true);
    document.removeEventListener("keydown", onKey, true);
  }
  setTimeout(()=>{
    document.addEventListener("mousedown", onDoc, true);
    document.addEventListener("keydown", onKey, true);
  }, 0);
}

/** SP10 Task 3: small dedicated anchored popup to author the structural
 *  filling-defect (`none` | `marginal` | `fracture` | `wear`) on ONE filled
 *  surface, opened from the LEFT-side `.surf-defect` indicator. Reuses
 *  {@link hideCariesDepthPopup}'s shared close/teardown, and the SAME
 *  positioning + outside-click/Escape close registration as
 *  {@link showCariesDepthPopup} — only the option set differs. */
function showFillingDefectPopup(surface: string, anchor: HTMLElement, toothNo?: number | null){
  hideCariesDepthPopup(); // reuse the shared close/teardown
  const active = activeTooth != null ? toothState.get(activeTooth) : null;
  if(!active?.fillingSurfaceMaterials?.has(surface)) return;
  const rect = anchor.getBoundingClientRect();
  const popup = el("div", { class: "odon-depth-popup" });
  popup.appendChild(el("div", { class: "odon-depth-title", text: `${t("fillingDefect.label")} – ${t(surfaceLabelKey(surface, toothNo))}` }));
  const current = active?.fillingDefect?.get(surface) ?? "none";
  const group = el("div", { class: "odon-depth-group" });
  for(const value of ["none", "marginal", "fracture", "wear"]){
    const btn = el("button", { class: "odon-depth-option" + (value === current ? " is-active" : ""), text: t("fillingDefect." + value) }) as HTMLButtonElement;
    btn.addEventListener("click", (e: Any)=>{
      e.stopPropagation();
      applyToSelected((s)=>{ applyFillingDefect(s.fillingDefect, surface, value); });
      hideCariesDepthPopup();
    });
    group.appendChild(btn);
  }
  popup.appendChild(group);
  document.body.appendChild(popup);
  // Position below-right of the indicator, clamped to the viewport — same as showCariesDepthPopup.
  const pw = popup.offsetWidth || 140;
  const left = Math.min(rect.left, window.innerWidth - pw - 8);
  const top = Math.min(rect.bottom + 4, window.innerHeight - popup.offsetHeight - 8);
  popup.style.left = `${Math.max(8, left)}px`;
  popup.style.top = `${Math.max(8, top)}px`;
  // Close on outside click / Escape — same registration as showCariesDepthPopup.
  const onDoc = (e: Any)=>{ if(!popup.contains(e.target)){ cleanup(); } };
  const onKey = (e: Any)=>{ if(e.key === "Escape") cleanup(); };
  function cleanup(){
    hideCariesDepthPopup();
    document.removeEventListener("mousedown", onDoc, true);
    document.removeEventListener("keydown", onKey, true);
  }
  setTimeout(()=>{
    document.addEventListener("mousedown", onDoc, true);
    document.addEventListener("keydown", onKey, true);
  }, 0);
}

// ---- Touch: Pinch-to-zoom ----
function getTouchDist(t1: Touch, t2: Touch){
  const dx = t1.clientX - t2.clientX;
  const dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function onGridTouchStart(e: TouchEvent){
  if(e.touches.length === 2){
    isPinching = true;
    pinchStartDist = getTouchDist(e.touches[0], e.touches[1]);
    const grid = $("#toothGrid") as HTMLElement | null;
    if(grid) grid.classList.add("odon-pinch-active");
    e.preventDefault();
  }
}

function onGridTouchMove(e: TouchEvent){
  if(isPinching && e.touches.length === 2){
    const dist = getTouchDist(e.touches[0], e.touches[1]);
    const scale = Math.max(0.5, Math.min(3, (dist / pinchStartDist) * pinchScale));
    const grid = $("#toothGrid") as HTMLElement | null;
    if(grid) grid.style.transform = `scale(${scale})`;
    e.preventDefault();
  }
}

function onGridTouchEnd(e: TouchEvent){
  if(isPinching && e.touches.length < 2){
    isPinching = false;
    const grid = $("#toothGrid") as HTMLElement | null;
    if(grid){
      // Read current scale from transform
      const match = grid.style.transform.match(/scale\(([\d.]+)\)/);
      pinchScale = match ? parseFloat(match[1]) : 1;
      // Snap back to 1 if close
      if(pinchScale > 0.9 && pinchScale < 1.1){
        pinchScale = 1;
        grid.style.transform = "";
        grid.classList.remove("odon-pinch-active");
      }
    }
  }
}

// ---- Touch: Arch toggle bar ----
function buildArchToggle(){
  const grid = $("#toothGrid") as HTMLElement | null;
  if(!grid) return;
  // Remove existing
  if(archToggleBar) archToggleBar.remove();

  archToggleBar = el("div", { class: "odon-arch-toggle" });
  const btnUpper = el("button", { class: "odon-arch-btn", text: t("touch.arch.upper") });
  const btnLower = el("button", { class: "odon-arch-btn", text: t("touch.arch.lower") });
  const btnBoth = el("button", { class: "odon-arch-btn active", text: t("touch.arch.both") });

  function setArch(mode: "both" | "upper" | "lower"){
    archMode = mode;
    btnUpper.classList.toggle("active", mode === "upper");
    btnLower.classList.toggle("active", mode === "lower");
    btnBoth.classList.toggle("active", mode === "both");
    grid!.classList.toggle("odon-arch-upper", mode === "upper");
    grid!.classList.toggle("odon-arch-lower", mode === "lower");
  }

  btnUpper.addEventListener("click", () => setArch(archMode === "upper" ? "both" : "upper"));
  btnLower.addEventListener("click", () => setArch(archMode === "lower" ? "both" : "lower"));
  btnBoth.addEventListener("click", () => setArch("both"));

  archToggleBar.appendChild(btnUpper);
  archToggleBar.appendChild(btnBoth);
  archToggleBar.appendChild(btnLower);

  // Insert before the grid
  grid.parentElement?.insertBefore(archToggleBar, grid);
}

function refreshArchToggleLabels(){
  if(!archToggleBar) return;
  const btns = archToggleBar.querySelectorAll(".odon-arch-btn");
  if(btns[0]) btns[0].textContent = t("touch.arch.upper");
  if(btns[1]) btns[1].textContent = t("touch.arch.both");
  if(btns[2]) btns[2].textContent = t("touch.arch.lower");
}

// ---- Touch: tile event wiring ----
function addTouchToTile(tile: HTMLElement, toothNo: number){
  tile.addEventListener("touchstart", (e: TouchEvent) => {
    if(readOnly) return;
    if(e.touches.length !== 1) return;
    touchStartTime = Date.now();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchMoved = false;

    const touch = e.touches[0];
    longPressTimer = setTimeout(() => {
      if(!touchMoved){
        showContextMenu(toothNo, touch);
      }
    }, LONG_PRESS_MS);
  }, { passive: true });

  tile.addEventListener("touchmove", (e: TouchEvent) => {
    if(e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if(Math.abs(dx) > TOUCH_MOVE_THRESHOLD || Math.abs(dy) > TOUCH_MOVE_THRESHOLD){
      touchMoved = true;
      if(longPressTimer){ clearTimeout(longPressTimer); longPressTimer = null; }
    }
  }, { passive: true });

  tile.addEventListener("touchend", (e: TouchEvent) => {
    if(readOnly) return;
    if(longPressTimer){ clearTimeout(longPressTimer); longPressTimer = null; }
    const elapsed = Date.now() - touchStartTime;
    if(!touchMoved && elapsed < LONG_PRESS_MS){
      // Short tap — show zoom popover on touch devices
      e.preventDefault(); // prevent click from also firing
      showZoomPopover(toothNo);
    }
  });
}

function onToothClick(toothNo: Any, evt: Any){
  if(readOnly) return;
  const multi = evt.metaKey || evt.ctrlKey;
  if(multi){
    if(selectedTeeth.has(toothNo)){
      selectedTeeth.delete(toothNo);
    }else{
      selectedTeeth.add(toothNo);
      activeTooth = toothNo;
    }
  }else{
    selectedTeeth = new Set([toothNo]);
    activeTooth = toothNo;
  }
  if(activeTooth && !selectedTeeth.has(activeTooth)){
    activeTooth = selectedTeeth.values().next().value ?? null;
  }
  updateSelectionUI();
}

// ---- Keyboard accessibility ----
const NAV_ROWS = [
  [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28],
  [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38],
];

function isTileNavigable(toothNo: number): boolean{
  const tiles = toothTile.get(toothNo);
  if(!tiles || tiles.length === 0) return false;
  return tiles.some(t => !t.classList.contains("wisdom-hidden") && !t.classList.contains("placeholder"));
}

function navigateToTooth(currentTooth: number, direction: string){
  const rowIdx = NAV_ROWS.findIndex(r => r.includes(currentTooth));
  if(rowIdx < 0) return;
  const row = NAV_ROWS[rowIdx];
  const colIdx = row.indexOf(currentTooth);

  let targetTooth: number | null = null;
  if(direction === "ArrowRight"){
    for(let i = colIdx + 1; i < row.length; i++){
      if(isTileNavigable(row[i])){ targetTooth = row[i]; break; }
    }
  }else if(direction === "ArrowLeft"){
    for(let i = colIdx - 1; i >= 0; i--){
      if(isTileNavigable(row[i])){ targetTooth = row[i]; break; }
    }
  }else if(direction === "ArrowDown"){
    if(rowIdx < NAV_ROWS.length - 1){
      const nextRow = NAV_ROWS[rowIdx + 1];
      const nextCol = Math.min(colIdx, nextRow.length - 1);
      for(let i = nextCol; i < nextRow.length; i++){
        if(isTileNavigable(nextRow[i])){ targetTooth = nextRow[i]; break; }
      }
      if(!targetTooth){
        for(let i = nextCol - 1; i >= 0; i--){
          if(isTileNavigable(nextRow[i])){ targetTooth = nextRow[i]; break; }
        }
      }
    }
  }else if(direction === "ArrowUp"){
    if(rowIdx > 0){
      const prevRow = NAV_ROWS[rowIdx - 1];
      const prevCol = Math.min(colIdx, prevRow.length - 1);
      for(let i = prevCol; i < prevRow.length; i++){
        if(isTileNavigable(prevRow[i])){ targetTooth = prevRow[i]; break; }
      }
      if(!targetTooth){
        for(let i = prevCol - 1; i >= 0; i--){
          if(isTileNavigable(prevRow[i])){ targetTooth = prevRow[i]; break; }
        }
      }
    }
  }

  if(targetTooth !== null){
    const tiles = toothTile.get(targetTooth);
    const sideTile = tiles?.find((t: HTMLElement) => t.classList.contains("side-view"));
    if(sideTile) sideTile.focus();
  }
}

function onToothKeydown(toothNo: number, evt: KeyboardEvent){
  if(readOnly) return;
  switch(evt.key){
    case "Enter":
    case " ":
      evt.preventDefault();
      onToothClick(toothNo, evt);
      break;
    case "ArrowRight":
    case "ArrowLeft":
    case "ArrowUp":
    case "ArrowDown":
      evt.preventDefault();
      navigateToTooth(toothNo, evt.key);
      break;
    case "Escape":
      evt.preventDefault();
      clearSelection();
      break;
  }
}

function updateToothTileVisibility(){
  const hiddenSet = new Set([18,28,38,48]);
  for(const toothNo of ALL_TEETH){
    const tiles = toothTile.get(toothNo);
    if(!tiles) continue;
    const hide = !wisdomVisible && hiddenSet.has(toothNo);
    for(const tile of tiles){
      tile.classList.toggle("wisdom-hidden", hide);
      if(tile.hasAttribute("role")){
        tile.setAttribute("tabindex", hide || readOnly ? "-1" : "0");
        if(hide) tile.setAttribute("aria-hidden", "true");
        else tile.removeAttribute("aria-hidden");
      }
    }
  }
  selectedTeeth = new Set([...selectedTeeth].filter(tn => {
    const tiles = toothTile.get(tn);
    if(!tiles || tiles.length === 0) return true;
    return !tiles.every(tile => tile.classList.contains("wisdom-hidden"));
  }));
  if(activeTooth && !selectedTeeth.has(activeTooth)){
    activeTooth = selectedTeeth.values().next().value ?? null;
  }
  updateSelectionUI();
}

function setEdentulous(on: Any){
  if(on){
    // DS-1: turning on whole-mouth edentulous is a STRUCTURAL interactive edit
    // (not a reset), so route it through the batch gate — in plan mode every
    // changed tooth is marked plan-edited; in status mode (plan initialized)
    // every changed tooth NOT already plan-edited mirrors status->plan (planned
    // teeth diverge). Only teeth that ACTUALLY change (were not already sound-
    // missing) are passed to the gate, so an already-missing tooth's plan is
    // left untouched (per-tooth no-op signaling). Uninitialized plan stays a
    // pure passthrough (byte-identical to the pre-dual-state behavior).
    const missingKey = JSON.stringify(serializeState((()=>{ const s = defaultState(); s.toothSelection = "none"; return s; })()));
    const changed = ALL_TEETH.filter(tn => JSON.stringify(serializeState(toothState.get(tn) ?? defaultState())) !== missingKey);
    // DS-1 (review Fix 3): set the `edentulous` global + the toggle-button state
    // INSIDE the gated closure, NOT synchronously before it resolves. On the
    // deferred-confirm path they must take effect only on Accept — otherwise
    // Cancel (which never runs this closure) would leave `edentulous === true`
    // while every tooth is untouched, so getStatusChart().globals.edentulous
    // would export a wrong flag. `notifyStateChange()` also moves inside so the
    // whole-mouth refresh fires when the batch actually applies.
    gateToothEditBatch(changed, ()=>{
      edentulous = true;
      setToggleButton($("#btnEdentulous"), edentulous);
      suppressEdentulousSync = true;
      for(const toothNo of ALL_TEETH){
        const s = defaultState();
        s.toothSelection = "none";
        toothState.set(toothNo, s);
        applyStateToSvg(toothNo);
        updateToothTileNumber(toothNo);
      }
      suppressEdentulousSync = false;
      if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
      notifyStateChange();
    });
    return;
  }
  // Un-setting edentulous is not a per-tooth structural edit (it touches no tooth
  // state here), so it applies immediately and is never gated.
  edentulous = false;
  setToggleButton($("#btnEdentulous"), edentulous);
  notifyStateChange();
}

/** Toggle visibility of wisdom teeth (18, 28, 38, 48). */
function setWisdomVisible(on: Any){
  wisdomVisible = !!on;
  setToggleButton($("#btnWisdomVisible"), wisdomVisible);
  updateToothTileVisibility();
  // Wisdom teeth fade via opacity (no size change), so the ResizeObserver won't
  // fire — redraw the bridge overlay explicitly so a span onto a wisdom tooth stays current.
  updateBridgeOverlay();
}

/** Toggle visibility of the bone/gum base layer on all teeth. */
function setShowBase(on: Any){
  showBase = on;
  setToggleButton($("#btnBoneVisible"), showBase);
  for(const toothNo of ALL_TEETH){
    applyStateToSvg(toothNo);
  }
}

/** Toggle visibility of occlusal-view tiles (premolars and molars). */
function setOcclusalVisible(on: Any){
  occlusalVisible = !!on;
  setToggleButton($("#btnOcclView"), occlusalVisible);
  $$(".tooth-tile.occl-view").forEach(tile => {
    tile.classList.toggle("occl-hidden", !occlusalVisible);
  });
  // Occlusal rows change grid height — redraw immediately instead of waiting for
  // the debounced ResizeObserver, so bridge bars don't sit at a stale Y.
  updateBridgeOverlay();
}

/** Toggle visibility of the healthy-pulp layer on all teeth. */
function setHealthyPulpVisible(on: Any){
  showHealthyPulp = !!on;
  setToggleButton($("#btnPulpVisible"), showHealthyPulp);
  for(const toothNo of ALL_TEETH){
    applyStateToSvg(toothNo);
  }
}

function serializeState(s: Any){
  return {
    toothSelection: s.toothSelection,
    pulpDx: s.pulpDx,
    // SP4 Task 5: pulpLatin (practical-Latin subtype) and apicalDx (apical AAE
    // diagnosis) are now authorable in the diagnosis UI, so they join the
    // serialized payload — this is also what feeds the FHIR export (both are
    // already mapped in FIELD_MAPPINGS). Both round-trip via fromRaw below.
    pulpLatin: s.pulpLatin,
    apicalDx: s.apicalDx,
    endoResection: !!s.endoResection,
    resorptionType: s.resorptionType,
    // SP18: peri-implant status (mucositis / peri-implantitis staging) was
    // authored, rendered, and read back by hydrateState, but omitted here —
    // an SP8 omission that silently dropped it on export/import. Fixed by
    // adding it alongside the other enum-axis fields.
    periImplant: s.periImplant,
    mods: Array.from(s.mods || []),
    periapicalType: s.periapicalType,
    endo: s.endo,
    caries: Array.from(s.caries || []),
    cariesActiveDepth: s.cariesActiveDepth,
    // SP6 Task 1: the unified per-surface severity replaces the SP5
    // `cariesDepths` + `secondaryCaries` pair. Serialized like `cariesDepths`
    // was (Record<surface,number>). Payload version bumped to 2.4.
    cariesSeverity: Object.fromEntries(s.cariesSeverity || new Map()),
    fillingMaterial: s.fillingMaterial,
    fillingSurfaces: Array.from(s.fillingSurfaces || []),
    fillingSurfaceMaterials: Object.fromEntries(s.fillingSurfaceMaterials || new Map()),
    fissureSealing: !!s.fissureSealing,
    calculus: !!s.calculus,
    contactMesial: !!s.contactMesial,
    contactDistal: !!s.contactDistal,
    wearEdge: s.wearEdge,
    wearCervical: s.wearCervical,
    discoloration: s.discoloration,
    orthoAppliance: s.orthoAppliance,
    orthoDrift: s.orthoDrift,
    orthoVertical: s.orthoVertical,
    orthoRotation: !!s.orthoRotation,
    brokenMesial: !!s.brokenMesial,
    brokenIncisal: !!s.brokenIncisal,
    brokenDistal: !!s.brokenDistal,
    extractionWound: !!s.extractionWound,
    extractionPlan: !!s.extractionPlan,
    parapulpalPin: !!s.parapulpalPin,
    crownReplace: !!s.crownReplace,
    crownNeeded: !!s.crownNeeded,
    missingClosed: !!s.missingClosed,
    bridgePillar: !!s.bridgePillar,
    prosthesis: s.prosthesis,
    mobility: s.mobility,
    toothSubstrate: s.toothSubstrate,
    restorationType: s.restorationType,
    restorationMaterial: s.restorationMaterial,
    crownLeakage: !!s.crownLeakage,
    rootCaries: s.rootCaries,
    radiographicDepth: Object.fromEntries(s.radiographicDepth || new Map()),
    fillingDefect: Object.fromEntries(s.fillingDefect || new Map()),
    // SP-perio P1 Task 1: omitted ENTIRELY when no site is charted (mirrors
    // the customStates/note pattern below) — a no-perio tooth/payload stays
    // byte-identical to its pre-perio serialization.
    ...((s.perio?.pd?.size ?? 0) > 0 ? { perio: {
      pd: Object.fromEntries(s.perio.pd),
      gm: Object.fromEntries(s.perio.gm),
      bop: Array.from(s.perio.bop),
      sup: Array.from(s.perio.sup),
    } } : {}),
    // SP-perio P2b Task 2: omitted ENTIRELY when no entrance is graded, same
    // convention as `perio` above — a no-furcation tooth/payload stays
    // byte-identical to its pre-furcation serialization.
    ...((s.furcation?.size ?? 0) > 0 ? { furcation: Object.fromEntries(s.furcation) } : {}),
    // SP-perio P2b Task 3: omitted ENTIRELY when no surface has plaque, same
    // convention as `perio`/`furcation` above (additive) — a no-plaque
    // tooth/payload stays byte-identical apart from the version field.
    ...((s.plaque?.size ?? 0) > 0 ? { plaque: Array.from(s.plaque) } : {}),
    // SP-perio PG-D Task 1: pi/gi are emitted ONLY when at least one surface
    // is graded, same omit-when-empty convention as perio/furcation/plaque
    // above — a tooth never touched by PI/GI stays byte-identical apart from
    // the version bump (payload 2.15).
    ...((s.pi?.size ?? 0) > 0 ? { pi: Object.fromEntries(s.pi) } : {}),
    ...((s.gi?.size ?? 0) > 0 ? { gi: Object.fromEntries(s.gi) } : {}),
    ...((s.mpi?.size ?? 0) > 0 ? { mpi: Object.fromEntries(s.mpi) } : {}),
    ...((s.mbi?.size ?? 0) > 0 ? { mbi: Object.fromEntries(s.mbi) } : {}),
    // SP-perio PG-D Task 2: keratinized gingiva width — omitted ENTIRELY when
    // not charted (null), same omit-when-empty convention as pi/gi above — a
    // tooth never touched by KG stays byte-identical (payload stays 2.15,
    // Task 1 already bumped it).
    ...(s.kg != null ? { kg: s.kg } : {}),
    // SP-perio PG-C Task 2: cejVisibility/rootConcavity are emitted ONLY when set
    // (!== "none"), like the omit-when-empty perio fields above — a default tooth
    // stays byte-identical (payload bumped to 2.14). Both round-trip via
    // validateEnum in hydrateState (default "none").
    ...(s.cejVisibility && s.cejVisibility !== "none" ? { cejVisibility: s.cejVisibility } : {}),
    ...(s.rootConcavity && s.rootConcavity !== "none" ? { rootConcavity: s.rootConcavity } : {}),
    // SP-perio PG-D Task 3: gingivalThickness/millerClass are emitted ONLY
    // when set (!== their skip value), like cejVisibility/rootConcavity above
    // — a default tooth stays byte-identical (payload stays 2.15). Both
    // round-trip via validateEnum in hydrateState.
    ...(s.gingivalThickness && s.gingivalThickness !== "unknown" ? { gingivalThickness: s.gingivalThickness } : {}),
    ...(s.millerClass && s.millerClass !== "none" ? { millerClass: s.millerClass } : {}),
    ...(Object.keys(s.customStates || {}).length > 0 ? { customStates: s.customStates } : {}),
    ...(s.note ? { note: s.note } : {}),
  };
}

// Allowed values for imported state fields
export const VALID_TOOTH_SELECTION = validValues("toothSelection");
export const VALID_ENDO = validValues("endo");
export const VALID_FILLING_MATERIAL = validValues("fillingMaterial");
export const VALID_PROSTHESIS = validValues("prosthesis");
export const VALID_MOBILITY = validValues("mobility");
export const VALID_TOOTH_SUBSTRATE = validValues("toothSubstrate");
export const VALID_RESTORATION_TYPE = validValues("restorationType");
export const VALID_RESTORATION_MATERIAL = validValues("restorationMaterial");
export const VALID_MODS = validValues("mods");
export const VALID_PERIAPICAL_TYPE = validValues("periapicalType");
export const VALID_CARIES = validValues("caries");
// SP4 Task 1: pulp/apical/resorption diagnosis axes (additive; unused until
// later SP4 tasks wire up render/migration/validate).
export const VALID_PULP_DX = validValues("pulpDx");
export const VALID_PULP_LATIN = validValues("pulpLatin");
export const VALID_APICAL_DX = validValues("apicalDx");
export const VALID_RESORPTION_TYPE = validValues("resorptionType");
export const VALID_WEAR_EDGE = validValues("wearEdge");
export const VALID_WEAR_CERVICAL = validValues("wearCervical");
export const VALID_DISCOLORATION = validValues("discoloration");
// SP14 Task 1: orthodontic axes foundation (additive; see registry/axes.ts).
export const VALID_ORTHO_APPLIANCE = validValues("orthoAppliance");
export const VALID_ORTHO_DRIFT = validValues("orthoDrift");
export const VALID_ORTHO_VERTICAL = validValues("orthoVertical");
const VALID_CARIES_DEPTH = new Set(["surface","dentin","deep"]);
export const VALID_FILLING_SURFACES = validSurfaces();
// SP5/SP6: caries fields. `rootCaries` is a registered axis, so it reads from
// AXES like every other enum. `cariesSeverity` (unified 0..6 visual severity)
// and `radiographicDepth` are per-surface scalar-map fields with no axis of
// their own, so their valid sets are literal here. `VALID_CARS` is retained for
// reading the retired SP5 `secondaryCaries` map off legacy raw payloads during
// migration (see hydrateState).
export const VALID_ROOT_CARIES = validValues("rootCaries");
// SP8 Task 1: peri-implantitis foundation (registry axis; unused until later
// SP8 tasks wire up render/migration/UI).
export const VALID_PERI_IMPLANT = validValues("periImplant");
// SP-perio PG-C Task 2: the two new categorical data axes (registry axes; read
// from AXES like every other enum).
export const VALID_CEJ_VISIBILITY = validValues("cejVisibility");
export const VALID_ROOT_CONCAVITY = validValues("rootConcavity");
// SP-perio PG-D Task 3: the two new categorical data axes (registry axes; read
// from AXES like every other enum).
export const VALID_GINGIVAL_THICKNESS = validValues("gingivalThickness");
export const VALID_MILLER_CLASS = validValues("millerClass");
export const VALID_CARS = new Set([0, 1, 2, 3, 4, 5, 6]);
export const VALID_CARIES_SEVERITY = new Set([0, 1, 2, 3, 4, 5, 6]);
export const VALID_RADIOGRAPHIC_DEPTH = new Set(["none", "E1", "E2", "D1", "D2", "D3"]);
export const VALID_FILLING_DEFECT = new Set(["none", "marginal", "fracture", "wear"]);
export const VALID_FILLING_DEFECT_SET = new Set(["marginal", "fracture", "wear"]); // non-none, valid stored values
// SP-perio P2b Task 2: the union of every entrance value furcationEntrances()
// can ever return, across all tooth positions — used by hydrateState to
// validate a raw payload's `furcation` keys generically (hydrateState has no
// tooth-position context to call furcationEntrances(toothNo) itself, exactly
// like VALID_FILLING_SURFACES/VALID_RADIOGRAPHIC_DEPTH above are validated
// against a tooth-independent set, not a per-tooth one). setFurcation(), by
// contrast, DOES know the tooth and validates against the exact per-tooth set.
export const VALID_FURCATION_ENTRANCE = new Set(["mesial", "distal", "buccal", "lingual"]);
export const VALID_FURCATION_GRADE = new Set([1, 2, 3, 4]); // Glickman I-IV
// SP-perio P2b Task 3: the 4 fixed O'Leary plaque-index surfaces — the SAME
// set for every tooth (unlike VALID_FURCATION_ENTRANCE, which is filtered
// per-tooth-position by furcationEntrances()), so both setPlaque() and
// hydrateState() validate directly against this one constant.
export const VALID_PLAQUE_SURFACE = new Set(["mesial", "distal", "buccal", "lingual"]);

function filterSet(arr: Any, allowed: Set<string>): Set<string>{
  if(!Array.isArray(arr)) return new Set();
  return new Set(arr.filter((v: Any) => typeof v === "string" && allowed.has(v)));
}

function validateEnum(value: Any, allowed: Set<string>, fallback: string): string{
  return typeof value === "string" && allowed.has(value) ? value : fallback;
}

// SP-perio P1 Task 1: clinical ranges for the two perio scalar fields.
type PerioField = "pd" | "gm";
const PERIO_RANGES: Record<PerioField, [number, number]> = { pd: [1, 15], gm: [-10, 20] };

/**
 * Validate + clamp a perio `pd`/`gm` value. Returns the clamped integer
 * within the field's clinical range, or `null` for a value the field can't
 * represent at all: a non-integer/non-finite `v` (reject signal — the caller
 * must leave state untouched), or — for `pd` specifically — a value below the
 * minimum (0, negative), which doubles as the "un-chart this site" signal
 * `setPerioSite`/`hydrateState` rely on (a probing depth of 0 isn't a
 * clinical reading, it's "not probed"). `gm` has no such floor signal: it
 * clamps to its minimum like its maximum, since a coronal/pseudopocket
 * reading past -10mm is still a valid (if extreme) reading, not an absence.
 * Shared verbatim by setPerioSite (live edits) and hydrateState (payload
 * import), so both paths enforce identical bounds.
 */
function clampPerio(field: PerioField, v: unknown): number | null {
  if(typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v)) return null;
  const [min, max] = PERIO_RANGES[field];
  if(field === "pd" && v < min) return null;
  return Math.min(max, Math.max(min, v));
}

/**
 * SP5 final review (FIX 1): is a payload version older than 2.3?
 *
 * Payloads before 2.3 never stored an explicit per-surface `secondaryCaries`
 * CARS score — recurrent/secondary caries was DERIVED at render/summary time
 * from `caries ∩ fillingSurfaceMaterials`. So for a legacy payload we must
 * re-infer that intersection into an explicit score 3 on hydrate. A native 2.3+
 * payload, by contrast, stores the score deliberately: a caried surface with a
 * filling and NO recurrent score means the clinician left it primary, and we
 * must NOT flip it to recurrent on export→reimport.
 *
 * A missing/blank/non-string version is treated as legacy (pre-versioned or
 * pre-2.3 payloads had no version tag). Comparison is dotted-numeric so 1.4 <
 * 2.2 < 2.3 < 2.10 order correctly (not string-lexicographic).
 */
function isLegacyPayloadVersion(version: unknown): boolean {
  if(typeof version !== "string" || version.trim() === "") return true;
  const parse = (v: string) => v.split(".").map((p) => { const n = parseInt(p, 10); return Number.isFinite(n) ? n : 0; });
  const a = parse(version);
  const b = [2, 3, 0]; // threshold: 2.3.0
  for(let i = 0; i < Math.max(a.length, b.length); i++){
    const x = a[i] ?? 0, y = b[i] ?? 0;
    if(x !== y) return x < y;
  }
  return false; // exactly 2.3.0 → not legacy
}

/**
 * @param inferLegacySecondaryCaries When true (the DEFAULT — preserves every
 *   internal seam/preset/version-less caller and the existing SVG goldens), a
 *   surface present in BOTH `caries` and `fillingSurfaceMaterials` with no
 *   stored severity is given the canonical recurrent `cariesSeverity` value 3
 *   (SP6 Task 1: the surface is recurrent regardless — this only fixes its CARS
 *   opacity). The JSON/FHIR import path passes `false` for native ≥2.3 payloads
 *   so a caried+filled surface with no stored value keeps the render default.
 */
function hydrateState(raw: Any, inferLegacySecondaryCaries = true){
  const s = defaultState();
  if(!raw || typeof raw !== "object") return s;
  // Legacy migration (payload < 2.0): the flat `crownMaterial` enum and the
  // FIXED `bridgeUnit` values split into `toothSubstrate` +
  // `restorationType`×`restorationMaterial`. Detected by the absence of the new
  // `restorationType` field (mirrors the fillingSurfaceMaterials v1.3 fallback).
  // Unknown/absent values fall through to defaults; never throws.
  const legacyFixedBridge = raw.bridgeUnit === "zircon" || raw.bridgeUnit === "metal" || raw.bridgeUnit === "temporary";
  if(raw.restorationType === undefined && (raw.crownMaterial !== undefined || legacyFixedBridge)){
    const cm = typeof raw.crownMaterial === "string" ? raw.crownMaterial : "natural";
    if(cm === "natural" || cm === "radix" || cm === "broken" || cm === "crownprep"){
      raw.toothSubstrate = cm;
      raw.restorationType = "none";
      raw.restorationMaterial = "none";
      raw.crownMaterial = "natural";
    }else if(cm === "metal"){
      // Legacy "metal" crown = PFM → metal-ceramic (deliberate rename).
      raw.toothSubstrate = "crownprep";
      raw.restorationType = "crown";
      raw.restorationMaterial = "metal-ceramic";
      raw.crownMaterial = "natural";
    }else if(["emax","zircon","temporary","telescope","gold","gradia"].includes(cm)){
      raw.toothSubstrate = "crownprep";
      raw.restorationType = "crown";
      raw.restorationMaterial = cm;
      raw.crownMaterial = "natural";
    }else{
      // Implant attachments (healing-abutment/locator/bar…): preserved in
      // `crownMaterial` for the interim render path (absorbed by SP3b).
      raw.restorationType = "none";
      raw.restorationMaterial = "none";
    }
    // Fixed bridge values fold into restorationType:bridge × material; removable/
    // bar values stay on `bridgeUnit` (legacy path, retained through SP3a).
    if(raw.bridgeUnit === "zircon" || raw.bridgeUnit === "metal" || raw.bridgeUnit === "temporary"){
      raw.restorationType = "bridge";
      raw.restorationMaterial = raw.bridgeUnit === "metal" ? "metal-ceramic" : raw.bridgeUnit;
      raw.bridgeUnit = "none";
    }
  }
  // SP3b FIX 1: a v1.14.0 (payload 2.0) implant FIXED crown was serialized by the
  // SP3a interim defer as {toothSelection:"implant", restorationType:"none",
  // restorationMaterial:"none", crownMaterial:<fixed material>}. The legacy block
  // above is gated on restorationType===undefined so it skips this (restorationType
  // is "none", not absent), and the prosthesis-migration below only maps ATTACHMENT
  // crownMaterial values — so the crown would silently vanish. Fold a fixed-crown
  // crownMaterial on an implant (restorationType absent OR "none") into
  // restorationType:"crown" × material, mirroring the 1.4 fold + metal→metal-ceramic
  // rename. Attachment crownMaterial values (healing-abutment/locator/bar…) are not
  // in this set, so they fall through to the prosthesis migration untouched.
  const FIXED_CROWN_MATERIALS = ["emax", "zircon", "gold", "gradia", "metal", "telescope", "temporary"];
  if(raw.toothSelection === "implant"
     && (raw.restorationType === undefined || raw.restorationType === "none")
     && typeof raw.crownMaterial === "string"
     && FIXED_CROWN_MATERIALS.includes(raw.crownMaterial)){
    raw.restorationType = "crown";
    raw.restorationMaterial = raw.crownMaterial === "metal" ? "metal-ceramic" : raw.crownMaterial;
    raw.crownMaterial = "natural";
  }
  // SP3b field-move: migrate the legacy implant-attachment (`crownMaterial` on an
  // implant tooth) and removable/bar-denture (`bridgeUnit` on a gap tooth) values
  // onto the new `prosthesis` axis when no explicit `prosthesis` was supplied —
  // whether this payload is old-format (migrated above) or was written by the
  // interim SP3a/SP3b-foundation engine (restorationType already defined, but
  // `prosthesis` never serialized before this task). Gated by the SAME context
  // the legacy render branches required (isImplant / isNone): an attachment value
  // sitting on an unrelated toothSelection (only reachable via crafted/imported
  // payloads, never the UI) must not gain a `prosthesis` value it never rendered.
  if(raw.prosthesis === undefined){
    const CROWN_MATERIAL_TO_PROSTHESIS: Record<string, string> = {
      "healing-abutment": "healing-abutment",
      "locator": "locator",
      "locator-prosthesis": "locator-denture",
      "bar": "bar",
      "bar-prosthesis": "bar-denture",
    };
    const BRIDGE_UNIT_TO_PROSTHESIS: Record<string, string> = {
      "removable": "removable-partial",
      "bar": "bar",
      "bar-prosthesis": "bar-denture",
    };
    if(raw.toothSelection === "implant" && typeof raw.crownMaterial === "string" && CROWN_MATERIAL_TO_PROSTHESIS[raw.crownMaterial]){
      raw.prosthesis = CROWN_MATERIAL_TO_PROSTHESIS[raw.crownMaterial];
    }else if(raw.toothSelection === "none" && typeof raw.bridgeUnit === "string" && BRIDGE_UNIT_TO_PROSTHESIS[raw.bridgeUnit]){
      raw.prosthesis = BRIDGE_UNIT_TO_PROSTHESIS[raw.bridgeUnit];
    }
  }
  s.toothSelection = validateEnum(raw.toothSelection, VALID_TOOTH_SELECTION, s.toothSelection);
  // SP4 Task 3: pulpInflam (boolean) retired in favor of pulpDx (enum).
  // Legacy true -> "irreversible-pulpitis" (the only condition state the
  // old boolean could represent); false/absent -> "normal". A modern
  // payload's own pulpDx (if present and valid) wins over the migrated
  // legacy value.
  const migratedPulpDx = raw.pulpInflam ? "irreversible-pulpitis" : "normal";
  s.pulpDx = validateEnum(raw.pulpDx, VALID_PULP_DX, migratedPulpDx);
  // SP4 Task 5: pulpLatin (practical-Latin subtype) round-trips independently of
  // the pulp-detail level. It has no legacy predecessor, so absent/invalid -> "none".
  s.pulpLatin = validateEnum(raw.pulpLatin, VALID_PULP_LATIN, "none");
  s.endoResection = !!raw.endoResection;
  // SP4 Task 2: rootResorption (boolean) retired in favor of resorptionType
  // (enum). Legacy true -> "external-cervical" (the only subtype the old
  // boolean could represent); false/absent -> "none". A modern payload's own
  // resorptionType (if present and valid) wins over the migrated legacy value.
  const migratedResorptionType = raw.rootResorption ? "external-cervical" : "none";
  s.resorptionType = validateEnum(raw.resorptionType, VALID_RESORPTION_TYPE, migratedResorptionType);
  s.mods = filterSet(raw.mods, VALID_MODS);
  s.periapicalType = validateEnum(raw.periapicalType, VALID_PERIAPICAL_TYPE, "none");
  // SP4 Task 4: `apicalDx` (enum) drives the periapical glyph on a PRESENT
  // tooth, decoupled from `mods.inflammation`. Derive it from the legacy
  // pairing of mods.inflammation + periapicalType: on a present tooth, a set
  // `inflammation` mod meant an apical lesion — the "abscess" subtype maps to
  // acute-apical-abscess, every other subtype (granuloma / cyst / unset) to
  // asymptomatic-apical-periodontitis. The `inflammation` mod is then REMOVED
  // from a present tooth's mods (the lesion is fully represented by apicalDx;
  // keeping it would double-encode and re-fire the retired render path). On a
  // NON-present tooth (missing / implant) `inflammation` keeps its SECOND role
  // — periodontal inflammation — so it is LEFT untouched and apicalDx stays
  // "normal". periapicalType is preserved as the histological lesion subtype.
  // A modern payload's own apicalDx (if present and valid) wins over the derived value.
  let migratedApicalDx = "normal";
  if(s.mods.has("inflammation") && isToothPresent(s.toothSelection)){
    migratedApicalDx = s.periapicalType === "abscess" ? "acute-apical-abscess" : "asymptomatic-apical-periodontitis";
    s.mods.delete("inflammation");
  }
  s.apicalDx = validateEnum(raw.apicalDx, VALID_APICAL_DX, migratedApicalDx);
  // SP7: enforce the lesion-subtype invariant on read. On a PRESENT tooth the
  // granuloma/cyst subtype (including the legacy `abscess` subtype) is valid
  // only under symptomatic/asymptomatic apical periodontitis; otherwise it is
  // cleared to "none". Non-present teeth are left untouched (their stored
  // subtype still feeds the unchanged non-present render path). Never throws.
  if(isToothPresent(s.toothSelection)){
    if(s.apicalDx !== "symptomatic-apical-periodontitis"
        && s.apicalDx !== "asymptomatic-apical-periodontitis"){
      s.periapicalType = "none";
    }
  }
  s.endo = validateEnum(raw.endo, VALID_ENDO, s.endo);
  // SP7: enforce the endo/pulp mutual-exclusion invariant on read. A tooth with
  // any endodontic treatment (endo !== "none") has no vital pulp, so it cannot
  // carry a pulpitis/necrosis diagnosis. Normalize to "normal" (also clears any
  // Latin subtype). Runs unconditionally — a conformant payload never violates
  // this, so it is a no-op except on contradictory legacy/hand-edited data.
  // NOTE: placed here (after s.endo is assigned from `raw`, not immediately
  // after the s.pulpDx assignment above) because s.endo is not populated from
  // `raw.endo` until this line — checking it any earlier would only ever see
  // defaultState()'s "none" placeholder and never normalize a real payload.
  if(s.endo && s.endo !== "none" && (s.pulpDx !== "normal" || s.pulpLatin !== "none")){
    s.pulpDx = "normal";
    s.pulpLatin = "none";
  }
  s.caries = filterSet(raw.caries, VALID_CARIES);
  const toIcdas = (v: Any): number | null => {
    if(typeof v === "number" && VALID_ICDAS.has(v)) return v;
    if(typeof v === "string"){
      if(v === "surface" || v === "dentin" || v === "deep") return threeLevelToIcdas(v);
      const n = Number(v); if(VALID_ICDAS.has(n)) return n;
    }
    return null;
  };
  s.cariesActiveDepth = toIcdas(raw.cariesActiveDepth) ?? 2;
  // SP6 Task 1 migration inputs. The unified `cariesSeverity` is built AFTER
  // `fillingSurfaceMaterials` (below), merging three raw sources per surface:
  //   - `raw.cariesSeverity` (native 2.4 unified field) — always wins,
  //   - `raw.cariesDepths`   (retired SP5 ICDAS map)    — primary fallback,
  //   - `raw.secondaryCaries` (retired SP5 CARS map)    — recurrent fallback.
  // These are parsed into locals here; only `cariesSeverity` survives on state.
  const rawSeverity = new Map<string, number>();
  if(raw.cariesSeverity && typeof raw.cariesSeverity === "object"){
    for(const [surf, val] of Object.entries(raw.cariesSeverity)){
      const num = typeof val === "number" ? val : (typeof val === "string" ? Number(val) : NaN);
      if(VALID_FILLING_SURFACES.has(surf) && VALID_CARIES_SEVERITY.has(num)) rawSeverity.set(surf, num);
    }
  }
  const rawDepths = new Map<string, number>();
  if(raw.cariesDepths && typeof raw.cariesDepths === "object"){
    for(const [surf, val] of Object.entries(raw.cariesDepths)){
      const code = toIcdas(val);
      if(VALID_FILLING_SURFACES.has(surf) && code !== null) rawDepths.set(surf, code);
    }
  }
  const rawSecondary = new Map<string, number>();
  if(raw.secondaryCaries && typeof raw.secondaryCaries === "object"){
    for(const [surf, val] of Object.entries(raw.secondaryCaries)){
      const num = typeof val === "number" ? val : (typeof val === "string" ? Number(val) : NaN);
      if(VALID_FILLING_SURFACES.has(surf) && VALID_CARS.has(num)) rawSecondary.set(surf, num);
    }
  }
  // SP5 Task 1: `rootCaries` is a normal enum. `radiographicDepth` is a
  // per-surface scalar map, independent of the unified visual severity.
  s.rootCaries = validateEnum(raw.rootCaries, VALID_ROOT_CARIES, "none");
  // SP8 Task 3: peri-implant disease (enum, implant-only). Additive axis — a
  // legacy payload never had this field, so absent/invalid -> "none" (no
  // change in render for pre-SP8 payloads).
  s.periImplant = validateEnum(raw.periImplant, VALID_PERI_IMPLANT, "none");
  // SP8 Task 4: migrate pre-SP8 implant signals. An implant tooth that carried
  // mods.inflammation or mods.parodontal recorded soft-tissue inflammation with
  // no bone-loss grade, so it becomes peri-implant mucositis and the mod is
  // removed (non-implant teeth keep their mods). Runs unconditionally — a modern
  // 2.6 payload never has those mods on an implant, so it's a no-op there.
  if(s.toothSelection === "implant" && s.periImplant === "none"){
    if(s.mods.has("inflammation")){ s.periImplant = "mucositis"; s.mods.delete("inflammation"); }
    if(s.mods.has("parodontal")){ s.periImplant = "mucositis"; s.mods.delete("parodontal"); }
  }
  // SP-perio PG-C Task 2: cejVisibility/rootConcavity (additive enum axes). A
  // legacy payload (<=2.13) never carried these fields, so absent/invalid ->
  // "none". No migration needed.
  s.cejVisibility = validateEnum(raw.cejVisibility, VALID_CEJ_VISIBILITY, "none");
  s.rootConcavity = validateEnum(raw.rootConcavity, VALID_ROOT_CONCAVITY, "none");
  // SP-perio PG-D Task 3: gingivalThickness/millerClass (additive enum axes).
  // Absent/legacy payloads have no key -> stays the default (no throw); an
  // unrecognized value self-heals to the default, same tolerant-hydrate
  // policy as every other axis above.
  s.gingivalThickness = validateEnum(raw.gingivalThickness, VALID_GINGIVAL_THICKNESS, "unknown");
  s.millerClass = validateEnum(raw.millerClass, VALID_MILLER_CLASS, "none");
  s.radiographicDepth = new Map();
  if(raw.radiographicDepth && typeof raw.radiographicDepth === "object"){
    for(const [surf, val] of Object.entries(raw.radiographicDepth)){
      if(VALID_FILLING_SURFACES.has(surf) && typeof val === "string" && VALID_RADIOGRAPHIC_DEPTH.has(val)) s.radiographicDepth.set(surf, val);
    }
  }
  // SP10: per-surface filling defect (additive; legacy payloads have none).
  s.fillingDefect = new Map();
  if(raw.fillingDefect && typeof raw.fillingDefect === "object"){
    for(const [surf, val] of Object.entries(raw.fillingDefect)){
      if(VALID_FILLING_SURFACES.has(surf) && typeof val === "string" && VALID_FILLING_DEFECT_SET.has(val)) s.fillingDefect.set(surf, val);
    }
  }
  s.fillingMaterial = validateEnum(raw.fillingMaterial, VALID_FILLING_MATERIAL, s.fillingMaterial);
  s.fillingSurfaces = filterSet(raw.fillingSurfaces, VALID_FILLING_SURFACES);
  s.fillingSurfaceMaterials = new Map();
  const rawFSM = raw.fillingSurfaceMaterials;
  if(rawFSM && typeof rawFSM === "object"){
    // v1.4 format
    for(const [surf, mat] of Object.entries(rawFSM)){
      if(VALID_FILLING_SURFACES.has(surf) && typeof mat === "string" && VALID_FILLING_MATERIAL.has(mat) && mat !== "none"){
        s.fillingSurfaceMaterials.set(surf, mat);
      }
    }
  }else if(s.fillingMaterial !== "none" && s.fillingSurfaces.size > 0){
    // legacy v1.3: one material applied to all filled surfaces
    for(const surf of s.fillingSurfaces){
      s.fillingSurfaceMaterials.set(surf, s.fillingMaterial);
    }
  }
  // keep fillingSurfaces in sync with the map keys
  s.fillingSurfaces = new Set(s.fillingSurfaceMaterials.keys());
  // SP6 Task 1 migration: build the unified per-surface `cariesSeverity` from
  // the three raw sources (parsed above), now that `caries` and
  // `fillingSurfaceMaterials` are finalized. Per surface the value is resolved
  // by the state machine:
  //   - a native `raw.cariesSeverity` value ALWAYS wins (round-trips 2.4),
  //   - otherwise a RECURRENT surface (has a filling) prefers the retired CARS
  //     score, then the retired ICDAS depth, then a representative default,
  //   - a PRIMARY surface (no filling) takes the retired ICDAS depth.
  // Only surfaces with an explicit source value get an entry — a caried surface
  // with no source resolves to the render/summary default (2) via `?? 2`, so
  // omitting it is render-identical and preserves byte-compat.
  //
  // FIX 1 (data integrity, carried from SP5): the legacy caries∩filling → score
  // inference (there is no stored recurrent value on a <2.3 payload) fires ONLY
  // for legacy callers. `inferLegacySecondaryCaries` defaults to `true`
  // (internal seams/presets/version-less callers, preserving goldens), while the
  // JSON/FHIR import path passes `false` for native ≥2.3 payloads where a caried
  // + filled surface with no recurrent score is a deliberate primary lesion.
  s.cariesSeverity = new Map();
  const severitySurfaces = new Set<string>([
    ...rawSeverity.keys(), ...rawDepths.keys(), ...rawSecondary.keys(),
  ]);
  for(const surf of s.fillingSurfaceMaterials.keys()){
    if(inferLegacySecondaryCaries && s.caries.has("caries-" + surf)) severitySurfaces.add(surf);
  }
  for(const surf of severitySurfaces){
    if(rawSeverity.has(surf)){ s.cariesSeverity.set(surf, rawSeverity.get(surf)!); continue; }
    const hasFilling = s.fillingSurfaceMaterials.has(surf);
    if(hasFilling){
      // Recurrent: prefer the stored CARS score, then the ICDAS depth, then the
      // legacy caries∩filling inference (default recurrent score 3).
      if(rawSecondary.has(surf)){ s.cariesSeverity.set(surf, rawSecondary.get(surf)!); }
      else if(rawDepths.has(surf)){ s.cariesSeverity.set(surf, rawDepths.get(surf)!); }
      else if(inferLegacySecondaryCaries && s.caries.has("caries-" + surf)){ s.cariesSeverity.set(surf, 3); }
    }else{
      // Primary: the ICDAS depth.
      if(rawDepths.has(surf)){ s.cariesSeverity.set(surf, rawDepths.get(surf)!); }
    }
  }
  // FIX 2 (final review, minor): normalize a contradictory legacy input — a
  // surface that's both in `caries` and filled (i.e. recurrent) but whose
  // resolved severity is an explicit CARS 0 (Sound). That combination is only
  // reachable via a raw payload (the popup can't produce it — picking CARS 0
  // there already removes the caries via `applyRecurrentCariesScore`), and
  // left as-is it renders `subcaries-{surface}` at the SVG's default opacity,
  // silently keeping a caries indicator that should have been cleared.
  // Resolve it the same way the popup does (score 0 removes the surface from
  // `caries` and clears its severity — same transition as
  // `applyRecurrentCariesScore`, inlined here to avoid a `Set<unknown>` vs
  // `Set<string>` type mismatch against `defaultState()`'s untyped `caries`).
  // Input-side only — does not touch render/state-machine/popup logic.
  for(const surf of s.fillingSurfaceMaterials.keys()){
    if(s.caries.has("caries-" + surf) && s.cariesSeverity.get(surf) === 0){
      s.caries.delete("caries-" + surf);
      s.cariesSeverity.delete(surf);
    }
  }
  s.fissureSealing = !!raw.fissureSealing;
  s.calculus = !!raw.calculus;
  s.contactMesial = !!raw.contactMesial;
  s.contactDistal = !!raw.contactDistal;
  // SP11: bruxismWear/bruxismNeckWear (booleans) retired in favor of the
  // wearEdge/wearCervical type enums. Legacy edge boolean -> attrition (dominant
  // bruxism edge wear); cervical boolean -> abrasion (generic cervical wear);
  // false/absent -> none. A modern payload's own valid value wins.
  const migratedWearEdge = raw.bruxismWear ? "attrition" : "none";
  s.wearEdge = validateEnum(raw.wearEdge, VALID_WEAR_EDGE, migratedWearEdge);
  const migratedWearCervical = raw.bruxismNeckWear ? "abrasion" : "none";
  s.wearCervical = validateEnum(raw.wearCervical, VALID_WEAR_CERVICAL, migratedWearCervical);
  s.discoloration = validateEnum(raw.discoloration, VALID_DISCOLORATION, "none");
  // SP14 Task 1: orthodontic axes foundation (additive; no legacy fields to migrate).
  s.orthoAppliance = validateEnum(raw.orthoAppliance, VALID_ORTHO_APPLIANCE, "none");
  s.orthoDrift = validateEnum(raw.orthoDrift, VALID_ORTHO_DRIFT, "none");
  s.orthoVertical = validateEnum(raw.orthoVertical, VALID_ORTHO_VERTICAL, "none");
  s.orthoRotation = raw.orthoRotation === true;
  s.brokenMesial = !!raw.brokenMesial;
  s.brokenIncisal = !!raw.brokenIncisal;
  s.brokenDistal = !!raw.brokenDistal;
  s.extractionWound = !!raw.extractionWound;
  s.extractionPlan = !!raw.extractionPlan;
  s.parapulpalPin = !!raw.parapulpalPin;
  s.crownReplace = !!raw.crownReplace;
  s.crownNeeded = !!raw.crownNeeded;
  s.missingClosed = !!raw.missingClosed;
  s.bridgePillar = !!raw.bridgePillar;
  s.prosthesis = validateEnum(raw.prosthesis, VALID_PROSTHESIS, "none");
  s.mobility = validateEnum(raw.mobility, VALID_MOBILITY, s.mobility);
  s.toothSubstrate = validateEnum(raw.toothSubstrate, VALID_TOOTH_SUBSTRATE, s.toothSubstrate);
  s.restorationType = validateEnum(raw.restorationType, VALID_RESTORATION_TYPE, s.restorationType);
  s.restorationMaterial = validateEnum(raw.restorationMaterial, VALID_RESTORATION_MATERIAL, s.restorationMaterial);
  // SP15 wholebranch fix: a radix substrate (broken root remnant) can't carry
  // a fixed restoration — restorationRowHidden() hides the restoration
  // control for it (B7), and syncControlsFromState's reset block clears a
  // LIVE crown/bridge when the substrate select changes to radix. Mirror that
  // guard here too so a crafted/imported/directly-hydrated radix+crown payload
  // self-heals on hydrate, the same way FIX 4 below self-heals a
  // crown+prosthesis payload — a stale crown must never render over a
  // tooth-radix layer nor appear alongside "Radix" in the summary.
  if(s.toothSubstrate === "radix" && s.restorationType !== "none"){
    s.restorationType = "none";
    s.restorationMaterial = "none";
  }
  // SP3b Task 6 (spec §9 gap): the two fields above are validated independently
  // against their own enums, so a hand-edited/imported payload can still pair a
  // legal type with a material that type never supports (e.g. inlay+metal — the
  // matrix only allows inlay in emax/gold/gradia/zircon/temporary). Guard the
  // (type, material) PAIR here so an invalid combo never reaches state/render —
  // composeRestorationLayers() already no-ops on one, but a "sane-looking but
  // impossible" state is still worth correcting rather than leaving in place.
  // isValidRestoration() also takes a `view` (onlay is occlusal-only), but view
  // is a render/UI concern, not a data-validity one: a stored/imported state has
  // no notion of which template will eventually draw it, so validate here with
  // "occlusal" (the permissive superset of front) so a valid onlay+material pair
  // is never rejected just because we don't yet know the view.
  if(!isValidRestoration(s.restorationType as RestorationType, s.restorationMaterial as RestorationMaterial, "occlusal")){
    const spec = RESTORATION_MATRIX[s.restorationType as Exclude<RestorationType, "none">];
    if(spec && spec.materials.length > 0){
      // Type is legitimate, material is not: keep the type, fall back to its
      // first valid material (deterministic — RESTORATION_MATRIX order).
      s.restorationMaterial = spec.materials[0];
    }else{
      // No type (or a type with no valid materials at all, which today's
      // matrix never produces) — drop both to "none" rather than guess.
      s.restorationType = "none";
      s.restorationMaterial = "none";
    }
  }
  // SP3b FIX 4: cross-field coherence — a tooth has EITHER a fixed restoration OR a
  // prosthesis, never both. A crafted/imported payload can pair both; keep the
  // restoration and clear the prosthesis (restoration wins, matching render
  // precedence). Never throws.
  if((s.restorationType === "crown" || s.restorationType === "bridge") && s.prosthesis !== "none"){
    s.prosthesis = "none";
  }
  s.crownLeakage = !!raw.crownLeakage;
  // SP-perio P1 Task 1: restore the per-site perio sub-record. Absent/legacy
  // (<=2.11) payloads have no `perio` key at all -> stays the empty default
  // (no throw). Every raw value is independently validated: `pd` is charted
  // only through clampPerio's own rules (out-of-range/non-integer/unknown
  // site dropped, never orphaning a bad entry); `gm`/`bop`/`sup` are ONLY
  // ever kept for a site that resolved a valid `pd` above — a crafted/foreign
  // payload can never sneak in an orphaned gm/bop/sup on an un-charted site.
  const rawPerio = raw.perio;
  if(rawPerio && typeof rawPerio === "object"){
    if(rawPerio.pd && typeof rawPerio.pd === "object"){
      for(const [site, val] of Object.entries(rawPerio.pd)){
        if(!(PERIO_SITES as readonly string[]).includes(site)) continue;
        const num = typeof val === "number" ? val : (typeof val === "string" ? Number(val) : NaN);
        const clamped = clampPerio("pd", num);
        if(clamped !== null) s.perio.pd.set(site, clamped);
      }
    }
    if(rawPerio.gm && typeof rawPerio.gm === "object"){
      for(const [site, val] of Object.entries(rawPerio.gm)){
        if(!s.perio.pd.has(site)) continue; // no orphan gm without a charted pd
        const num = typeof val === "number" ? val : (typeof val === "string" ? Number(val) : NaN);
        const clamped = clampPerio("gm", num);
        if(clamped !== null) s.perio.gm.set(site, clamped);
      }
    }
    if(Array.isArray(rawPerio.bop)){
      for(const site of rawPerio.bop){
        if(typeof site === "string" && s.perio.pd.has(site)) s.perio.bop.add(site);
      }
    }
    if(Array.isArray(rawPerio.sup)){
      for(const site of rawPerio.sup){
        if(typeof site === "string" && s.perio.pd.has(site)) s.perio.sup.add(site);
      }
    }
  }
  // SP-perio P2b Task 2: restore the per-entrance furcation grade map.
  // Absent/legacy (<=2.12) payloads have no `furcation` key -> stays the
  // empty default (no throw). Validated against the tooth-independent
  // VALID_FURCATION_ENTRANCE/VALID_FURCATION_GRADE sets (see their doc
  // comment above) — hydrateState has no toothNo to call
  // furcationEntrances(toothNo) itself; a crafted/foreign entrance for a
  // tooth position that doesn't actually offer it is harmless dead data,
  // exactly like an out-of-position radiographicDepth/fillingDefect surface.
  const rawFurcation = raw.furcation;
  if(rawFurcation && typeof rawFurcation === "object"){
    for(const [entrance, val] of Object.entries(rawFurcation)){
      if(!VALID_FURCATION_ENTRANCE.has(entrance)) continue;
      const num = typeof val === "number" ? val : (typeof val === "string" ? Number(val) : NaN);
      if(Number.isInteger(num) && VALID_FURCATION_GRADE.has(num)) s.furcation.set(entrance, num);
    }
  }
  // SP-perio P2b Task 3: restore the O'Leary plaque-surface presence set.
  // Absent/legacy payloads have no `plaque` key -> stays the empty default
  // (no throw). Validated against VALID_PLAQUE_SURFACE — an unrecognized
  // entry (foreign/crafted string) is silently dropped, never throws.
  const rawPlaque = raw.plaque;
  if(Array.isArray(rawPlaque)){
    for(const surface of rawPlaque){
      if(typeof surface === "string" && VALID_PLAQUE_SURFACE.has(surface)) s.plaque.add(surface);
    }
  }
  // SP-perio PG-D Task 1: restore the graded PI/GI surface maps. Absent/legacy
  // (<=2.14) payloads have no `pi`/`gi` key -> stays the empty default (no
  // throw). Validated against VALID_PLAQUE_SURFACE (same fixed 4-surface set
  // `plaque` uses) + grade in {1,2,3} — an unrecognized surface or an
  // out-of-range/non-integer grade (including a stored 0, which should never
  // happen but is tolerated as "drop it") is silently dropped, never throws.
  if(raw.pi && typeof raw.pi === "object"){
    for(const [surface, g] of Object.entries(raw.pi)){
      if(VALID_PLAQUE_SURFACE.has(surface) && (g === 1 || g === 2 || g === 3)) s.pi.set(surface, g);
    }
  }
  if(raw.gi && typeof raw.gi === "object"){
    for(const [surface, g] of Object.entries(raw.gi)){
      if(VALID_PLAQUE_SURFACE.has(surface) && (g === 1 || g === 2 || g === 3)) s.gi.set(surface, g);
    }
  }
  // SP-perio PG-E Task 1: restore the peri-implant mPI/mBI graded surface
  // maps, same tolerant parsing as pi/gi above. Hydrate is a non-interactive
  // path (not gated) — the implant-only restriction is enforced only by the
  // SETTER, not by hydrate/import, matching every other axis's hydrate
  // tolerance policy in this file.
  if(raw.mpi && typeof raw.mpi === "object"){
    for(const [surface, g] of Object.entries(raw.mpi)){
      if(VALID_PLAQUE_SURFACE.has(surface) && (g === 1 || g === 2 || g === 3)) s.mpi.set(surface, g);
    }
  }
  if(raw.mbi && typeof raw.mbi === "object"){
    for(const [surface, g] of Object.entries(raw.mbi)){
      if(VALID_PLAQUE_SURFACE.has(surface) && (g === 1 || g === 2 || g === 3)) s.mbi.set(surface, g);
    }
  }
  // SP-perio PG-D Task 2: restore keratinized gingiva width. Absent/legacy
  // payloads have no `kg` key -> stays the default null (no throw).
  // `clampKg` tolerates any input (non-numeric/out-of-range) and returns
  // null for it, same tolerant-hydrate policy as every other axis above.
  s.kg = clampKg(raw.kg);
  // Restore note
  if(typeof raw.note === "string") s.note = raw.note;
  // Restore plugin custom states (only for registered plugin IDs)
  if(raw.customStates && typeof raw.customStates === "object"){
    const validIds = new Set(registeredPlugins.map(p => p.id));
    for(const [key, val] of Object.entries(raw.customStates)){
      if(validIds.has(key)){
        s.customStates[key] = val;
      }
    }
  }
  return s;
}

/** R2-A Task 2: per-tooth serialize loop, parameterized over a chart map so
 *  the same collection logic serves the STATUS export, the PLAN export
 *  (getPlanChart()), and the plan-vs-status diff check in
 *  collectExportPayload() below — instead of three copies of the loop. */
function collectTeeth(chart: Map<Any, Any>){
  const teeth: Record<string, Any> = {};
  for(const toothNo of ALL_TEETH){
    const s = chart.get(toothNo) ?? defaultState();
    teeth[toothNo] = serializeState(s);
  }
  return teeth;
}

/** Current global settings, shared verbatim by every payload shape below
 *  (status export, plan export) — these are session/app-level, not owned by
 *  either chart. */
function collectGlobals(){
  return {
    wisdomVisible,
    showBase,
    occlusalVisible,
    showHealthyPulp,
    edentulous,
  };
}

/** UI-4: collect the UI layout state (card collapse settings) for the export
 *  payload. Omitted entirely when every card is in its default (expanded)
 *  state, so a no-collapse export stays byte-identical apart from the version
 *  bump and the cosmetic `ui` key is absent from untouched cases. */
function collectUiState(){
  const nonDefault = Object.keys(collapsedCards).filter(id => collapsedCards[id]);
  if(nonDefault.length === 0) return undefined;
  return { collapsedCards: { ...collapsedCards } };
}

function applyCollapsedCardDom(id: string, collapsed: boolean): void {
  const BTN_TO_DOM: Record<string, { containerId: string; isControls: boolean }> = {
    controls: { containerId: "controlsActions", isControls: true },
    status: { containerId: "statusCard", isControls: false },
    caries: { containerId: "cariesSection", isControls: false },
    filling: { containerId: "fillingSection", isControls: false },
    rootPeriodontium: { containerId: "rootPeriodontiumSection", isControls: false },
  };
  const cfg = BTN_TO_DOM[id];
  if(!cfg) return;
  const btnId = "btnToggle" + id.charAt(0).toUpperCase() + id.slice(1) + "Card";
  const el = document.getElementById(cfg.containerId);
  const btn = document.getElementById(btnId);
  if(!el || !btn) return;
  if(cfg.isControls){
    const wasHidden = el.classList.contains("hidden");
    if(wasHidden !== collapsed){
      el.classList.toggle("hidden", collapsed);
      const icon = btn.querySelector(".toggle-icon");
      if(icon) icon.textContent = collapsed ? "+" : "−";
      applyToggleA11y(btn, "panel.controls", collapsed);
    }
  }else{
    const wasCollapsed = el.classList.contains("collapsed");
    if(wasCollapsed !== collapsed){
      el.classList.toggle("collapsed", collapsed);
      const icon = btn.querySelector(".toggle-icon");
      if(icon) icon.textContent = collapsed ? "+" : "−";
      const labelKey = CARD_TOGGLE_LABELS[btnId] ?? "";
      applyToggleA11y(btn, labelKey, collapsed);
    }
  }
}

/** UI-4: restore the UI layout state from the hydrated payload. */
function hydrateUiState(ui: Any): void {
  collapsedCards = {};
  if(!ui || typeof ui !== "object") return;
  if(ui.collapsedCards && typeof ui.collapsedCards === "object"){
    for(const id of Object.keys(ui.collapsedCards)){
      if(VALID_CARD_IDS.has(id)) collapsedCards[id] = !!ui.collapsedCards[id];
    }
  }
}

/**
 * R2-A Task 2 (D3, RATIFIED): export/import stay STATUS-PRIMARY — `teeth`
 * is always built from `charts.status` explicitly (NOT the active-chart
 * alias `toothState`), so exporting while in PLAN mode still yields the
 * STATUS as the primary payload. The `plan` section is a NEW, additive,
 * separately-addressable layer: it is only appended when the plan chart has
 * actually been initialized AND differs from status, so a status-only case
 * (the overwhelming majority, including every existing caller/golden) stays
 * byte-identical apart from the version bump.
 */
function collectExportPayload(){
  const statusTeeth = collectTeeth(charts.status);
  const planTeeth = planInitialized ? collectTeeth(charts.plan) : null;
  const planDiffers = planTeeth !== null && JSON.stringify(planTeeth) !== JSON.stringify(statusTeeth);
  const uiState = collectUiState();
  return {
    version: "2.21",
    globals: collectGlobals(),
    teeth: statusTeeth,
    ...(caseMetaIsEmpty(caseMeta) ? {} : { case: serializeCaseMeta(caseMeta) }),
    ...(uiState ? { ui: uiState } : {}),
    ...(planDiffers ? { plan: planTeeth } : {}),
  };
}

/** TEST-ONLY: collect the full export payload ({version, globals, teeth[,
 *  plan]}) exactly as exportStatus()/exportFhir() would serialize it.
 *  Not part of the public API. */
export function __collectExportPayloadForTest(): Any {
  return collectExportPayload();
}

/**
 * Export the STATUS chart's payload — identical to exportStatus()'s JSON
 * (status-primary; unaffected by the current chart mode).
 */
export function getStatusChart(): Any {
  return collectExportPayload();
}

/**
 * Export the PLAN chart's payload alone: same shape as the status export
 * (`{version, globals, teeth}`), but `teeth` is collected from `charts.plan`.
 * `globals` are shared app-level settings, not owned by either chart.
 */
export function getPlanChart(): Any {
  const uiState = collectUiState();
  return {
    version: "2.21",
    globals: collectGlobals(),
    teeth: collectTeeth(charts.plan),
    ...(caseMetaIsEmpty(caseMeta) ? {} : { case: serializeCaseMeta(caseMeta) }),
    ...(uiState ? { ui: uiState } : {}),
  };
}

/**
 * Hydrate `payload.teeth` into the PLAN chart ONLY (status is left
 * untouched), mirroring the per-tooth hydrate importStatus() performs for
 * the status chart. Marks the plan chart initialized. Repaints the DOM only
 * when PLAN is the currently active chart mode — hydrating a chart that
 * isn't on screen must not visibly disturb whatever IS on screen (mirrors
 * setChartMode()'s own full-repaint-on-activation behavior).
 */
export function setPlanChart(payload: Any): void {
  if(!payload || typeof payload !== "object") return;
  const inferLegacySecondaryCaries = isLegacyPayloadVersion(payload.version);
  const teeth = payload.teeth || {};
  for(const toothNo of ALL_TEETH){
    const raw = teeth[toothNo];
    charts.plan.set(toothNo, hydrateState(raw, inferLegacySecondaryCaries));
  }
  planInitialized = true;
  // DS-1: replacing the plan chart wholesale resets any runtime plan-edits.
  planEditedTeeth.clear();
  // DS-1 (review Fix 2): drop any pending dual-state confirm — its deferred
  // `applyFn` was captured against the pre-replace plan and must not run against
  // the freshly-hydrated plan chart via a later acceptDualStateConfirm().
  pendingDualStateConfirm = null;
  if(getChartMode() === "plan"){
    for(const toothNo of ALL_TEETH){
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
      updateToothLabelNoteIcon(toothNo);
    }
    if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
    notifyStateChange();
  }
}

// R2-B Task 1: pure, read-only status->plan diff engine. Reuses the SAME
// summary-label helpers the tooltip (getStateSummary) and whole-mouth panel
// (getOdontogramSummary) already use for these axes, so a diff entry never
// invents new copy — it just reports "the same label the UI would already
// show changed from X to Y". Adds no render/state mutation whatsoever; a
// treatment-oriented axis list (not a raw field-by-field diff), curated to
// the clinically relevant axes a "what changed" review would care about.
export type PlanChange = { toothNo: number; axis: string; from: string; to: string };

/** toothSelection value -> its i18n label key, mirrored from
 *  optionsFor("toothSelection") (see registry/axes.ts / ui-options.test.ts)
 *  so the "presence" diff axis names a value exactly the way the #toothSelect
 *  picker itself does. A value outside this set (e.g. the legacy/import-only
 *  "no-tooth-after-extraction") falls back to the "missing" label — closest
 *  existing semantics ("no tooth present") without inventing new copy. */
const TOOTH_SELECT_LABEL_KEY: Record<string, string> = Object.fromEntries(
  optionsFor("toothSelection").map((o) => [o.value, o.labelKey])
);

/** SP-perio P1 Task 1: SUMMARY-level (never per-site) perio label for a
 *  SINGLE tooth's state, used only by DIFF_AXES' `perio` entry below — so a
 *  status->plan perio edit narrates as ONE diff entry per tooth ("3 sites,
 *  BOP 33.3%, worst CAL 8") instead of exploding into up to 6 per-site
 *  entries. "Nothing charted" renders the same `planChange.none` sentinel
 *  every other axis uses. */
function perioSummaryLabel(s: Any): string {
  const perio = s.perio;
  if(!perio || !perio.pd || perio.pd.size === 0) return t("planChange.none");
  let bleeding = 0;
  let worstCal: number | null = null;
  for(const [site, pd] of perio.pd as Map<string, number>){
    if((perio.bop as Set<string>).has(site)) bleeding++;
    const cal = pd + ((perio.gm as Map<string, number>).get(site) ?? 0);
    if(worstCal === null || cal > worstCal) worstCal = cal;
  }
  const bopPct = Math.round((bleeding / perio.pd.size) * 1000) / 10;
  return t("planChange.perioSummary", { sites: perio.pd.size, bop: bopPct, cal: worstCal ?? 0 });
}

/** SP-perio P2b Task 4: SUMMARY-level (never per-entrance) furcation label
 *  for a SINGLE tooth's state, used only by DIFF_AXES' `furcation` entry
 *  below — mirrors {@link perioSummaryLabel}'s "one line per tooth, not one
 *  per site/entrance" shape. Reports only the tooth's HIGHEST Glickman grade
 *  (reusing the exact same `furcation.grade.N` copy the furcation picker
 *  itself already shows), not a per-entrance breakdown. "Nothing charted"
 *  renders the shared `planChange.none` sentinel every other axis uses. */
function furcationSummaryLabel(s: Any): string {
  const furcation = s.furcation as Map<string, number> | undefined;
  if(!furcation || furcation.size === 0) return t("planChange.none");
  let maxGrade = 0;
  for(const grade of furcation.values()){
    if(grade > maxGrade) maxGrade = grade;
  }
  return maxGrade > 0 ? t(`furcation.grade.${maxGrade}`) : t("planChange.none");
}

/** SP-perio P2b Task 4: SUMMARY-level (never per-surface) O'Leary plaque
 *  label for a SINGLE tooth's state, used only by DIFF_AXES' `plaque` entry
 *  below — reports a compact "N/4 surfaces" count rather than exploding
 *  into up to 4 per-surface entries. "Nothing charted" renders the shared
 *  `planChange.none` sentinel every other axis uses. */
function plaqueSummaryLabel(s: Any): string {
  const plaque = s.plaque as Set<string> | undefined;
  if(!plaque || plaque.size === 0) return t("planChange.none");
  return `${plaque.size}/4`;
}

/** Curated, treatment-relevant diff axes for {@link getPlanChanges}. Each
 *  `label(state)` returns a short human string for that axis's value in the
 *  CURRENT UI language — reusing the exact same per-value i18n lookups
 *  getStateSummary()/getOdontogramSummary() already use for that axis, so the
 *  diff never renders text the rest of the app wouldn't also show. An
 *  axis at its "nothing recorded" value renders the shared
 *  `t("planChange.none")` sentinel so a from->to reads cleanly (e.g.
 *  "— → korona (cirkónium)") instead of an empty string. */
const DIFF_AXES: { key: string; labelKey: string; label: (s: Any) => string }[] = [
  {
    key: "presence", labelKey: "planChange.axis.presence",
    label: (s) => {
      const base = t(TOOTH_SELECT_LABEL_KEY[s.toothSelection] ?? "toothSelect.none");
      return s.extractionPlan ? `${base} (${t("tooth.extractionPlan")})` : base;
    },
  },
  {
    key: "substrate", labelKey: "planChange.axis.substrate",
    label: (s) => t(`substrate.${s.toothSubstrate}`),
  },
  {
    key: "restoration", labelKey: "planChange.axis.restoration",
    label: (s) => s.restorationType === "none" ? t("planChange.none") : restorationSummaryLabel(s.restorationType, s.restorationMaterial),
  },
  {
    key: "prosthesis", labelKey: "planChange.axis.prosthesis",
    label: (s) => {
      const prosthesisKey = PROSTHESIS_SUMMARY_KEY[s.prosthesis];
      return prosthesisKey ? t(prosthesisKey) : t("planChange.none");
    },
  },
  {
    key: "crownAction", labelKey: "planChange.axis.crownAction",
    label: (s) => {
      const parts: string[] = [];
      if(s.crownNeeded) parts.push(t("tooth.crownNeeded"));
      if(s.crownReplace) parts.push(t("tooth.crownReplace"));
      return parts.length > 0 ? parts.join(", ") : t("planChange.none");
    },
  },
  {
    key: "ortho", labelKey: "planChange.axis.ortho",
    label: (s) => {
      const parts: string[] = [];
      if(s.orthoAppliance && s.orthoAppliance !== "none") parts.push(t("ortho.appliance." + s.orthoAppliance));
      if(s.orthoDrift && s.orthoDrift !== "none") parts.push(t("ortho.drift." + s.orthoDrift));
      if(s.orthoVertical && s.orthoVertical !== "none") parts.push(t("ortho.vertical." + s.orthoVertical));
      if(s.orthoRotation === true) parts.push(t("ortho.rotation.label"));
      return parts.length > 0 ? parts.join(", ") : t("planChange.none");
    },
  },
  {
    key: "pulpEndo", labelKey: "planChange.axis.pulpEndo",
    label: (s) => {
      if(s.endo && s.endo !== "none"){
        const endoKey = SUMMARY_ENDO_KEY[s.endo];
        return endoKey ? t(endoKey) : t("planChange.none");
      }
      return pulpDiagnosisLabel(s) ?? t("planChange.none");
    },
  },
  {
    key: "apical", labelKey: "planChange.axis.apical",
    label: (s) => apicalDiagnosisLabel(s) ?? t("planChange.none"),
  },
  {
    // SP-perio P1 Task 1: ONE summary-level entry per tooth (see
    // perioSummaryLabel above) — never 6 per-site entries.
    key: "perio", labelKey: "planChange.axis.perio",
    label: (s) => perioSummaryLabel(s),
  },
  {
    // SP-perio P2b Task 4: ONE summary-level entry per tooth (see
    // furcationSummaryLabel above) — never one per entrance.
    key: "furcation", labelKey: "planChange.axis.furcation",
    label: (s) => furcationSummaryLabel(s),
  },
  {
    // SP-perio P2b Task 4: ONE summary-level entry per tooth (see
    // plaqueSummaryLabel above) — never one per surface.
    key: "plaque", labelKey: "planChange.axis.plaque",
    label: (s) => plaqueSummaryLabel(s),
  },
];

/**
 * Compare the "status" chart against the "plan" chart, tooth by tooth and
 * axis by axis (see {@link DIFF_AXES}), and report every axis whose label
 * differs. Pure and read-only: never mutates either chart, never touches the
 * DOM, never renders — a `parity.test.ts`-safe addition.
 *
 * Returns `[]` whenever the plan chart hasn't been initialized yet (no plan
 * exists to diff against). A tooth absent from either chart resolves via
 * `defaultState()`, so a status-only or plan-only tooth still diffs correctly
 * against the clinical default rather than throwing.
 *
 * Iterates the fixed `ALL_TEETH` list (not chart key insertion order), so
 * results are always grouped by tooth in the same stable clinical order the
 * rest of the app already uses (quadrant-by-quadrant); within a tooth,
 * entries follow `DIFF_AXES` order.
 */
export function getPlanChanges(): PlanChange[] {
  if(!planInitialized) return [];
  const out: PlanChange[] = [];
  for(const toothNo of ALL_TEETH){
    const st = charts.status.get(toothNo) ?? defaultState();
    const pl = charts.plan.get(toothNo) ?? defaultState();
    for(const axis of DIFF_AXES){
      const from = axis.label(st);
      const to = axis.label(pl);
      if(from !== to) out.push({ toothNo, axis: axis.key, from, to });
    }
  }
  return out;
}

// ---- SP-perio P1 Task 1: periodontal data-core public API ----
// All five functions below operate on the ACTIVE-chart `toothState` alias
// (not `charts.status` directly), exactly like every pre-existing per-tooth
// getter/setter in this file — so they transparently participate in the
// Status/Plan dual-state model (R2-A): called while `chartMode === "plan"`
// they read/write the plan chart, and vice versa. Pure data — no SVG/DOM
// touched, no render triggered (parity-safe: perio has no chart layer yet).

type PerioSitePatch = { pd?: number | null; gm?: number; bop?: boolean; sup?: boolean };
type PlainPerio = { pd: Record<string, number>; gm: Record<string, number>; bop: string[]; sup: string[] };

/**
 * Set/clear one perio site's reading(s) on the active chart's tooth.
 *
 * - `pd` is the CHARTING key. `null`/`undefined`/any value `< 1` UN-CHARTS
 *   the site — it is removed from `pd`, `gm`, `bop`, AND `sup` in one atomic
 *   step (never leaves an orphaned gm/bop/sup behind). A non-integer `pd`
 *   (e.g. 6.5) is instead REJECTED outright: the whole call is a no-op and
 *   state stays unchanged (no partial write). A valid integer `pd` is
 *   clamped to 1–15.
 * - `gm`/`bop`/`sup` only ever apply to an ALREADY-charted site (this call's
 *   own `pd`, or a previously-charted one) — supplying them for a site with
 *   no charted `pd` is a silent no-op, preserving the "absence = not
 *   charted" invariant. `gm` is clamped to −10…+20; a non-integer `gm` is
 *   rejected (that one field is left unset/unchanged, the rest of the patch
 *   still applies).
 * - An unrecognized `site` (not one of {@link PERIO_SITES}) is a silent no-op.
 *
 * Fires {@link onStateChange} listeners (via `notifyStateChange()`) whenever
 * it actually mutates state; never on a rejected/no-op call.
 */
export function setPerioSite(toothNo: number, site: string, patch: PerioSitePatch): void {
  if(!(PERIO_SITES as readonly string[]).includes(site)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  // DS-1: route the actual mutation through the status->plan gate. The closure
  // returns whether it changed state so a rejected/no-op edit neither marks the
  // tooth plan-edited nor mirrors it (preserving the "notify only on change"
  // contract). The lazy vivify above stays OUTSIDE the gate (not a user edit).
  gateToothEdit(toothNo, () => {
    const perio = s.perio;
    let changed = false;

    if("pd" in patch){
      const pd = patch.pd;
      if(pd === null || pd === undefined || (typeof pd === "number" && pd < 1)){
        if(perio.pd.has(site) || perio.gm.has(site) || perio.bop.has(site) || perio.sup.has(site)){
          perio.pd.delete(site);
          perio.gm.delete(site);
          perio.bop.delete(site);
          perio.sup.delete(site);
          changed = true;
        }
        if(changed) notifyStateChange();
        return changed;
      }
      const clampedPd = clampPerio("pd", pd);
      if(clampedPd === null) return false; // non-integer pd -> reject the WHOLE call
      if(perio.pd.get(site) !== clampedPd){ perio.pd.set(site, clampedPd); changed = true; }
    }

    if(!perio.pd.has(site)){
      if(changed) notifyStateChange();
      return changed; // never orphan gm/bop/sup onto an un-charted site
    }

    if(patch.gm !== undefined){
      const clampedGm = clampPerio("gm", patch.gm);
      if(clampedGm !== null && perio.gm.get(site) !== clampedGm){ perio.gm.set(site, clampedGm); changed = true; }
    }
    if(patch.bop !== undefined){
      if(patch.bop){ if(!perio.bop.has(site)){ perio.bop.add(site); changed = true; } }
      else if(perio.bop.has(site)){ perio.bop.delete(site); changed = true; }
    }
    if(patch.sup !== undefined){
      if(patch.sup){ if(!perio.sup.has(site)){ perio.sup.add(site); changed = true; } }
      else if(perio.sup.has(site)){ perio.sup.delete(site); changed = true; }
    }
    if(changed) notifyStateChange();
    return changed;
  });
}

/** Read a tooth's perio sub-record from the active chart as a PLAIN object
 *  (Maps/Sets converted to a fresh Record/Array each call — safe to mutate,
 *  never aliases live state). A tooth with no charted sites (or never
 *  touched at all) returns the empty-but-defined shape, never `undefined`. */
export function getToothPerio(toothNo: number): PlainPerio {
  const s = toothState.get(toothNo);
  const perio = s?.perio;
  if(!perio || perio.pd.size === 0) return { pd: {}, gm: {}, bop: [], sup: [] };
  return {
    pd: Object.fromEntries(perio.pd),
    gm: Object.fromEntries(perio.gm),
    bop: Array.from(perio.bop),
    sup: Array.from(perio.sup),
  };
}

// ---- SP-perio P2b Task 2: furcation involvement (Glickman I-IV, per
// entrance) public API. Operates on the ACTIVE-chart `toothState` alias,
// exactly like the perio-site API above — transparently Status/Plan
// dual-state aware. Pure data — no SVG/DOM touched, no render triggered
// (parity-safe: furcation has no chart layer yet, that's Task 4).

/**
 * Set/clear one furcation entrance's Glickman grade on the active chart's
 * tooth.
 *
 * - `entrance` must be one of {@link furcationEntrances}(toothNo) for THIS
 *   tooth (position-gated — e.g. "lingual" is rejected on an upper molar,
 *   which only ever offers mesial/distal/buccal). Any other entrance,
 *   including one valid for a different tooth position, is a silent no-op.
 * - `grade` must be an integer 1-4 (Glickman I-IV) to set/overwrite the
 *   entrance; `null`/`undefined` clears it; anything else (non-integer,
 *   out-of-range) is a silent no-op — state stays unchanged.
 *
 * Fires {@link notifyStateChange} whenever it actually mutates state; never
 * on a rejected/no-op call.
 */
export function setFurcation(toothNo: number, entrance: string, grade: number | null | undefined): void {
  if(!furcationEntrances(toothNo).includes(entrance)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  // DS-1: gate the mutation (see setPerioSite). Returns whether it changed so a
  // rejected/no-op edit is neither marked plan-edited nor mirrored.
  gateToothEdit(toothNo, () => {
    const furcation = s.furcation as Map<string, number>;

    if(grade === null || grade === undefined){
      if(furcation.has(entrance)){ furcation.delete(entrance); notifyStateChange(); return true; }
      return false;
    }
    if(!Number.isInteger(grade) || !VALID_FURCATION_GRADE.has(grade)) return false;
    if(furcation.get(entrance) !== grade){ furcation.set(entrance, grade); notifyStateChange(); return true; }
    return false;
  });
}

/** Read a tooth's furcation sub-record from the active chart as a PLAIN
 *  object (entrance -> grade), safe to mutate, never aliases live state. A
 *  tooth with no graded entrance (or never touched at all) returns `{}`. */
export function getToothFurcation(toothNo: number): Record<string, number> {
  const s = toothState.get(toothNo);
  const furcation = s?.furcation as Map<string, number> | undefined;
  if(!furcation || furcation.size === 0) return {};
  return Object.fromEntries(furcation);
}

// ---- SP-perio P2b Task 3: O'Leary plaque-index (per-surface presence)
// public API. Operates on the ACTIVE-chart `toothState` alias, exactly like
// the perio-site/furcation APIs above — transparently Status/Plan dual-state
// aware. Pure data — no SVG/DOM touched, no render triggered (parity-safe:
// plaque has no chart layer yet, that's Task 4).

/**
 * Set/clear one O'Leary plaque-index surface's presence on the active
 * chart's tooth.
 *
 * - `surface` must be one of {@link VALID_PLAQUE_SURFACE} (mesial/distal/
 *   buccal/lingual — the SAME fixed set for every tooth, no per-tooth-
 *   position gating like furcation's entrances). Any other value is a
 *   silent no-op.
 * - `present` truthy adds the surface to the set (plaque present); falsy
 *   removes it (clean/not recorded).
 *
 * Fires {@link notifyStateChange} whenever it actually mutates state; never
 * on a rejected/no-op call.
 */
export function setPlaque(toothNo: number, surface: string, present: boolean): void {
  if(!VALID_PLAQUE_SURFACE.has(surface)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  // DS-1: gate the mutation (see setPerioSite). Returns whether it changed so a
  // no-op edit is neither marked plan-edited nor mirrored.
  gateToothEdit(toothNo, () => {
    const plaque = s.plaque as Set<string>;
    if(present){
      if(!plaque.has(surface)){ plaque.add(surface); notifyStateChange(); return true; }
    }else{
      if(plaque.has(surface)){ plaque.delete(surface); notifyStateChange(); return true; }
    }
    return false;
  });
}

/** Read a tooth's plaque sub-record from the active chart as a PLAIN array
 *  of present surfaces, safe to mutate, never aliases live state. A tooth
 *  with no plaque surface (or never touched at all) returns `[]`. */
export function getToothPlaque(toothNo: number): string[] {
  const s = toothState.get(toothNo);
  const plaque = s?.plaque as Set<string> | undefined;
  if(!plaque || plaque.size === 0) return [];
  return Array.from(plaque);
}

// ---- SP-perio PG-D Task 1: Silness-Löe Plaque Index (PI) + Löe-Silness
// Gingival Index (GI) public API. Both are per-surface GRADED (1-3) axes over
// the SAME fixed 4-surface set as O'Leary `plaque` above, but a separate
// sub-record — this coexists intentionally with `plaque` (different clinical
// instrument), never merged with it. Operates on the ACTIVE-chart `toothState`
// alias, exactly like the perio-site/furcation/plaque APIs above —
// transparently Status/Plan dual-state aware. Pure data — no SVG/DOM touched,
// no render triggered (parity-safe: neither axis has a chart layer).

/** Read one graded surface off a Map, defaulting an absent/invalid entry to 0. */
function getSurfaceGrade(map: Map<string, number>, surface: string): 0|1|2|3 {
  const g = map.get(surface);
  return (g === 1 || g === 2 || g === 3) ? g : 0;
}

/**
 * Set/clear one graded surface (PI or GI, selected by `mapKey`) on the
 * active chart's tooth, through the DS-1 gate.
 *
 * - `surface` must be one of {@link VALID_PLAQUE_SURFACE}; any other value
 *   is a silent no-op.
 * - `grade` 0 clears the surface (absence = healthy); 1/2/3 sets it; any
 *   other value (non-integer, out of range) is a silent no-op.
 *
 * Fires {@link notifyStateChange} whenever it actually mutates state; never
 * on a rejected/no-op call — `gateToothEdit`'s `applyFn` returns `false` for
 * a no-op so the DS-1 protocol never marks/mirrors a tooth that didn't change.
 */
function setSurfaceGrade(toothNo: number, mapKey: "pi"|"gi"|"mpi"|"mbi", surface: string, grade: number): void {
  if(!VALID_PLAQUE_SURFACE.has(surface)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  // PG-E: mPI/mBI are peri-implant indices — only settable on implant teeth.
  if((mapKey === "mpi" || mapKey === "mbi") && s.toothSelection !== "implant") return;
  gateToothEdit(toothNo, () => {
    const map = s[mapKey] as Map<string, number>;
    if(grade === 0){
      if(map.has(surface)){ map.delete(surface); notifyStateChange(); return true; }
      return false;
    }
    if(grade === 1 || grade === 2 || grade === 3){
      if(map.get(surface) !== grade){ map.set(surface, grade); notifyStateChange(); return true; }
    }
    return false;
  });
}

/** Read a tooth's Silness-Löe Plaque Index grade on one surface from the
 *  active chart. Grade 0 (default) means healthy/absent — never distinct
 *  from "never charted". */
export function getPlaqueIndex(toothNo: number, surface: string): 0|1|2|3 {
  return getSurfaceGrade((toothState.get(toothNo)?.pi as Map<string, number>) ?? new Map(), surface);
}

/** Set/clear a tooth's Silness-Löe Plaque Index grade on one surface on the
 *  active chart. See {@link setSurfaceGrade} for validation/no-op semantics. */
export function setPlaqueIndex(toothNo: number, surface: string, grade: number): void {
  setSurfaceGrade(toothNo, "pi", surface, grade);
}

/** Read a tooth's Löe-Silness Gingival Index grade on one surface from the
 *  active chart. Grade 0 (default) means healthy/absent — never distinct
 *  from "never charted". */
export function getGingivalIndex(toothNo: number, surface: string): 0|1|2|3 {
  return getSurfaceGrade((toothState.get(toothNo)?.gi as Map<string, number>) ?? new Map(), surface);
}

/** Set/clear a tooth's Löe-Silness Gingival Index grade on one surface on the
 *  active chart. See {@link setSurfaceGrade} for validation/no-op semantics. */
export function setGingivalIndex(toothNo: number, surface: string, grade: number): void {
  setSurfaceGrade(toothNo, "gi", surface, grade);
}

// ---- SP-perio PG-E Task 1: peri-implant Mombelli indices (mPI/mBI) public
// API. Reuse the exact same per-surface graded machinery as PI/GI above
// (`setSurfaceGrade`), with one additional guard: mPI/mBI are implant-only —
// the setter is a silent no-op on any tooth that isn't `toothSelection ===
// "implant"` (including a never-touched tooth number, which lazily vivifies
// as a non-implant default and therefore also no-ops). See `setSurfaceGrade`
// for full validation/no-op semantics (invalid surface/grade).

/** Read a tooth's Mombelli modified Plaque Index grade on one surface from
 *  the active chart. Grade 0 (default) means healthy/absent — never distinct
 *  from "never charted". Implant-only in practice (see setter), but the
 *  getter itself is unconditional (mirrors PI/GI/every other graded axis). */
export function getPeriImplantPlaque(toothNo: number, surface: string): 0|1|2|3 {
  return getSurfaceGrade((toothState.get(toothNo)?.mpi as Map<string, number>) ?? new Map(), surface);
}

/** Set/clear a tooth's Mombelli modified Plaque Index grade on one surface on
 *  the active chart. Silent no-op unless the tooth is an implant
 *  (`toothSelection === "implant"`) — see `setSurfaceGrade` for the guard. */
export function setPeriImplantPlaque(toothNo: number, surface: string, grade: number): void {
  setSurfaceGrade(toothNo, "mpi", surface, grade);
}

/** Read a tooth's Mombelli modified sulcus Bleeding Index grade on one
 *  surface from the active chart. Grade 0 (default) means healthy/absent —
 *  never distinct from "never charted". */
export function getPeriImplantBleeding(toothNo: number, surface: string): 0|1|2|3 {
  return getSurfaceGrade((toothState.get(toothNo)?.mbi as Map<string, number>) ?? new Map(), surface);
}

/** Set/clear a tooth's Mombelli modified sulcus Bleeding Index grade on one
 *  surface on the active chart. Silent no-op unless the tooth is an implant
 *  (`toothSelection === "implant"`) — see `setSurfaceGrade` for the guard. */
export function setPeriImplantBleeding(toothNo: number, surface: string, grade: number): void {
  setSurfaceGrade(toothNo, "mbi", surface, grade);
}

// ---- SP-perio PG-D Task 2: keratinized gingiva width (KG) public API.
// A single per-tooth BUCCAL mm scalar (integer, clamped 0-15) — deliberately
// NOT per-site/per-surface, unlike pi/gi above or the 6-site perio-probing
// record. `null` = not charted, never a stored 0 (mirrors every other
// "absence means not charted" axis in this file). Operates on the ACTIVE-chart
// `toothState` alias, transparently Status/Plan dual-state aware. Interactive
// edits route through the DS-1 gate `gateToothEdit`. Pure data — no SVG/DOM
// touched, no render triggered (no svgLayer for this axis -> parity byte-
// identical).

/** Clamp an arbitrary input to an integer 0-15, or `null` for anything that
 *  isn't a finite number (including `null`/`undefined`) — used by both the
 *  setter (rejecting a non-finite EDIT as a no-op) and hydrate (tolerating a
 *  malformed/out-of-range STORED value by dropping it to null). */
function clampKg(mm: unknown): number | null {
  if(mm === null || mm === undefined) return null;
  const n = Number(mm);
  if(!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(15, Math.round(n)));
}

/** Read a tooth's keratinized gingiva width (mm) from the active chart.
 *  `null` means not charted. */
export function getKeratinizedWidth(toothNo: number): number | null {
  const v = toothState.get(toothNo)?.kg;
  return typeof v === "number" ? v : null;
}

/**
 * Set/clear a tooth's keratinized gingiva width (mm) on the active chart.
 *
 * - `mm === null` explicitly clears it (not charted).
 * - Any other value is clamped to an integer 0-15 via {@link clampKg}.
 * - A non-finite number (e.g. `NaN` from a bad keystroke) is a silent no-op
 *   — it must NOT clear an existing value, unlike an explicit `null`.
 *
 * Fires {@link notifyStateChange} whenever it actually mutates state; never
 * on a rejected/no-op call — `gateToothEdit`'s `applyFn` returns `false` for
 * a no-op so the DS-1 protocol never marks/mirrors a tooth that didn't change.
 */
export function setKeratinizedWidth(toothNo: number, mm: number | null): void {
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  const next = mm === null ? null : clampKg(mm);
  // non-finite number → no-op (do not clear an existing value on a bad keystroke)
  if(mm !== null && next === null) return;
  gateToothEdit(toothNo, () => {
    if(s.kg === next) return false;
    s.kg = next; notifyStateChange(); return true;
  });
}

// ---- SP-perio PG-C Task 2: cejVisibility + rootConcavity public API.
// Two per-tooth categorical DATA axes (data + registry + FHIR + payload only;
// the Dental Chart rows/UI are PG-C Task 3). Both operate on the ACTIVE-chart
// `toothState` alias like the perio/furcation/plaque APIs above — transparently
// Status/Plan dual-state aware. Interactive per-tooth edits, so they route
// through the DS-1 gate `gateToothEdit` exactly like setFurcation/setPlaque.
// Pure data — no SVG/DOM touched, no render triggered (neither axis has a chart
// layer: NO svgLayer → parity byte-identical).

/**
 * Set a tooth's CEJ-visibility on the active chart. `value` must be one of
 * {@link VALID_CEJ_VISIBILITY} (none | detectable | not-detectable); anything
 * else is a silent no-op (state unchanged). Fires {@link notifyStateChange}
 * only when it actually changes state; never on a rejected/no-op call.
 */
export function setCejVisibility(toothNo: number, value: string): void {
  if(!VALID_CEJ_VISIBILITY.has(value)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  // DS-1: gate the mutation (see setFurcation/setPlaque). Returns whether it
  // changed so a no-op edit is neither marked plan-edited nor mirrored.
  gateToothEdit(toothNo, () => {
    if(s.cejVisibility === value) return false;
    s.cejVisibility = value;
    notifyStateChange();
    return true;
  });
}

/** Read a tooth's CEJ-visibility from the active chart. A tooth never touched
 *  (or with the default) returns "none". */
export function getCejVisibility(toothNo: number): string {
  const s = toothState.get(toothNo);
  return (s?.cejVisibility as string) ?? "none";
}

/**
 * Set a tooth's root-concavity on the active chart. `value` must be one of
 * {@link VALID_ROOT_CONCAVITY} (none | mild | deep); anything else is a silent
 * no-op (state unchanged). Fires {@link notifyStateChange} only when it
 * actually changes state; never on a rejected/no-op call.
 */
export function setRootConcavity(toothNo: number, value: string): void {
  if(!VALID_ROOT_CONCAVITY.has(value)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  gateToothEdit(toothNo, () => {
    if(s.rootConcavity === value) return false;
    s.rootConcavity = value;
    notifyStateChange();
    return true;
  });
}

/** Read a tooth's root-concavity from the active chart. A tooth never touched
 *  (or with the default) returns "none". */
export function getRootConcavity(toothNo: number): string {
  const s = toothState.get(toothNo);
  return (s?.rootConcavity as string) ?? "none";
}

// ---- SP-perio PG-D Task 3: gingivalThickness + millerClass public API.
// Two per-tooth categorical DATA axes (data + registry + FHIR + payload only;
// the Dental Chart rows/UI land in later PG-D tasks). Both operate on the
// ACTIVE-chart `toothState` alias like the cejVisibility/rootConcavity APIs
// above — transparently Status/Plan dual-state aware. Interactive per-tooth
// edits, so they route through the DS-1 gate `gateToothEdit`. Pure data — no
// SVG/DOM touched, no render triggered (neither axis has a chart layer: NO
// svgLayer → parity byte-identical).

/**
 * Set a tooth's gingival-thickness on the active chart. `value` must be one
 * of {@link VALID_GINGIVAL_THICKNESS} (unknown | thin | medium | thick);
 * anything else is a silent no-op (state unchanged). Fires
 * {@link notifyStateChange} only when it actually changes state; never on a
 * rejected/no-op call.
 */
export function setGingivalThickness(toothNo: number, value: string): void {
  if(!VALID_GINGIVAL_THICKNESS.has(value)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  gateToothEdit(toothNo, () => {
    if(s.gingivalThickness === value) return false;
    s.gingivalThickness = value;
    notifyStateChange();
    return true;
  });
}

/** Read a tooth's gingival-thickness from the active chart. A tooth never
 *  touched (or with the default) returns "unknown". */
export function getGingivalThickness(toothNo: number): string {
  const s = toothState.get(toothNo);
  return (s?.gingivalThickness as string) ?? "unknown";
}

/**
 * Set a tooth's Miller recession class on the active chart. `value` must be
 * one of {@link VALID_MILLER_CLASS} (none | i | ii | iii | iv); anything else
 * is a silent no-op (state unchanged). Fires {@link notifyStateChange} only
 * when it actually changes state; never on a rejected/no-op call.
 */
export function setMillerClass(toothNo: number, value: string): void {
  if(!VALID_MILLER_CLASS.has(value)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  gateToothEdit(toothNo, () => {
    if(s.millerClass === value) return false;
    s.millerClass = value;
    notifyStateChange();
    return true;
  });
}

/** Read a tooth's Miller recession class from the active chart. A tooth never
 *  touched (or with the default) returns "none". */
export function getMillerClass(toothNo: number): string {
  const s = toothState.get(toothNo);
  return (s?.millerClass as string) ?? "none";
}

/** Derive Clinical Attachment Level (CAL = pd + gm, gm signed and defaulting
 *  to 0) for every CHARTED site of a tooth on the active chart. CAL is never
 *  stored — this is the single source of truth for it. A site absent from
 *  `pd` (not charted) has NO entry in the returned Map (not a 0). */
export function getToothCal(toothNo: number): Map<string, number> {
  const cal = new Map<string, number>();
  const s = toothState.get(toothNo);
  if(!s || !s.perio) return cal;
  for(const [site, pd] of s.perio.pd as Map<string, number>){
    cal.set(site, pd + ((s.perio.gm as Map<string, number>).get(site) ?? 0));
  }
  return cal;
}

/** Cairo RT1 interproximal-CAL "approximately zero" threshold, in mm (SP-perio
 *  PG-C Task 1 — see {@link getToothRecessionType}). Below this the
 *  interproximal papilla is considered clinically intact (no measurable
 *  attachment loss). Small, explicit, and tunable by a maintainer — Cairo
 *  2011 does not itself prescribe a numeric epsilon for "zero". */
const CAIRO_RT1_INTERPROX_THRESHOLD_MM = 1;

/** Cairo (2011) gingival-recession TYPE — RT1/RT2/RT3 — or `"none"`. */
export type RecessionType = "none" | "rt1" | "rt2" | "rt3";

/**
 * SP-perio PG-C Task 1: the Cairo 2011 recession-TYPE classification,
 * DERIVED purely from the already-charted per-site CAL ({@link getToothCal})
 * plus the buccal gingival margin (`perio.gm.get("B")`) — never stored, no
 * new state/payload/FHIR axis (parity byte-identical). Pure + read-only:
 * this is the single source of truth for a tooth's RT, mirroring how
 * {@link getToothCal} is the single source of truth for CAL.
 *
 * Cairo classifies BUCCAL recession by comparing it to the WORSE (deeper) of
 * the two adjacent interproximal (mesio-/disto-buccal) attachment losses:
 *   - `"none"`: no buccal recession — `gm.B` is <= 0 (the margin is at/
 *     coronal to the CEJ, i.e. a pseudopocket, not recession) OR the buccal
 *     site simply isn't charted (`gm.B` undefined). Absence is treated the
 *     same as "no recession", not "unknown", since RT is a display-only
 *     derivation with no "uncharted" state of its own to represent.
 *   - `"rt1"`: buccal recession present, but the interproximal CAL
 *     (`max(CAL[MB], CAL[DB])`) is below {@link CAIRO_RT1_INTERPROX_THRESHOLD_MM}
 *     — essentially no interproximal attachment/papilla loss. An uncharted
 *     MB/DB site contributes `0` to that max (the most conservative/least
 *     severe reading), so "buccal recession + nothing charted
 *     interproximally" also reads as RT1.
 *   - `"rt2"`: interproximal CAL loss is <= the buccal CAL loss — the
 *     papilla still reaches (or nearly reaches) the contact point.
 *   - `"rt3"`: interproximal CAL loss EXCEEDS the buccal CAL loss — severe
 *     papilla loss, apical to the buccal margin.
 */
export function getToothRecessionType(toothNo: number): RecessionType {
  const s = toothState.get(toothNo);
  if(!s || !s.perio) return "none";
  const gmB = (s.perio.gm as Map<string, number>).get("B");
  if(gmB === undefined || gmB <= 0) return "none";
  const cal = getToothCal(toothNo);
  const buccal = cal.get("B") ?? 0;
  const interprox = Math.max(cal.get("MB") ?? 0, cal.get("DB") ?? 0);
  if(interprox < CAIRO_RT1_INTERPROX_THRESHOLD_MM) return "rt1";
  if(interprox <= buccal) return "rt2";
  return "rt3";
}

/**
 * Whole-mouth periodontal summary over the active chart: total charted
 * sites, how many bled on probing, the derived %BOP, and the single worst
 * (deepest) CAL reading with the tooth it's on, plus the deepest raw pocket
 * depth recorded anywhere. `%BOP = bleedingSites / chartedSites` — a site
 * flagged `bop` without ever being charted can't exist (see setPerioSite()),
 * so this ratio can never exceed 100%. Returns zeros/nulls (never `NaN`)
 * when nothing has been charted anywhere.
 *
 * `maxFurcation` (SP-perio P2b Task 2): the single highest Glickman grade
 * (1-4) recorded on ANY furcation entrance anywhere in the mouth, `null`
 * when nothing has been graded. Deliberately its own pass over `ALL_TEETH`
 * (not folded into the pd-site loop above) since a tooth can carry furcation
 * data independently of whether it has any charted perio site.
 *
 * `plaquePercent` (SP-perio P2b Task 3): whole-mouth O'Leary Plaque Index —
 * `(total plaque surfaces charted across present teeth) / (present-teeth *
 * 4) * 100`, one decimal (same rounding as `bopPercent` above), `0` when
 * there are no present teeth (NOT `null` — matches `bopPercent`'s
 * zero-not-null convention, unlike `avgPd`/`avgCal`). "Present" here means a
 * REAL tooth in the mouth — `toothSelection` is neither `"none"` (missing)
 * nor `"implant"` — deliberately the SAME predicate `isToothPresent()` uses
 * (O'Leary is a tooth-focused index: a missing tooth has no surfaces to
 * chart, an implant has no natural tooth surface). This is intentionally
 * looser than `perioRowHidden()` (which additionally excludes under-gum/
 * extraction-socket teeth, since THOSE have no probeable periodontal
 * pocket) — an under-gum or extraction-socket "tooth" still occupies a slot
 * in the arch and can carry visible/recorded plaque on the socket/gum
 * surface, so it still counts toward the denominator here. Deliberately its
 * own pass over `ALL_TEETH` (not folded into the pd-site loop above) since a
 * tooth can carry plaque data independently of whether it has any charted
 * perio site, mirroring `maxFurcation` above. A tooth never touched at all
 * (no entry in the active chart map) is skipped entirely, same convention
 * `maxFurcation`'s loop and `getOdontogramSummary()` use.
 *
 * SP-perio PG-D Task 5 additions (own pass over `ALL_TEETH`, same "absence =
 * not charted" convention as `maxFurcation`/`plaquePercent` above):
 *   - `piScore`/`giScore`: mean of ALL charted PI/GI surface grades across
 *     the whole mouth (sum of grades / number of CHARTED surfaces, one
 *     decimal) — `null` when nothing is charted anywhere (mirrors
 *     `avgPd`/`avgCal`'s null-when-none, NOT `bopPercent`/`plaquePercent`'s
 *     zero-when-none, since a 0 mean would misleadingly read as "all
 *     surfaces charted healthy").
 *   - `kgDeficientTeeth`: count of teeth with a charted `kg` narrower than
 *     2mm (`kg != null && kg < 2`) — an uncharted tooth (`kg === null`) is
 *     never counted.
 *   - `gtDistribution`/`millerDistribution`: per-value counts across the
 *     whole mouth, excluding the "not charted" skip value (`unknown`/
 *     `none` respectively) — mirrors how `maxFurcation`'s loop only counts
 *     graded entrances.
 *
 * SP-perio PG-E Task 3 addition (own pass, same convention):
 *   - `mpiScore`/`mbiScore`: mean of ALL charted mPI/mBI surface grades
 *     across implant teeth (sum of grades / number of CHARTED surfaces, one
 *     decimal) — `null` when nothing is charted anywhere, mirrors
 *     `piScore`/`giScore` exactly. mPI/mBI are implant-only axes (the setter
 *     is a no-op on a non-implant tooth), so guarding the accumulator on
 *     `s.toothSelection === "implant"` is belt-and-suspenders — a
 *     non-implant tooth's `mpi`/`mbi` maps can never be non-empty — but
 *     makes the implant-only intent explicit at the read site too.
 */
export function getPerioSummary(): {
  chartedSites: number; bleedingSites: number; bopPercent: number;
  worstCal: number | null; worstCalTooth: number | null; maxPd: number | null;
  avgPd: number | null; avgCal: number | null; maxFurcation: number | null;
  plaquePercent: number;
  piScore: number | null; giScore: number | null; kgDeficientTeeth: number;
  gtDistribution: { thin: number; medium: number; thick: number };
  millerDistribution: { i: number; ii: number; iii: number; iv: number };
  // SP-perio PG-E Task 3: mPI/mBI whole-mouth mean, implant-only — mirrors
  // piScore/giScore's mean-of-charted-grades definition above.
  mpiScore: number | null; mbiScore: number | null;
} {
  let chartedSites = 0, bleedingSites = 0;
  let worstCal: number | null = null, worstCalTooth: number | null = null, maxPd: number | null = null;
  let sumPd = 0, sumCal = 0;
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s || !s.perio) continue;
    const pdMap = s.perio.pd as Map<string, number>;
    const gmMap = s.perio.gm as Map<string, number>;
    const bopSet = s.perio.bop as Set<string>;
    for(const [site, pd] of pdMap){
      chartedSites++;
      if(bopSet.has(site)) bleedingSites++;
      const cal = pd + (gmMap.get(site) ?? 0);
      sumPd += pd;
      sumCal += cal;
      if(worstCal === null || cal > worstCal){ worstCal = cal; worstCalTooth = toothNo; }
      if(maxPd === null || pd > maxPd) maxPd = pd;
    }
  }
  const bopPercent = chartedSites > 0 ? Math.round((bleedingSites / chartedSites) * 1000) / 10 : 0;
  // Averages over all charted sites, one decimal — null (not 0/NaN) when
  // nothing is charted, mirroring worstCal/maxPd's "absence = not charted".
  const avgPd = chartedSites > 0 ? Math.round((sumPd / chartedSites) * 10) / 10 : null;
  const avgCal = chartedSites > 0 ? Math.round((sumCal / chartedSites) * 10) / 10 : null;

  let maxFurcation: number | null = null;
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s || !s.furcation) continue;
    for(const grade of (s.furcation as Map<string, number>).values()){
      if(maxFurcation === null || grade > maxFurcation) maxFurcation = grade;
    }
  }

  // SP-perio P2b Task 3: O'Leary whole-mouth Plaque Index (see doc comment
  // above for the present-tooth definition/rationale).
  let presentTeeth = 0, plaqueSurfaces = 0;
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s) continue;
    if(!isToothPresent(s.toothSelection)) continue;
    presentTeeth++;
    plaqueSurfaces += (s.plaque as Set<string> | undefined)?.size ?? 0;
  }
  const plaquePercent = presentTeeth > 0 ? Math.round((plaqueSurfaces / (presentTeeth * 4)) * 1000) / 10 : 0;

  // SP-perio PG-D Task 5: PI/GI whole-mouth mean, KG-deficient tooth count,
  // GT/Miller distributions — deliberately their own pass over `ALL_TEETH`
  // (not folded into the pd-site loop above), same reasoning as
  // `maxFurcation`/`plaquePercent`: these axes are charted independently of
  // whether a tooth has any charted perio site.
  let piSum = 0, piCount = 0, giSum = 0, giCount = 0;
  let kgDeficientTeeth = 0;
  const gtDistribution = { thin: 0, medium: 0, thick: 0 };
  const millerDistribution = { i: 0, ii: 0, iii: 0, iv: 0 };
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s) continue;
    if(s.pi) for(const grade of (s.pi as Map<string, number>).values()){ piSum += grade; piCount++; }
    if(s.gi) for(const grade of (s.gi as Map<string, number>).values()){ giSum += grade; giCount++; }
    if(typeof s.kg === "number" && s.kg < 2) kgDeficientTeeth++;
    if(s.gingivalThickness === "thin") gtDistribution.thin++;
    else if(s.gingivalThickness === "medium") gtDistribution.medium++;
    else if(s.gingivalThickness === "thick") gtDistribution.thick++;
    if(s.millerClass === "i") millerDistribution.i++;
    else if(s.millerClass === "ii") millerDistribution.ii++;
    else if(s.millerClass === "iii") millerDistribution.iii++;
    else if(s.millerClass === "iv") millerDistribution.iv++;
  }
  const piScore = piCount > 0 ? Math.round((piSum / piCount) * 10) / 10 : null;
  const giScore = giCount > 0 ? Math.round((giSum / giCount) * 10) / 10 : null;

  // SP-perio PG-E Task 3: mPI/mBI whole-mouth mean, implant-only — own pass
  // over ALL_TEETH, same reasoning as the PI/GI pass above (mirrors it
  // exactly, just gated to implant teeth per the doc comment above).
  let mpiSum = 0, mpiCount = 0, mbiSum = 0, mbiCount = 0;
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s) continue;
    if(s.toothSelection !== "implant") continue;
    if(s.mpi) for(const grade of (s.mpi as Map<string, number>).values()){ mpiSum += grade; mpiCount++; }
    if(s.mbi) for(const grade of (s.mbi as Map<string, number>).values()){ mbiSum += grade; mbiCount++; }
  }
  const mpiScore = mpiCount > 0 ? Math.round((mpiSum / mpiCount) * 10) / 10 : null;
  const mbiScore = mbiCount > 0 ? Math.round((mbiSum / mbiCount) * 10) / 10 : null;

  return {
    chartedSites, bleedingSites, bopPercent, worstCal, worstCalTooth, maxPd, avgPd, avgCal, maxFurcation, plaquePercent,
    piScore, giScore, kgDeficientTeeth, gtDistribution, millerDistribution,
    mpiScore, mbiScore,
  };
}

/** UI-3b: true iff ANY periodontal axis has been charted anywhere in the
 *  mouth. Used to auto-skip the perio section of an export and to disable the
 *  perio image-export menu items on a blank chart. Derived entirely from
 *  `getPerioSummary()` — no new traversal. */
export function hasAnyPerioData(): boolean {
  const s = getPerioSummary();
  if(s.chartedSites > 0
    || s.maxFurcation !== null
    || s.plaquePercent > 0
    || s.piScore !== null
    || s.giScore !== null
    || s.kgDeficientTeeth > 0
    || s.gtDistribution.thin > 0 || s.gtDistribution.medium > 0 || s.gtDistribution.thick > 0
    || s.millerDistribution.i > 0 || s.millerDistribution.ii > 0
    || s.millerDistribution.iii > 0 || s.millerDistribution.iv > 0
    || s.mpiScore !== null
    || s.mbiScore !== null) return true;
  // `getPerioSummary()` doesn't surface three independently-chartable perio
  // axes, so scan for them directly (else a chart with ONLY such a finding is
  // wrongly treated as "no perio data" and its export section auto-skipped):
  //   - cejVisibility / rootConcavity: registry enum axes ("none" default),
  //     charted with no dependency on any PD site;
  //   - a NON-deficient KG measurement: the summary only counts kg<2
  //     (`kgDeficientTeeth`), so a healthy charted width (e.g. 5 mm) is invisible
  //     to the checks above but is still charted perio data.
  for(const toothNo of ALL_TEETH){
    if(getKeratinizedWidth(toothNo) !== null) return true;
    if(getCejVisibility(toothNo) !== "none") return true;
    if(getRootConcavity(toothNo) !== "none") return true;
  }
  return false;
}

/** 2.2.1: `true` iff at least one tooth on the ACTIVE chart carries a
 *  non-blank free-text note AND the notes feature is enabled — mirrors the
 *  same gate the tooltip / whole-mouth summary use. Drives the PDF export
 *  dialog's "individual notes" checkbox (disabled when this is false). */
export function hasAnyToothNote(): boolean {
  if(!notesEnabled) return false;
  for(const s of toothState.values()){
    if(s.note && s.note.trim() !== "") return true;
  }
  return false;
}

/** Per-tooth perio for every tooth on the active chart that has at least one
 *  charted site (an uncharted tooth is OMITTED, not present with empty
 *  maps — mirrors the same "absence = not charted" convention the payload's
 *  `perio` key follows). Keyed by tooth number (FDI), stringified (plain
 *  object keys are always strings), each value shaped like
 *  {@link getToothPerio}'s return. */
export function getPerioChart(): Record<string, PlainPerio> {
  const out: Record<string, PlainPerio> = {};
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s || !s.perio || s.perio.pd.size === 0) continue;
    out[String(toothNo)] = {
      pd: Object.fromEntries(s.perio.pd),
      gm: Object.fromEntries(s.perio.gm),
      bop: Array.from(s.perio.bop),
      sup: Array.from(s.perio.sup),
    };
  }
  return out;
}

/**
 * SP-perio P4b Task 1: state adapter for the pure 2017 periodontal
 * classification derivation core (`derivePerioClassification` in
 * `perioClassification.ts`). Reduces the active chart's per-tooth CAL/PD +
 * the P4a case metadata into the pure {@link PerioDerivationInput} struct —
 * this is the ONLY place engine state is read for classification purposes;
 * `derivePerioClassification` itself never touches `toothState`/`caseMeta`
 * directly, so it stays callable from an arbitrary serialized snapshot (the
 * later FHIR Condition builder feeds it that way, not live module state).
 *
 * Per tooth: `interdentalCal` = worst (max) CAL over the 4 approximal sites
 * (MB/DB/ML/DL); `buccalOralCal` = worst (max) CAL over the 2 mid sites
 * (B/L); `maxPd` = worst (max) raw PD over any of the 6 sites (from
 * `s.perio.pd` directly, NOT derived CAL); `present` mirrors
 * `isToothPresent()`. A tooth never touched at all (no chart entry) reads
 * as present with all-zero perio fields — the same "never touched -> default
 * state" convention every other per-tooth read in this file uses.
 */
export function buildDerivationInputFromState(): PerioDerivationInput {
  const INTERDENTAL_SITES = ["MB", "DB", "ML", "DL"] as const;
  const BUCCAL_ORAL_SITES = ["B", "L"] as const;

  const teeth: ToothDerivationInput[] = ALL_TEETH.map((toothNo) => {
    const s = toothState.get(toothNo);
    const present = isToothPresent((s ?? defaultState()).toothSelection);

    const cal = getToothCal(toothNo);
    let interdentalCal = 0;
    for (const site of INTERDENTAL_SITES) {
      const v = cal.get(site);
      if (v !== undefined && v > interdentalCal) interdentalCal = v;
    }
    let buccalOralCal = 0;
    for (const site of BUCCAL_ORAL_SITES) {
      const v = cal.get(site);
      if (v !== undefined && v > buccalOralCal) buccalOralCal = v;
    }

    let maxPd = 0;
    if (s && s.perio) {
      for (const pd of (s.perio.pd as Map<string, number>).values()) {
        if (pd > maxPd) maxPd = pd;
      }
    }

    return { toothNo, interdentalCal, buccalOralCal, maxPd, present };
  });

  const summary = getPerioSummary();
  const meta = getCaseMeta();

  return {
    teeth,
    bopPercent: summary.bopPercent,
    maxFurcation: summary.maxFurcation,
    meta: {
      age: meta.age,
      maxRblPercent: meta.maxRblPercent,
      toothLossPerio: meta.toothLossPerio,
      smokingStatus: meta.smokingStatus,
      cigarettesPerDay: meta.cigarettesPerDay,
      diabetesStatus: meta.diabetesStatus,
      hba1c: meta.hba1c,
    },
  };
}

/** Final result of {@link getPerioClassification} — one axis result per axis,
 *  each either the clinician's override (when set) or the pure-derived value,
 *  plus the raw derivation and an `overridden` flag per axis so callers (T3's
 *  FHIR evidence, T4's UI) can tell which. */
export interface PerioClassificationResult {
  diagnosis: string;
  stage: string;
  grade: string;
  extent: string;
  derived: PerioClassification;
  overridden: { diagnosis: boolean; stage: boolean; grade: boolean; extent: boolean };
}

/**
 * SP-perio P4b Task 2: the final periodontal classification — per-axis
 * clinician override (`caseMeta.<axis>Override`) when set, else the pure
 * `derivePerioClassification` result (fed via `buildDerivationInputFromState`,
 * the same state adapter T1 built). Overrides never feed back into the
 * derivation itself — `derived` is always the untouched computed value, so
 * callers can always see both what the engine computed and what the
 * clinician actually chose.
 */
export function getPerioClassification(): PerioClassificationResult {
  const derived = derivePerioClassification(buildDerivationInputFromState());
  return {
    diagnosis: caseMeta.diagnosisOverride ?? derived.diagnosis,
    stage: caseMeta.stageOverride ?? derived.stage,
    grade: caseMeta.gradeOverride ?? derived.grade,
    extent: caseMeta.extentOverride ?? derived.extent,
    derived,
    overridden: {
      diagnosis: caseMeta.diagnosisOverride !== null,
      stage: caseMeta.stageOverride !== null,
      grade: caseMeta.gradeOverride !== null,
      extent: caseMeta.extentOverride !== null,
    },
  };
}

/** P4b Task 4: `"molar-incisor"` (the derived/override enum value, hyphenated)
 *  maps to the camelCase `perio.class.extent.molarIncisor` i18n key segment;
 *  every other extent value is used as-is. */
function extentI18nSegment(extent: string): string {
  return extent === "molar-incisor" ? "molarIncisor" : extent;
}

/**
 * P4b Task 4: builds the FINAL (override-aware) periodontal classification
 * fragment appended to `getOdontogramSummary()`'s `periodontalText` — e.g.
 * "Dx: periodontitis · Stage III · Grade B · generalized" for periodontitis,
 * "Dx: gingivitis" for gingivitis (2017 stage/grade/extent only apply once
 * periodontitis is the diagnosis), or "Dx: periodontally healthy" whenever a
 * clinician has explicitly overridden ANY axis — even to arrive back at
 * health — so their choice stays visible rather than silently reverting to
 * the plain base text.
 *
 * Returns `""` (nothing appended) for the ordinary untouched case — final
 * diagnosis health AND no override on any axis — leaving `periodontalText`
 * byte-identical to its pre-P4b "healthy" wording for every existing
 * fixture/test that never touches perio data or the classification axes.
 */
function classificationSummaryFragment(cls: PerioClassificationResult): string {
  const anyOverride = cls.overridden.diagnosis || cls.overridden.stage || cls.overridden.grade || cls.overridden.extent;
  if(cls.diagnosis === "health" && !anyOverride) return "";
  const parts = [t("perio.class.summary.dx", { dx: t(`perio.class.dx.${cls.diagnosis}`) })];
  // Stage/grade/extent are periodontitis-staging concepts, so they're normally
  // shown only for a periodontitis diagnosis. But an EXPLICIT per-axis override
  // must never be silently dropped from the summary — surface it even when the
  // diagnosis isn't periodontitis (the clinician deliberately set it).
  const showStaging = cls.diagnosis === "periodontitis";
  if((showStaging || cls.overridden.stage) && cls.stage !== "na" && cls.stage !== "indeterminate") parts.push(t("perio.class.summary.stage", { stage: cls.stage }));
  if((showStaging || cls.overridden.grade) && cls.grade !== "indeterminate") parts.push(t("perio.class.summary.grade", { grade: cls.grade }));
  if((showStaging || cls.overridden.extent) && cls.extent !== "na") parts.push(t(`perio.class.extent.${extentI18nSegment(cls.extent)}`));
  return parts.join(" · ");
}

// ---- Periodontal-arc sub-project P2, Task 3: keyboard charting order ----
// Explicit, pure charting-order table driving the full-mouth grid's keyboard
// auto-advance (PerioChart.tsx). There are two "rows" — pd, then gm. WITHIN
// a row: the buccal sites (MB,B,DB) are charted tooth-by-tooth across the
// arch order (upper then lower — `ALL_TEETH`, the exact array `PerioChart.tsx`
// mirrors as its own module-scope `UPPER_ARCH`/`LOWER_ARCH` concat) before
// moving on to the lingual sites (ML,L,DL) the same way; this mirrors the
// grid's own DOM layout (`buildArch`'s field-row loop: tooth outer, site
// inner) and `PERIO_SITES`' own MB/B/DB/ML/L/DL grouping. Once every lingual
// gm site of the last tooth is reached, the order ends (`nextPerioCell`
// returns `null` — deliberately NOT wrapping back to the first pd cell, so a
// clinician doing a final full-mouth charting pass gets an explicit "done"
// signal rather than looping silently).
//
// Built ONCE at module load (2 rows * 6 sites * 32 teeth = 384 entries) so
// `nextPerioCell`/`prevPerioCell` are plain array lookups, not a
// re-derivation per call. Pure/side-effect-free — no `toothState` read, no
// DOM — safe to unit-test directly, independent of the grid.
const PERIO_CHART_ROWS = ["pd", "gm"] as const;
const PERIO_SITE_GROUPS: readonly (readonly PerioSite[])[] = [
  ["MB", "B", "DB"],
  ["ML", "L", "DL"],
];

export type PerioCellCoord = { toothNo: number; site: PerioSite; row: "pd" | "gm" };

const PERIO_CELL_ORDER: PerioCellCoord[] = (() => {
  const order: PerioCellCoord[] = [];
  for(const row of PERIO_CHART_ROWS){
    for(const siteGroup of PERIO_SITE_GROUPS){
      for(const toothNo of ALL_TEETH){
        for(const site of siteGroup){
          order.push({ toothNo, site, row });
        }
      }
    }
  }
  return order;
})();

function perioCellKey(c: { toothNo: number; site: string; row: string }): string {
  return `${c.row}:${c.toothNo}:${c.site}`;
}

const PERIO_CELL_INDEX: Map<string, number> = new Map(
  PERIO_CELL_ORDER.map((c, i) => [perioCellKey(c), i]),
);

/**
 * Pure charting-order helper for the full-mouth perio grid's keyboard
 * auto-advance (PerioChart.tsx) — given the cell just charted, returns the
 * NEXT cell in charting order (see the order table comment above), or
 * `null` at the very end (last lingual gm site of the last tooth in the
 * arch order). An unrecognized `cur` (a site string not in {@link PERIO_SITES}
 * or a `row` other than "pd"/"gm") also returns `null`. Never mutates
 * state — a plain-object round trip, trivially unit-testable in isolation.
 */
export function nextPerioCell(cur: { toothNo: number; site: string; row: "pd" | "gm" }): PerioCellCoord | null {
  const idx = PERIO_CELL_INDEX.get(perioCellKey(cur));
  if(idx === undefined) return null;
  return PERIO_CELL_ORDER[idx + 1] ?? null;
}

/** Reverse of {@link nextPerioCell} — the grid's Left-arrow / previous-cell
 *  step. `null` for an unrecognized `cur` or at the very first cell. */
export function prevPerioCell(cur: { toothNo: number; site: string; row: "pd" | "gm" }): PerioCellCoord | null {
  const idx = PERIO_CELL_INDEX.get(perioCellKey(cur));
  if(idx === undefined || idx === 0) return null;
  return PERIO_CELL_ORDER[idx - 1] ?? null;
}

// ---- Periodontal-arc sub-project P2, Task 2: full-mouth grid support ----
// Two small production (non-test) reads/writes the perio-chart overlay's grid
// (PerioChart.tsx, a separate React component/module) needs, since it lives
// outside odontogram.ts and can't reach the private `toothState` map,
// `perioRowHidden`, or `applyToSelected` directly.

/** Whether tooth `toothNo`'s periodontal probing sites are chartable on the
 *  active chart — the SAME gate {@link perioRowHidden} applies to the
 *  tooth-info panel's `#perioRow` (missing/implant/under-gum/extraction-
 *  socket teeth have no probing site to chart). The full-mouth perio-chart
 *  overlay grid (P2 Task 2) disables a tooth's entire column (site cells +
 *  mobility cell) on this same predicate — a tooth never touched (no stored
 *  state yet) reads as present/chartable, mirroring every other per-tooth
 *  default read here. */
export function isPerioRowHidden(toothNo: number): boolean {
  return perioRowHidden(toothState.get(toothNo));
}

/** Whether tooth `toothNo` is an implant on the ACTIVE chart (status/plan
 *  aware, reading the SAME `toothState` the perio number rows read). The
 *  graphical Dental Chart (`PerioChart` / `perioGraphic.ts`) uses this to draw
 *  the implant fixture artwork (`#implant-base`) in place of the natural
 *  `#tooth-base` for an implant tooth — a read-only presentation concern,
 *  outside the tooth-info panel, so like `isPerioRowHidden`/`getToothMobility`
 *  above it needs a small public read since it can't reach `toothState`
 *  directly. A never-touched tooth defaults to non-implant. */
export function isToothImplant(toothNo: number): boolean {
  return toothState.get(toothNo)?.toothSelection === "implant";
}

/** Read tooth `toothNo`'s Miller mobility grade from the active chart
 *  ("none" for a never-touched tooth, matching {@link defaultState}). */
export function getToothMobility(toothNo: number): string {
  return toothState.get(toothNo)?.mobility ?? "none";
}

/**
 * Set tooth `toothNo`'s Miller mobility grade on the active chart from
 * OUTSIDE the tooth-info panel. The panel's own `#mobilitySelect` writes
 * mobility through `applyToSelected()`, which applies to the bulk
 * `selectedTeeth` set — unusable here, since the full-mouth perio-chart
 * overlay grid (P2 Task 2) edits one specific tooth at a time that is not
 * necessarily `activeTooth` or selected on the base chart. This reuses the
 * EXACT SAME mutation + render + notify steps that path takes
 * (`applyStateToSvg`, `updateToothTileNumber`, re-syncing the panel when
 * `toothNo` happens to be the active tooth, `notifyStateChange`) — no new
 * mobility derivation or render logic, just a single-tooth entry point into
 * it. Lazily initializes a never-touched tooth's state first, exactly like
 * `setPerioSite` does. An unrecognized `value` (not in {@link VALID_MOBILITY})
 * is a silent no-op, exactly like every other per-tooth enum setter here.
 */
export function setToothMobility(toothNo: number, value: string): void {
  if(!VALID_MOBILITY.has(value)) return;
  let s = toothState.get(toothNo);
  if(!s){ s = defaultState(); toothState.set(toothNo, s); }
  if(s.mobility === value) return;
  gateToothEdit(toothNo, () => {
    s.mobility = value;
    applyStateToSvg(toothNo);
    updateToothTileNumber(toothNo);
    if(toothNo === activeTooth) syncControlsFromState(toothState.get(toothNo));
    notifyStateChange();
  });
}

// ---- Periodontal-arc sub-project P2, Task 1: perio-chart overlay open/close ----
// Separately-invocable imperative API so a host dental application can call up
// the perio overlay independently of the base odontogram (e.g. from its own
// menu/shortcut, without going through any odontogram-specific UI). The flag
// lives here (alongside the rest of the module-level session state) and reuses
// the existing `onStateChange` subscription — `App.tsx`'s demo subscribes and
// mirrors the flag into React state (`perioOpen`) so `<PerioChart/>` re-renders
// on open/close. No tooth-state mutation, no payload/FHIR change.
let perioOverlayOpen = false;

/** Open the perio-chart overlay. No-op (still notifies) if already open. */
export function openPerioOverlay(): void {
  perioOverlayOpen = true;
  notifyStateChange();
}

/** Close the perio-chart overlay. No-op (still notifies) if already closed. */
export function closePerioOverlay(): void {
  perioOverlayOpen = false;
  notifyStateChange();
}

/** Whether the perio-chart overlay is currently open. */
export function isPerioOverlayOpen(): boolean {
  return perioOverlayOpen;
}

// ---- Periodontal "Dental Chart" graphical redesign, Task 1: presentation ----
// Session-level UI preference (no payload/FHIR change) governing how the P2
// perio content is HOUSED: "toggle" (default) shows an Odontogram | Dental
// Chart segmented control that renders <PerioChart inline/> in the chart
// area (odontogram hidden via CSS, never unmounted); "popup" keeps P2's
// classic launch-button + modal-overlay housing. Lives alongside
// `perioOverlayOpen` (same session-state precedent) and reuses the existing
// `onStateChange` subscription — App.tsx mirrors it into React state exactly
// like `perioOpen` mirrors `isPerioOverlayOpen()`.
export type PerioViewMode = "toggle" | "popup";
let perioViewMode: PerioViewMode = "toggle";

/** Current perio-chart housing mode. Defaults to `"toggle"`. */
export function getPerioViewMode(): PerioViewMode {
  return perioViewMode;
}

/** Switch the perio-chart housing mode. No-op (still notifies) if unchanged. */
export function setPerioViewMode(mode: PerioViewMode): void {
  if(mode === perioViewMode) return;
  perioViewMode = mode;
  notifyStateChange();
}

// ---- UI-2 Task 1: Settings -> Periodontal tab app-level preferences ----
// Two session-level UI preferences (no payload/FHIR change), mirroring the
// `perioViewMode` precedent immediately above: a module `let` + getter +
// setter that calls `notifyStateChange()`. Neither is part of the tooth
// state, so neither is ever serialized (`collectExportPayload`/
// `getPlanChart`/hydrate never reference these) — round-trip/FHIR/SVG
// goldens are unaffected. `perioRowVisibility` drives which perio-chart
// index rows the Dental Chart renders (T2); `perioIndexNameMode` drives
// whether index row labels show the localized name or a static
// English/Latin canonical name (T3). Both are wired into the Settings ->
// Periodontal tab via `SettingsState` in `SettingsModal.tsx`.

/** The 16 toggleable periodontal index rows the Dental Chart can show/hide. */
export type PerioRowId =
  | "plaque"
  | "bop"
  | "cal"
  | "gm"
  | "pd"
  | "furcation"
  | "mobility"
  | "cej"
  | "rootConcavity"
  | "pi"
  | "gi"
  | "mpi"
  | "mbi"
  | "kg"
  | "gt"
  | "miller";

const PERIO_ROW_IDS: readonly PerioRowId[] = [
  "plaque", "bop", "cal", "gm", "pd", "furcation", "mobility", "cej",
  "rootConcavity", "pi", "gi", "mpi", "mbi", "kg", "gt", "miller",
];

function defaultPerioRowVisibility(): Record<PerioRowId, boolean> {
  const record = {} as Record<PerioRowId, boolean>;
  for (const id of PERIO_ROW_IDS) record[id] = true;
  return record;
}

let perioRowVisibility: Record<PerioRowId, boolean> = defaultPerioRowVisibility();

/** Current per-index perio-chart row visibility. Defaults to all-visible. */
export function getPerioRowVisibility(): Record<PerioRowId, boolean> {
  return perioRowVisibility;
}

/** Show/hide one perio-chart index row. No-op (still notifies) if unchanged. */
export function setPerioRowVisibility(id: PerioRowId, visible: boolean): void {
  if(perioRowVisibility[id] === visible) return;
  perioRowVisibility = { ...perioRowVisibility, [id]: visible };
  notifyStateChange();
}

/** How perio-chart index row labels are rendered. */
export type PerioIndexNameMode = "translated" | "canonical";
let perioIndexNameMode: PerioIndexNameMode = "translated";

/** Current perio index-name display mode. Defaults to `"translated"`. */
export function getPerioIndexNameMode(): PerioIndexNameMode {
  return perioIndexNameMode;
}

/** Switch the perio index-name display mode. No-op (still notifies) if unchanged. */
export function setPerioIndexNameMode(mode: PerioIndexNameMode): void {
  if(mode === perioIndexNameMode) return;
  perioIndexNameMode = mode;
  notifyStateChange();
}

// ---- Periodontal "Dental Chart" PG-B Task 2: the index-switcher overlay ----
// Session-level UI preference (no payload/FHIR change) selecting WHICH
// clinical index is highlighted OVER the Dental Chart arch graphic, on top of
// the always-drawn PD/GM curve. Purely a DISPLAY selector over existing perio
// data — it never mutates a tooth's state, adds an axis, or touches the live
// odontogram, so SVG-fingerprint / FHIR / round-trip goldens are unaffected.
//   - "none"    : no overlay (default).
//   - "plaque"  : marks on O'Leary plaque surfaces (getToothPlaque).
//   - "bop"     : dots on bleeding-on-probing sites (perio.bop).
//   - "pd5"/"pd6": highlight sites whose probing depth >= 5 / >= 6 mm.
//   - "pd"/"cal"/"gr": reserved for T3's continuous heat (no-op stubs here).
//   - "cairo"   : per-tooth Cairo (2011) recession TYPE (RT1-3), derived
//     from CAL (see getToothRecessionType) — a whole-tooth classification,
//     not a per-site reading (PG-C Task 1).
//   - "pi"/"gi" : per-surface graded Silness-Löe Plaque Index / Löe-Silness
//     Gingival Index (0-3, mesial/distal/buccal/lingual — getPlaqueIndex/
//     getGingivalIndex), heat-bucketed like the mm ramps (PG-D Task 4).
//   - "kg"      : per-tooth keratinized gingiva width in mm (getKeratinizedWidth),
//     heat-bucketed on a mucogingival-risk ramp (thin = severe) (PG-D Task 4).
//   - "mpi"/"mbi": per-surface graded Mombelli modified Plaque Index / modified
//     sulcus Bleeding Index (0-3, mesial/distal/buccal/lingual —
//     getPeriImplantPlaque/getPeriImplantBleeding), heat-bucketed like pi/gi.
//     IMPLANT-ONLY data, so marks only ever appear on implant teeth (PG-E).
// Lives alongside `perioViewMode` (same session-state precedent) and reuses
// the existing `onStateChange` subscription — PerioChart mirrors it into React
// state (for the active-button/read-out) and redraws the overlay on notify.
export type PerioOverlayLayer = "none" | "pd" | "cal" | "gr" | "cairo" | "kg" | "plaque" | "pi" | "gi" | "mpi" | "mbi" | "bop" | "pd5" | "pd6";
let perioOverlayLayer: PerioOverlayLayer = "none";

/** Current Dental Chart overlay layer. Defaults to `"none"`. */
export function getPerioOverlayLayer(): PerioOverlayLayer {
  return perioOverlayLayer;
}

/** Select the Dental Chart overlay layer. Always notifies (so the overlay
 *  redraws + the switcher's active state updates) even when unchanged. */
export function setPerioOverlayLayer(layer: PerioOverlayLayer): void {
  perioOverlayLayer = layer;
  notifyStateChange();
}

function downloadJson(payload: Any, filenamePrefix: string){
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
  a.href = url;
  a.download = `${filenamePrefix}-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadDataUrl(dataUrl: string, filename: string){
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

let exportOverlayEl: HTMLElement | null = null;
let exportInProgress = false;

function showExportOverlay(){
  if(exportOverlayEl) return;
  const card = el("div", { class: "odon-export-card" }, [
    el("div", { class: "odon-export-title", text: t("export.progress.title") }),
    el("div", { class: "odon-export-pct", id: "odonExportPct", text: "0%" }),
    el("div", { class: "odon-export-phase", id: "odonExportPhase", text: t("export.progress.preparing") }),
  ]);
  exportOverlayEl = el("div", { class: "odon-export-overlay", role: "status", "aria-live": "polite" }, [card]);
  document.body.appendChild(exportOverlayEl);
}
function setExportProgress(pct: number, phaseKey: string){
  const p = Math.max(0, Math.min(100, Math.round(pct)));
  const pctEl = exportOverlayEl?.querySelector("#odonExportPct");
  const phaseEl = exportOverlayEl?.querySelector("#odonExportPhase");
  if(pctEl) pctEl.textContent = `${p}%`;
  if(phaseEl) phaseEl.textContent = t(phaseKey);
}
function hideExportOverlay(){
  if(exportOverlayEl){ exportOverlayEl.remove(); exportOverlayEl = null; }
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Prune a cloned SVG subtree to match what is actually visible on screen.
 * Walks the live `original` and its `clone` in parallel and drops clone nodes
 * whose original element is hidden (display:none / visibility:hidden / opacity 0),
 * so the exported SVG reflects the current layer state without needing the
 * engine's CSS rules embedded.
 */
export function pruneHiddenClone(original: Element, clone: Element){
  const oChildren = Array.from(original.children);
  const cChildren = Array.from(clone.children);
  for(let i = 0; i < oChildren.length; i++){
    const o = oChildren[i];
    const c = cChildren[i];
    if(!c) continue;
    const cs = window.getComputedStyle(o);
    const hiddenByOpacity = cs.opacity !== "" && Number(cs.opacity) === 0;
    if(cs.display === "none" || cs.visibility === "hidden" || hiddenByOpacity){
      c.remove();
    }else{
      pruneHiddenClone(o, c);
    }
  }
}

/**
 * Prefix every id and id-reference inside a cloned subtree so that combining
 * many tiles (cloned from a few shared templates) into one SVG document does
 * not cause id collisions (gradients, clipPaths, etc.).
 */
export function namespaceIds(root: Element, prefix: string){
  const fixUrl = (v: string) => v.replace(/url\(#([^)]+)\)/g, (_m, id) => `url(#${prefix}${id})`);
  const refAttrs = ["fill","stroke","clip-path","mask","filter"];
  root.querySelectorAll("[id]").forEach((e) => {
    const oldId = e.getAttribute("id");
    if(oldId) e.setAttribute("id", prefix + oldId);
  });
  const nodes: Element[] = [root, ...Array.from(root.querySelectorAll("*"))];
  for(const e of nodes){
    for(const a of refAttrs){
      const v = e.getAttribute(a);
      if(v && v.includes("url(#")) e.setAttribute(a, fixUrl(v));
    }
    const style = e.getAttribute("style");
    if(style && style.includes("url(#")) e.setAttribute("style", fixUrl(style));
    const href = e.getAttribute("href") ?? e.getAttributeNS("http://www.w3.org/1999/xlink", "href");
    if(href && href.startsWith("#")){
      e.setAttribute("href", "#" + prefix + href.slice(1));
      e.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
    }
  }
}

/**
 * Serialize the on-screen odontogram tooth grid into a single, self-contained
 * SVG string (vector, no rasterization). Each tooth SVG is placed as a nested
 * `<svg>` at its laid-out position; tooth number labels are emitted as `<text>`.
 * Returns null if the grid is not present.
 */
export function buildOdontogramSvg(): { xml: string; width: number; height: number } | null {
  const grid = document.querySelector("#toothGrid, .tooth-grid") as HTMLElement | null;
  if(!grid) return null;
  const gridRect = grid.getBoundingClientRect();
  const W = Math.max(1, Math.round(gridRect.width));
  const H = Math.max(1, Math.round(gridRect.height));

  const out = document.createElementNS(SVG_NS, "svg");
  out.setAttribute("xmlns", SVG_NS);
  out.setAttribute("width", String(W));
  out.setAttribute("height", String(H));
  out.setAttribute("viewBox", `0 0 ${W} ${H}`);

  const bg = document.createElementNS(SVG_NS, "rect");
  bg.setAttribute("x", "0"); bg.setAttribute("y", "0");
  bg.setAttribute("width", String(W)); bg.setAttribute("height", String(H));
  bg.setAttribute("fill", "#ffffff");
  out.appendChild(bg);

  // Tooth SVGs, positioned by their rendered box.
  let tileIndex = 0;
  grid.querySelectorAll(".tooth-svg > svg").forEach((svgEl) => {
    const r = svgEl.getBoundingClientRect();
    if(r.width === 0 || r.height === 0) return;
    const clone = svgEl.cloneNode(true) as Element;
    pruneHiddenClone(svgEl, clone);
    namespaceIds(clone, `t${tileIndex++}-`);
    const wrap = document.createElementNS(SVG_NS, "svg");
    wrap.setAttribute("x", String(r.left - gridRect.left));
    wrap.setAttribute("y", String(r.top - gridRect.top));
    wrap.setAttribute("width", String(r.width));
    wrap.setAttribute("height", String(r.height));
    const vb = svgEl.getAttribute("viewBox");
    if(vb) wrap.setAttribute("viewBox", vb);
    wrap.setAttribute("preserveAspectRatio", "xMidYMid meet");
    while(clone.firstChild) wrap.appendChild(clone.firstChild);
    out.appendChild(wrap);
  });

  // Multi-tooth bridge-span saddle bars. The export is allowlist-based (only the
  // tooth SVGs and label cells above are cloned), so the live `.bridge-overlay`
  // <svg> is silently excluded; we recompute the SAME bars from tooth geometry
  // (shared computeBridgeBars) and emit them as native <rect> so PNG/JPG/SVG all
  // include the bridge. Drawn after the teeth (mirrors the live z-order).
  const bridgeSpans = detectBridgeSpans(bridgeStateFor);
  if(bridgeSpans.length){
    const rectFor = (toothNo: number) => tileRectFor(grid, gridRect, toothNo);
    const bars = computeBridgeBars(bridgeSpans, bridgeStateFor, rectFor, defaultMaterialColor);
    for(const bar of bars) out.appendChild(barRect(bar));
  }

  // Tooth number labels as text.
  grid.querySelectorAll(".tooth-label-cell").forEach((cell) => {
    const text = (cell.textContent || "").trim();
    if(!text) return;
    const r = cell.getBoundingClientRect();
    if(r.width === 0 || r.height === 0) return;
    const cs = window.getComputedStyle(cell);
    const txt = document.createElementNS(SVG_NS, "text");
    txt.setAttribute("x", String(r.left - gridRect.left + r.width / 2));
    txt.setAttribute("y", String(r.top - gridRect.top + r.height / 2));
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("dominant-baseline", "central");
    txt.setAttribute("font-family", cs.fontFamily);
    txt.setAttribute("font-size", cs.fontSize);
    txt.setAttribute("font-weight", cs.fontWeight);
    txt.setAttribute("fill", cs.color);
    txt.textContent = text;
    out.appendChild(txt);
  });

  const xml = new XMLSerializer().serializeToString(out);
  return { xml: `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`, width: W, height: H };
}

/** Export the odontogram as a downloadable, scalable SVG file. */
export async function exportSvg(){
  if(exportInProgress) return;
  exportInProgress = true;
  showExportOverlay();
  setExportProgress(30, "export.progress.preparing");
  try{
    const built = buildOdontogramSvg();
    if(!built) throw new Error("Odontogram grid not found");
    setExportProgress(90, "export.progress.encoding");
    const blob = new Blob([built.xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
    const a = document.createElement("a");
    a.href = url;
    a.download = `odontogram-${stamp}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setExportProgress(100, "export.progress.done");
    await new Promise((r) => window.setTimeout(r, 300));
  }finally{
    hideExportOverlay();
    exportInProgress = false;
  }
}

/**
 * UI-3b Task 6: shared SVG→raster core — loads a serialized SVG (as a data
 * URI) into an off-screen `<canvas>` at `scale`×, painted over a white
 * background first (charts have transparent gaps), and returns the canvas so
 * callers can encode it as PNG or JPEG at whatever quality they need.
 * Extracted out of `exportImage`/`exportPerioImage`'s previously-duplicated
 * raster paths (DRY) — behavior is unchanged, only factored out. The new
 * `exportPdf()` raster path reuses it too, via {@link rasterizeSvgToPng}.
 */
async function rasterizeSvgToCanvas(xml: string, width: number, height: number, scale = 2): Promise<HTMLCanvasElement> {
  const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("SVG rasterization failed"));
    img.src = svgUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if(!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * UI-3b Task 6: SVG → PNG data URL, built on {@link rasterizeSvgToCanvas}.
 * Used by `exportImage`'s/`exportPerioImage`'s PNG branch AND by
 * `exportPdf`'s chart-embedding path (jsPDF `.addImage` needs a PNG/JPEG
 * data URL, never raw SVG — see the module doc comment on `exportPdf`).
 */
async function rasterizeSvgToPng(xml: string, width: number, height: number, scale = 2): Promise<string> {
  const canvas = await rasterizeSvgToCanvas(xml, width, height, scale);
  return canvas.toDataURL("image/png");
}

/**
 * Export the odontogram as PNG or JPG. Renders the serialized SVG via the
 * browser's native rasterizer (Image → canvas) — much faster than the previous
 * html2canvas DOM rasterization, and sharper.
 */
export async function exportImage(format: "png" | "jpg" = "png"){
  if(exportInProgress) return;
  exportInProgress = true;
  showExportOverlay();
  setExportProgress(10, "export.progress.preparing");
  try{
    const built = buildOdontogramSvg();
    if(!built) throw new Error("Odontogram grid not found");
    setExportProgress(40, "export.progress.rendering");
    const canvas = await rasterizeSvgToCanvas(built.xml, built.width, built.height);
    setExportProgress(90, "export.progress.encoding");
    const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
    if(format === "jpg"){
      downloadDataUrl(canvas.toDataURL("image/jpeg", 0.92), `odontogram-${stamp}.jpg`);
    }else{
      downloadDataUrl(canvas.toDataURL("image/png"), `odontogram-${stamp}.png`);
    }
    setExportProgress(100, "export.progress.done");
    await new Promise((r) => window.setTimeout(r, 300));
  }finally{
    hideExportOverlay();
    exportInProgress = false;
  }
}

/** UI-3b: export the full perio chart as a standalone vector SVG file. */
export async function exportPerioSvg(): Promise<void> {
  if(exportInProgress) return;
  exportInProgress = true;
  showExportOverlay();
  setExportProgress(10, "export.progress.preparing");
  try{
    const built = await buildPerioSvg();
    if(!built) throw new Error("Perio chart could not be built");
    const blob = new Blob([built.xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
    const a = document.createElement("a");
    a.href = url; a.download = `perio-${stamp}.svg`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    setExportProgress(100, "export.progress.done");
    await new Promise((r) => window.setTimeout(r, 200));
  }finally{ hideExportOverlay(); exportInProgress = false; }
}

/** UI-3b: export the full perio chart as PNG/JPG (SVG → canvas @2×, via the
 *  shared {@link rasterizeSvgToCanvas} raster core). */
export async function exportPerioImage(format: "png" | "jpg" = "png"): Promise<void> {
  if(exportInProgress) return;
  exportInProgress = true;
  showExportOverlay();
  setExportProgress(10, "export.progress.preparing");
  try{
    const built = await buildPerioSvg();
    if(!built) throw new Error("Perio chart could not be built");
    setExportProgress(40, "export.progress.rendering");
    const canvas = await rasterizeSvgToCanvas(built.xml, built.width, built.height);
    setExportProgress(90, "export.progress.encoding");
    const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
    if(format === "jpg") downloadDataUrl(canvas.toDataURL("image/jpeg", 0.92), `perio-${stamp}.jpg`);
    else downloadDataUrl(canvas.toDataURL("image/png"), `perio-${stamp}.png`);
    setExportProgress(100, "export.progress.done");
    await new Promise((r) => window.setTimeout(r, 300));
  }finally{ hideExportOverlay(); exportInProgress = false; }
}

/**
 * UI-3b Task 6: assemble a printable PDF report (jsPDF-native — vector text
 * + raster chart PNGs, no svg2pdf.js). Gathers all `data` (SVG→PNG
 * rasterization via {@link rasterizeSvgToPng}, summary/classification text,
 * `hasAnyPerioData()`), drives the export-progress overlay, then hands off
 * to the PURE `assemblePdf()` (`src/perioPdf.ts`), which decides section
 * layout from `opts`/`data` alone.
 *
 * jsPDF-in-jsdom note: constructing a real `jsPDF` instance depends on
 * browser canvas/font internals jsdom doesn't fully provide, so this
 * wrapper is NOT unit-tested directly — `assemblePdf`'s section-gating IS
 * thoroughly unit-tested with an injectable fake doc (see
 * `ui3b-export-pdf.test.ts`). This wrapper's own raster→layout→save path is
 * a browser-verify item (see the task report).
 */
export async function exportPdf(opts: PdfExportOptions): Promise<void> {
  if(exportInProgress) return;
  exportInProgress = true;
  showExportOverlay();
  setExportProgress(10, "export.progress.preparing");
  try{
    const odontoBuilt = opts.odontogramChart ? buildOdontogramSvg() : null;
    if(opts.odontogramChart && !odontoBuilt) throw new Error("Odontogram grid not found");
    setExportProgress(30, "export.progress.rendering");
    const odontogramPng = odontoBuilt
      ? await rasterizeSvgToPng(odontoBuilt.xml, odontoBuilt.width, odontoBuilt.height)
      : "";

    const hasPerio = hasAnyPerioData();
    const perioNeeded = hasPerio && (opts.perioStatus || opts.perioDescription);
    let perioPng = "";
    let perioImageSize: { width: number; height: number } | undefined;
    if(perioNeeded){
      setExportProgress(50, "export.progress.rendering");
      const perioBuilt = await buildPerioSvg();
      if(!perioBuilt) throw new Error("Perio chart could not be built");
      perioPng = await rasterizeSvgToPng(perioBuilt.xml, perioBuilt.width, perioBuilt.height);
      perioImageSize = { width: perioBuilt.width, height: perioBuilt.height };
    }
    setExportProgress(80, "export.progress.encoding");

    const odontoSummary = getOdontogramSummary();
    const perioSum = getPerioSummary();
    const worstCalText = perioSum.worstCal === null
      ? "–"
      : `${perioSum.worstCal}${perioSum.worstCalTooth !== null ? ` (${formatToothLabel(perioSum.worstCalTooth)})` : ""}`;
    const perioSummaryText = [
      `${t("perio.bopPercent")}: ${perioSum.bopPercent}%`,
      `${t("perio.summary.worstCal")}: ${worstCalText}`,
      `${t("perio.summary.maxPd")}: ${perioSum.maxPd === null ? "–" : perioSum.maxPd}`,
      `${odontoSummary.periodontalTitle}: ${odontoSummary.periodontalText}`,
    ].join("\n");

    const data: PdfAssembleData = {
      hasPerio,
      caseMeta: getCaseMeta(),
      odontogramPng,
      odontogramSummaryText: buildOdontogramProseText(odontoSummary),
      individualNotesText: odontoSummary.individualNotes
        ? odontoSummary.individualNotes.items.join("\n")
        : "",
      odontogramImageSize: odontoBuilt ? { width: odontoBuilt.width, height: odontoBuilt.height } : undefined,
      perioPng,
      perioSummaryText,
      perioImageSize,
    };

    // Lazy-load jsPDF only when a PDF is actually exported, so it (and its
    // html2canvas/dompurify deps) stays out of consumers' main bundle.
    const { jsPDF } = await import("jspdf");
    assemblePdf(opts, data, () => new jsPDF() as unknown as PdfDocLike);
    setExportProgress(100, "export.progress.done");
    await new Promise((r) => window.setTimeout(r, 300));
  }finally{
    hideExportOverlay();
    exportInProgress = false;
  }
}

/**
 * UI-3b Task 6: multi-paragraph prose built from {@link getOdontogramSummary}
 * for the PDF odontogram section — overview sentence, permanent/missing
 * tooth lists, implants, and every non-empty per-axis section (caries,
 * fillings, endo, ...), each on its own line. Kept internal to `exportPdf`'s
 * data-gathering (not part of the public summary API) since it's just a
 * PDF-specific flattening of fields `OdontogramSummary` already exposes
 * structurally.
 */
function buildOdontogramProseText(summary: OdontogramSummary): string {
  const parts: string[] = [summary.overview];
  if(summary.permanentList) parts.push(summary.permanentList);
  if(summary.missingList) parts.push(summary.missingList);
  if(summary.implants) parts.push(`${summary.implants.heading}: ${summary.implants.text}`);
  for(const section of summary.sections){
    if(section.items.length) parts.push(`${section.heading}: ${section.items.join("; ")}`);
  }
  return parts.join("\n");
}

export function exportStatus(){
  downloadJson(collectExportPayload(), "odontogram-status");
}

/**
 * Export the current odontogram as an HL7 FHIR R4 collection Bundle (JSON).
 * @param options - Optional subject reference (e.g. "Patient/123"); when
 *   omitted a placeholder Patient is embedded.
 */
export function exportFhir(options?: FhirExportOptions){
  const bundle = buildFhirBundle(collectExportPayload(), options);
  downloadJson(bundle, "odontogram-fhir");
}

/**
 * R2-A Task 2 (D3, RATIFIED): the DATA-ONLY half of the import path — no
 * DOM/UI calls, so it is directly unit-testable without a live
 * initOdontogram() mount (mirrors why other module-state tests use
 * `__setToothStateForTest` instead of calling importStatus() itself: several
 * of importStatus()'s UI-sync tail calls, e.g. syncControlsFromState() via
 * updateSelectionUI(), assume a live control-panel DOM and are not part of
 * this task's scope to change).
 *
 * Hydrates `data.teeth` into `charts.status` EXPLICITLY (never the
 * active-chart alias), so importing a payload while in PLAN mode still loads
 * the STATUS chart correctly. A `plan` section (payload >=2.11) restores the
 * PLAN chart too. Its absence (e.g. a legacy <=2.10 payload, or a native
 * 2.11+ export where plan matched status and was omitted) leaves the plan
 * chart cleared/uninitialized, so the next setChartMode("plan") deep-copies
 * the freshly-imported status — it must never resurrect a stale plan left
 * over from before this import.
 */
function hydrateImportedCharts(data: Any): void {
  // FIX 1: only re-infer the legacy caries∩filling recurrent-caries intersection
  // for pre-2.3 payloads. A native ≥2.3 payload (including any FHIR bundle, which
  // parseFhirBundle tags "2.3") carries explicit `secondaryCaries` scores, so an
  // unscored caried+filled surface stays PRIMARY. A missing version → legacy.
  const inferLegacySecondaryCaries = isLegacyPayloadVersion(data.version);
  const teeth = data.teeth || {};
  for(const toothNo of ALL_TEETH){
    const raw = teeth[toothNo];
    charts.status.set(toothNo, hydrateState(raw, inferLegacySecondaryCaries));
  }
  // P4a: shared case-level metadata — mirrors `globals`, hydrated once here
  // regardless of status/plan, self-healing any bad/missing values.
  hydrateCaseMeta(data.case);
  if(data.plan && typeof data.plan === "object"){
    for(const toothNo of ALL_TEETH){
      const raw = data.plan[toothNo];
      charts.plan.set(toothNo, hydrateState(raw, inferLegacySecondaryCaries));
    }
    planInitialized = true;
  }else{
    charts.plan.clear();
    planInitialized = false;
  }
  // DS-1: an import replaces the whole case — a freshly imported plan carries
  // no runtime plan-edits (they are never serialized), so drop any stale marks
  // regardless of whether the import brought a `plan` section.
  planEditedTeeth.clear();
  // DS-1 (review Fix 2): also drop any pending dual-state confirm. Its deferred
  // `applyFn` was captured against the PRE-import state; a later
  // acceptDualStateConfirm() must never run it against freshly-hydrated charts.
  pendingDualStateConfirm = null;
  // UI-4: restore the UI layout state (card collapse settings) from the payload.
  hydrateUiState(data.ui);
}

/**
 * R2-A whole-branch review fix: force the active chart back to STATUS
 * immediately after an import hydrates `charts`. An import is status-primary
 * and replaces the whole case, so it must always land the user on the
 * STATUS chart — even if Plan mode was active before the import. Without
 * this, importing a payload while in Plan mode left `chartMode` on "plan"
 * and `toothState` aliased to `charts.plan`; the post-hydrate repaint would
 * then draw from the (possibly just-cleared, by `hydrateImportedCharts`)
 * plan chart instead of the freshly-imported status data, stranding the
 * user on an empty/stale plan view with the toggle still reading "Plan".
 * Forcing status here makes every import land predictably; the user can
 * switch to Plan afterwards to see the imported plan section, if one was
 * present.
 *
 * Extracted into its own function (rather than inlined in `importStatus()`)
 * so the test seam below can exercise EXACTLY this state-only logic without
 * requiring `importStatus()`'s DOM-dependent UI-sync tail (e.g.
 * `updateSelectionUI()` -> `syncControlsFromState()`, which assumes a live
 * control-panel DOM — same reason `hydrateImportedCharts()` itself is a
 * separate, directly-testable function; see its docstring above).
 */
function resetActiveChartToStatusAfterImport(): void {
  chartMode = "status";
  toothState = charts.status;
}

export function importStatus(data: Any){
  if(!data || typeof data !== "object") return;
  hydrateImportedCharts(data);
  resetActiveChartToStatusAfterImport();
  // Full repaint-all — now guaranteed to draw the just-imported STATUS chart
  // regardless of which chart was active before the import.
  for(const toothNo of ALL_TEETH){
    applyStateToSvg(toothNo);
    updateToothTileNumber(toothNo);
    updateToothLabelNoteIcon(toothNo);
  }
  if(data.globals){
    if(typeof data.globals.wisdomVisible === "boolean") setWisdomVisible(data.globals.wisdomVisible);
    if(typeof data.globals.showBase === "boolean") setShowBase(data.globals.showBase);
    if(typeof data.globals.occlusalVisible === "boolean") setOcclusalVisible(data.globals.occlusalVisible);
    if(typeof data.globals.showHealthyPulp === "boolean") setHealthyPulpVisible(data.globals.showHealthyPulp);
    if(typeof data.globals.edentulous === "boolean"){
      edentulous = data.globals.edentulous;
      setToggleButton($("#btnEdentulous"), edentulous);
    }
  }
  // UI-4: restore collapsed/expanded card state to the DOM after import.
  for(const id of Object.keys(collapsedCards)){
    applyCollapsedCardDom(id, collapsedCards[id]);
  }
  updateSelectionFilterButtons();
  updateSelectionUI();
  notifyStateChange();
  syncChartModeUi();
}

/** TEST-ONLY (R2-A Task 2 seam): exercise the DATA-ONLY import hydrate
 *  (status-primary teeth + conditional plan restore + planInitialized),
 *  without requiring a live DOM/initOdontogram() token. Not part of the
 *  public API. */
export function __hydrateImportedChartsForTest(data: Any): void {
  hydrateImportedCharts(data);
}

/** TEST-ONLY (whole-branch review fix seam): exercise the DATA-ONLY half of
 *  the import path's chart-mode fix — `hydrateImportedCharts()` followed by
 *  the new `resetActiveChartToStatusAfterImport()` step `importStatus()`
 *  now runs — without requiring a live DOM/initOdontogram() token.
 *  `importStatus()`'s own DOM-dependent UI-sync tail (`updateSelectionUI()`
 *  -> `syncControlsFromState()`) assumes a live control-panel DOM and is out
 *  of scope for this seam, same as `__hydrateImportedChartsForTest`. Not
 *  part of the public API. */
export function __importStatusForTest(data: Any): void {
  if(!data || typeof data !== "object") return;
  hydrateImportedCharts(data);
  resetActiveChartToStatusAfterImport();
}

/** Import a FHIR R4 Bundle (object or JSON string) produced by this module. */
export function importFhirBundle(input: Any){
  let bundle = input;
  if(typeof input === "string"){
    try{ bundle = JSON.parse(input); }catch(e){ console.error("Invalid FHIR JSON", e); return; }
  }
  const payload = parseFhirBundle(bundle);
  importStatus(payload);
}

function applyStatusExtra(option: Any){
  if(!option) return;
  const meta = getStatusExtrasMeta();
  const archTeeth = (arch)=> meta?.[arch] || [];
  const archWisdom = (arch)=> meta?.wisdom?.[arch] || [];

  // DS-1 (review Fix 1+2): a Statuses preset is a SINGLE atomic interactive edit
  // over a SET of teeth — it MUST go through the batch gate exactly once (like
  // setEdentulous / the dentition presets), NOT a per-tooth `gateToothEdit` loop.
  // Per-tooth gating was doubly broken: (1) a preset touching >=2 already
  // plan-edited teeth hit the confirm's single-slot guard on the 2nd+ tooth, so
  // that tooth's edit was silently discarded even after Accept (data loss);
  // (2) a preset touching a planned + an unplanned tooth applied the unplanned
  // tooth immediately (before the user answered the confirm), so Cancel left a
  // partial apply. The fix: PRECOMPUTE the set of teeth the preset will ACTUALLY
  // change (same skip/predicate/unchanged-value detection the per-tooth path
  // used, via a serialized before/after comparison, computed on a CLONE so
  // nothing is committed before the gate resolves), then apply ALL of them in
  // ONE `gateToothEditBatch` closure — ONE confirm if any changed tooth is
  // plan-edited, apply-all-or-none, and mark/mirror only the actually-changed
  // teeth. `changes` accumulates across the (possibly several) `collect()` calls
  // a single preset makes (bar-denture makes three), so the WHOLE preset is one
  // atomic batch. Uninitialized plan stays a pure passthrough (byte-identical).
  const changes = new Map<number, Any>(); // toothNo -> precomputed next state
  const collect = (teeth, fn)=>{
    for(const toothNo of teeth){
      // Base successive collects for the same tooth on the prior collect's result
      // (so multi-collect presets compose exactly like the old sequential
      // per-tooth application), else on the tooth's current committed state.
      const base = changes.get(toothNo) ?? toothState.get(toothNo) ?? defaultState();
      const clone = hydrateState(serializeState(base), false);
      const next = fn(clone, toothNo) || clone;
      changes.set(toothNo, next);
    }
  };
  const commit = ()=>{
    // Keep only teeth whose FINAL next state differs from what is committed now —
    // this uniformly drops the three no-op cases (wisdom skip, predicate
    // mismatch, unchanged value) so the gate never marks/mirrors an unchanged
    // tooth (mirroring how setPerioSite/setFurcation/setPlaque signal `changed`).
    const entries = [...changes.entries()].filter(([toothNo, next]) =>
      JSON.stringify(serializeState(next)) !== JSON.stringify(serializeState(toothState.get(toothNo) ?? defaultState())));
    const changed = entries.map(([toothNo]) => toothNo);
    gateToothEditBatch(changed, ()=>{
      for(const [toothNo, next] of entries){
        toothState.set(toothNo, next);
        applyStateToSvg(toothNo);
        updateToothTileNumber(toothNo);
      }
      if(activeTooth){
        syncControlsFromState(toothState.get(activeTooth));
      }
      updateSelectionFilterButtons();
      // B9: applyStateToSvg only touches per-tooth SVG; notifyStateChange() is
      // what drives updateBridgeOverlay() (the bridge-span connector) + every
      // listener. Fire it ONCE here, after all changed teeth are applied — and
      // INSIDE the gated closure so it runs when the batch actually applies
      // (synchronously on the immediate path; on Accept for a deferred confirm),
      // never while the confirm is still pending.
      notifyStateChange();
    });
  };

  // Legacy crownMaterial values only ever offered "zircon" | "metal" here; fold
  // the deliberate metal -> metal-ceramic rename (matches the hydrateState migration).
  const toRestorationMaterial = (material: Any) => material === "metal" ? "metal-ceramic" : material;

  // Pillar (abutment) tooth: a present tooth gets a crown restoration, flagged
  // as a bridge pillar. Full multi-tooth bridge-span rendering on a tooth-base
  // pillar is an SP3b concern; this only sets the new-model fields.
  const setBridgeCrown = (s, material)=>{
    s.toothSubstrate = "crownprep";
    s.restorationType = "crown";
    s.restorationMaterial = toRestorationMaterial(material);
    s.bridgePillar = true;
    s.brokenMesial = false;
    s.brokenIncisal = false;
    s.brokenDistal = false;
  };

  // Pontic (gap) tooth: a missing tooth gets a bridge-type restoration.
  const setBridgePontic = (s, material)=>{
    s.restorationType = "bridge";
    s.restorationMaterial = toRestorationMaterial(material);
  };

  if(option.type === "span"){
    collect(option.teeth || [], (s)=>{
      if(s.toothSelection === "tooth-base"){
        setBridgeCrown(s, option.material);
      }else if(s.toothSelection === "none"){
        setBridgePontic(s, option.material);
      }
    });
    commit();
    return;
  }

  if(option.type === "arch-bridge"){
    const teeth = archTeeth(option.arch);
    const wisdom = new Set(archWisdom(option.arch));
    const present = teeth.filter(tn => toothState.get(tn)?.toothSelection === "tooth-base");
    if(present.length >= 2){
      const first = present[0];
      const last = present[present.length - 1];
      const startIdx = teeth.indexOf(first);
      const endIdx = teeth.indexOf(last);
      const between = startIdx < endIdx ? teeth.slice(startIdx + 1, endIdx) : [];
      collect(teeth, (s, tn)=>{
        if(wisdom.has(tn)) return;
        if(s.toothSelection === "tooth-base"){
          setBridgeCrown(s, option.material);
        }else if(s.toothSelection === "none" && between.includes(tn)){
          setBridgePontic(s, option.missingMaterial || option.material);
        }
      });
    }else{
      collect(teeth, (s, tn)=>{
        if(wisdom.has(tn)) return;
        if(s.toothSelection === "tooth-base"){
          setBridgeCrown(s, option.material);
        }
      });
    }
    commit();
    return;
  }

  if(option.type === "partial-removable"){
    const teeth = archTeeth(option.arch);
    const wisdom = new Set(archWisdom(option.arch));
    collect(teeth, (s, tn)=>{
      if(wisdom.has(tn)) return;
      if(s.toothSelection === "none"){
        s.prosthesis = "removable-partial";
      }
    });
    commit();
    return;
  }

  if(option.type === "full-removable"){
    const teeth = archTeeth(option.arch);
    const wisdom = new Set(archWisdom(option.arch));
    collect(teeth, (_s, tn)=>{
      const next = defaultState();
      next.toothSelection = "none";
      next.prosthesis = wisdom.has(tn) ? "none" : "removable-full";
      return next;
    });
    commit();
    return;
  }

  if(option.type === "bar-denture"){
    const implantTeeth = option.implants || [];
    const missingTeeth = option.missing || [];
    const archTeeth = option.arch ? (getStatusExtrasMeta()?.[option.arch] || []) : [];
    const sevenEight = archTeeth.filter(tn => [7,8].includes(tn % 10));
    collect(implantTeeth, (_s, _tn)=>{
      const next = defaultState();
      next.toothSelection = "implant";
      next.prosthesis = "bar-denture";
      return next;
    });
    collect(missingTeeth, (_s, _tn)=>{
      const next = defaultState();
      next.toothSelection = "none";
      next.prosthesis = "bar-denture";
      return next;
    });
    collect(sevenEight, (_s, _tn)=>{
      const next = defaultState();
      next.toothSelection = "none";
      return next;
    });
    commit();
  }
}

/** TEST-ONLY: apply a clinical status-extra preset (span/arch-bridge/removable/
 *  bar-denture) directly against the module-level state map. Not part of the
 *  public API. */
export function __applyStatusExtraForTest(option: Any): void {
  applyStatusExtra(option);
}

// ---- Load and build grid ----
let initialized = false;
let controlsWired = false;
let initToken = 0;

// `svgText` is the inlined SVG markup from a `?raw` import (see TEMPLATES) —
// parsed directly, never fetched. Kept `async` so existing `await loadSvg(...)`
// call sites are unchanged.
async function loadSvg(svgText: Any){
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svg = doc.documentElement;
  // Normalize ids/attrs
  stripDisplayNoneToDataActive(svg);
  ensureDataActiveForSwitchables(svg);
  return svg;
}

async function buildGrid(token: number){
  if(!initialized || token !== initToken) return;
  const grid = $("#toothGrid");
  if(!grid) return;
  grid.innerHTML = "";

  // preload SVG templates in parallel
  const tplCache = new Map();
  const occlCache = new Map();
  const tplNos = [11,13,14,16] as const;
  const occlNos = [14,16] as const;
  await Promise.all([
    ...tplNos.map(async (tplNo) => {
      tplCache.set(tplNo, await loadSvg(TEMPLATES[tplNo]));
    }),
    ...occlNos.map(async (tplNo) => {
      occlCache.set(tplNo, await loadSvg(TEMPLATES_OCCL[tplNo]));
    }),
  ]);
  if(!initialized || token !== initToken) return;

  function addTile({toothNo, tplNo, rot, mirror, view, clickable}: Any){
    if(!initialized || token !== initToken) return;
    const tpl = view === "occl" ? occlCache.get(tplNo) : tplCache.get(tplNo);
    if(!tpl) return;
    const svg = tpl.cloneNode(true);
    if(rot === 180) rotate180(svg);
    if(mirror) mirrorVertical(svg);

    const tileClasses = [
      "tooth-tile",
      `tpl-${tplNo}`,
      toothNo >= 31 ? "lower-row" : "upper-row",
      view === "occl" ? "occl-view" : "side-view"
    ];
    if(!clickable) tileClasses.push("placeholder");

    const tile = el("div", { class: tileClasses.join(" "), "data-tooth": String(toothNo) }, [
      el("div", { class:"tooth-svg" })
    ]);
    $(".tooth-svg", tile).appendChild(svg);

    if(clickable){
      tile.addEventListener("click", (e)=>onToothClick(toothNo, e));
      tile.addEventListener("dblclick", ()=>{
        if(!notesEnabled || readOnly) return;
        showNoteEditor(toothNo);
      });
      tile.addEventListener("keydown", (e)=>onToothKeydown(toothNo, e));
      if(view === "side"){
        tile.setAttribute("role", "option");
        tile.setAttribute("aria-selected", "false");
        tile.setAttribute("tabindex", readOnly ? "-1" : "0");
        tile.setAttribute("aria-label", toLabel(toothNo, numberingSystem));
      }
      if(isTouchDevice()) addTouchToTile(tile, toothNo);
    }else{
      tile.removeAttribute("data-tooth");
    }

    grid.appendChild(tile);

    if(!toothSvgRoot.has(toothNo)) toothSvgRoot.set(toothNo, []);
    toothSvgRoot.get(toothNo).push(svg);
    if(!toothTile.has(toothNo)) toothTile.set(toothNo, []);
    toothTile.get(toothNo).push(tile);

    if(!toothState.has(toothNo)) toothState.set(toothNo, defaultState());
    applyStateToSvg(toothNo);
  }

  function addRowSide(rowTeeth: Any){
    for(const toothNo of rowTeeth){
      const map = TOOTH_TEMPLATE.get(toothNo);
      const tplNo = map ? map.tpl : 16;
      addTile({ toothNo, tplNo, rot: map?.rot ?? 0, mirror: map?.mirror ?? false, view: "side", clickable: true });
    }
  }

  function occlTemplateForTooth(toothNo: Any){
    if([14,15,24,25,34,35,44,45].includes(toothNo)) return 14;
    if([16,17,18,26,27,28,36,37,38,46,47,48].includes(toothNo)) return 16;
    return null;
  }

  function addPlaceholderTile(){
    const tile = el("div", { class:"tooth-tile occl-view placeholder" }, [
      el("div", { class:"tooth-svg" })
    ]);
    grid.appendChild(tile);
  }

  function addRowOccl(rowTeeth: Any, placeholders: Any){
    for(const toothNo of rowTeeth){
      const map = TOOTH_TEMPLATE.get(toothNo);
      const tplNo = occlTemplateForTooth(toothNo);
      if(placeholders.has(toothNo) || !tplNo || !map){
        addPlaceholderTile();
        continue;
      }
      addTile({ toothNo, tplNo, rot: map.rot, mirror: map.mirror, view: "occl", clickable: true });
    }
  }

  function addLabelRow(rowTeeth: Any, targetMap: Any){
    const row = el("div", { class:"tooth-label-row", "aria-hidden":"true" });
    for(const toothNo of rowTeeth){
      const cell = el("div", { class:"tooth-label-cell", text: toLabel(toothNo, numberingSystem), tabindex:"-1" });
      cell.addEventListener("click", (e)=>onToothClick(toothNo, e));
      row.appendChild(cell);
      targetMap.set(toothNo, cell);
    }
    grid.appendChild(row);
  }

  const upperSide = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
  const lowerSide = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
  const upperOcclPlaceholders = new Set([13,12,11,21,22,23]);
  const lowerOcclPlaceholders = new Set([43,42,41,31,32,33]);

  if(!initialized || token !== initToken) return;
  addLabelRow(upperSide, toothLabelUpper);
  addRowSide(upperSide);
  addRowOccl(upperSide, upperOcclPlaceholders);
  addRowOccl(lowerSide, lowerOcclPlaceholders);
  addRowSide(lowerSide);
  addLabelRow(lowerSide, toothLabelLower);

  // ARIA on grid container
  grid.setAttribute("role", "listbox");
  grid.setAttribute("aria-multiselectable", "true");

  // start with no tooth selected
  selectedTeeth = new Set();
  activeTooth = null;
  updateSelectionUI();
  updateToothTileVisibility();
  setOcclusalVisible(occlusalVisible);
  setHealthyPulpVisible(showHealthyPulp);

  // Wire touch interactions
  if(isTouchDevice()){
    grid.addEventListener("touchstart", onGridTouchStart, { passive: false });
    grid.addEventListener("touchmove", onGridTouchMove, { passive: false });
    grid.addEventListener("touchend", onGridTouchEnd);
    buildArchToggle();
  }
}

let pendingImportFormat: "status" | "fhir" = "status";
/** Set which parser the next file import uses. Defaults back to "status" after each import. */
export function setImportFormat(format: "status" | "fhir"){
  pendingImportFormat = format === "fhir" ? "fhir" : "status";
}

// ---- Controls wiring ----
function wireControls(){
  // Collapse toggles and the global visibility toggles use delegated listeners
  // with stable function references, so addEventListener de-duplicates them.
  // Register on every init because destroyOdontogram removes them; the DOM
  // guarantees only one live listener each. These handle the `setX(!current)`
  // toggles that would otherwise cancel themselves out under React StrictMode's
  // double mount-effect (which re-wires anonymous listeners onto the same nodes).
  document.addEventListener("click", onCardToggleClick);
  document.addEventListener("click", onGlobalToggleClick);
  // Note: buildChecks/buildSurfaceCross/buildSelect below self-clear and create
  // fresh nodes, so re-running wireControls per init is safe; destroyOdontogram
  // empties those containers and they are rebuilt here.
  if(controlsWired) return;
  controlsWired = true;
  const iconButtons = ["btnOcclView","btnWisdomVisible","btnBoneVisible","btnPulpVisible"];
  iconButtons.forEach((id)=>{
    const btn = $(`#${id}`);
    if(btn) loadInlineIcon(btn).then(()=>syncIconXLine(btn));
  });

  // Tooth base dropdown
  buildSelect($("#toothSelect"), getToothSelectOptions(), (value)=>{
    applyToSelected((s, toothNo)=>{
      if(value === "milktooth" && MILKTOOTH_BLOCKED.has(toothNo)){
        return;
      }
      const next = defaultState();
      next.toothSelection = value;
      if(!["tooth-base","milktooth","implant","tooth-under-gum"].includes(value)){
        next.extractionPlan = false;
      }
      if(value !== "none"){
        next.extractionWound = false;
      }
      if(value === "implant" || value === "none"){
        next.caries.clear();
        next.endo = "none";
        next.pulpDx = "normal";
        next.fillingMaterial = "none";
        next.fillingSurfaces.clear();
      }
      toothState.set(toothNo, next);
    });
    if(value !== "none") setEdentulous(false);
  });

  // Substrate dropdown (tooth condition: natural / radix / broken / crown-prep)
  buildSelect($("#substrateSelect"), getSubstrateOptions(), (value)=>{
    applyToSelected((s)=>{
      s.toothSubstrate = value;
      if(value !== "broken"){
        s.brokenMesial = false;
        s.brokenIncisal = false;
        s.brokenDistal = false;
      }
      // crown-needed only applies while a natural/broken/prepared tooth is unrestored
      if(!["natural","broken","crownprep"].includes(value) || s.restorationType !== "none"){
        s.crownNeeded = false;
      }
    });
    setEdentulous(false);
  });

  // Combined restoration dropdown (crown / inlay / onlay / veneer / bridge ×
  // material). Value encodes `${type}|${material}` and writes BOTH fields.
  // At initial wiring there is no active tooth yet (options get narrowed by
  // syncControlsFromState/refreshAllSelectOptions once one is selected), but
  // thread ctx consistently in case activeTooth is already set (e.g. re-wire).
  const initialToothState = activeTooth ? toothState.get(activeTooth) : null;
  buildSelect($("#restorationSelect"), getRestorationOptions("occlusal", { isImplant: initialToothState?.toothSelection === "implant", toothSelection: initialToothState?.toothSelection }), (value)=>{
    const v = String(value);
    applyToSelected((s)=>{ applyRestorationSelection(s, v); });
    setEdentulous(false);
  });

  // SP7 Task 4: merged pulp/endo status. Custom-built (optgroups) rather than
  // via buildSelect; the change handler routes to pulpEndoOnSelect, which
  // enforces the mutual-exclusion invariant (endo <-> vital pulpDx).
  {
    const sel = $("#pulpEndoSelect");
    sel.addEventListener("change", () => {
      const value = sel.value;
      applyToSelected((s)=>{ pulpEndoOnSelect(s, value); });
    });
  }

  // Apical (AAE) diagnosis
  buildSelect($("#apicalDxSelect"), getApicalDxOptions(), (value)=>{
    applyToSelected((s)=>{
      s.apicalDx = value;
      // SP7: granuloma/cyst is a refinement of apical periodontitis only.
      if(value !== "symptomatic-apical-periodontitis" && value !== "asymptomatic-apical-periodontitis"){
        s.periapicalType = "none";
      }
    });
  });

  // Resection
  $("#endoResection").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.endoResection = (e.target as HTMLInputElement).checked;
    });
  });

  // Parapulpal pin
  $("#parapulpalPin").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.parapulpalPin = (e.target as HTMLInputElement).checked;
    });
  });

  // Root resorption (SP4 Task 5: resorptionType enum — none / internal /
  // external-cervical picker; both subtypes render identically).
  buildSelect($("#resorptionSelect"), getResorptionOptions(), (value)=>{
    applyToSelected((s)=>{ s.resorptionType = value; });
  });

  // Peri-implant status (SP8 Task 5: implants only — supersedes the parodontal/
  // inflammation mods there).
  buildSelect($("#periImplantSelect"), getPeriImplantOptions(), (value)=>{
    applyToSelected((s)=>{ applyPeriImplantSelection(s, value); });
  });

  // Extraction wound
  $("#extractionWound").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.extractionWound = (e.target as HTMLInputElement).checked;
    });
  });

  // Extraction plan
  $("#extractionPlan").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.extractionPlan = (e.target as HTMLInputElement).checked;
    });
  });

  // Crown replace
  $("#crownReplace").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.crownReplace = (e.target as HTMLInputElement).checked;
    });
  });

  // Crown needed
  $("#crownNeeded").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.crownNeeded = (e.target as HTMLInputElement).checked;
    });
  });

  // Crown leakage (marginal leakage on a crown/bridge restoration)
  $("#crownLeakage").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.crownLeakage = (e.target as HTMLInputElement).checked;
    });
  });

  // Missing closed
  $("#missingClosed").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.missingClosed = (e.target as HTMLInputElement).checked;
    });
  });

  // Mobility
  buildSelect($("#mobilitySelect"), getMobilityOptions(), (value)=>{
    applyToSelected((s)=>{
      s.mobility = value;
    });
  });

  // SP-perio P1 Task 2: the 6-site PD/GM/BOP/SUP grid — built once here
  // (site identities are static), values synced per-tooth by syncPerioRow()
  // inside syncControlsFromState(). See buildPerioGrid's own doc comment.
  buildPerioGrid($("#perioGrid"));

  // Inflammations
  buildChecks($("#modsChecks"), MOD_OPTIONS, (id, on)=>{
    applyToSelected((s)=>{
      if(on) s.mods.add(id); else s.mods.delete(id);
    });
  });
  buildSelect($("#periapicalTypeSelect"), getPeriapicalTypeOptions(), (val)=>{
    applyToSelected((s)=>{ s.periapicalType = val; });
  });

  // Caries surfaces in a cross layout; subcrown stays as a separate row.
  // Toggling a surface on records its severity (from the active-depth dropdown);
  // toggling off clears it. Subcrown carries no per-surface severity. SP6 Task 1:
  // the single unified `cariesSeverity` map (was `cariesDepths`).
  const cariesOnToggle = (id: Any, on: Any)=>{
    applyToSelected((s)=>{
      if(on){
        s.caries.add(id);
        if(id !== "caries-subcrown") s.cariesSeverity.set(id.replace("caries-",""), s.cariesActiveDepth);
      }else{
        s.caries.delete(id);
        s.cariesSeverity.delete(id.replace("caries-",""));
      }
    });
  };
  buildSurfaceCross($("#cariesChecks"), [
    { value: "caries-buccal", labelKey: "surface.buccal", letter: "B", pos: "buccal" },
    { value: "caries-mesial", labelKey: "surface.mesial", letter: "M", pos: "mesial" },
    { value: "caries-occlusal", labelKey: "surface.occlusal", letter: "O", pos: "occlusal" },
    { value: "caries-distal", labelKey: "surface.distal", letter: "D", pos: "distal" },
    { value: "caries-lingual", labelKey: "surface.lingualPalatal", letter: "L", pos: "lingual" },
  ], cariesOnToggle);
  // Add a per-surface depth indicator (3 stacked bars) inside each caries cell.
  // Clicking it opens a popup to change that surface's depth (only when caried).
  $$("#cariesChecks .surface-cell").forEach((cell) => {
    const input = cell.querySelector("input") as HTMLInputElement | null;
    if(!input) return;
    const surface = String(input.value).replace("caries-", "");
    const ind = el("span", { class: "surf-depth", title: t("caries.detailsHint") }, [ el("i"), el("i"), el("i") ]);
    ind.addEventListener("click", (e: Any)=>{
      e.preventDefault();
      e.stopPropagation();
      if(!input.checked || readOnly) return;
      showCariesDepthPopup(surface, ind, activeTooth);
    });
    cell.appendChild(ind);
  });
  buildChecks($("#cariesSubcrownRow"), [
    { value: "caries-subcrown", labelKey: "surface.subcrown" },
  ], cariesOnToggle);
  buildSelect($("#cariesDepthSelect"), getCariesDepthOptions(), (val)=>{
    applyToSelected((s)=>{ s.cariesActiveDepth = Number(val); });
  });
  // SP5 Task 5: per-tooth root-caries picker. On change the selected value is
  // the canonical rootCaries enum (simple mode's "present" already maps to
  // "active-cavitated" — SP6 Task 3), so it writes straight to state.
  buildSelect($("#rootCariesSelect"), rootCariesOptions(), (value)=>{
    applyToSelected((s)=>{ s.rootCaries = value; });
  });

  // Filling material dropdown
  buildSelect($("#fillingSelect"), getFillingOptions(false), (mat)=>{
    applyToSelected((s)=>{
      s.fillingMaterial = mat;
      // Clearing the active material removes any existing per-surface fillings,
      // otherwise they would become orphaned (surface UI hides but state lingers,
      // still rendering/serializing/exporting). Keeps the map and set in sync.
      if(mat === "none"){
        s.fillingSurfaces.clear();
        s.fillingSurfaceMaterials.clear();
      }
    });
  });

  // Filling surfaces in a cross layout.
  buildSurfaceCross($("#fillingSurfaceChecks"), [
    { value: "buccal", labelKey: "surface.buccal", letter: "B", pos: "buccal" },
    { value: "mesial", labelKey: "surface.mesial", letter: "M", pos: "mesial" },
    { value: "occlusal", labelKey: "surface.occlusal", letter: "O", pos: "occlusal" },
    { value: "distal", labelKey: "surface.distal", letter: "D", pos: "distal" },
    { value: "lingual", labelKey: "surface.lingualPalatal", letter: "L", pos: "lingual" },
  ], (surf: Any, on: Any)=>{
    applyToSelected((s)=>{
      if(on && s.fillingMaterial !== "none"){
        s.fillingSurfaces.add(surf);
        s.fillingSurfaceMaterials.set(surf, s.fillingMaterial);
      }else{
        s.fillingSurfaces.delete(surf);
        s.fillingSurfaceMaterials.delete(surf);
      }
    });
  });
  // SP6 Task 2 (step 2): mirror the caries-cell per-surface indicator onto each
  // FILLING-surface cell. It signposts (and, via the contextual popup, authors)
  // recurrent caries on a filled surface — CSS shows it only when the filling
  // checkbox is checked, and the dark border (`.has-subcaries`) is toggled in
  // syncFillingSubcariesIndicator when the surface actually has caries.
  $$("#fillingSurfaceChecks .surface-cell").forEach((cell) => {
    const input = cell.querySelector("input") as HTMLInputElement | null;
    if(!input) return;
    const surface = String(input.value);
    const ind = el("span", { class: "surf-depth", title: t("caries.recurrentHint") }, [ el("i"), el("i"), el("i") ]);
    ind.addEventListener("click", (e: Any)=>{
      e.preventDefault();
      e.stopPropagation();
      if(!input.checked || readOnly) return;
      showCariesDepthPopup(surface, ind, activeTooth);
    });
    cell.appendChild(ind);
  });
  // SP10: LEFT-side per-surface filling-defect indicator (the RIGHT-side .surf-depth
  // authors recurrent caries; this authors the structural defect). Shown by CSS only
  // when the filling checkbox is checked; the dark border (.has-defect) is toggled in
  // syncFillingDefectIndicator when the surface actually carries a defect.
  $$("#fillingSurfaceChecks .surface-cell").forEach((cell) => {
    const input = cell.querySelector("input") as HTMLInputElement | null;
    if(!input) return;
    const surface = String(input.value);
    const ind = el("span", { class: "surf-defect", title: t("fillingDefect.label") }, [ el("i") ]);
    ind.addEventListener("click", (e: Any)=>{
      e.preventDefault(); e.stopPropagation();
      if(!input.checked || readOnly) return;
      showFillingDefectPopup(surface, ind, activeTooth);
    });
    cell.insertBefore(ind, cell.firstChild); // LEFT side
  });

  // Fissure sealing
  $("#fissureSealing").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.fissureSealing = (e.target as HTMLInputElement).checked;
    });
  });

  // Calculus
  $("#calculusToggle").addEventListener("change", (e)=>{
    applyToSelected((s)=>{ s.calculus = (e.target as HTMLInputElement).checked; });
  });

  // Contact point missing
  $("#contactMesial").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.contactMesial = (e.target as HTMLInputElement).checked;
    });
  });
  $("#contactDistal").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.contactDistal = (e.target as HTMLInputElement).checked;
    });
  });

  // Wear (SP11 Task 3: wearEdge/wearCervical enum pickers — replaces the
  // bruxism checkboxes; mirrors the #resorptionSelect buildSelect wiring).
  buildSelect($("#wearEdgeSelect"), getWearEdgeOptions(), (value)=>{
    applyToSelected((s)=>{ s.wearEdge = value; });
  });
  buildSelect($("#wearCervicalSelect"), getWearCervicalOptions(), (value)=>{
    applyToSelected((s)=>{ s.wearCervical = value; });
  });

  // Wear simple-mode toggles (SP13 Task 2: yes/no checkboxes shown instead of
  // the selects above when wearDetailLevel === "simple"; write the canonical
  // simple value on check, "none" on uncheck).
  $("#wearEdgeToggle").addEventListener("change", (e)=>{
    const on = (e.target as HTMLInputElement).checked;
    applyToSelected((s)=>{ s.wearEdge = on ? "attrition" : "none"; });
  });
  $("#wearCervicalToggle").addEventListener("change", (e)=>{
    const on = (e.target as HTMLInputElement).checked;
    applyToSelected((s)=>{ s.wearCervical = on ? "abrasion" : "none"; });
  });

  // Discoloration (SP12 Task 3: discoloration enum picker — mirrors the
  // wearEdge/wearCervical buildSelect wiring above).
  buildSelect($("#discolorationSelect"), getDiscolorationOptions(), (value)=>{
    applyToSelected((s)=>{ s.discoloration = value; });
  });

  // Discoloration simple-mode toggle (SP13 Task 2: mirrors the wear toggles
  // above; independent discolorationDetailLevel setting).
  $("#discolorationToggle").addEventListener("change", (e)=>{
    const on = (e.target as HTMLInputElement).checked;
    applyToSelected((s)=>{ s.discoloration = on ? "other" : "none"; });
  });

  // Ortho (SP14 Task 3: appliance/drift/vertical enum pickers + rotation
  // boolean toggle — mirrors the discoloration buildSelect/toggle wiring
  // above).
  buildSelect($("#orthoApplianceSelect"), getOrthoApplianceOptions(), (value)=>{
    applyToSelected((s)=>{ s.orthoAppliance = value; });
  });
  buildSelect($("#orthoDriftSelect"), getOrthoDriftOptions(), (value)=>{
    applyToSelected((s)=>{ s.orthoDrift = value; });
  });
  buildSelect($("#orthoVerticalSelect"), getOrthoVerticalOptions(), (value)=>{
    applyToSelected((s)=>{ s.orthoVertical = value; });
  });
  $("#orthoRotationToggle").addEventListener("change", (e)=>{
    const on = (e.target as HTMLInputElement).checked;
    applyToSelected((s)=>{ s.orthoRotation = on; });
  });

  // Bridge pillar
  $("#bridgePillar").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.bridgePillar = (e.target as HTMLInputElement).checked;
    });
  });

  // Broken crown parts
  $("#brokenMesial").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.brokenMesial = (e.target as HTMLInputElement).checked;
    });
  });
  $("#brokenIncisal").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.brokenIncisal = (e.target as HTMLInputElement).checked;
    });
  });
  $("#brokenDistal").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.brokenDistal = (e.target as HTMLInputElement).checked;
    });
  });

  // Reset buttons
  $("#btnResetTooth").addEventListener("click", ()=>{
    if(selectedTeeth.size === 0) return;
    resetTeethGated(Array.from(selectedTeeth) as number[]);
  });

  $("#btnResetAll").addEventListener("click", ()=>{
    setEdentulous(false);
    resetCaseMeta(); // case-level patient metadata is part of the blank-slate reset (like edentulous)
    for(const toothNo of ALL_TEETH){
      toothState.set(toothNo, defaultState());
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    if(activeTooth){
      setControlsEnabled(true);
      syncControlsFromState(toothState.get(activeTooth));
    }
    // caseMeta was cleared above (resetCaseMeta) AFTER setEdentulous's early
    // notify fired, so the mounted case-metadata panel would otherwise show
    // stale patient data until the next unrelated change — notify once more now
    // that all blank-slate resets are done, so subscribers re-read cleared state.
    notifyStateChange();
  });

  $("#btnPrimaryDentition").addEventListener("click", applyPrimaryDentition);

  $("#btnMixedDentition").addEventListener("click", applyMixedDentition);

  // Status extras
  const statusExtras = getStatusExtras();
  if(statusExtras.length){
    const statusOptions = statusExtras.map((opt)=>({ value: opt.id, label: opt.label }));
    buildSelect($("#statusExtraSelect"), statusOptions, ()=>{});
    setSelectOptions($("#statusExtraSelect"), statusOptions, statusOptions[0]?.value);
    $("#statusExtraApply").addEventListener("click", ()=>{
      const id = $("#statusExtraSelect").value;
      const option = statusExtras.find(o => o.id === id);
      applyStatusExtra(option);
    });
  }

  $("#btnSelectAll").addEventListener("click", ()=>{
    selectedTeeth = new Set(ALL_TEETH);
    activeTooth = ALL_TEETH[0];
    updateToothTileVisibility();
  });
  $("#btnSelectAllPresent").addEventListener("click", ()=>{
    const present = ALL_TEETH.filter(tn => toothState.get(tn)?.toothSelection !== "none");
    selectedTeeth = new Set(present);
    activeTooth = present[0] ?? null;
    updateToothTileVisibility();
  });
  $("#btnSelectPermanent").addEventListener("click", ()=>{
    const permanent = ALL_TEETH.filter(tn => toothState.get(tn)?.toothSelection === "tooth-base");
    selectedTeeth = new Set(permanent);
    activeTooth = permanent[0] ?? null;
    updateToothTileVisibility();
  });
  $("#btnSelectMilk").addEventListener("click", ()=>{
    const milk = ALL_TEETH.filter(tn => toothState.get(tn)?.toothSelection === "milktooth");
    selectedTeeth = new Set(milk);
    activeTooth = milk[0] ?? null;
    updateToothTileVisibility();
  });
  $("#btnSelectImplants").addEventListener("click", ()=>{
    const implants = ALL_TEETH.filter(tn => toothState.get(tn)?.toothSelection === "implant");
    selectedTeeth = new Set(implants);
    activeTooth = implants[0] ?? null;
    updateToothTileVisibility();
  });
  $("#btnSelectAllMissing").addEventListener("click", ()=>{
    const missing = ALL_TEETH.filter(tn => toothState.get(tn)?.toothSelection === "none");
    selectedTeeth = new Set(missing);
    activeTooth = missing[0] ?? null;
    updateToothTileVisibility();
  });
  $("#btnSelectUpper").addEventListener("click", ()=>{
    selectedTeeth = new Set(ALL_TEETH.filter(tn => tn >= 11 && tn <= 28));
    activeTooth = 11;
    updateToothTileVisibility();
  });
  $("#btnSelectUpperFront").addEventListener("click", ()=>{
    const front = [13,12,11,21,22,23];
    selectedTeeth = new Set(front);
    activeTooth = front[0];
    updateToothTileVisibility();
  });
  $("#btnSelectUpperMolar").addEventListener("click", ()=>{
    const molars = [18,17,16,26,27,28];
    selectedTeeth = new Set(molars);
    activeTooth = molars[0];
    updateToothTileVisibility();
  });
  $("#btnSelectLower").addEventListener("click", ()=>{
    selectedTeeth = new Set(ALL_TEETH.filter(tn => tn >= 31 && tn <= 48));
    activeTooth = 31;
    updateToothTileVisibility();
  });
  $("#btnSelectLowerFront").addEventListener("click", ()=>{
    const front = [43,42,41,31,32,33];
    selectedTeeth = new Set(front);
    activeTooth = front[0];
    updateToothTileVisibility();
  });
  $("#btnSelectLowerMolar").addEventListener("click", ()=>{
    const molars = [38,37,36,46,47,48];
    selectedTeeth = new Set(molars);
    activeTooth = molars[0];
    updateToothTileVisibility();
  });
  $("#btnSelectNone").addEventListener("click", ()=>{
    selectedTeeth = new Set();
    activeTooth = null;
    updateSelectionUI();
  });
  $("#btnSelectNoneChart").addEventListener("click", ()=>{
    selectedTeeth = new Set();
    activeTooth = null;
    updateSelectionUI();
  });

  // R2-A Task 3: Status | Plan chart-mode toggle (chart-header, separate from
  // both the topbar and the right Controls panel).
  $("#chartModeStatus").addEventListener("click", ()=>setChartMode("status"));
  $("#chartModePlan").addEventListener("click", ()=>setChartMode("plan"));

  // The global visibility toggles (edentulous / wisdom / occlusal / bone / pulp)
  // are handled by the delegated onGlobalToggleClick listener registered above.

  // Card collapse toggles use a single delegated listener on `document` (see
  // onCardToggleClick). Here we only set the initial a11y labels to match each
  // card's current collapsed state; the click handling is delegation-based.
  const statusCard = $("#statusCard");
  const statusToggle = $("#btnToggleStatusCard");
  if(statusCard && statusToggle){
    applyToggleA11y(statusToggle, "status.title", statusCard.classList.contains("collapsed"));
  }
  const controlsToggle = $("#btnToggleControlsCard");
  const controlsActions = $("#controlsActions");
  if(controlsToggle && controlsActions){
    applyToggleA11y(controlsToggle, "panel.controls", controlsActions.classList.contains("hidden"));
  }
  [
    { card: "#cariesSection", btn: "#btnToggleCariesCard", labelKey: "caries.title" },
    { card: "#fillingSection", btn: "#btnToggleFillingCard", labelKey: "filling.title" },
    { card: "#rootPeriodontiumSection", btn: "#btnToggleRootPeriodontiumCard", labelKey: "card.rootPeriodontium" },
  ].forEach(({card, btn, labelKey})=>{
    const cardEl = $(card);
    const btnEl = $(btn);
    if(!cardEl || !btnEl) return;
    applyToggleA11y(btnEl, labelKey, cardEl.classList.contains("collapsed"));
  });

  const exportBtn = $("#btnStatusExport") as HTMLButtonElement | null;
  const fhirBtn = $("#btnStatusFhirExport") as HTMLButtonElement | null;
  const importBtn = $("#btnStatusImport") as HTMLButtonElement | null;
  const importInput = $("#statusImportInput") as HTMLInputElement | null;
  if(exportBtn){
    exportBtn.onclick = () => exportStatus();
  }
  if(fhirBtn){
    fhirBtn.onclick = () => exportFhir();
  }
  const pngBtn = $("#btnStatusPngExport") as HTMLButtonElement | null;
  const jpgBtn = $("#btnStatusJpgExport") as HTMLButtonElement | null;
  const svgBtn = $("#btnStatusSvgExport") as HTMLButtonElement | null;
  if(pngBtn){
    pngBtn.onclick = () => { exportImage("png").catch((e)=>console.error("PNG export failed", e)); };
  }
  if(jpgBtn){
    jpgBtn.onclick = () => { exportImage("jpg").catch((e)=>console.error("JPG export failed", e)); };
  }
  if(svgBtn){
    svgBtn.onclick = () => { exportSvg().catch((e)=>console.error("SVG export failed", e)); };
  }
  const perioSvgBtn = $("#btnPerioSvgExport") as HTMLButtonElement | null;
  const perioPngBtn = $("#btnPerioPngExport") as HTMLButtonElement | null;
  const perioJpgBtn = $("#btnPerioJpgExport") as HTMLButtonElement | null;
  if(perioSvgBtn) perioSvgBtn.onclick = () => { exportPerioSvg().catch((e)=>console.error("Perio SVG export failed", e)); };
  if(perioPngBtn) perioPngBtn.onclick = () => { exportPerioImage("png").catch((e)=>console.error("Perio PNG export failed", e)); };
  if(perioJpgBtn) perioJpgBtn.onclick = () => { exportPerioImage("jpg").catch((e)=>console.error("Perio JPG export failed", e)); };
  if(importBtn && importInput){
    importBtn.onclick = () => {
      importInput.value = "";
      importInput.click();
    };
    importInput.onchange = async ()=>{
      const file = importInput.files?.[0];
      if(!file) return;
      const format = pendingImportFormat;
      try{
        const text = await file.text();
        const data = JSON.parse(text);
        if(format === "fhir"){
          importFhirBundle(data);
        }else{
          importStatus(data);
        }
      }catch(e){
        console.error("Odontogram import failed", e);
      }finally{
        importInput.value = "";
        pendingImportFormat = "status";
      }
    };
  }
}

/**
 * Switch the displayed tooth numbering system and re-render all tooth labels.
 * @param system - The target {@link NumberingSystem}.
 */
export function setNumberingSystem(system: NumberingSystem){
  if(system === numberingSystem) return;
  numberingSystem = system;
  updateAllToothTileNumbers();
  updateActiveLabel();
}

/**
 * Initialise the odontogram engine: wire up DOM controls, build the SVG tooth
 * grid, and start listening for i18n changes. Safe to call multiple times
 * (subsequent calls are no-ops).
 */
export async function initOdontogram(){
  if(initialized) return;
  initialized = true;
  const token = ++initToken;
  wireControls();
  await buildGrid(token);
  if(!initialized || token !== initToken) return;
  if(!i18nUnsubscribe){
    i18nUnsubscribe = onI18nChange(()=>refreshLocalizedContent());
  }
  refreshLocalizedContent();
  // ensure controls match initial active tooth (if any)
  if(activeTooth != null){
    const state = toothState.get(activeTooth);
    if(state){
      syncControlsFromState(state);
    }
  }
  setupBridgeOverlayResize();
  notifyStateChange();
  // R2-A Task 3: reflect the initial chart mode ("status") in the toggle UI
  // on first mount, same as any other setChartMode()-driven sync.
  syncChartModeUi();
}

/**
 * Tear down the odontogram engine: clear all DOM elements built by the engine,
 * unsubscribe from i18n changes, and reset internal state. After this call,
 * {@link initOdontogram} may be called again to re-initialise.
 */
export function destroyOdontogram(){
  if(!initialized) return;
  initialized = false;
  initToken++;
  controlsWired = false;
  teardownBridgeOverlayResize();
  document.removeEventListener("click", onCardToggleClick);
  document.removeEventListener("click", onGlobalToggleClick);
  if(i18nUnsubscribe){
    i18nUnsubscribe();
    i18nUnsubscribe = null;
  }
  // Clear DOM fragments built by the odontogram engine
  const grid = $("#toothGrid") as HTMLElement | null;
  if(grid){
    grid.removeEventListener("touchstart", onGridTouchStart);
    grid.removeEventListener("touchmove", onGridTouchMove);
    grid.removeEventListener("touchend", onGridTouchEnd);
    grid.style.transform = "";
    grid.classList.remove("odon-pinch-active", "odon-arch-upper", "odon-arch-lower");
    grid.innerHTML = "";
  }
  if(archToggleBar){ archToggleBar.remove(); archToggleBar = null; }
  hideZoomPopover();
  hideContextMenu();
  hideNoteEditor();
  if(longPressTimer){ clearTimeout(longPressTimer); longPressTimer = null; }
  pinchScale = 1;
  isPinching = false;
  archMode = "both";
  readOnly = false;
  notesEnabled = false;
  pluginOverlays.clear();
  const mods = $("#modsChecks") as HTMLElement | null;
  if(mods) mods.innerHTML = "";
  const caries = $("#cariesChecks") as HTMLElement | null;
  if(caries) caries.innerHTML = "";
  const cariesSub = $("#cariesSubcrownRow") as HTMLElement | null;
  if(cariesSub) cariesSub.innerHTML = "";
  const fillings = $("#fillingSurfaceChecks") as HTMLElement | null;
  if(fillings) fillings.innerHTML = "";
  const statusExtra = $("#statusExtraSelect") as HTMLSelectElement | null;
  if(statusExtra) statusExtra.innerHTML = "";
  // R2-A Task 1: a full teardown resets the whole case — BOTH charts, not
  // just the active one — and drops back to "status" mode so a subsequent
  // initOdontogram() starts clean (mirrors the pre-dual-state behavior of a
  // single cleared toothState).
  charts.status.clear();
  charts.plan.clear();
  planInitialized = false;
  planEditedTeeth.clear();
  pendingDualStateConfirm = null;
  chartMode = "status";
  toothState = charts.status;
  resetCaseMeta();
  toothSvgRoot.clear();
  toothTile.clear();
  toothLabelUpper.clear();
  toothLabelLower.clear();
  selectedTeeth = new Set();
  activeTooth = null;
}

/**
 * Clear the current tooth selection and reset the active tooth. Useful when
 * switching to view or quote-builder mode from the host application.
 */
export function clearSelection(){
  selectedTeeth = new Set();
  activeTooth = null;
  updateSelectionUI();
}
/**
 * Register one or more custom SVG plugins. Plugins can inject visual overlays
 * into the tooth SVG and maintain per-tooth custom state included in export/import.
 *
 * @param plugins - Array of {@link OdontogramPlugin} definitions.
 */
export function registerPlugins(plugins: OdontogramPlugin[]){
  registeredPlugins = [...plugins];
  // Re-render plugin overlays for all teeth
  for(const toothNo of ALL_TEETH){
    applyPluginOverlays(toothNo);
    updateToothTooltip(toothNo);
  }
}

/**
 * Set a plugin's custom state for a specific tooth. Triggers SVG re-render
 * for that tooth and updates the tooltip.
 *
 * @param toothNo - The FDI tooth number (11–48).
 * @param pluginId - The plugin's unique identifier.
 * @param value - The custom state value (any JSON-serializable value, or `undefined` to clear).
 */
export function setPluginState(toothNo: number, pluginId: string, value: unknown){
  const state = toothState.get(toothNo);
  if(!state) return;
  if(value === undefined){
    delete state.customStates[pluginId];
  }else{
    state.customStates[pluginId] = value;
  }
  applyStateToSvg(toothNo);
  updateToothTileNumber(toothNo);
}

/**
 * Get a plugin's custom state for a specific tooth.
 *
 * @param toothNo - The FDI tooth number (11–48).
 * @param pluginId - The plugin's unique identifier.
 * @returns The custom state value, or `undefined` if not set.
 */
export function getPluginState(toothNo: number, pluginId: string): unknown{
  const state = toothState.get(toothNo);
  return state?.customStates?.[pluginId];
}

/**
 * Get a human-readable summary of all active states for a tooth.
 * Useful for building custom tooltip or info-panel UIs.
 *
 * @param toothNo - The FDI tooth number (11–48).
 * @returns Array of localized state description strings.
 */
export function getToothStateSummary(toothNo: number): string[]{
  return getStateSummary(toothNo);
}

/** One heading + its per-tooth entries in the tooth-information summary. */
export type OdontogramSummarySection = {
  key: "caries" | "fillings" | "endo" | "diagnoses" | "wear" | "discoloration" | "orthodontics" | "prosthetics";
  heading: string;
  items: string[];
  /** Localized "no such tooth" sentence, shown when `items` is empty. */
  emptyText: string;
};

/** Structured, already-localized textual summary of the whole odontogram. */
export type OdontogramSummary = {
  overview: string;
  permanentList: string | null;
  missingList: string | null;
  sections: OdontogramSummarySection[];
  /** Implants heading + list — only present when at least one implant exists. */
  implants: { heading: string; text: string } | null;
  periodontalTitle: string;
  periodontalText: string;
  /** R2-B Task 2: the status->plan diff (see {@link getPlanChanges}), verbatim.
   *  `[]` whenever the plan chart hasn't been initialized or plan === status —
   *  a distinct field, not a section, since it's a diff rather than a status
   *  list. The "What changes" box in App.tsx renders from this field only
   *  when it's non-empty. */
  plannedChanges: PlanChange[];
  /** 2.2.1: per-tooth free-text notes — one "&lt;tooth&gt;: &lt;note&gt;" line per tooth
   *  that carries a note (gated on the notes-enabled setting, like the tooltip).
   *  `null` when no tooth has a note, so the panel/PDF omit the section entirely. */
  individualNotes: { heading: string; items: string[] } | null;
};

const SUMMARY_SURFACE_ORDER = ["buccal", "mesial", "occlusal", "distal", "lingual", "subcrown"];
/** SP6 Task 4 (§8) / SP16 Task 2: the letter used for `surface` in a
 *  per-tooth "(...)" summary — delegates to {@link surfaceLetter}, which is
 *  position-aware (incisal/labial/palatal) in "full" notation mode (the
 *  default) and respects the `surfaceNotation` setting. Shared by
 *  {@link subcariesLettersForTooth} and {@link getOdontogramSummary}'s
 *  per-tooth caries/fillings/radiographic-depth lists, so every existing
 *  summary that names a surface picks up the position-aware letter too. */
function summarySurfaceLetter(surface: string, toothNo: number): string {
  return surfaceLetter(surface, toothNo);
}
const SUMMARY_ENDO_KEY: Record<string, string> = {
  "endo-medical-filling": "endo.option.medicalFilling",
  "endo-filling": "endo.option.filling",
  "endo-filling-incomplete": "endo.option.incompleteFilling",
  "endo-glass-pin": "endo.option.glassPin",
  "endo-metal-pin": "endo.option.metalPin",
};
// FIX 3: map the `rootCaries` enum value ("active-cavitated") to its i18n key
// ("rootCaries.activeCavitated") so a root-caries-only tooth isn't summary-invisible.
const SUMMARY_ROOT_CARIES_KEY: Record<string, string> = {
  active: "rootCaries.active",
  arrested: "rootCaries.arrested",
  "active-cavitated": "rootCaries.activeCavitated",
};
/** Formats a tooth number for display using the active numbering system AND
 *  the milktooth display-remap ({@link getDisplayedToothNumber}) — the exact
 *  same formatting {@link getOdontogramSummary} uses for every tooth number
 *  it prints (permanent/missing lists, per-section entries, implants). Exported
 *  so the "What changes" box in App.tsx can label a {@link PlanChange.toothNo}
 *  identically, without duplicating the numbering/milktooth logic. */
export function formatToothLabel(toothNo: number): string {
  return toLabel(getDisplayedToothNumber(toothNo), numberingSystem);
}

/**
 * Build a human-readable, localized summary of the current odontogram state:
 * tooth counts, present/missing lists, and caries / fillings / endo /
 * prosthetics / periodontal sections. Numbers respect the active numbering
 * system. Intended for the optional "tooth information" panel; call
 * {@link onStateChange} to refresh it on edits.
 */
export function getOdontogramSummary(): OdontogramSummary {
  const lbl = formatToothLabel;

  const permanent: number[] = [];
  const missing: number[] = [];
  const implants: number[] = [];
  let milkCount = 0;
  const caries: string[] = [];
  const fillings: string[] = [];
  const endo: string[] = [];
  const prosthetics: string[] = [];
  const inflamed: string[] = [];
  const diagnoses: string[] = [];
  const wear: string[] = [];
  const discoloration: string[] = [];
  const orthodontics: string[] = [];
  const notes: string[] = [];

  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s) continue;
    // 2.2.1: per-tooth free-text note — gated on the notes-enabled setting,
    // mirroring the hover tooltip so a disabled feature never surfaces notes.
    if(notesEnabled && s.note && s.note.trim() !== "")
      notes.push(`${formatToothLabel(toothNo)}: ${s.note.trim()}`);
    const sel = s.toothSelection;
    const isMissing = sel === "none";
    const isImplant = sel === "implant";
    const isMilk = sel === "milktooth";
    if(isMissing) missing.push(toothNo);
    else if(isImplant) implants.push(toothNo);
    else if(isMilk) milkCount++;
    else permanent.push(toothNo);

    // Caries (primary vs. secondary). SP6 Task 1: a surface is RECURRENT
    // (secondary) caries when it also carries a filling — recurrence is DERIVED
    // from `caries ∩ fillingSurfaceMaterials` (the state machine), not from a
    // separate stored flag. The unified `cariesSeverity` is read as CARS there
    // and ICDAS on the primary (no-filling) surfaces.
    if(s.caries && s.caries.size > 0){
      const primary: string[] = [];
      const secondary: string[] = [];
      for(const surface of SUMMARY_SURFACE_ORDER){
        if(!s.caries.has("caries-" + surface)) continue;
        const letter = summarySurfaceLetter(surface, toothNo);
        if(s.fillingSurfaceMaterials && s.fillingSurfaceMaterials.has(surface)) secondary.push(letter);
        else primary.push(letter);
      }
      const parts: string[] = [];
      if(primary.length) parts.push(primary.join(", "));
      if(secondary.length) parts.push(secondary.join(", ") + " - " + t("toothInfo.secondary"));
      if(parts.length){
        const sev = cariesSeverityTierLabel(s);
        caries.push(`${lbl(toothNo)} (${parts.join("; ")})${sev ? " – " + sev : ""}`);
      }
    }

    // Root caries (FIX 3) — a present-tooth finding independent of surface
    // caries, so a tooth with ONLY root caries would otherwise never appear in
    // the caries section. Follows the surface-caries "label (detail)" style.
    if(s.rootCaries && s.rootCaries !== "none"){
      const rootKey = SUMMARY_ROOT_CARIES_KEY[s.rootCaries];
      if(rootKey) caries.push(`${lbl(toothNo)} (${t(rootKey)})`);
    }

    // Radiographic caries depth (FIX 3) — per-surface, independent of the
    // visual caries layer; surface any recorded depth so it isn't summary-
    // invisible. Style: "16 (M: Dentin, outer third (D1))".
    if(s.radiographicDepth && s.radiographicDepth.size > 0){
      const depths = SUMMARY_SURFACE_ORDER
        .filter((surface) => s.radiographicDepth.has(surface))
        .map((surface) => `${summarySurfaceLetter(surface, toothNo)}: ${t("radiographicDepth." + s.radiographicDepth.get(surface))}`);
      if(depths.length) caries.push(`${lbl(toothNo)} (${depths.join(", ")})`);
    }

    // Fillings (surfaces)
    if(s.fillingSurfaceMaterials && s.fillingSurfaceMaterials.size > 0){
      const letters = SUMMARY_SURFACE_ORDER
        .filter((surface) => s.fillingSurfaceMaterials.has(surface))
        .map((surface) => summarySurfaceLetter(surface, toothNo));
      if(letters.length){
        // SP10: defect suffix gated on !hasCrown to match the render
        // (applyStateToSvgSingle), which suppresses fillings/defects entirely
        // under a crown/bridge; the base filling-presence line above stays
        // unchanged (pre-existing behavior, out of scope for this fix).
        const defects = s.restorationType === "none"
          ? SUMMARY_SURFACE_ORDER
              .filter((surface) => s.fillingDefect?.has(surface) && s.fillingSurfaceMaterials.has(surface))
              .map((surface) => `${summarySurfaceLetter(surface, toothNo)}: ${t("fillingDefect." + s.fillingDefect.get(surface))}`)
          : [];
        // SP15 Task 5 (B3): name the finding explicitly with the
        // fillingDefect.label qualifier, the same way secondary caries always
        // names itself (toothInfo.secondary) on the Caries line — a bare
        // "surface: type" suffix read as generic filling info, not a defect.
        const suffix = defects.length ? ` – ${t("fillingDefect.label")}: ${defects.join(", ")}` : "";
        fillings.push(`${lbl(toothNo)} (${letters.join(", ")})${suffix}`);
      }
    }

    // Endo
    if((s.endo && s.endo !== "none") || s.endoResection){
      let name = SUMMARY_ENDO_KEY[s.endo] ? t(SUMMARY_ENDO_KEY[s.endo]) : "";
      if(s.endo === "endo-resection") name = t("toothInfo.resected");
      else if(s.endoResection) name = name ? `${name}, ${t("toothInfo.resected")}` : t("toothInfo.resected");
      endo.push(`${lbl(toothNo)} (${name})`);
    }

    // Prosthetics (fixed restorations — crown/inlay/onlay/veneer/bridge — +
    // implant attachments / removable / bar-retained dentures via `prosthesis`)
    if(s.restorationType && s.restorationType !== "none"){
      prosthetics.push(`${lbl(toothNo)}: ${restorationSummaryLabel(s.restorationType, s.restorationMaterial)}`);
    }
    if(s.prosthesis && s.prosthesis !== "none"){
      prosthetics.push(`${lbl(toothNo)}: ${t(PROSTHESIS_SUMMARY_KEY[s.prosthesis] || s.prosthesis)}`);
    }
    // SP17 Task 1 Fix #2 (gate-parity follow-up): same FULL gate as
    // getStateSummary above — mirrors the #crownLeakageRow control's own
    // visibility gate in full (!restorationRowHidden(s) AND crown/bridge),
    // not just the crown/bridge half.
    if(s.crownLeakage && !restorationRowHidden(s) && (s.restorationType === "crown" || s.restorationType === "bridge")) prosthetics.push(`${lbl(toothNo)} (${t("crownLeakage.label")})`);

    // Periodontal / periapical inflammation
    const hasInflam = s.mods && (s.mods.has("inflammation") || s.mods.has("parodontal"));
    if(hasInflam){
      let type: string;
      if(s.periapicalType && s.periapicalType !== "none") type = t("periapical.type." + s.periapicalType);
      else if(s.mods.has("parodontal")) type = t("mods.parodontal");
      else type = t("mods.periapicalInflammation");
      inflamed.push(`${lbl(toothNo)} (${type})`);
    }

    // SP9: clinical diagnoses (pulp / apical / resorption / peri-implant).
    const dxs = diagnosisSummaryLabels(s);
    if(dxs.length) diagnoses.push(`${lbl(toothNo)} (${dxs.join("; ")})`);
    // SP11: wear (edge/cervical) type-per-location whole-mouth section.
    // Review fix (post-SP11): gate on wearRowAllowed, same as the tooltip and
    // the render/UI row — suppresses stored wear on a crowned/non-natural-
    // substrate tooth that the chart itself no longer shows.
    if(wearRowAllowed(s)){
      const parts: string[] = [];
      if(s.wearEdge !== "none") parts.push(`${t("tooth.bruxism.edgeWear")}: ${t("wearType." + s.wearEdge)}`);
      if(s.wearCervical !== "none") parts.push(`${t("tooth.bruxism.neckWear")}: ${t("wearType." + s.wearCervical)}`);
      if(parts.length) wear.push(`${lbl(toothNo)} (${parts.join(", ")})`);
    }
    // SP12 Task 4: gate discoloration on the same discolorationAllowed predicate
    // the render tint, tooltip, and UI row use — suppresses stored discoloration
    // on a crowned/non-natural-substrate tooth that the chart itself no longer tints.
    if(discolorationAllowed(s) && s.discoloration !== "none"){
      discoloration.push(`${lbl(toothNo)} (${t("discoloration." + s.discoloration)})`);
    }
    // SP14 Task 4: orthodontic findings — gate on the same orthoAllowed
    // predicate the render glyphs and the Ortho UI card use, so the summary
    // never claims a finding on a tooth the chart itself doesn't show it on.
    if(orthoAllowed(s)){
      const orthoParts: string[] = [];
      if(s.orthoAppliance !== "none") orthoParts.push(t("ortho.appliance." + s.orthoAppliance));
      if(s.orthoDrift !== "none") orthoParts.push(t("ortho.drift." + s.orthoDrift));
      if(s.orthoVertical !== "none") orthoParts.push(t("ortho.vertical." + s.orthoVertical));
      if(s.orthoRotation === true) orthoParts.push(t("ortho.rotation.label"));
      if(orthoParts.length) orthodontics.push(`${lbl(toothNo)} (${orthoParts.join(", ")})`);
    }
    // SP9: calculus + mobility join the periodontal findings.
    // SP15 wholebranch fix: gate mobility on the same !isImplant condition as
    // the render/tooltip — an implant has no PDL (mobilityRowHidden hides the
    // control there), so the whole-mouth panel must not contradict that.
    if(s.calculus) inflamed.push(`${lbl(toothNo)} (${t("calculus.label")})`);
    if(s.mobility && s.mobility !== "none" && s.toothSelection !== "implant") inflamed.push(`${lbl(toothNo)} (${t("inflammation.mobilityLabel")} ${t("mobility." + s.mobility)})`);
    // FIX 1(c): peri-implant status is a periodontal finding, not a diagnosis —
    // route it into `inflamed` (periodontalText) instead of `diagnoses`, so an
    // implant with peri-implantitis is no longer reported "healthy" there.
    { const pi = periImplantSummaryLabel(s); if(pi) inflamed.push(`${lbl(toothNo)} (${pi})`); }
    // SP-perio PG-C Task 1: derived Cairo recession TYPE — same periodontal
    // "inflamed" bucket as calculus/mobility/peri-implant status above.
    { const rt = getToothRecessionType(toothNo); if(rt !== "none") inflamed.push(`${lbl(toothNo)} (${t(`perio.recession.${rt}`)})`); }
    // SP-perio PG-C Task 3: CEJ visibility / root concavity — same
    // periodontal "inflamed" bucket as calculus/mobility/peri-implant/
    // recession-type above.
    { const cej = cejVisibilitySummaryLabel(s); if(cej) inflamed.push(`${lbl(toothNo)} (${cej})`); }
    { const rc = rootConcavitySummaryLabel(s); if(rc) inflamed.push(`${lbl(toothNo)} (${rc})`); }
    // SP-perio PG-D Task 5: PI/GI/KG/GT/Miller — same periodontal "inflamed"
    // bucket as calculus/mobility/peri-implant/recession-type/CEJ/root-
    // concavity above.
    { const pi = plaqueIndexSummaryLine(toothNo); if(pi) inflamed.push(`${lbl(toothNo)} (${pi})`); }
    { const gi = gingivalIndexSummaryLine(toothNo); if(gi) inflamed.push(`${lbl(toothNo)} (${gi})`); }
    { const kg = keratinizedWidthSummaryLine(toothNo); if(kg) inflamed.push(`${lbl(toothNo)} (${kg})`); }
    { const gt = gingivalThicknessSummaryLabel(toothNo); if(gt) inflamed.push(`${lbl(toothNo)} (${gt})`); }
    { const mc = millerClassSummaryLabel(toothNo); if(mc) inflamed.push(`${lbl(toothNo)} (${mc})`); }
    // SP-perio PG-E Task 3: mPI/mBI — same periodontal "inflamed" bucket as
    // PI/GI/KG/GT/Miller above.
    { const mpi = periImplantPlaqueSummaryLine(toothNo); if(mpi) inflamed.push(`${lbl(toothNo)} (${mpi})`); }
    { const mbi = periImplantBleedingSummaryLine(toothNo); if(mbi) inflamed.push(`${lbl(toothNo)} (${mbi})`); }
  }

  // Overview sentence — plural-aware phrases keep grammar correct per language
  // (e.g. "1 tooth is missing" vs "3 teeth are missing").
  const plural = (base: string, n: number) => t(`${base}${n === 1 ? "One" : "Other"}`, { n });
  const milkPhrase = plural("toothInfo.milk", milkCount);
  const milkStr = milkCount > 0 ? t("toothInfo.milkFragment", { milk: milkPhrase }) : "";
  const presentPhrase = plural("toothInfo.present", permanent.length);
  const missingPhrase = plural("toothInfo.missing", missing.length);
  let overview: string;
  if(permanent.length === 0 && implants.length === 0 && milkCount > 0){
    overview = t("toothInfo.overviewMilkOnly", { milk: milkPhrase });
  }else if(implants.length > 0){
    overview = t("toothInfo.overviewImplant", { present: presentPhrase, milk: milkStr, missing: missingPhrase, implant: plural("toothInfo.implant", implants.length) });
  }else{
    overview = t("toothInfo.overview", { present: presentPhrase, milk: milkStr, missing: missingPhrase });
  }

  const permanentList = permanent.length
    ? t("toothInfo.permanentList", { count: permanent.length, list: permanent.map(lbl).join(", ") })
    : null;
  const missingList = missing.length
    ? t("toothInfo.missingList", { count: missing.length, list: missing.map(lbl).join(", ") })
    : null;

  const sections: OdontogramSummarySection[] = [
    { key: "caries", heading: t("toothInfo.caries"), items: caries, emptyText: t("toothInfo.cariesEmpty") },
    { key: "fillings", heading: t("toothInfo.fillings"), items: fillings, emptyText: t("toothInfo.fillingsEmpty") },
    { key: "endo", heading: t("toothInfo.endo"), items: endo, emptyText: t("toothInfo.endoEmpty") },
    { key: "diagnoses", heading: t("toothInfo.diagnoses"), items: diagnoses, emptyText: t("toothInfo.diagnosesEmpty") },
    { key: "wear", heading: t("toothInfo.wear"), items: wear, emptyText: t("toothInfo.wearEmpty") },
    { key: "discoloration", heading: t("toothInfo.discoloration"), items: discoloration, emptyText: t("toothInfo.discolorationEmpty") },
    { key: "orthodontics", heading: t("toothInfo.orthodontics"), items: orthodontics, emptyText: t("toothInfo.orthodonticsEmpty") },
    { key: "prosthetics", heading: t("toothInfo.prosthetics"), items: prosthetics, emptyText: t("toothInfo.prostheticsEmpty") },
  ];

  let periodontalText = inflamed.length
    ? t("toothInfo.periodontalInflamed", { list: inflamed.join(", ") })
    : t("toothInfo.periodontalHealthy");
  // P4a Task 2: append the labelled case-context fragment (age/smoking/
  // diabetes/HbA1c/RBL/tooth-loss) when any case metadata was charted; skip
  // entirely on an empty case so a chart with no case data reads unchanged.
  if(!caseMetaIsEmpty(caseMeta)){
    const fragment = caseContextSummaryFragment(caseMeta);
    if(fragment) periodontalText = `${periodontalText} – ${fragment}`;
  }
  // P4b Task 4: append the FINAL (override-aware) 2017 classification —
  // separate from the case-context fragment above (that one only fires when
  // caseMeta itself is non-empty; classification can be non-trivial purely
  // from charted perio data, with no case metadata set at all).
  {
    const classificationFragment = classificationSummaryFragment(getPerioClassification());
    if(classificationFragment) periodontalText = `${periodontalText} – ${classificationFragment}`;
  }

  const implantInfo = implants.length
    ? { heading: t("toothInfo.implants"), text: implants.map(lbl).join(", ") }
    : null;

  const individualNotes = notes.length
    ? { heading: t("toothInfo.notes"), items: notes }
    : null;

  return {
    overview,
    permanentList,
    missingList,
    sections,
    implants: implantInfo,
    periodontalTitle: t("toothInfo.periodontalTitle"),
    periodontalText,
    plannedChanges: getPlanChanges(),
    individualNotes,
  };
}

/**
 * Enable or disable read-only mode. When read-only, all click, touch, and
 * keyboard interactions are disabled. The control panel is dimmed and
 * non-interactive. Useful for print/report views.
 *
 * @param value - `true` to enable read-only mode, `false` to disable.
 */
export function setReadOnly(value: boolean){
  readOnly = value;
  const grid = $("#toothGrid") as HTMLElement | null;
  if(grid) grid.classList.toggle("read-only", readOnly);
  const panel = $(".panel") as HTMLElement | null;
  if(panel) panel.classList.toggle("read-only", readOnly);
  // Deferred fix (perio P2 follow-up, Task 1): toggling readOnly while the
  // perio chart is open used to be a no-op — the grid's own disabled state
  // is baked in at open/resync, and this function never touched the perio
  // container. Extend the same live `.read-only` lock to whichever perio
  // container is currently mounted: `#perioOverlay` (popup chrome) or
  // `#perioInlinePanel` (inline "Dental Chart" housing). Both are queried
  // defensively (only one is ever mounted at a time, and neither may be
  // mounted at all) — mirrors the `panel`/`grid` null-safety above.
  const perioOverlay = $("#perioOverlay") as HTMLElement | null;
  if(perioOverlay) perioOverlay.classList.toggle("read-only", readOnly);
  const perioInline = $("#perioInlinePanel") as HTMLElement | null;
  if(perioInline) perioInline.classList.toggle("read-only", readOnly);
  // Update tabindex on all navigable tiles
  $$(".tooth-tile[role='option']").forEach(tile => {
    tile.setAttribute("tabindex", readOnly ? "-1" : "0");
  });
}

/**
 * Get the current read-only mode state.
 */
export function getReadOnly(): boolean{
  return readOnly;
}

/**
 * Enable or disable per-tooth notes. When enabled, double-clicking a tooth
 * opens a note editor popover, and notes are shown in hover tooltips with
 * a badge indicator.
 *
 * @param value - `true` to enable notes, `false` to disable.
 */
export function setNotesEnabled(value: boolean){
  notesEnabled = value;
  // Refresh tooltips and label icons for all teeth
  for(const toothNo of ALL_TEETH){
    updateToothTooltip(toothNo);
    updateToothLabelNoteIcon(toothNo);
  }
}

/**
 * Get the current notes-enabled state.
 */
export function getNotesEnabled(): boolean{
  return notesEnabled;
}

export { setOcclusalVisible, setWisdomVisible, setShowBase, setHealthyPulpVisible };
