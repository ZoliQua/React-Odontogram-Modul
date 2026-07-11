/**
 * Canonical system URLs and coding maps for the FHIR export.
 *
 * - Local codes mirror the engine's own enum values and are ALWAYS emitted,
 *   guaranteeing round-trip fidelity even where no standard code exists. The
 *   local system is currently the ONLY coding emitted for clinical states.
 * - SNOMED CT is not yet active: `SNOMED_CODES` is currently empty and no
 *   `CodeEntry` sets `snomed`, so no SNOMED coding is emitted. When populated
 *   (with codes verified against the official SNOMED CT browser), entries are
 *   emitted as additional codings in the export; they are additive, never required.
 */

/** Local CodeSystem canonical URL (engine-owned codes). */
export const LOCAL_SYSTEM =
  "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram";

/** ISO 3950 / FDI tooth designation system. */
export const FDI_SYSTEM = "urn:iso:std:iso:3950";

/** SNOMED CT system URL. */
export const SNOMED_SYSTEM = "http://snomed.info/sct";

/**
 * ICDAS II (International Caries Detection and Assessment System) reference URL.
 * Documentation constant: per-surface caries codes (1–6) are emitted as the
 * caries component's `valueInteger`; this URL identifies the scoring system.
 */
export const ICDAS_SYSTEM = "https://www.icdas.org";

/** A single coded value: required local code, optional verified SNOMED code. */
export interface CodeEntry {
  code: string;
  display: string;
  snomed?: string;
}

/**
 * Local value maps, keyed by enum group then by enum value.
 * `display` strings are English (the export is language-neutral data).
 */
