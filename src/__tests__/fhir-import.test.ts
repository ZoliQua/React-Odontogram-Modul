import { describe, it, expect } from "vitest";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";

describe("parseFhirBundle (FHIR import)", () => {
  it("round-trips meaningful per-tooth fields from a self-produced bundle", () => {
    const payload = {
      version: "1.4",
      globals: { edentulous: false, wisdomVisible: true, showBase: false, occlusalVisible: false, showHealthyPulp: false },
      teeth: {
        "11": { toothSelection: "implant", crownMaterial: "zircon" },
        "21": { caries: ["caries-mesial", "caries-occlusal"], note: "watch" },
        "36": { fillingSurfaceMaterials: { buccal: "amalgam", distal: "composite" } },
        "46": { mobility: "m2", extractionPlan: true },
        "16": { mods: ["inflammation"], periapicalType: "cyst" },
      },
    };
    const bundle = buildFhirBundle(payload as never);
    const out = parseFhirBundle(bundle);
    expect(out.teeth["11"].toothSelection).toBe("implant");
    expect(out.teeth["11"].crownMaterial).toBe("zircon");
    expect((out.teeth["21"].caries ?? []).sort()).toEqual(["caries-mesial", "caries-occlusal"]);
    expect(out.teeth["21"].note).toBe("watch");
    expect(out.teeth["36"].fillingSurfaceMaterials).toEqual({ buccal: "amalgam", distal: "composite" });
    expect(out.teeth["46"].mobility).toBe("m2");
    expect(out.teeth["46"].extractionPlan).toBe(true);
    expect(out.teeth["16"].periapicalType).toBe("cyst");
  });

  it("reads chart-level edentulous", () => {
    const bundle = buildFhirBundle({ version: "1.4", globals: { edentulous: true }, teeth: {} } as never);
    expect(parseFhirBundle(bundle).globals?.edentulous).toBe(true);
  });

  it("never throws on malformed/foreign input", () => {
    expect(() => parseFhirBundle(null as never)).not.toThrow();
    expect(() => parseFhirBundle({ resourceType: "Bundle" } as never)).not.toThrow();
    expect(parseFhirBundle({ resourceType: "Bundle", entry: "nope" } as never).teeth).toEqual({});
    // foreign bundle with only SNOMED codes → no recognized local findings
    const foreign = { resourceType: "Bundle", type: "collection", entry: [
      { resource: { resourceType: "Observation", status: "final", code: { coding: [{ system: "http://snomed.info/sct", code: "80967001" }] }, bodySite: { coding: [{ system: "urn:iso:std:iso:3950", code: "11" }] } } },
    ]};
    expect(parseFhirBundle(foreign as never).teeth).toEqual({});
  });
});
