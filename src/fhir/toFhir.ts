import type {
  Bundle,
  Observation,
  Patient,
  CodeableConcept,
  Coding,
  OdontogramExportPayload,
  ToothRecord,
  FhirExportOptions,
} from "./types";
import {
  LOCAL_SYSTEM,
  FDI_SYSTEM,
  SNOMED_SYSTEM,
  SNOMED_CODES,
  LOCAL_VALUE_MAPS,
  type CodeEntry,
} from "./codesystems";
import { FIELD_MAPPINGS } from "./fieldMappings";

const PLACEHOLDER_PATIENT_ID = "odontogram-subject";
const PLACEHOLDER_PATIENT_FULLURL = "urn:uuid:odontogram-subject";

/** Build a CodeableConcept: always a local coding, plus SNOMED when verified. */
function concept(system: string, entry: CodeEntry, snomedKey?: string): CodeableConcept {
  const codings: Coding[] = [{ system, code: entry.code, display: entry.display }];
  const sct = entry.snomed ?? (snomedKey ? SNOMED_CODES[snomedKey] : undefined);
  if (sct) codings.push({ system: SNOMED_SYSTEM, code: sct, display: entry.display });
  return { coding: codings, text: entry.display };
}

/** Decode an enum value via a value-map group, tolerating unknown values. */
function valueConcept(group: string, value: string): CodeableConcept {
  const entry = LOCAL_VALUE_MAPS[group]?.[value] ?? { code: value, display: value };
  return concept(LOCAL_SYSTEM, entry, `${group}:${value}`);
}

/** The Observation.code identifying a finding TYPE (engine-local). */
function findingConcept(code: string, display: string): CodeableConcept {
  return concept(LOCAL_SYSTEM, { code, display }, `finding:${code}`);
}

/** FDI/ISO 3950 tooth bodySite. The internal key is already an FDI number. */
function toothBodySite(fdi: string): CodeableConcept {
  return { coding: [{ system: FDI_SYSTEM, code: fdi }], text: `Tooth ${fdi}` };
}

const EXAM_CATEGORY: CodeableConcept[] = [
  {
    coding: [
      { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "exam", display: "Exam" },
    ],
  },
];

const baseObservation = (subjectRef: string, tooth: string, code: CodeableConcept): Observation => ({
  resourceType: "Observation",
  status: "final",
  category: EXAM_CATEGORY,
  code,
  subject: { reference: subjectRef },
  bodySite: toothBodySite(tooth),
});

/** Emit zero or more Observations for one tooth field, per its mapping. */
function emitForField(
  subjectRef: string,
  tooth: string,
  rec: ToothRecord,
  mapping: (typeof FIELD_MAPPINGS)[number],
): Observation[] {
  const raw = (rec as Record<string, unknown>)[mapping.field];

  switch (mapping.kind) {
    case "enum": {
      const value = typeof raw === "string" ? raw : "";
      if (!value || value === mapping.skipValue) return [];
      const obs = baseObservation(subjectRef, tooth, findingConcept(mapping.findingCode, mapping.findingDisplay));
      obs.valueCodeableConcept = valueConcept(mapping.valueGroup, value);
      return [obs];
    }
    case "boolean": {
      if (raw !== true) return [];
      const obs = baseObservation(subjectRef, tooth, findingConcept(mapping.findingCode, mapping.findingDisplay));
      obs.valueBoolean = true;
      return [obs];
    }
    case "set": {
      const arr = Array.isArray(raw) ? (raw as unknown[]).filter((v): v is string => typeof v === "string") : [];
      if (arr.length === 0) return [];
      const obs = baseObservation(subjectRef, tooth, findingConcept(mapping.findingCode, mapping.findingDisplay));
      obs.component = arr.map((v) => ({ code: valueConcept(mapping.valueGroup, v), valueBoolean: true }));
      return [obs];
    }
    case "restoration": {
      // Per-surface materials (v1.4) take precedence; fall back to legacy single material.
      const fsm = (rec as Record<string, unknown>).fillingSurfaceMaterials;
      const perSurface: Array<[string, string]> = [];
      if (fsm && typeof fsm === "object") {
        for (const [surf, mat] of Object.entries(fsm as Record<string, unknown>)) {
          if (typeof mat === "string" && mat) perSurface.push([surf, mat]);
        }
      }
      if (perSurface.length === 0) {
        const material = typeof raw === "string" ? raw : "";
        const surfaces = Array.isArray(rec[mapping.surfacesField as keyof ToothRecord] as unknown)
          ? ((rec[mapping.surfacesField as keyof ToothRecord] as unknown[]).filter((v): v is string => typeof v === "string"))
          : [];
        if (material && material !== mapping.skipValue) {
          for (const s of surfaces) perSurface.push([s, material]);
        }
      }
      if (perSurface.length === 0) return [];
      const obs = baseObservation(subjectRef, tooth, findingConcept(mapping.findingCode, mapping.findingDisplay));
      obs.component = perSurface.map(([surf, mat]) => ({
        code: valueConcept("fillingSurfaces", surf),
        valueCodeableConcept: valueConcept("fillingMaterial", mat),
      }));
      return [obs];
    }
    default:
      return [];
  }
}

