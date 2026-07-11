// SP5 Task 7: payload version 2.3 — the version literal bump itself (Tasks
// 1/3/4 already wired the field-level serialization/FHIR for `rootCaries`/
// `secondaryCaries`/`radiographicDepth`; this task only bumps the version tag
// and closes the loop with an explicit round-trip proof at 2.3).
//
// `importStatus`/`hydrateState` are field-presence-driven and NEVER branch on
// `payload.version` (grepped odontogram.ts: no `raw.version`/`data.version`/
// `payload.version` read anywhere) — the version tag is purely informational.
// This is exercised directly below via `__setToothStateForTest`, which invokes
// the exact same per-tooth `hydrateState(raw)` call `importStatus` makes,
// without requiring a live DOM/SVG grid (established pattern — see
// radiographic-depth-badge.test.ts / secondary-caries-parity.test.ts).
import { describe, it, expect } from "vitest";
import { __setToothStateForTest, __getToothStateForTest, __collectExportPayloadForTest } from "../odontogram";
import { buildFhirBundle } from "../fhir/toFhir";
import { parseFhirBundle } from "../fhir/fromFhir";

type Any = {
  rootCaries: string;
  secondaryCaries: Map<string, number>;
  radiographicDepth: Map<string, string>;
};

describe("SP5 Task 7: payload version 2.3", () => {
  it("collectExportPayload emits version 2.3", () => {
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.3");
  });

  it("parseFhirBundle (fromFhir) emits version 2.3, independent of the input payload's own version tag", () => {
    const bundle = buildFhirBundle({ version: "1.4", teeth: {} } as never);
    const out = parseFhirBundle(bundle);
    expect(out.version).toBe("2.3");
  });

  it("rootCaries/secondaryCaries/radiographicDepth survive a JSON export(2.3) -> import round-trip", () => {
    __setToothStateForTest(17, {
      toothSelection: "tooth-base",
      caries: ["caries-mesial", "caries-occlusal"],
      rootCaries: "active-cavitated",
      secondaryCaries: { mesial: 5, occlusal: 2 },
      radiographicDepth: { mesial: "D2", occlusal: "E1" },
    });
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.3");
    const raw17 = payload.teeth[17];
    expect(raw17.rootCaries).toBe("active-cavitated");
    expect(raw17.secondaryCaries).toEqual({ mesial: 5, occlusal: 2 });
    expect(raw17.radiographicDepth).toEqual({ mesial: "D2", occlusal: "E1" });

    // Re-hydrate the exported raw tooth record (as importStatus would for
    // every tooth) into a different slot and confirm lossless round-trip.
    __setToothStateForTest(27, raw17);
    const s = __getToothStateForTest(27) as unknown as Any;
    expect(s.rootCaries).toBe("active-cavitated");
    expect(Object.fromEntries(s.secondaryCaries)).toEqual({ mesial: 5, occlusal: 2 });
    expect(Object.fromEntries(s.radiographicDepth)).toEqual({ mesial: "D2", occlusal: "E1" });
  });

  it("rootCaries/secondaryCaries/radiographicDepth survive a full FHIR export(2.3) -> import round-trip", () => {
    const payload = {
      version: "2.3",
      teeth: {
        "36": {
          toothSelection: "tooth-base",
          rootCaries: "arrested",
          secondaryCaries: { buccal: 6, lingual: 1 },
          radiographicDepth: { buccal: "D3", lingual: "E2" },
        },
      },
    };
    const bundle = buildFhirBundle(payload as never);
    const out = parseFhirBundle(bundle);
    expect(out.version).toBe("2.3");
    expect(out.teeth["36"].rootCaries).toBe("arrested");
    expect(out.teeth["36"].secondaryCaries).toEqual({ buccal: 6, lingual: 1 });
    expect(out.teeth["36"].radiographicDepth).toEqual({ buccal: "D3", lingual: "E2" });
  });

  it("importer is field-presence-driven, not version-gated: 1.4/2.0/2.1/2.2/2.3-tagged payloads all hydrate the 3 new fields identically", () => {
    for (const version of ["1.4", "2.0", "2.1", "2.2", "2.3"]) {
      __setToothStateForTest(15, {
        version, // a per-tooth raw record never carries/needs this; included only to prove it's harmless if present
        toothSelection: "tooth-base",
        rootCaries: "active",
        secondaryCaries: { distal: 4 },
        radiographicDepth: { distal: "D1" },
      } as never);
      const s = __getToothStateForTest(15) as unknown as Any;
      expect(s.rootCaries).toBe("active");
      expect(Object.fromEntries(s.secondaryCaries)).toEqual({ distal: 4 });
      expect(Object.fromEntries(s.radiographicDepth)).toEqual({ distal: "D1" });
    }
  });
});
