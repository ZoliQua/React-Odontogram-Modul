import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { payloadCases } from "../../__tests__/parity/matrix";
import { buildFhirBundle } from "../../fhir/toFhir";
import { parseFhirBundle } from "../../fhir/fromFhir";
import { parseFhirBundleFromRegistry } from "../fromFhir";

const here = import.meta.url;
const golden = JSON.parse(readFileSync(fileURLToPath(new URL("../../__tests__/parity/roundtrip-golden.json", here)), "utf8"));

describe("registry-driven fromFhir matches the pre-rewrite engine", () => {
  it("equals the legacy parseFhirBundle for every matrix payload's bundle", () => {
    for (const p of payloadCases()) {
      const bundle = buildFhirBundle(p.payload);
      expect(parseFhirBundleFromRegistry(bundle), p.name).toEqual(parseFhirBundle(bundle));
    }
  });
  it("equals the frozen round-trip golden", () => {
    payloadCases().forEach((p, i) =>
      expect(parseFhirBundleFromRegistry(buildFhirBundle(p.payload)), p.name).toEqual(golden[i].parsed));
  });
  it("recovers note and customStates through a round-tripped bundle", () => {
    const payload = { version: "1.4", teeth: { "11": {
      crownMaterial: "metal",
      note: "chipped incisal edge",
      customStates: { strFlag: "yes", numFlag: 3, boolFlag: true },
    } } };
    const parsed = parseFhirBundleFromRegistry(buildFhirBundle(payload as any));
    expect(parsed.teeth["11"].note).toBe("chipped incisal edge");
    expect(parsed.teeth["11"].customStates).toEqual({ strFlag: "yes", numFlag: 3, boolFlag: true });
  });
});
