import { AXES } from "./axes";
import { allRestorationLayers } from "./restorations";

/** Non-axis layers the render clears (base/pulp/milktooth/bruxism/crown-branch intermediates/etc.).
 *  Transcribed verbatim from odontogram.ts applyStateToSvgSingle's clear block (:742-787).
 *  Also includes "implant" and "milktooth": those two ids are NOT cleared by the :742-787
 *  block itself (they are activation-toggled right after it, at :763-764 via
 *  setActive("implant", isImplant) / setActive("milktooth", isMilktooth)), but
 *  axisClearLayers() below derives them from AXES (toothSelection.svgLayer) since they
 *  are legitimate switchable SVG layers. Clearing them here is byte-identical to today's
 *  render because :763-764 immediately re-sets them to the correct value right after —
 *  setActive() is a pure, idempotent attribute write. They are listed explicitly here so
 *  allClearLayers() equals this list as a set (see the set-equality test). */
export const FIXED_CLEAR_LAYERS: string[] = [
  "tooth-base","tooth-healthy-pulp","tooth-inflam-pulp","tooth-bruxism-wear","tooth-bruxism-neck-wear",
  "tooth-base-beauty","endo-resection","milktooth-base","milktooth-beauty","milktooth-healthy-pulp",
  "milktooth-inflam-pulp","fissure-sealing","mesial-no-contact-point","distal-no-contact-point","no-tooth-after-extraction",
  // GROUPS.variants
  "tooth-broken-incisal","tooth-broken-distal-incisal","tooth-broken-distal","tooth-broken-mesial-distal-incisal",
  "tooth-broken-mesial-distal","tooth-broken-mesial-incisal","tooth-broken-mesial","tooth-crownprep","tooth-under-gum",
  "tooth-radix",
  // GROUPS.mods + periapical glyphs
  "inflammation","parodontal","mobility","cysta","granuloma","abscess",
  // GROUPS.endo + endo-resorption
  "endo-medical-filling","endo-filling","endo-filling-incomplete","endo-glass-pin","endo-metal-pin","endo-resection","parapulpal-pin","endo-resorption",
  // caries ids
  "caries-subcrown","caries-buccal","caries-lingual","caries-distal","caries-mesial","caries-occlusal",
  // subcaries per surface
  "subcaries-buccal","subcaries-lingual","subcaries-mesial","subcaries-distal","subcaries-occlusal",
  "calculus",
  // fillings: {mat}-{surface}
  "filling-amalgam-buccal","filling-amalgam-lingual","filling-amalgam-mesial","filling-amalgam-distal","filling-amalgam-occlusal",
  "filling-composite-buccal","filling-composite-lingual","filling-composite-mesial","filling-composite-distal","filling-composite-occlusal",
  "filling-gic-buccal","filling-gic-lingual","filling-gic-mesial","filling-gic-distal","filling-gic-occlusal",
  "filling-temporary-buccal","filling-temporary-lingual","filling-temporary-mesial","filling-temporary-distal","filling-temporary-occlusal",
  // restoration clear list (odontogram.ts:780)
  "implant-base","implant-connector","implant-healing-abutment","implant-locator-screw","implant-bar","prosthesis",
  "prosthesis-implant","prosthesis-implant-crown","prosthesis-implant-gum","telescope","zircon","metal","emax-crown",
  "zircon-crown","metal-crown","temporary-crown","telescope-crown-inside","telescope-crown-outside","extraction-plan",
  "zircon-bridge-connector","metal-bridge-connector","temporary-bridge-connector","telescope-bridge-connector",
  "temporary-restorations",
  // SP3 restoration composition — per-material wrapper <g> groups...
  "emax","gold","gradia","metal-ceramic",
  // ...and every composed child layer (crown / bridge-connector / inlay / onlay / veneer),
  // superset of allRestorationLayers() so allClearLayers() stays equal to this list.
  "gold-crown","gradia-crown","metal-ceramic-crown","telescope-crown",
  "emax-bridge-connector","gold-bridge-connector","gradia-bridge-connector","metal-ceramic-bridge-connector",
  "emax-inlay","gold-inlay","gradia-inlay","zircon-inlay","temporary-inlay",
  "emax-onlay","gold-onlay","gradia-onlay","zircon-onlay","temporary-onlay",
  "emax-veneer","gold-veneer","gradia-veneer","zircon-veneer","temporary-veneer",
  // specials
  "crown-replace","crown-needed","missing-closed",
  // toothSelection activation layers (see comment above): cleared here, re-set at :763-764
  "implant","milktooth",
];

export function axisClearLayers(): string[] {
  const out: string[] = [];
  for (const ax of AXES) for (const v of ax.values ?? []) {
    const layers = v.svgLayer == null ? [] : Array.isArray(v.svgLayer) ? v.svgLayer : [v.svgLayer];
    for (const id of layers) if (!out.includes(id)) out.push(id);
  }
  return out;
}

/** The full set of layers the render turns off before applying active state. */
export function allClearLayers(): string[] {
  const set = new Set(FIXED_CLEAR_LAYERS);
  for (const id of axisClearLayers()) set.add(id);
  // SP3: every valid restoration composition layer must be cleared before the
  // render re-activates the selected one. These ids are all also listed in
  // FIXED_CLEAR_LAYERS (so the set-equality test still holds), but deriving them
  // from the matrix keeps the two in lockstep as materials evolve.
  for (const id of allRestorationLayers()) set.add(id);
  return [...set];
}
