// Verifies that importStatus/__importStatusForTest fully replaces the internal
// tooth state with the payload's teeth data — every tooth in ALL_TEETH is
// reset to the payload's value (or defaultState when absent from the payload).
import { describe, it, expect, beforeEach } from "vitest";
import {
  __setToothStateForTest,
  __getToothStateForTest,
  __importStatusForTest,
  __resetChartStateForTest,
  __collectExportPayloadForTest,
  __getStatusStateForTest,
  getOdontogramSummary,
  getStatusChart,
  exportStatus,
} from "../odontogram";

beforeEach(() => {
  __resetChartStateForTest();
});

describe("importStatus replaces internal state", () => {
  it("replaces a tooth that exists in the payload", () => {
    // Pre-seed tooth 11 with a veneer
    __setToothStateForTest(11, { toothSelection: "tooth-base", restorationType: "veneer", toothSubstrate: "crownprep" });
    expect(__getToothStateForTest(11)?.restorationType).toBe("veneer");

    // Import a payload with tooth 11 as a crown
    __importStatusForTest({
      version: "2.19",
      teeth: { 11: { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" } },
    });

    // Must now reflect the imported value
    expect(__getToothStateForTest(11)?.restorationType).toBe("crown");
  });

  it("resets a tooth to defaults when absent from the payload", () => {
    // Pre-seed tooth 12 with non-default values
    __setToothStateForTest(12, { toothSelection: "implant", restorationType: "crown" });
    expect(__getToothStateForTest(12)?.toothSelection).toBe("implant");

    // Import a payload that does NOT contain tooth 12
    __importStatusForTest({
      version: "2.19",
      teeth: { 11: { toothSelection: "tooth-base" } },
    });

    // Tooth 12 must be reset to defaultState (toothSelection = "tooth-base")
    expect(__getToothStateForTest(12)?.toothSelection).toBe("tooth-base");
    expect(__getToothStateForTest(12)?.restorationType).toBe("none");
  });

  it("resets ALL teeth when given an empty teeth object", () => {
    // Pre-seed some teeth
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setToothStateForTest(17, { toothSelection: "none" });
    __setToothStateForTest(38, { toothSelection: "milktooth" });

    __importStatusForTest({ version: "2.19", teeth: {} });

    // Every tooth is back to its default
    expect(__getToothStateForTest(11)?.toothSelection).toBe("tooth-base");
    expect(__getToothStateForTest(17)?.toothSelection).toBe("tooth-base");
    expect(__getToothStateForTest(38)?.toothSelection).toBe("tooth-base");
  });

  it("round-trips: export -> reset -> import -> state matches export", () => {
    // Set up a few teeth with specific state
    __setToothStateForTest(11, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "emax", toothSubstrate: "crownprep", caries: ["caries-occlusal"] });
    __setToothStateForTest(14, { toothSelection: "implant", prosthesis: "locator" });
    __setToothStateForTest(36, { toothSelection: "none" });

    // Export the current state
    const payload = __collectExportPayloadForTest();
    expect(payload.teeth[11].restorationType).toBe("crown");
    expect(payload.teeth[14].prosthesis).toBe("locator");

    // Reset everything
    __resetChartStateForTest();
    expect(__getToothStateForTest(11)).toBeUndefined();

    // Re-import the exact same payload
    __importStatusForTest(payload);

    // Verify all teeth match the exported values
    expect(__getToothStateForTest(11)?.restorationType).toBe("crown");
    expect(__getToothStateForTest(11)?.restorationMaterial).toBe("emax");
    expect(__getToothStateForTest(11)?.caries).toEqual(["caries-occlusal"]);
    expect(__getToothStateForTest(14)?.toothSelection).toBe("implant");
    expect(__getToothStateForTest(14)?.prosthesis).toBe("locator");
    expect(__getToothStateForTest(36)?.toothSelection).toBe("none");
  });

  it("handles payload with string-keyed tooth numbers (as JSON.parse produces)", () => {
    __importStatusForTest({
      version: "2.19",
      teeth: { "21": { toothSelection: "implant" }, "22": { toothSelection: "none" } },
    });

    expect(__getToothStateForTest(21)?.toothSelection).toBe("implant");
    expect(__getToothStateForTest(22)?.toothSelection).toBe("none");
  });

  it("ignores a null/undefined payload (no crash, no state change)", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    __importStatusForTest(null!);
    expect(__getToothStateForTest(11)?.toothSelection).toBe("implant");
    __importStatusForTest(undefined!);
    expect(__getToothStateForTest(11)?.toothSelection).toBe("implant");
  });

  it("importing a payload with only some teeth resets the rest to defaults", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });
    __setToothStateForTest(12, { toothSelection: "none" });
    __setToothStateForTest(13, { toothSelection: "milktooth" });

    __importStatusForTest({
      version: "2.19",
      teeth: { 12: { toothSelection: "implant" } },
    });

    expect(__getToothStateForTest(11)?.toothSelection).toBe("tooth-base"); // reset to default
    expect(__getToothStateForTest(12)?.toothSelection).toBe("implant");    // from payload
    expect(__getToothStateForTest(13)?.toothSelection).toBe("tooth-base"); // reset to default
  });

  it("summary reflects the imported data after __importStatusForTest", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base" });
    __setToothStateForTest(12, { toothSelection: "tooth-base" });
    __setToothStateForTest(13, { toothSelection: "tooth-base" });

    __importStatusForTest({
      version: "2.19",
      teeth: {
        11: { toothSelection: "none" },    // missing
        12: { toothSelection: "implant" }, // implant
        // 13 absent → reset to "tooth-base" (present)
      },
    });

    const summary = getOdontogramSummary();
    expect(summary.missingList).not.toBeNull();
    expect(summary.implants).not.toBeNull();
  });

  it("a payload without a version string is treated as legacy (inferLegacySecondaryCaries=true)", () => {
    // Legacy inference: a surface in BOTH caries AND fillingSurfaceMaterials
    // with no stored severity gets severity 3 (recurrent).
    __importStatusForTest({
      // NO version key → treated as legacy
      teeth: {
        11: {
          toothSelection: "tooth-base",
          caries: ["caries-occlusal"],
          fillingSurfaceMaterials: { occlusal: "amalgam" },
        },
      },
    });

    const s = __getToothStateForTest(11) as Record<string, unknown>;
    expect((s as any).cariesSeverity).toEqual({ occlusal: 3 });
  });

  it("a payload with version >=2.3 is treated as modern (no legacy inference)", () => {
    __importStatusForTest({
      version: "2.19",
      teeth: {
        11: {
          toothSelection: "tooth-base",
          caries: ["caries-occlusal"],
          fillingSurfaceMaterials: { occlusal: "amalgam" },
        },
      },
    });

    const s = __getToothStateForTest(11) as Record<string, unknown>;
    // No stored severity → no inference in modern payload
    expect((s as any).cariesSeverity).toEqual({});
  });
});

