// SP5 final-review fixes (data integrity + summary visibility).
//
// FIX 1 — version-gate the legacy secondary-caries inference: a surface with
// BOTH primary caries and a filling used to be re-derived as recurrent caries
// (CARS score 3) on every hydrate. That is correct ONLY for legacy (<2.3)
// payloads; a native ≥2.3 payload stores the score deliberately, so an unscored
// caried+filled surface must stay PRIMARY across export→reimport.
//
// FIX 3 — surface rootCaries + radiographicDepth in getOdontogramSummary so a
// tooth carrying only those findings is not summary-invisible.
//
// Driven through `__setToothStateForTest(tooth, raw, version)`, which invokes
// the exact per-tooth `hydrateState(raw, isLegacyPayloadVersion(version))` call
// that importStatus makes for a whole payload — no live DOM/SVG grid required
// (established seam; see payload-2-3-roundtrip.test.ts).
import { describe, it, expect } from "vitest";
import {
  __setToothStateForTest,
  __getToothStateForTest,
  __collectExportPayloadForTest,
  getOdontogramSummary,
} from "../odontogram";

const secondaryOf = (toothNo: number): Record<string, number> => {
  const s = __getToothStateForTest(toothNo) as { secondaryCaries?: Map<string, number> } | undefined;
  return Object.fromEntries((s?.secondaryCaries as Map<string, number>) ?? new Map());
};

describe("FIX 1: legacy secondary-caries inference is version-gated", () => {
  const cariedAndFilled = {
    toothSelection: "tooth-base",
    caries: ["caries-occlusal"],
    fillingSurfaceMaterials: { occlusal: "amalgam" },
  } as const;

  it("native 2.3 payload: a caried+filled surface with NO stored score stays PRIMARY (secondaryCaries empty)", () => {
    __setToothStateForTest(16, { ...cariedAndFilled }, "2.3");
    expect(secondaryOf(16)).toEqual({});
  });

  it("export(2.3) -> reimport(2.3) is IDEMPOTENT: no recurrent score is injected on the round-trip", () => {
    __setToothStateForTest(16, { ...cariedAndFilled }, "2.3");
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.3");
    const raw16 = payload.teeth[16];
    // Serialized empty map is {} — not a stored recurrent score.
    expect(raw16.secondaryCaries).toEqual({});
    // Re-import the exact exported record (as importStatus would) at 2.3.
    __setToothStateForTest(26, raw16, "2.3");
    expect(secondaryOf(26)).toEqual({});
  });

  it("legacy payloads (1.4, 2.0, 2.2, no-version) DO infer the intersection as recurrent score 3", () => {
    for (const version of ["1.4", "2.0", "2.2", undefined]) {
      __setToothStateForTest(17, { ...cariedAndFilled }, version as string | undefined);
      expect(secondaryOf(17)).toEqual({ occlusal: 3 });
    }
  });

  it("a stored ≥2.3 score always wins and is never overwritten by the (disabled) inference", () => {
    __setToothStateForTest(18, { ...cariedAndFilled, secondaryCaries: { occlusal: 5 } }, "2.3");
    expect(secondaryOf(18)).toEqual({ occlusal: 5 });
  });
});

describe("FIX 3: rootCaries + radiographicDepth appear in the odontogram summary", () => {
  const cariesItems = () =>
    getOdontogramSummary().sections.find((sec) => sec.key === "caries")?.items ?? [];

  it("a rootCaries-only tooth produces a caries summary line", () => {
    // Clear the other slots this suite touched so they don't pollute the summary.
    for (const n of [16, 17, 18, 26]) __setToothStateForTest(n, { toothSelection: "tooth-base" }, "2.3");
    __setToothStateForTest(15, { toothSelection: "tooth-base", rootCaries: "active" }, "2.3");
    expect(cariesItems().some((line) => line.includes("15"))).toBe(true);
  });

  it("a radiographicDepth-only surface produces a caries summary line", () => {
    __setToothStateForTest(14, { toothSelection: "tooth-base", radiographicDepth: { mesial: "D2" } }, "2.3");
    expect(cariesItems().some((line) => line.includes("14"))).toBe(true);
  });
});
