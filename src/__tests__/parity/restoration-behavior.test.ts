// SP3a Task 4: explicit new-behavior / migration assertions for the crown-material
// -> toothSubstrate + restorationType x restorationMaterial swap (Task 3, commit
// 202af19). Parity goldens (svg-fingerprints.json / fhir-golden.json /
// roundtrip-golden.json) already cover this broadly via the matrix; these tests
// pin down the specific, human-readable behaviors called out in the Task 4 brief
// using the real hydrate (via __renderActiveLayers, the only exported seam that
// runs hydrateState) and FHIR-export entry points (same as render-seam.test.ts /
// fhir.test.ts).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { __renderActiveLayers, __setToothStateForTest, __getToothStateForTest } from "../../odontogram";
import { buildFhirBundle } from "../../fhir/toFhir";

// Node's own URL (not jsdom's) so this resolves relative to this file on disk
// regardless of test environment — same workaround as render-seam.test.ts.
function svgText(name: string): string {
  return readFileSync(fileURLToPath(new NodeURL(`../../assets/teeth-svgs/${name}.svg`, import.meta.url)), "utf8");
}

function findCoding(bundle: ReturnType<typeof buildFhirBundle>, code: string) {
  return bundle.entry
    ?.map((e) => e.resource)
    .find((r: any) => r?.code?.coding?.[0]?.code === code);
}

describe("restoration behavior: legacy migration (crownMaterial/bridgeUnit -> new axes)", () => {
  it("a 1.4 crownMaterial:'metal' state hydrates to restorationMaterial:'metal-ceramic' (deliberate PFM rename)", () => {
    const ids = __renderActiveLayers(svgText("11"), 11, { toothSelection: "tooth-base", crownMaterial: "metal" }).map((l) => l.id);
    // metal-ceramic wrapper group + crown layer active — proves restorationMaterial
    // resolved to "metal-ceramic", not the legacy "metal" id.
    expect(ids).toContain("metal-ceramic");
    expect(ids).toContain("metal-ceramic-crown");
    expect(ids).not.toContain("metal");
    expect(ids).not.toContain("metal-crown");
  });

  it("a bridgeUnit:'zircon' state hydrates to restorationType:'bridge', restorationMaterial:'zircon'", () => {
    const ids = __renderActiveLayers(svgText("11"), 11, { toothSelection: "tooth-base", bridgeUnit: "zircon" }).map((l) => l.id);
    // zircon wrapper group + bridge-connector layer active — proves restorationType
    // resolved to "bridge" and restorationMaterial to "zircon" (not left on bridgeUnit).
    expect(ids).toContain("zircon");
    expect(ids).toContain("zircon-bridge-connector");
  });

  it("a crownMaterial:'radix' state hydrates to toothSubstrate:'radix'", () => {
    const ids = __renderActiveLayers(svgText("11"), 11, { toothSelection: "tooth-base", crownMaterial: "radix" }).map((l) => l.id);
    expect(ids).toContain("tooth-radix");
    expect(ids).not.toContain("tooth-base");
  });

  // SP3a final review: implant fixed crowns are DEFERRED to SP3b with zero
  // regression. A legacy implant carrying a fixed crown must NOT migrate to
  // restorationType:"crown" — that would VANISH on sync (which force-resets
  // implants to restorationType:"none"). Instead it stays on the legacy
  // `crownMaterial` path and renders the pre-SP3a connector + crown layers.
  it("a 1.4 implant with crownMaterial:'zircon' KEEPS the legacy crown on migrate (restorationType stays 'none')", () => {
    __setToothStateForTest(14, { toothSelection: "implant", crownMaterial: "zircon" });
    const s = __getToothStateForTest(14)!;
    expect(s.toothSelection).toBe("implant");
    expect(s.crownMaterial).toBe("zircon"); // NOT reset to "natural"
    expect(s.restorationType).toBe("none"); // NOT folded into "crown"
    expect(s.restorationMaterial).toBe("none");
  });

  it("a 1.4 implant with crownMaterial:'zircon' renders BOTH implant-connector AND the zircon crown layers", () => {
    const ids = __renderActiveLayers(svgText("14"), 14, { toothSelection: "implant", crownMaterial: "zircon" }).map((l) => l.id);
    // Restored a549534 render: connector + zircon wrapper group + zircon crown.
    expect(ids).toContain("implant-connector");
    expect(ids).toContain("zircon");
    expect(ids).toContain("zircon-crown");
    // The crown must NOT flow through the new restoration composition.
    expect(ids).not.toContain("metal-ceramic");
  });
});

describe("restoration behavior: new-model axes authored directly", () => {
  it("a gold-inlay state renders the gold-inlay layer", () => {
    const ids = __renderActiveLayers(svgText("11"), 11, {
      toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "inlay", restorationMaterial: "gold",
    }).map((l) => l.id);
    expect(ids).toContain("gold"); // wrapper <g>
    expect(ids).toContain("gold-inlay"); // composed child layer
    expect(ids).not.toContain("gold-crown");
  });

  it("an emax crown FHIR-exports a restoration-type + restoration-material coding", () => {
    const bundle = buildFhirBundle({
      version: "2.0",
      teeth: { "11": { toothSelection: "tooth-base", toothSubstrate: "crownprep", restorationType: "crown", restorationMaterial: "emax" } },
    });
    const typeObs = findCoding(bundle, "restoration-type");
    const materialObs = findCoding(bundle, "restoration-material");
    expect((typeObs as any)?.valueCodeableConcept?.coding?.[0]?.code).toBe("crown");
    expect((materialObs as any)?.valueCodeableConcept?.coding?.[0]?.code).toBe("emax");
  });
});
