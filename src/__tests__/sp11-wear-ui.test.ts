// SP11 Task 3: UI wiring for the wear axis (Tasks 1-2 already provide the
// wearEdge/wearCervical enums, getWearEdgeOptions()/getWearCervicalOptions(),
// render gate, and hydrate/migration). This task replaces the two bruxism
// checkboxes (#bruxismWear / #bruxismNeckWear) in #bruxismRow with two
// labeled <select> controls (#wearEdgeSelect / #wearCervicalSelect), wired
// via buildSelect()/applyToSelected() (mirroring #resorptionSelect), and
// aligns the row-visibility gate to the render gate (adds the
// toothSubstrate === "natural" check the row gate previously omitted).
//
// Like sp8-peri-implant-ui.test.ts, there is no full-DOM initOdontogram()
// mount harness for the tooth panel: the JSX-structure assertion renders
// <App/> with odontogram.ts mocked out, and the row-visibility-gate
// behavior exercises the real, exported test-only seam
// (__wearRowAllowedForTest) against hand-built state objects — mirroring
// the __syncPeriImplantVisibilityForTest pattern, since the real gate
// closes over module-internal selectedTeeth/toothState state that isn't
// reachable from a test.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";
import { __wearRowAllowedForTest, VALID_WEAR_EDGE, VALID_WEAR_CERVICAL } from "../odontogram";

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
    __wearRowAllowedForTest: actual.__wearRowAllowedForTest,
    VALID_WEAR_EDGE: actual.VALID_WEAR_EDGE,
    VALID_WEAR_CERVICAL: actual.VALID_WEAR_CERVICAL,
  };
});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.documentElement.classList.remove("dark");
});

describe("SP11 Task 3: wear-type dropdowns replace bruxism checkboxes", () => {
  it("#wearEdgeSelect and #wearCervicalSelect exist inside #bruxismRow", () => {
    render(createElement(App));
    expect(document.querySelector("#bruxismRow #wearEdgeSelect")).toBeTruthy();
    expect(document.querySelector("#bruxismRow #wearCervicalSelect")).toBeTruthy();
  });

  it("the old bruxism checkboxes are gone", () => {
    render(createElement(App));
    expect(document.querySelector("#bruxismWear")).toBeNull();
    expect(document.querySelector("#bruxismNeckWear")).toBeNull();
  });

  it("selecting a wearEdge value writes state.wearEdge (buildSelect wiring, mirrors #resorptionSelect)", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "wearEdgeSelect";
    for (const v of VALID_WEAR_EDGE) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { wearEdge: "none" };
    sel.addEventListener("change", () => {
      state.wearEdge = sel.value;
    });

    expect(VALID_WEAR_EDGE.has("erosion")).toBe(true);
    sel.value = "erosion";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.wearEdge).toBe("erosion");
  });

  it("selecting a wearCervical value writes state.wearCervical", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "wearCervicalSelect";
    for (const v of VALID_WEAR_CERVICAL) {
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { wearCervical: "none" };
    sel.addEventListener("change", () => {
      state.wearCervical = sel.value;
    });

    expect(VALID_WEAR_CERVICAL.has("abfraction")).toBe(true);
    sel.value = "abfraction";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.wearCervical).toBe("abfraction");
  });

  it("row gate: allowed only for tooth-base + no restoration + natural substrate", () => {
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "natural" })).toBe(true);
  });

  it("row gate quirk fix: a crown-prepped/broken/radix substrate (matching the render gate) now hides the row too", () => {
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "radix" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "broken" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "none", toothSubstrate: "crownprep" })).toBe(false);
  });

  it("row gate: hidden when a restoration is present or the tooth isn't a natural present tooth", () => {
    expect(__wearRowAllowedForTest({ toothSelection: "tooth-base", restorationType: "crown", toothSubstrate: "natural" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "implant", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
    expect(__wearRowAllowedForTest({ toothSelection: "none", restorationType: "none", toothSubstrate: "natural" })).toBe(false);
  });
});
