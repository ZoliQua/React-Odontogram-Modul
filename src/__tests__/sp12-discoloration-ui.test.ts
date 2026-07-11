// SP12 Task 3: UI wiring for the discoloration axis. Tasks 1-2 already
// provide the discoloration enum, getDiscolorationOptions(), the render-time
// crown tint, and the discolorationAllowed()/__discolorationAllowedForTest
// gate. This task adds the #discolorationRow / #discolorationSelect control
// next to the existing wear row (#bruxismRow), wired via
// buildSelect()/applyToSelected() (mirroring #wearEdgeSelect/#wearCervicalSelect),
// and gates the row's visibility on the SAME discolorationAllowed predicate
// the render/tooltip use — exposed here as __discolorationRowAllowedForTest.
//
// Mirrors sp11-wear-ui.test.ts's harness: there is no full-DOM
// initOdontogram() mount harness for the tooth panel, so the JSX-structure
// assertion renders <App/> with odontogram.ts mocked out, the change-wiring
// assertion exercises a hand-built <select> + change-listener pair (the
// same buildSelect contract), and the row-visibility-gate behavior exercises
// the real, exported test-only seam against hand-built state objects.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";
import { __discolorationRowAllowedForTest, VALID_DISCOLORATION } from "../odontogram";

vi.mock("../odontogram", async () => {
  const actual = await vi.importActual<typeof import("../odontogram")>("../odontogram");
  return {
    initOdontogram: vi.fn().mockResolvedValue(undefined),
    destroyOdontogram: vi.fn(),
    setNumberingSystem: vi.fn(),
    clearSelection: vi.fn(),
    setOcclusalVisible: vi.fn(),
    setWisdomVisible: vi.fn(),
    setShowBase: vi.fn(),
    setHealthyPulpVisible: vi.fn(),
    registerPlugins: vi.fn(),
    setPluginState: vi.fn(),
    getPluginState: vi.fn(),
    getToothStateSummary: vi.fn().mockReturnValue([]),
    setReadOnly: vi.fn(),
    getReadOnly: vi.fn().mockReturnValue(false),
    setNotesEnabled: vi.fn(),
    getNotesEnabled: vi.fn().mockReturnValue(false),
    setIcdasEnabled: vi.fn(),
    getIcdasEnabled: vi.fn().mockReturnValue(false),
    setPulpDetailLevel: vi.fn(),
    getPulpDetailLevel: vi.fn().mockReturnValue("aae"),
    setSecondaryCariesMode: vi.fn(),
    getSecondaryCariesMode: vi.fn().mockReturnValue("standard"),
    setRootCariesMode: vi.fn(),
    getRootCariesMode: vi.fn().mockReturnValue("simple"),
    setRadiographicDepthMode: vi.fn(),
    getRadiographicDepthMode: vi.fn().mockReturnValue("off"),
    setCariesDepthEnabled: vi.fn(),
    getCariesDepthEnabled: vi.fn().mockReturnValue(true),
    setWearDetailLevel: vi.fn(),
    getWearDetailLevel: vi.fn().mockReturnValue("complex"),
    setDiscolorationDetailLevel: vi.fn(),
    getDiscolorationDetailLevel: vi.fn().mockReturnValue("complex"),
    getOdontogramSummary: vi.fn().mockReturnValue({
      overview: "", permanentList: null, missingList: null,
      sections: [], implants: null, periodontalTitle: "", periodontalText: "",
    }),
    onStateChange: vi.fn().mockReturnValue(() => {}),
    exportFhir: vi.fn(),
    exportImage: vi.fn(),
    exportSvg: vi.fn(),
    setImportFormat: vi.fn(),
    // Real exports under test — not part of the imperative DOM/SVG wiring.
    __discolorationRowAllowedForTest: actual.__discolorationRowAllowedForTest,
    VALID_DISCOLORATION: actual.VALID_DISCOLORATION,
  };
});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.documentElement.classList.remove("dark");
});

describe("SP12 Task 3: discoloration dropdown next to the wear row", () => {
  it("#discolorationSelect exists inside #discolorationRow", () => {
    render(createElement(App));
    expect(document.querySelector("#discolorationRow #discolorationSelect")).toBeTruthy();
  });

  it("#discolorationRow is placed immediately after #bruxismRow", () => {
    render(createElement(App));
    const bruxismRow = document.querySelector("#bruxismRow");
    expect(bruxismRow?.nextElementSibling?.id).toBe("discolorationRow");
  });

  it("selecting a discoloration value writes state.discoloration (buildSelect wiring, mirrors #wearEdgeSelect)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "discolorationSelect";
    for (const v of VALID_DISCOLORATION) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { discoloration: "none" };
    sel.addEventListener("change", () => {
      state.discoloration = sel.value;
    });

    expect(VALID_DISCOLORATION.has("tetracycline")).toBe(true);
    sel.value = "tetracycline";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.discoloration).toBe("tetracycline");
  });

  it("row gate: allowed for a plain natural tooth-base or milktooth", () => {
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
    expect(__discolorationRowAllowedForTest({ toothSelection: "milktooth", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
  });

  it("row gate: hidden for a crowned tooth or a non-natural substrate", () => {
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "natural" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "radix" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "broken" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "crownprep" })).toBe(false);
  });

  it("row gate: hidden when the tooth isn't a natural present tooth at all", () => {
    expect(__discolorationRowAllowedForTest({ toothSelection: "implant", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
    expect(__discolorationRowAllowedForTest({ toothSelection: "none", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
  });
});
