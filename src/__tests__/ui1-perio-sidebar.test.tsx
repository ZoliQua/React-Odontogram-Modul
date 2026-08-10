// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-1 Task 1: extract `PerioSidebar` out of `PerioChart.tsx` (the whole-mouth
// summary bar + "Páciens adatok" case-metadata form + 2017 classification
// block) into its own standalone, separately-mountable component, and
// view-gate `<App/>`'s shared right `<aside className="panel">` so it shows
// `<PerioSidebar/>` in the perio (Dental Chart, toggle-mode) view instead of
// the odontogram controls, and the odontogram controls everywhere else. Pure
// UI relocation — no data/derivation/FHIR change.
//
// Part (a) renders `<PerioSidebar/>` directly (no <App/> mount needed — same
// precedent as perio-p2-grid.test.ts renders <PerioChart/> directly: nothing
// PerioSidebar needs requires a live initOdontogram()/SVG-grid mount).
// Part (b) mounts <App/> with the same comprehensive partial-mock harness the
// existing p4a-case-panel.test.ts / p4b-classification-ui.test.ts use, to
// prove the view-gate itself.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import PerioSidebar from "../PerioSidebar";
import App from "../App";
import {
  __resetChartStateForTest,
  setNumberingSystem,
  getCaseMeta,
  resetCaseMeta,
  getPerioClassification,
  closePerioOverlay,
  setPerioViewMode,
} from "../odontogram";

function renderSidebar() {
  return render(createElement(PerioSidebar));
}

beforeEach(() => {
  cleanup();
  document.body.innerHTML = "";
  __resetChartStateForTest();
  setNumberingSystem("FDI");
  resetCaseMeta();
});

describe("UI-1 Task 1: <PerioSidebar/> renders standalone", () => {
  it("renders the whole-mouth summary bar items", () => {
    renderSidebar();
    expect(document.getElementById("perio-fg-summary-avgpd")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-avgcal")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-bop")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-charted")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-cal")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-maxpd")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-maxfurc")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-plaque")).toBeTruthy();
  });

  it("renders the Páciens adatok (case-metadata) controls", () => {
    renderSidebar();
    expect(document.getElementById("caseMetaPanel")).toBeTruthy();
    expect(document.getElementById("caseMetaAge")).toBeTruthy();
    expect(document.getElementById("caseMetaSmoking")).toBeTruthy();
    expect(document.getElementById("caseMetaCigarettesPerDay")).toBeTruthy();
    expect(document.getElementById("caseMetaDiabetes")).toBeTruthy();
    expect(document.getElementById("caseMetaHba1c")).toBeTruthy();
    expect(document.getElementById("caseMetaRbl")).toBeTruthy();
    expect(document.getElementById("caseMetaToothLoss")).toBeTruthy();
  });

  it("renders the 2017 classification axes", () => {
    renderSidebar();
    expect(document.getElementById("perioClassDiagnosisDerived")).toBeTruthy();
    expect(document.getElementById("perioClassDiagnosisOverride")).toBeTruthy();
    expect(document.getElementById("perioClassStageDerived")).toBeTruthy();
    expect(document.getElementById("perioClassStageOverride")).toBeTruthy();
    expect(document.getElementById("perioClassGradeDerived")).toBeTruthy();
    expect(document.getElementById("perioClassGradeOverride")).toBeTruthy();
    expect(document.getElementById("perioClassExtentDerived")).toBeTruthy();
    expect(document.getElementById("perioClassExtentOverride")).toBeTruthy();
  });
});

describe("UI-1 Task 1: <PerioSidebar/> controls still call their setters", () => {
  it("age input calls setCaseAge", () => {
    renderSidebar();
    const input = document.getElementById("caseMetaAge") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "61" } });
    expect(getCaseMeta().age).toBe(61);
  });

  it("smoking select calls setSmokingStatus", () => {
    renderSidebar();
    const select = document.getElementById("caseMetaSmoking") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "current" } });
    expect(getCaseMeta().smokingStatus).toBe("current");
  });

  it("diagnosis override select calls setDiagnosisOverride", () => {
    renderSidebar();
    const select = document.getElementById("perioClassDiagnosisOverride") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "periodontitis" } });
    expect(getPerioClassification().diagnosis).toBe("periodontitis");
    expect(getPerioClassification().overridden.diagnosis).toBe(true);
  });

  it("stage override select calls setStageOverride", () => {
    renderSidebar();
    const select = document.getElementById("perioClassStageOverride") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "III" } });
    expect(getPerioClassification().stage).toBe("III");
    expect(getPerioClassification().overridden.stage).toBe(true);
  });
});

