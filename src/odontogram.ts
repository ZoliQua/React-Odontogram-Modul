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
import tooth11Url from "./assets/teeth-svgs/11.svg";
import tooth13Url from "./assets/teeth-svgs/13.svg";
import tooth14Url from "./assets/teeth-svgs/14.svg";
import tooth16Url from "./assets/teeth-svgs/16.svg";
import tooth14OcclUrl from "./assets/teeth-svgs/14_occl.svg";
import tooth16OcclUrl from "./assets/teeth-svgs/16_occl.svg";
/* Tooth SVG Test UI (v2) - vanilla JS */

const TEMPLATES = {
  11: tooth11Url,
  13: tooth13Url,
  14: tooth14Url,
  16: tooth16Url,
};
const TEMPLATES_OCCL = {
  14: tooth14OcclUrl,
  16: tooth16OcclUrl,
};

// Tooth mapping in details:
// 11: 11,12 -> no rotate, no mirror; 21,22 -> no rotate, mirror Y
//     31,32 -> rotate 180; 41,42 -> rotate 180 + mirror Y
// 13: 13 -> no rotate; 23 -> mirror Y; 33 -> rotate 180; 43 -> rotate 180 + mirror Y
// 14: 14,15 -> no rotate; 24,25 -> mirror Y; 34,35 -> rotate 180; 44,45 -> rotate 180 + mirror Y
// 16: 16,17,18 -> no rotate; 26,27,28 -> mirror Y; 36,37,38 -> rotate 180; 46,47,48 -> rotate 180 + mirror Y
const TOOTH_TEMPLATE = new Map([
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
const toothState = new Map(); // toothNo -> state
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
  pulpDetailLevel = (value === "simple" || value === "latin") ? value : "aae";
  if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
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
  surfaceNotation = value === "simple" ? "simple" : "full";
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

async function loadInlineIcon(button: Any){
  if(!button) return;
  const src = button.dataset.iconSrc;
  if(!src) return;
  try{
    const res = await fetch(src);
    if(!res.ok) return;
    const txt = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(txt, "image/svg+xml");
    const svg = doc.documentElement;
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.classList.add("icon-svg");
    button.innerHTML = "";
    button.appendChild(svg);
  }catch(_e){
    // ignore icon load failures
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
function onCardToggleClick(e: Any){
  const target = e.target as Any;
  const btn = target?.closest?.(".icon-btn");
  if(!btn) return;
  const icon = btn.querySelector(".toggle-icon");
  // Controls card collapses its actions container (uses `.hidden`), not the card.
  if(btn.id === "btnToggleControlsCard"){
    const actions = document.querySelector("#controlsActions");
    if(!actions) return;
    const hidden = actions.classList.toggle("hidden");
    applyToggleA11y(btn, "panel.controls", hidden);
    if(icon) icon.textContent = hidden ? "+" : "−";
    return;
  }
  const labelKey = CARD_TOGGLE_LABELS[btn.id];
  if(!labelKey) return; // not a card collapse toggle
  const card = btn.closest(".card");
  if(!card) return;
  const collapsed = card.classList.toggle("collapsed");
  applyToggleA11y(btn, labelKey, collapsed);
  if(icon) icon.textContent = collapsed ? "+" : "−";
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
  return optionsFor("toothSelection").map(o => ({ value: o.value, label: t(o.labelKey) }));
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
export function buildPulpEndoSelect(sel: Any, isMilktooth: boolean, selected: string): void {
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
  mkGroup("pulpEndo.groupVital", getPulpOptions());
  mkGroup("pulpEndo.groupTreated", getEndoOptions(isMilktooth).filter(o => o.value !== "none"));
  sel.value = selected;
}

// SP7 Task 4: apply a merged-selector choice, enforcing the mutual-exclusion
// invariant (mirrors the hydrate-time normalize at s.endo assignment, above).
export function pulpEndoOnSelect(s: Any, value: string): void {
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

function applyStateToSvg(toothNo: Any){
  const roots = toothSvgRoot.get(toothNo);
  if(!roots) return;
  for(const svg of roots){
    applyStateToSvgSingle(toothNo, svg);
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

/** TEST-ONLY: read back a tooth's current state as a plain object (Sets/Maps
 *  converted to arrays/objects for easy assertions). Not part of the public API. */
export function __getToothStateForTest(toothNo: number): Record<string, unknown> | undefined {
  const s = toothState.get(toothNo);
  if(!s) return undefined;
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
  if(state.crownLeakage) summary.push(t("crownLeakage.label"));
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

function syncControlsFromState(state: Any){
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
  buildPulpEndoSelect($("#pulpEndoSelect"), isMilktooth, pulpEndoDisplayValue(state));
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
  $("#periapicalTypeRow").classList.toggle("hidden", !periapicalRowVisible(state));
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
  $("#cariesDepthRow").classList.toggle("hidden", !cariesDepthEnabled);
  setSelectOptions($("#cariesDepthSelect"), getCariesDepthOptions(), state.cariesActiveDepth);
  if($("#cariesDepthSelect").value !== String(state.cariesActiveDepth)){
    state.cariesActiveDepth = Number($("#cariesDepthSelect").value);
  }

  // SP5 Task 5: per-tooth root-caries picker. Options come from the current
  // `rootCariesMode`; the stored value is displayed collapsed to that list but
  // NEVER written back (non-collapsing — widening the mode reveals it again).
  // Shown only on a present tooth (mirrors the endo/pulp per-tooth controls).
  setSelectOptions($("#rootCariesSelect"), rootCariesOptions(), rootCariesDisplayValue(rootCariesMode, state.rootCaries));
  $("#rootCariesRow").classList.toggle("hidden", !isToothPresent(state.toothSelection));

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
  $("#cariesSection").classList.toggle("hidden", hideByBase || hideByRadix);
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
  $("#rpPerioBlock").classList.toggle("hidden", hideByNone);
  $("#rootPeriodontiumSection").classList.toggle("hidden", hideByBase && hideByNone);
  const selectedList = selectedArr.length > 0 ? selectedArr : (activeTooth ? [activeTooth] : []);
  const contactAllowed = selectedList.length > 0 && selectedList.every(tn => {
    const s = toothState.get(tn);
    const allowedBase = s && (s.toothSelection === "tooth-base" || s.toothSelection === "milktooth" || BROKEN_VARIANTS.has(s.toothSelection));
    if(!allowedBase) return false;
    if(s.toothSelection === "tooth-base" && s.restorationType !== "none") return false;
    return true;
  });
  const bruxismAllowed = selectedList.length > 0 && selectedList.every(tn => {
    const s = toothState.get(tn);
    return s && wearRowAllowed(s);
  });
  // SP12 Task 3: #discolorationRow visibility gate — reuses the same
  // discolorationAllowed predicate the render tint and tooltip use, so the
  // dropdown's visibility never contradicts the chart (SP9/10/11 lesson).
  const discolorationRowAllowed = selectedList.length > 0 && selectedList.every(tn => {
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
  for(const toothNo of selectedTeeth){
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
    toothState.set(toothNo, defaultState());
    applyStateToSvg(toothNo);
    updateToothTileNumber(toothNo);
    if(activeTooth === toothNo) syncControlsFromState(toothState.get(toothNo));
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
    toothState.set(toothNo, defaultState());
    applyStateToSvg(toothNo);
    updateToothTileNumber(toothNo);
    if(activeTooth === toothNo) syncControlsFromState(toothState.get(toothNo));
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
  edentulous = on;
  setToggleButton($("#btnEdentulous"), edentulous);
  if(edentulous){
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
  }
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
export const VALID_CARS = new Set([0, 1, 2, 3, 4, 5, 6]);
export const VALID_CARIES_SEVERITY = new Set([0, 1, 2, 3, 4, 5, 6]);
export const VALID_RADIOGRAPHIC_DEPTH = new Set(["none", "E1", "E2", "D1", "D2", "D3"]);
export const VALID_FILLING_DEFECT = new Set(["none", "marginal", "fracture", "wear"]);
export const VALID_FILLING_DEFECT_SET = new Set(["marginal", "fracture", "wear"]); // non-none, valid stored values

function filterSet(arr: Any, allowed: Set<string>): Set<string>{
  if(!Array.isArray(arr)) return new Set();
  return new Set(arr.filter((v: Any) => typeof v === "string" && allowed.has(v)));
}

function validateEnum(value: Any, allowed: Set<string>, fallback: string): string{
  return typeof value === "string" && allowed.has(value) ? value : fallback;
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

function collectExportPayload(){
  const teeth = {};
  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo) ?? defaultState();
    teeth[toothNo] = serializeState(s);
  }
  return {
    version: "2.10",
    globals: {
      wisdomVisible,
      showBase,
      occlusalVisible,
      showHealthyPulp,
      edentulous,
    },
    teeth,
  };
}

/** TEST-ONLY: collect the full export payload ({version, globals, teeth}) exactly
 *  as exportStatus()/exportFhir() would serialize it. Not part of the public API. */
export function __collectExportPayloadForTest(): Any {
  return collectExportPayload();
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
    const scale = 2;
    const svgUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(built.xml);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("SVG rasterization failed"));
      img.src = svgUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = built.width * scale;
    canvas.height = built.height * scale;
    const ctx = canvas.getContext("2d");
    if(!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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

function exportStatus(){
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

function importStatus(data: Any){
  if(!data || typeof data !== "object") return;
  // FIX 1: only re-infer the legacy caries∩filling recurrent-caries intersection
  // for pre-2.3 payloads. A native ≥2.3 payload (including any FHIR bundle, which
  // parseFhirBundle tags "2.3") carries explicit `secondaryCaries` scores, so an
  // unscored caried+filled surface stays PRIMARY. A missing version → legacy.
  const inferLegacySecondaryCaries = isLegacyPayloadVersion(data.version);
  const teeth = data.teeth || {};
  for(const toothNo of ALL_TEETH){
    const raw = teeth[toothNo];
    toothState.set(toothNo, hydrateState(raw, inferLegacySecondaryCaries));
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
  updateSelectionFilterButtons();
  updateSelectionUI();
  notifyStateChange();
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

  const applyChanges = (teeth, fn)=>{
    for(const toothNo of teeth){
      const s = toothState.get(toothNo) ?? defaultState();
      const next = fn(s, toothNo) || s;
      toothState.set(toothNo, next);
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    if(activeTooth){
      syncControlsFromState(toothState.get(activeTooth));
    }
    updateSelectionFilterButtons();
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
    applyChanges(option.teeth || [], (s)=>{
      if(s.toothSelection === "tooth-base"){
        setBridgeCrown(s, option.material);
      }else if(s.toothSelection === "none"){
        setBridgePontic(s, option.material);
      }
    });
    // B9: applyChanges() only touches per-tooth SVG (applyStateToSvg); it never
    // calls notifyStateChange(), so updateBridgeOverlay() (the only caller of
    // renderBridgeOverlay()) never runs and a bridge added via a Statuses
    // preset shows no connector. Fire it once here, after all teeth in this
    // preset are applied, not per-tooth.
    notifyStateChange();
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
      applyChanges(teeth, (s, tn)=>{
        if(wisdom.has(tn)) return;
        if(s.toothSelection === "tooth-base"){
          setBridgeCrown(s, option.material);
        }else if(s.toothSelection === "none" && between.includes(tn)){
          setBridgePontic(s, option.missingMaterial || option.material);
        }
      });
    }else{
      applyChanges(teeth, (s, tn)=>{
        if(wisdom.has(tn)) return;
        if(s.toothSelection === "tooth-base"){
          setBridgeCrown(s, option.material);
        }
      });
    }
    notifyStateChange();
    return;
  }

  if(option.type === "partial-removable"){
    const teeth = archTeeth(option.arch);
    const wisdom = new Set(archWisdom(option.arch));
    applyChanges(teeth, (s, tn)=>{
      if(wisdom.has(tn)) return;
      if(s.toothSelection === "none"){
        s.prosthesis = "removable-partial";
      }
    });
    notifyStateChange();
    return;
  }

  if(option.type === "full-removable"){
    const teeth = archTeeth(option.arch);
    const wisdom = new Set(archWisdom(option.arch));
    applyChanges(teeth, (_s, tn)=>{
      const next = defaultState();
      next.toothSelection = "none";
      next.prosthesis = wisdom.has(tn) ? "none" : "removable-full";
      return next;
    });
    notifyStateChange();
    return;
  }

  if(option.type === "bar-denture"){
    const implantTeeth = option.implants || [];
    const missingTeeth = option.missing || [];
    const archTeeth = option.arch ? (getStatusExtrasMeta()?.[option.arch] || []) : [];
    const sevenEight = archTeeth.filter(tn => [7,8].includes(tn % 10));
    applyChanges(implantTeeth, (_s, _tn)=>{
      const next = defaultState();
      next.toothSelection = "implant";
      next.prosthesis = "bar-denture";
      return next;
    });
    applyChanges(missingTeeth, (_s, _tn)=>{
      const next = defaultState();
      next.toothSelection = "none";
      next.prosthesis = "bar-denture";
      return next;
    });
    applyChanges(sevenEight, (_s, _tn)=>{
      const next = defaultState();
      next.toothSelection = "none";
      return next;
    });
    notifyStateChange();
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

async function loadSvg(url: Any){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`SVG fetch failed: ${url}`);
  const txt = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(txt, "image/svg+xml");
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
    setEdentulous(false);
    for(const toothNo of selectedTeeth){
      toothState.set(toothNo, defaultState());
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    if(activeTooth){
      setControlsEnabled(true);
      syncControlsFromState(toothState.get(activeTooth));
    }
  });

  $("#btnResetAll").addEventListener("click", ()=>{
    setEdentulous(false);
    for(const toothNo of ALL_TEETH){
      toothState.set(toothNo, defaultState());
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    if(activeTooth){
      setControlsEnabled(true);
      syncControlsFromState(toothState.get(activeTooth));
    }
  });

  $("#btnPrimaryDentition").addEventListener("click", ()=>{
    setEdentulous(false);
    suppressEdentulousSync = true;
    for(const toothNo of ALL_TEETH){
      const s = defaultState();
      if(PRIMARY_MILK.has(toothNo)){
        s.toothSelection = "milktooth";
      }else{
        s.toothSelection = "none";
      }
      toothState.set(toothNo, s);
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    suppressEdentulousSync = false;
    if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
  });

  $("#btnMixedDentition").addEventListener("click", ()=>{
    setEdentulous(false);
    suppressEdentulousSync = true;
    for(const toothNo of ALL_TEETH){
      const s = defaultState();
      if(MIXED_PERMANENT.has(toothNo)){
        s.toothSelection = "tooth-base";
      }else if(MIXED_MILK.has(toothNo)){
        s.toothSelection = "milktooth";
      }else if(MIXED_NONE.has(toothNo)){
        s.toothSelection = "none";
      }
      toothState.set(toothNo, s);
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    suppressEdentulousSync = false;
    if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
  });

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
  toothState.clear();
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
/**
 * Build a human-readable, localized summary of the current odontogram state:
 * tooth counts, present/missing lists, and caries / fillings / endo /
 * prosthetics / periodontal sections. Numbers respect the active numbering
 * system. Intended for the optional "tooth information" panel; call
 * {@link onStateChange} to refresh it on edits.
 */
export function getOdontogramSummary(): OdontogramSummary {
  const lbl = (toothNo: number) => toLabel(getDisplayedToothNumber(toothNo), numberingSystem);

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

  for(const toothNo of ALL_TEETH){
    const s = toothState.get(toothNo);
    if(!s) continue;
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
    if(s.crownLeakage) prosthetics.push(`${lbl(toothNo)} (${t("crownLeakage.label")})`);

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

  const periodontalText = inflamed.length
    ? t("toothInfo.periodontalInflamed", { list: inflamed.join(", ") })
    : t("toothInfo.periodontalHealthy");

  const implantInfo = implants.length
    ? { heading: t("toothInfo.implants"), text: implants.map(lbl).join(", ") }
    : null;

  return {
    overview,
    permanentList,
    missingList,
    sections,
    implants: implantInfo,
    periodontalTitle: t("toothInfo.periodontalTitle"),
    periodontalText,
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