/**
 * Convert a serialized odontogram payload into a FHIR R4 collection Bundle.
 * Pure: no DOM, no network. Tolerant of malformed input (never throws).
 */
export function buildFhirBundle(
  payload: OdontogramExportPayload,
  options: FhirExportOptions = {},
): Bundle {
  const teeth =
    payload && typeof payload === "object" && payload.teeth && typeof payload.teeth === "object"
      ? payload.teeth
      : {};

  const subjectRef = options.subject ?? PLACEHOLDER_PATIENT_FULLURL;
  const entries: Bundle["entry"] = [];

  if (!options.subject) {
    const patient: Patient = { resourceType: "Patient", id: PLACEHOLDER_PATIENT_ID };
    entries.push({ fullUrl: PLACEHOLDER_PATIENT_FULLURL, resource: patient });
  }

  // Chart-level (whole-mouth) edentulous status, if set in globals.
  const globals: Record<string, boolean> =
    payload && typeof payload === "object" && payload.globals && typeof payload.globals === "object"
      ? payload.globals
      : {};
  if (globals.edentulous === true) {
    const edentulousObs: Observation = {
      resourceType: "Observation",
      status: "final",
      category: EXAM_CATEGORY,
      code: {
        coding: [{ system: LOCAL_SYSTEM, code: "edentulous", display: "Edentulous (whole mouth)" }],
        text: "Edentulous (whole mouth)",
      },
      subject: { reference: subjectRef },
      valueBoolean: true,
    };
    entries.push({ resource: edentulousObs });
  }

  for (const [tooth, recRaw] of Object.entries(teeth)) {
    const rec = (recRaw && typeof recRaw === "object" ? recRaw : {}) as ToothRecord;
    for (const mapping of FIELD_MAPPINGS) {
      for (const obs of emitForField(subjectRef, tooth, rec, mapping)) {
        entries.push({ resource: obs });
      }
    }
    if (typeof rec.note === "string" && rec.note.trim().length > 0) {
      const noteObs = baseObservation(subjectRef, tooth, findingConcept("tooth-note", "Tooth note"));
      noteObs.note = [{ text: rec.note }];
      entries.push({ resource: noteObs });
    }
    // Plugin custom states: map primitive values via local codes; skip unknown shapes.
    const custom = rec.customStates;
    if (custom && typeof custom === "object") {
      for (const [pluginId, value] of Object.entries(custom)) {
        if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") continue;
        const obs = baseObservation(subjectRef, tooth, {
          coding: [{ system: LOCAL_SYSTEM, code: `custom-state:${pluginId}`, display: `Custom state: ${pluginId}` }],
          text: `Custom state: ${pluginId}`,
        });
        if (typeof value === "string") obs.valueString = value;
        else if (typeof value === "number") obs.valueQuantity = { value };
        else obs.valueBoolean = value;
        entries.push({ resource: obs });
      }
    }
  }

  return { resourceType: "Bundle", type: "collection", entry: entries };
}