// --- Part (b): App-level view-gate --------------------------------------

vi.mock("../odontogram", async () => {
  const actual = await vi.importActual<typeof import("../odontogram")>("../odontogram");
  return {
    initOdontogram: vi.fn().mockImplementation(() => {
      const grid = document.getElementById("toothGrid");
      if (grid && !grid.querySelector("[data-fake-tooth-svg]")) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("data-fake-tooth-svg", "11");
        grid.appendChild(svg);
      }
      return Promise.resolve(undefined);
    }),
    destroyOdontogram: vi.fn(),
    // Real (not a bare vi.fn()) — this single file's hoisted vi.mock applies
    // to BOTH the direct <PerioSidebar/> renders (part a, which need real
    // numbering/reset behavior) and the <App/> mount (part b, which doesn't
    // care either way).
    setNumberingSystem: actual.setNumberingSystem,
    __resetChartStateForTest: actual.__resetChartStateForTest,
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
    setSurfaceNotation: vi.fn(),
    getSurfaceNotation: vi.fn().mockReturnValue("full"),
    hasAnyPerioData: vi.fn().mockReturnValue(false),
    setPatientName: actual.setPatientName,
    setExamDate: actual.setExamDate,
    exportPdf: vi.fn().mockResolvedValue(undefined),
    getOdontogramSummary: vi.fn().mockReturnValue({
      overview: "", permanentList: null, missingList: null,
      sections: [], implants: null, toothTable: { columns: [], rows: [], legend: "" }, periodontalHasFindings: false, periodontalTitle: "", periodontalText: "",
    }),
    exportFhir: vi.fn(),
    exportImage: vi.fn(),
    exportSvg: vi.fn(),
    setImportFormat: vi.fn(),
    onStateChange: actual.onStateChange,
    openPerioOverlay: actual.openPerioOverlay,
    closePerioOverlay: actual.closePerioOverlay,
    isPerioOverlayOpen: actual.isPerioOverlayOpen,
    getPerioViewMode: actual.getPerioViewMode,
    setPerioViewMode: actual.setPerioViewMode,
    getPerioRowVisibility: actual.getPerioRowVisibility,
    setPerioRowVisibility: actual.setPerioRowVisibility,
    getPerioIndexNameMode: actual.getPerioIndexNameMode,
    setPerioIndexNameMode: actual.setPerioIndexNameMode,
    getPdfSettings: actual.getPdfSettings,
    setPdfSettings: actual.setPdfSettings,
    getPerioOverlayLayer: actual.getPerioOverlayLayer,
    setPerioOverlayLayer: actual.setPerioOverlayLayer,
    isDualStateConfirmPending: actual.isDualStateConfirmPending,
    acceptDualStateConfirm: actual.acceptDualStateConfirm,
    cancelDualStateConfirm: actual.cancelDualStateConfirm,
    PERIO_SITES: actual.PERIO_SITES,
    isUpperTooth: actual.isUpperTooth,
    formatToothLabel: actual.formatToothLabel,
    getPerioChart: actual.getPerioChart,
    getToothPerio: actual.getToothPerio,
    getToothCal: actual.getToothCal,
    getPerioSummary: actual.getPerioSummary,
    setPerioSite: actual.setPerioSite,
    getToothMobility: actual.getToothMobility,
    setToothMobility: actual.setToothMobility,
    furcationEntrances: actual.furcationEntrances,
    getToothFurcation: actual.getToothFurcation,
    setFurcation: actual.setFurcation,
    getToothPlaque: actual.getToothPlaque,
    setPlaque: actual.setPlaque,
    isPerioRowHidden: actual.isPerioRowHidden,
    getToothRecessionType: actual.getToothRecessionType,
    getCejVisibility: actual.getCejVisibility,
    setCejVisibility: actual.setCejVisibility,
    getRootConcavity: actual.getRootConcavity,
    setRootConcavity: actual.setRootConcavity,
    nextPerioCell: actual.nextPerioCell,
    prevPerioCell: actual.prevPerioCell,
    getPlaqueIndex: actual.getPlaqueIndex,
    setPlaqueIndex: actual.setPlaqueIndex,
    getGingivalIndex: actual.getGingivalIndex,
    setGingivalIndex: actual.setGingivalIndex,
    getKeratinizedWidth: actual.getKeratinizedWidth,
    setKeratinizedWidth: actual.setKeratinizedWidth,
    getGingivalThickness: actual.getGingivalThickness,
    setGingivalThickness: actual.setGingivalThickness,
    getMillerClass: actual.getMillerClass,
    setMillerClass: actual.setMillerClass,
    isToothImplant: actual.isToothImplant,
    getPeriImplantPlaque: actual.getPeriImplantPlaque,
    setPeriImplantPlaque: actual.setPeriImplantPlaque,
    getPeriImplantBleeding: actual.getPeriImplantBleeding,
    setPeriImplantBleeding: actual.setPeriImplantBleeding,
    getCaseMeta: actual.getCaseMeta,
    setCaseAge: actual.setCaseAge,
    setSmokingStatus: actual.setSmokingStatus,
    setCigarettesPerDay: actual.setCigarettesPerDay,
    setDiabetesStatus: actual.setDiabetesStatus,
    setHba1c: actual.setHba1c,
    setToothLossPerio: actual.setToothLossPerio,
    setMaxRblPercent: actual.setMaxRblPercent,
    resetCaseMeta: actual.resetCaseMeta,
    getPerioClassification: actual.getPerioClassification,
    setDiagnosisOverride: actual.setDiagnosisOverride,
    setStageOverride: actual.setStageOverride,
    setGradeOverride: actual.setGradeOverride,
    setExtentOverride: actual.setExtentOverride,
  };
});

