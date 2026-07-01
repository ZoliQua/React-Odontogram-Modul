import type { OdontogramExportPayload, ToothRecord } from "./types";
import { LOCAL_SYSTEM } from "./codesystems";
import { FIELD_MAPPINGS } from "./fieldMappings";

// Reverse lookup: finding code -> mapping.
const BY_FINDING: Record<string, (typeof FIELD_MAPPINGS)[number]> = {};
for (const m of FIELD_MAPPINGS) BY_FINDING[m.findingCode] = m;

function localCode(cc: unknown): string | undefined {
  const coding = (cc as { coding?: Array<{ system?: string; code?: string }> } | undefined)?.coding;
  if (!Array.isArray(coding)) return undefined;
  const hit = coding.find((c) => c?.system === LOCAL_SYSTEM && typeof c.code === "string");
  return hit?.code;
}

function ensureTooth(teeth: Record<string, ToothRecord>, id: string): ToothRecord {
  if (!teeth[id]) teeth[id] = {};
  return teeth[id];
}

/**
 * Invert buildFhirBundle: parse a FHIR R4 collection Bundle produced by this
 * module back into the {version, globals, teeth} payload importStatus expects.
 * Only LOCAL_SYSTEM codings are trusted (round-trip). Tolerant of bad input.
 */
export function parseFhirBundle(bundle: unknown): OdontogramExportPayload {
  const teeth: Record<string, ToothRecord> = {};
  const globals: Record<string, boolean> = {};
  const entries = (bundle as { entry?: unknown })?.entry;
  if (Array.isArray(entries)) {
    for (const e of entries) {
      const res = (e as { resource?: unknown })?.resource as {
        resourceType?: string;
        code?: unknown;
        bodySite?: { coding?: Array<{ system?: string; code?: string }> };
        valueCodeableConcept?: unknown;
        valueBoolean?: unknown;
        valueString?: unknown;
        valueQuantity?: { value?: unknown };
        component?: Array<{ code?: unknown; valueCodeableConcept?: unknown; valueBoolean?: unknown; valueInteger?: unknown }>;
        note?: Array<{ text?: unknown }>;
      } | undefined;
      if (!res || res.resourceType !== "Observation") continue;

      const findingCode = localCode(res.code);
      if (!findingCode) continue;

      const toothId = res.bodySite?.coding?.find((c) => typeof c.code === "string")?.code;

      // chart-level
      if (findingCode === "edentulous") { globals.edentulous = res.valueBoolean === true; continue; }
      if (!toothId) continue;
      const rec = ensureTooth(teeth, toothId);

      if (findingCode === "tooth-note") {
        const text = res.note?.[0]?.text;
        if (typeof text === "string") rec.note = text;
        continue;
      }
      if (findingCode.startsWith("custom-state:")) {
        const id = findingCode.slice("custom-state:".length);
        const val = typeof res.valueString === "string" ? res.valueString
          : typeof res.valueBoolean === "boolean" ? res.valueBoolean
          : typeof res.valueQuantity?.value === "number" ? res.valueQuantity.value
          : undefined;
        if (val !== undefined) { (rec.customStates ??= {})[id] = val; }
        continue;
      }

      const mapping = BY_FINDING[findingCode];
      if (!mapping) continue;

      if (mapping.kind === "enum") {
        const v = localCode(res.valueCodeableConcept);
        if (v) (rec as Record<string, unknown>)[mapping.field] = v;
      } else if (mapping.kind === "boolean") {
        if (res.valueBoolean === true) (rec as Record<string, unknown>)[mapping.field] = true;
      } else if (mapping.kind === "set") {
        const vals = (res.component ?? []).map((c) => localCode(c.code)).filter((x): x is string => !!x);
        if (vals.length) (rec as Record<string, unknown>)[mapping.field] = vals;
        if (mapping.field === "caries") {
          const depths: Record<string, number> = {};
          for (const c of res.component ?? []) {
            const code = localCode(c.code);
            if (!code) continue;
            const vi = c.valueInteger;
            if (typeof vi === "number") depths[String(code).replace("caries-", "")] = vi;
          }
          if (Object.keys(depths).length) rec.cariesDepths = depths;
        }
      } else if (mapping.kind === "restoration") {
        const fsm: Record<string, string> = {};
        for (const c of res.component ?? []) {
          const surf = localCode(c.code);
          const mat = localCode(c.valueCodeableConcept);
          if (surf && mat) fsm[surf] = mat;
        }
        if (Object.keys(fsm).length) rec.fillingSurfaceMaterials = fsm;
      }
    }
  }
  return { version: "1.4", globals, teeth };
}
