/** Registry type definitions for the clinical-axis engine (SP2). Types only. */

export type AxisKind = "enum" | "boolean" | "set" | "surfaceSet" | "restoration" | "derived" | "global";

/** A coded concept: local code always present; SNOMED/ICD optional and additive. */
export interface ConceptRef {
  local: string;                 // LOCAL_SYSTEM code — always present, round-trip key
  display: string;               // language-neutral English display
  snomed?: string;               // SNOMED CT id (unused in SP2)
  icd?: { system: string; code: string }[]; // system-agnostic (unused in SP2)
}

/** One allowed value of an axis. svgLayer/ui are added in later stages. */
export interface AxisValue {
  id: string;                    // engine value id (e.g. "metal", "caries-occlusal")
  coding: ConceptRef;            // additive codings for this value
  labelKey?: string;             // i18n key (added in the UI stage)
}

/** One chartable tooth axis. Resolver fields are optional here (filled per stage). */
export interface ClinicalAxis {
  id: string;                    // axis id (e.g. "crownMaterial")
  field: string;                 // ToothRecord field name this axis reads/writes
  kind: AxisKind;
  finding: ConceptRef;           // Observation.code concept (finding type)
  valueGroup?: string;           // LOCAL_VALUE_MAPS group for enum/set/restoration values
  values?: AxisValue[];          // allowed values (enum/set/surfaceSet/restoration)
  skipValue?: string;            // value that emits nothing (enum/restoration)
  surfacesField?: string;        // restoration axis: the ToothRecord field holding the surface list
  flag?: string;                 // feature-flag gate (e.g. "icdasEnabled")
}

/** Per-tooth rendering context (static tables; populated in later stages). */
export interface ToothContext {
  fdi: number;
  template: 11 | 13 | 14 | 16;
  view: "front" | "occlusal";
  isAnterior: boolean;
  isMolar: boolean;
  mirror: boolean;
  rot: 0 | 180;
  fissureAllowed: boolean;
  milktoothAllowed: boolean;
}

/** Placeholder for the eventual axis-keyed state; SP2 keeps the current container.
 *  Kept as a nominal type so later stages can tighten it. */
export type ToothState = Record<string, unknown>;
