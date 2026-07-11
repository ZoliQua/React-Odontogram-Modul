import type { Bundle, OdontogramExportPayload, FhirExportOptions } from "./types";
import { buildFhirBundleFromRegistry } from "../registry/fhir";

/**
 * Convert a serialized odontogram payload into a FHIR R4 collection Bundle.
 * Pure: no DOM, no network. Tolerant of malformed input (never throws).
 */
export function buildFhirBundle(payload: OdontogramExportPayload, options: FhirExportOptions = {}): Bundle {
  return buildFhirBundleFromRegistry(payload, options);
}
