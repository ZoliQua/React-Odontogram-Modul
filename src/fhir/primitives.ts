import type { CodeableConcept, Coding, Observation, ToothRecord } from "./types";
import {
  LOCAL_SYSTEM,
  FDI_SYSTEM,
  SNOMED_SYSTEM,
  SNOMED_CODES,
  LOCAL_VALUE_MAPS,
  type CodeEntry,
} from "./codesystems";

export const PLACEHOLDER_PATIENT_ID = "odontogram-subject";
export const PLACEHOLDER_PATIENT_FULLURL = "urn:uuid:odontogram-subject";

/** Build a CodeableConcept: always a local coding, plus SNOMED when verified. */
export function concept(system: string, entry: CodeEntry, snomedKey?: string): CodeableConcept {
  const codings: Coding[] = [{ system, code: entry.code, display: entry.display }];
  const sct = entry.snomed ?? (snomedKey ? SNOMED_CODES[snomedKey] : undefined);
  if (sct) codings.push({ system: SNOMED_SYSTEM, code: sct, display: entry.display });
  return { coding: codings, text: entry.display };
}

/** Decode an enum value via a value-map group, tolerating unknown values. */
export function valueConcept(group: string, value: string): CodeableConcept {
  const entry = LOCAL_VALUE_MAPS[group]?.[value] ?? { code: value, display: value };
  return concept(LOCAL_SYSTEM, entry, `${group}:${value}`);
}

/** The Observation.code identifying a finding TYPE (engine-local). */
export function findingConcept(code: string, display: string): CodeableConcept {
  return concept(LOCAL_SYSTEM, { code, display }, `finding:${code}`);
}

/** FDI/ISO 3950 tooth bodySite. The internal key is already an FDI number. */
export function toothBodySite(fdi: string): CodeableConcept {
  return { coding: [{ system: FDI_SYSTEM, code: fdi }], text: `Tooth ${fdi}` };
}

export const EXAM_CATEGORY: CodeableConcept[] = [
  {
    coding: [
      { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "exam", display: "Exam" },
    ],
  },
];

export const baseObservation = (subjectRef: string, tooth: string, code: CodeableConcept): Observation => ({
  resourceType: "Observation",
  status: "final",
  category: EXAM_CATEGORY,
  code,
  subject: { reference: subjectRef },
  bodySite: toothBodySite(tooth),
});

export function localCode(cc: unknown): string | undefined {
  const coding = (cc as { coding?: Array<{ system?: string; code?: string }> } | undefined)?.coding;
  if (!Array.isArray(coding)) return undefined;
  const hit = coding.find((c) => c?.system === LOCAL_SYSTEM && typeof c.code === "string");
  return hit?.code;
}

export function ensureTooth(teeth: Record<string, ToothRecord>, id: string): ToothRecord {
  if (!teeth[id]) teeth[id] = {};
  return teeth[id];
}