describe("importStatus payload shape pitfalls", () => {
  it("a flat tooth object (no `teeth` wrapper) produces defaults everywhere", () => {
    // COMMON MISTAKE: passing the tooth record directly without the
    // { version, teeth } envelope. This results in ALL teeth getting
    // defaultState because data.teeth is undefined.
    __importStatusForTest({
      toothSelection: "implant",
      restorationType: "crown",
    } as any);

    // Every tooth should be default (tooth-base, not implant)
    expect(__getToothStateForTest(11)?.toothSelection).toBe("tooth-base");
    expect(__getToothStateForTest(11)?.restorationType).toBe("none");
  });

  it("a plain object without version still works but treats legacy data as legacy", () => {
    // Valid payload shape but missing version — treated as legacy
    __importStatusForTest({
      teeth: {
        11: { toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "crownprep" },
      },
    });

    expect(__getToothStateForTest(11)?.restorationType).toBe("crown");
    expect(__getToothStateForTest(12)?.toothSelection).toBe("tooth-base");
  });
});

describe("getStatusChart / exportStatus / importStatus compatibility", () => {
  it("getStatusChart() returns a payload that __importStatusForTest can consume (roundtrip)", () => {
    // Set up specific state
    __setToothStateForTest(11, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon", toothSubstrate: "crownprep" });
    __setToothStateForTest(14, { toothSelection: "implant", prosthesis: "healing-abutment" });
    __setToothStateForTest(15, { toothSelection: "none" });
    __setToothStateForTest(36, { toothSelection: "tooth-base", caries: ["caries-occlusal", "caries-mesial"], fillingSurfaceMaterials: { occlusal: "amalgam" } });

    // Capture via getStatusChart (same output as exportStatus, but as object)
    const payload = getStatusChart();

    // Verify the payload has the expected shape
    expect(payload).toHaveProperty("version");
    expect(payload).toHaveProperty("teeth");
    expect(typeof payload.version).toBe("string");
    expect(typeof payload.teeth).toBe("object");
    expect(payload.teeth[11]).toBeDefined();

    // Reset state completely
    __resetChartStateForTest();

    // Re-import via the same __importStatusForTest path importStatus uses (data only)
    __importStatusForTest(payload);

    // All teeth must now match the original state
    expect(__getToothStateForTest(11)?.restorationType).toBe("crown");
    expect(__getToothStateForTest(11)?.restorationMaterial).toBe("zircon");
    expect(__getToothStateForTest(14)?.toothSelection).toBe("implant");
    expect(__getToothStateForTest(14)?.prosthesis).toBe("healing-abutment");
    expect(__getToothStateForTest(15)?.toothSelection).toBe("none");
    const s36 = __getToothStateForTest(36) as any;
    expect(s36?.caries).toEqual(["caries-occlusal", "caries-mesial"]);
  });

  it("getStatusChart() and __collectExportPayloadForTest() return the same thing", () => {
    __setToothStateForTest(11, { toothSelection: "implant" });

    const fromGet = getStatusChart();
    const fromCollect = __collectExportPayloadForTest();

    expect(fromGet).toEqual(fromCollect);
  });

  it("the real importStatus function (with DOM guard) would accept the same payload shape", () => {
    // Proving the payload shape is accepted by checking that
    // hydrateImportedCharts (called by importStatus) processes it correctly
    // via the test seam __importStatusForTest.
    const payload = {
      version: "2.19",
      teeth: {
        11: { toothSelection: "implant" },
      },
    };

    __importStatusForTest(payload);
    expect(__getToothStateForTest(11)?.toothSelection).toBe("implant");
  });
});
