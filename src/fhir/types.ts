import type { Bundle, Observation, Patient, CodeableConcept, Coding } from "fhir/r4";

export type { Bundle, Observation, Patient, CodeableConcept, Coding };

/** Per-tooth record as produced by the engine's serializeState(). */
export interface ToothRecord {
  toothSelection?: string;
  endoResection?: boolean;
  mods?: string[];
  periapicalType?: string;
  endo?: string;
  caries?: string[];
  cariesActiveDepth?: number;
  cariesDepths?: Record<string, number>;
  calculus?: boolean;
  fillingMaterial?: string;
  fillingSurfaces?: string[];
  fillingSurfaceMaterials?: Record<string, string>;
  fissureSealing?: boolean;
  contactMesial?: boolean;
  contactDistal?: boolean;
  bruxismWear?: boolean;
  bruxismNeckWear?: boolean;
  brokenMesial?: boolean;
  brokenIncisal?: boolean;
  brokenDistal?: boolean;
  extractionWound?: boolean;
  extractionPlan?: boolean;
  parapulpalPin?: boolean;
  crownReplace?: boolean;
  crownNeeded?: boolean;
  missingClosed?: boolean;
  bridgePillar?: boolean;
  prosthesis?: string;
  mobility?: string;
  toothSubstrate?: string;
  restorationType?: string;
  restorationMaterial?: string;
  crownLeakage?: boolean;
  // SP4 Task 1: pulp/apical/resorption diagnosis axes — see
  // docs/superpowers/specs/2026-07-13-odontogram-sp4-endo-pulp-diagnosis-design.md.
  // `pulpDx` is rendered/emitted (replaced the retired `pulpInflam` boolean,
  // SP4 Task 3); `pulpLatin`/`apicalDx` are still additive-only scaffolding.
  pulpDx?: string;
  pulpLatin?: string;
  apicalDx?: string;
  resorptionType?: string;
  customStates?: Record<string, unknown>;
  note?: string;
}

/** The serialized odontogram export payload (matches exportStatus()'s object). */
export interface OdontogramExportPayload {
  version: string;
  globals?: Record<string, boolean>;
  teeth: Record<string, ToothRecord>;
}

/** Options for buildFhirBundle / exportFhir. */
export interface FhirExportOptions {
  /**
   * FHIR reference string for the subject, e.g. "Patient/123".
   * When omitted, a placeholder Patient resource is added to the Bundle and
   * referenced by every Observation.
   */
  subject?: string;
}