async function mountApp() {
  const utils = render(createElement(App));
  await Promise.resolve();
  return utils;
}

describe("UI-1 Task 1: <App/> right panel view-gate", () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.clearAllMocks();
    document.documentElement.classList.remove("dark");
    closePerioOverlay();
    setPerioViewMode("toggle");
    resetCaseMeta();
  });

  it("odontogram view (default): shows the odontogram controls, not the perio sidebar", async () => {
    await mountApp();
    expect(document.getElementById("statusCard")).toBeTruthy();
    expect(document.getElementById("toothSelect")).toBeTruthy();
    expect(document.getElementById("caseMetaPanel")).toBeNull();
  });

  it("perio (Dental Chart) view: shows the perio sidebar; odontogram controls stay mounted but hidden", async () => {
    await mountApp();
    fireEvent.click(document.getElementById("appViewDentalChart")!);
    expect(document.getElementById("caseMetaPanel")).toBeTruthy();
    expect(document.getElementById("perio-fg-summary-avgpd")).toBeTruthy();
    // The odontogram control panel is NOT unmounted (that would drop its
    // one-time wireControls() listeners and break editing after toggling back —
    // see App.tsx). It stays in the DOM, hidden via CSS.
    const controls = document.querySelector(".panel-odontogram-controls") as HTMLElement | null;
    expect(controls).toBeTruthy();
    expect(controls!.style.display).toBe("none");
    expect(document.getElementById("statusCard")).toBeTruthy();
    expect(document.getElementById("toothSelect")).toBeTruthy();
  });

  it("switching back to the odontogram view restores the odontogram controls", async () => {
    await mountApp();
    fireEvent.click(document.getElementById("appViewDentalChart")!);
    expect(document.getElementById("caseMetaPanel")).toBeTruthy();
    fireEvent.click(document.getElementById("appViewOdontogram")!);
    expect(document.getElementById("statusCard")).toBeTruthy();
    expect(document.getElementById("caseMetaPanel")).toBeNull();
  });
});
