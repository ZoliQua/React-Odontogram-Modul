import type { OdontogramExportPayload, ToothRecord } from "../fhir/types";
import { localCode, ensureTooth } from "../fhir/primitives";
import { AXES } from "./axes";
import type { ClinicalAxis } from "./types";

// Reverse lookup: finding code -> axis.
const BY_FINDING: Record<string, ClinicalAxis> = {};
for (const a of AXES) BY_FINDING[a.finding.local] = a;

/** Registry-driven inverse of buildFhirBundle. Byte-identical to the legacy parseFhirBundle. */
export function parseFhirBundleFromRegistry(bundle: unknown): OdontogramExportPayload {
  const teeth: Record<string, ToothRecord> = {};
  const globals: Record<string, boolean> = {};
  const entries = (bundle as { entry?: unknown })?.entry;
  if (Array.isArray(entries)) {
    for (const e of entries) {
      const res = (e as { resource?: unknown })?.resource as {
        resourceType?: string; code?: unknown;
        bodySite?: { coding?: Array<{ system?: string; code?: string }> };
        valueCodeableConcept?: unknown; valueBoolean?: unknown; valueString?: unknown;
        valueQuantity?: { value?: unknown };
        component?: Array<{ code?: unknown; valueCodeableConcept?: unknown; valueBoolean?: unknown; valueInteger?: unknown }>;
        note?: Array<{ text?: unknown }>;
      } | undefined;
      if (!res || res.resourceType !== "Observation") continue;

      const findingCode = localCode(res.code);
      if (!findingCode) continue;
      const toothId = res.bodySite?.coding?.find((c) => typeof c.code === "string")?.code;

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

      const axis = BY_FINDING[findingCode];
      if (!axis) continue;

      if (axis.kind === "enum") {
        const v = localCode(res.valueCodeableConcept);
        if (v) (rec as Record<string, unknown>)[axis.field] = v;
      } else if (axis.kind === "boolean") {
        if (res.valueBoolean === true) (rec as Record<string, unknown>)[axis.field] = true;
      } else if (axis.kind === "set") {
        const vals = (res.component ?? []).map((c) => localCode(c.code)).filter((x): x is string => !!x);
        if (vals.length) (rec as Record<string, unknown>)[axis.field] = vals;
        if (axis.field === "caries") {
          const depths: Record<string, number> = {};
          for (const c of res.component ?? []) {
            const code = localCode(c.code);
            if (!code) continue;
            const vi = c.valueInteger;
            if (typeof vi === "number") depths[String(code).replace("caries-", "")] = vi;
          }
          if (Object.keys(depths).length) rec.cariesDepths = depths;
        }
      } else if (axis.kind === "restoration") {
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
  return { version: "2.1", globals, teeth };
}