export const LOCAL_VALUE_MAPS: Record<string, Record<string, CodeEntry>> = {
  toothSelection: {
    "none": { code: "none", display: "No tooth status" },
    "tooth-base": { code: "tooth-base", display: "Present tooth" },
    "milktooth": { code: "milktooth", display: "Primary (deciduous) tooth" },
    "implant": { code: "implant", display: "Dental implant" },
    "tooth-under-gum": { code: "tooth-under-gum", display: "Tooth under gum" },
    "no-tooth-after-extraction": { code: "no-tooth-after-extraction", display: "Missing after extraction" },
  },
  endo: {
    "none": { code: "none", display: "No endodontic treatment" },
    "endo-medical-filling": { code: "endo-medical-filling", display: "Endodontic medical filling" },
    "endo-filling": { code: "endo-filling", display: "Root canal filling" },
    "endo-filling-incomplete": { code: "endo-filling-incomplete", display: "Incomplete root canal filling" },
    "endo-glass-pin": { code: "endo-glass-pin", display: "Glass fiber post" },
    "endo-metal-pin": { code: "endo-metal-pin", display: "Metal post" },
  },
  fillingMaterial: {
    "none": { code: "none", display: "No filling" },
    "amalgam": { code: "amalgam", display: "Amalgam filling" },
    "composite": { code: "composite", display: "Composite filling" },
    "gic": { code: "gic", display: "Glass ionomer cement filling" },
    "temporary": { code: "temporary", display: "Temporary filling" },
  },
  prosthesis: {
    "none":              { code: "none",              display: "No prosthesis" },
    "healing-abutment":  { code: "healing-abutment",  display: "Healing abutment" },
    "locator":           { code: "locator",           display: "Locator attachment" },
    "locator-denture":   { code: "locator-denture",   display: "Locator overdenture" },
    "bar":               { code: "bar",               display: "Bar attachment" },
    "bar-denture":       { code: "bar-denture",       display: "Bar overdenture" },
    "removable-partial": { code: "removable-partial", display: "Partial removable denture" },
    "removable-full":    { code: "removable-full",    display: "Full removable denture" },
  },
  mobility: {
    "none": { code: "none", display: "No mobility" },
    "m1": { code: "m1", display: "Mobility grade 1" },
    "m2": { code: "m2", display: "Mobility grade 2" },
    "m3": { code: "m3", display: "Mobility grade 3" },
  },
  mods: {
    "inflammation": { code: "inflammation", display: "Inflammation" },
    "parodontal": { code: "parodontal", display: "Periodontal involvement" },
    "mobility": { code: "mobility", display: "Mobility" },
  },
  periapicalType: {
    "none": { code: "none", display: "No periapical lesion" },
    "granuloma": { code: "granuloma", display: "Periapical granuloma" },
    "cyst": { code: "cyst", display: "Radicular cyst" },
    "abscess": { code: "abscess", display: "Periapical abscess" },
  },
  caries: {
    "caries-subcrown": { code: "caries-subcrown", display: "Subcrown caries" },
    "caries-buccal": { code: "caries-buccal", display: "Buccal caries" },
    "caries-lingual": { code: "caries-lingual", display: "Lingual caries" },
    "caries-mesial": { code: "caries-mesial", display: "Mesial caries" },
    "caries-distal": { code: "caries-distal", display: "Distal caries" },
    "caries-occlusal": { code: "caries-occlusal", display: "Occlusal caries" },
  },
  fillingSurfaces: {
    "buccal": { code: "buccal", display: "Buccal surface" },
    "lingual": { code: "lingual", display: "Lingual surface" },
    "mesial": { code: "mesial", display: "Mesial surface" },
    "distal": { code: "distal", display: "Distal surface" },
    "occlusal": { code: "occlusal", display: "Occlusal surface" },
  },
  toothSubstrate: {
    "natural": { code: "natural", display: "Natural substrate" },
    "radix": { code: "radix", display: "Root remnant (radix)" },
    "broken": { code: "broken", display: "Broken tooth" },
    "crownprep": { code: "crownprep", display: "Prepared for crown" },
  },
  restorationType: {
    "none": { code: "none", display: "No restoration" },
    "crown": { code: "crown", display: "Crown" },
    "inlay": { code: "inlay", display: "Inlay" },
    "onlay": { code: "onlay", display: "Onlay" },
    "veneer": { code: "veneer", display: "Veneer" },
    "bridge": { code: "bridge", display: "Bridge unit" },
  },
  restorationMaterial: {
    "none": { code: "none", display: "No material" },
    "emax": { code: "emax", display: "Lithium disilicate (e.max)" },
    "gold": { code: "gold", display: "Gold" },
    "gradia": { code: "gradia", display: "Indirect composite (Gradia)" },
    "zircon": { code: "zircon", display: "Zirconia" },
    "metal": { code: "metal", display: "Full-cast metal" },
    "metal-ceramic": { code: "metal-ceramic", display: "Metal-ceramic (PFM)" },
    "telescope": { code: "telescope", display: "Telescopic crown" },
    "temporary": { code: "temporary", display: "Temporary" },
  },
  // SP4 Task 1: pulp/apical/resorption diagnosis axes (additive; not yet
  // rendered). See docs/superpowers/specs/2026-07-13-odontogram-sp4-endo-pulp-diagnosis-design.md.
  pulpDx: {
    "normal": { code: "normal", display: "Normal pulp" },
    "reversible-pulpitis": { code: "reversible-pulpitis", display: "Reversible pulpitis" },
    "irreversible-pulpitis": { code: "irreversible-pulpitis", display: "Irreversible pulpitis" },
    "necrosis": { code: "necrosis", display: "Pulp necrosis" },
  },
  // Practical clinical Latin pulp subtypes (spec §3.2); `display` is the Latin
  // label itself (language-neutral, identical across UI languages).
  pulpLatin: {
    "none": { code: "none", display: "No Latin pulp subtype" },
    "pulpa-sana": { code: "pulpa-sana", display: "Pulpa sana" },
    "hyperaemia-pulpae": { code: "hyperaemia-pulpae", display: "Hyperaemia pulpae" },
    "pulpitis-acuta-serosa": { code: "pulpitis-acuta-serosa", display: "Pulpitis acuta serosa" },
    "pulpitis-acuta-purulenta": { code: "pulpitis-acuta-purulenta", display: "Pulpitis acuta purulenta" },
    "pulpitis-chronica-clausa": { code: "pulpitis-chronica-clausa", display: "Pulpitis chronica clausa" },
    "pulpitis-chronica-ulcerosa": { code: "pulpitis-chronica-ulcerosa", display: "Pulpitis chronica ulcerosa (aperta)" },
    "pulpitis-chronica-hyperplastica": { code: "pulpitis-chronica-hyperplastica", display: "Pulpitis chronica hyperplastica (pulpa-polyp)" },
    "necrosis-pulpae": { code: "necrosis-pulpae", display: "Necrosis pulpae" },
    "gangraena-pulpae": { code: "gangraena-pulpae", display: "Gangraena pulpae" },
  },
  apicalDx: {
    "normal": { code: "normal", display: "No apical pathology" },
    "symptomatic-apical-periodontitis": { code: "symptomatic-apical-periodontitis", display: "Symptomatic apical periodontitis" },
    "asymptomatic-apical-periodontitis": { code: "asymptomatic-apical-periodontitis", display: "Asymptomatic apical periodontitis" },
    "acute-apical-abscess": { code: "acute-apical-abscess", display: "Acute apical abscess" },
    "chronic-apical-abscess": { code: "chronic-apical-abscess", display: "Chronic apical abscess" },
    "condensing-osteitis": { code: "condensing-osteitis", display: "Condensing osteitis" },
  },
  resorptionType: {
    "none": { code: "none", display: "No root resorption" },
    "internal": { code: "internal", display: "Internal root resorption" },
    "external-cervical": { code: "external-cervical", display: "External cervical root resorption" },
  },
  // SP5 Task 1: caries fields foundation (additive; not yet rendered). `rootCaries`
  // is a normal enum axis (registered in axes.ts/fieldMappings.ts). `secondaryCaries`
  // (CARS 0-6) and `radiographicDepth` are per-surface scalar maps handled the same
  // way `cariesDepths` is (special-cased outside AXES) — `secondaryCaries` has no
  // value-map group (a raw integer score, like ICDAS), `radiographicDepth` does.
  rootCaries: {
    "none": { code: "none", display: "No root caries" },
    "active": { code: "active", display: "Active root caries" },
    "arrested": { code: "arrested", display: "Arrested root caries" },
    "active-cavitated": { code: "active-cavitated", display: "Active cavitated root caries" },
  },
  radiographicDepth: {
    "none": { code: "none", display: "No radiographic caries depth recorded" },
    "E1": { code: "E1", display: "Enamel, outer half (E1)" },
    "E2": { code: "E2", display: "Enamel, inner half (E2)" },
    "D1": { code: "D1", display: "Dentin, outer third (D1)" },
    "D2": { code: "D2", display: "Dentin, middle third (D2)" },
    "D3": { code: "D3", display: "Dentin, inner third (D3)" },
  },
};

/**
 * Verified SNOMED CT codes, keyed by "<group>:<value>".
 * CURRENTLY EMPTY — so no SNOMED coding is emitted by the export; the local
 * system is the only coding produced for clinical states. When entries are
 * added here (codes verified against the official SNOMED CT browser), they are
 * emitted as additional codings in the export. The mapper works with or without
 * entries — they are purely additive.
 */
export const SNOMED_CODES: Record<string, string> = {};
