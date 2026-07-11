// SP7 Task 5: merge the "Root" (#endoSection) and "Periodontium and
// inflammations" (#inflammationSection) cards into one #rootPeriodontiumSection
// card with two labeled blocks (#rpRootBlock / #rpPerioBlock), relocate the
// lesion-subtype row (#periapicalTypeRow) under the apical diagnosis row, and
// retire the periapical-inflammation checkbox as an authoring control for a
// PRESENT tooth (apicalDx drives the glyph there instead).
//
// Like App.test.tsx, the JSX-structure assertions render <App/> with
// odontogram.ts mocked out (it manipulates real DOM/SVGs and isn't needed to
// check markup). The visibility-toggle behavior (test 4) exercises the real,
// exported `__syncInflammationModVisibilityForTest` helper against a
// hand-built #modsChecks DOM fragment — mirroring the
// __syncSurfaceDepthIndicatorForTest / sp7-pulp-endo-select.test.ts pattern,
// since no full-DOM initOdontogram() harness exists for the tooth panel.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";
import { __syncInflammationModVisibilityForTest } from "../odontogram";

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
    // Real export under test — not part of the imperative DOM/SVG wiring.
    __syncInflammationModVisibilityForTest: actual.__syncInflammationModVisibilityForTest,
  };
});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.documentElement.classList.remove("dark");
});

describe("SP7 Task 5: Root and Periodontium merged card", () => {
  it("has one #rootPeriodontiumSection and neither old section", () => {
    render(createElement(App));
    expect(document.querySelector("#rootPeriodontiumSection")).toBeTruthy();
    expect(document.querySelector("#endoSection")).toBeNull();
    expect(document.querySelector("#inflammationSection")).toBeNull();
  });

  it("periapicalTypeRow lives under apicalDxRow in the root block", () => {
    render(createElement(App));
    const root = document.querySelector("#rpRootBlock")!;
    expect(root).toBeTruthy();
    expect(root.querySelector("#apicalDxRow")).toBeTruthy();
    expect(root.querySelector("#periapicalTypeRow")).toBeTruthy();
    // #pulpEndoSelect (Task 4's merged selector) lives in the root block too —
    // the old two-select endoSection layout is gone.
    expect(root.querySelector("#pulpEndoSelect")).toBeTruthy();
  });

  it("mobility + calculus + mods live in the perio block", () => {
    render(createElement(App));
    const perio = document.querySelector("#rpPerioBlock")!;
    expect(perio).toBeTruthy();
    expect(perio.querySelector("#mobilityRow")).toBeTruthy();
    expect(perio.querySelector("#calculusRow")).toBeTruthy();
    expect(perio.querySelector("#modsChecks")).toBeTruthy();
  });

  it("has one collapse button wired to the merged card", () => {
    render(createElement(App));
    expect(document.querySelector("#btnToggleRootPeriodontiumCard")).toBeTruthy();
    expect(document.querySelector("#btnToggleEndoCard")).toBeNull();
    expect(document.querySelector("#btnToggleInflammationCard")).toBeNull();
  });

  it("hides the inflammation mod checkbox's row for a present tooth, shows it for an implant", () => {
    // Mirrors the DOM shape buildChecks() produces for #modsChecks: a <label>
    // wrapping the checkbox input and its text span.
    document.body.innerHTML = "";
    const container = document.createElement("div");
    container.id = "modsChecks";
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = "inflammation";
    const span = document.createElement("span");
    span.textContent = "Inflammation";
    label.appendChild(input);
    label.appendChild(span);
    container.appendChild(label);
    document.body.appendChild(container);

    __syncInflammationModVisibilityForTest(container, "tooth-base");
    expect(label.classList.contains("hidden")).toBe(true);

    __syncInflammationModVisibilityForTest(container, "implant");
    expect(label.classList.contains("hidden")).toBe(false);

    __syncInflammationModVisibilityForTest(container, "none");
    expect(label.classList.contains("hidden")).toBe(false);
  });
});
