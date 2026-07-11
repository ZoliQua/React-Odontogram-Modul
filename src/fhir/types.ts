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
  // SP6 Task 1: unified per-surface caries severity (0..6), read as ICDAS on a
  // primary surface and CARS on a recurrent one. Replaces `cariesDepths`.
  cariesSeverity?: Record<string, number>;
  // Retired SP5 fields, still accepted on legacy raw payloads for migration only.
  cariesDepths?: Record<string, number>;
  calculus?: boolean;
  fillingMaterial?: string;
  fillingSurfaces?: string[];
  fillingSurfaceMaterials?: Record<string, string>;
  fissureSealing?: boolean;
  contactMesial?: boolean;
  contactDistal?: boolean;
  wearEdge?: string;
  wearCervical?: string;
  // SP12 Task 1: tooth discoloration foundation (additive; see docs/superpowers
  // SP12 design). Enum axis, no svgLayer — see registry/axes.ts.
  discoloration?: string;
  periImplant?: string;
  // SP14 Task 1: orthodontic axes foundation (additive; see registry/axes.ts).
  orthoAppliance?: string;
  orthoDrift?: string;
  orthoVertical?: string;
  orthoRotation?: boolean;
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
  // `rootCaries` is a normal enum axis. `radiographicDepth` (per-surface
  // none/E1/E2/D1/D2/D3) is a per-surface scalar map, independent of the
  // unified visual severity. `secondaryCaries` is a retired SP5 field, still
  // accepted on legacy raw payloads for migration only (folded into
  // `cariesSeverity` on hydrate).
  rootCaries?: string;
  secondaryCaries?: Record<string, number>;
  radiographicDepth?: Record<string, string>;
  // SP10 Task 1: per-surface filling-defect scalar map (none/marginal/fracture/wear),
  // modeled the same way as `radiographicDepth` above.
  fillingDefect?: Record<string, string>;
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
