// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// R2-B Task 2: the "What changes" box (#plannedChangesBox) surfaces
// getPlanChanges() (Task 1) under the Tooth-information panel.
//
// Two concerns, one file:
//  1. getOdontogramSummary() now widens with a `plannedChanges: PlanChange[]`
//     field, populated straight from the real getPlanChanges() diff engine.
//  2. App.tsx renders #plannedChangesBox from that field: absent/empty when
//     there is no plan (or plan === status), present and listing every
//     `${label(toothNo)}: ${axisName} ${from} → ${to}` entry when they differ.
//
// Mirrors sp14-ortho-ui.test.ts's harness: initOdontogram et al. (DOM/SVG
// chart mount) are mocked out since this panel doesn't need a live chart,
// but getOdontogramSummary/getPlanChanges/formatToothLabel/onStateChange and
// the dual-chart test seams are delegated to the REAL implementation via
// vi.importActual, so the App-mount assertions exercise real business logic,
// not hand-authored fixtures.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement, act } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";
import {
  getOdontogramSummary,
  getPlanChanges,
  setChartMode,
  __setToothStateForTest,
  __resetChartStateForTest,
} from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

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
    setSurfaceNotation: vi.fn(),
    getSurfaceNotation: vi.fn().mockReturnValue("full"),
    exportFhir: vi.fn(),
    exportImage: vi.fn(),
    exportSvg: vi.fn(),
    setImportFormat: vi.fn(),
    // Real exports under test — not part of the imperative DOM/SVG wiring.
    getOdontogramSummary: actual.getOdontogramSummary,
    getPlanChanges: actual.getPlanChanges,
    hasAnyPerioData: actual.hasAnyPerioData,
    getCaseMeta: actual.getCaseMeta,
    setPatientName: actual.setPatientName,
    setExamDate: actual.setExamDate,
    exportPdf: vi.fn().mockResolvedValue(undefined),
    formatToothLabel: actual.formatToothLabel,
    onStateChange: actual.onStateChange,
    openPerioOverlay: actual.openPerioOverlay,
    closePerioOverlay: actual.closePerioOverlay,
    isPerioOverlayOpen: actual.isPerioOverlayOpen,
    getPerioViewMode: vi.fn().mockReturnValue("toggle"),
    setPerioViewMode: vi.fn(),
    getPerioRowVisibility: vi.fn().mockReturnValue({
      plaque: true, bop: true, cal: true, gm: true, pd: true, furcation: true,
      mobility: true, cej: true, rootConcavity: true, pi: true, gi: true,
      mpi: true, mbi: true, kg: true, gt: true, miller: true,
    }),
    setPerioRowVisibility: vi.fn(),
    getPerioIndexNameMode: vi.fn().mockReturnValue("translated"),
    setPerioIndexNameMode: vi.fn(),
    getPdfSettings: vi.fn().mockReturnValue({ defaultName: "John Doe", defaultDob: "1980-01-01", showAge: true, dateFormat: "iso", colorTheme: "blue", showBone: true, showHealthyPulp: true, toothSpacing: "wide", border: false, borderThickness: "medium", borderColor: "#000000", toothNumberSize: "normal", includeOdontogramText: true, includeOdontogramTable: true, perioToothSpacing: "wide", perioShowEmptyRows: true, perioLabelPlacement: "center", perioFontSize: "normal", includePerioTable: true, includePerioAbbrev: true, showDisclaimer: true, disclaimerText: "", summaryGrouping: "jaw", showGenerator: true }),
    setPdfSettings: vi.fn(),
    isDualStateConfirmPending: vi.fn().mockReturnValue(false),
    acceptDualStateConfirm: vi.fn(),
    cancelDualStateConfirm: vi.fn(),
    setChartMode: actual.setChartMode,
    __setToothStateForTest: actual.__setToothStateForTest,
    __resetChartStateForTest: actual.__resetChartStateForTest,
  };
});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.documentElement.classList.remove("dark");
  __resetChartStateForTest();
  setI18nLanguage("en");
});

describe("getOdontogramSummary().plannedChanges", () => {
  it("is [] when no plan chart exists yet", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    expect(getOdontogramSummary().plannedChanges).toEqual([]);
  });

  it("is [] when the plan equals status", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    setChartMode("status");
    expect(getOdontogramSummary().plannedChanges).toEqual([]);
  });

  it("mirrors getPlanChanges() exactly when the plan differs from status", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon" });
    setChartMode("status");

    const summary = getOdontogramSummary();
    expect(summary.plannedChanges.length).toBeGreaterThan(0);
    expect(summary.plannedChanges).toEqual(getPlanChanges());
  });
});

describe("#plannedChangesBox in the Tooth-information panel", () => {
  it("is absent when there is no plan", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base" });
    render(createElement(App));
    expect(document.querySelector("#plannedChangesBox")).toBeNull();
  });

  it("is absent when the plan equals status", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    setChartMode("status");
    render(createElement(App));
    expect(document.querySelector("#plannedChangesBox")).toBeNull();
  });

  it("lists every formatted change (label: axis from → to) when the plan differs", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "none" });
    setChartMode("plan");
    __setToothStateForTest(16, { toothSelection: "tooth-base", restorationType: "crown", restorationMaterial: "zircon" });
    setChartMode("status");

    render(createElement(App));
    const box = document.querySelector("#plannedChangesBox");
    expect(box).toBeTruthy();

    const text = box!.textContent ?? "";
    expect(text).toContain(t("toothInfo.plannedChanges"));
    expect(text).toContain("16");
    expect(text).toContain(t("planChange.axis.restoration"));
    expect(text).toContain(t("planChange.none"));
    expect(text).toContain(`${t("restoration.type.crown")} – ${t("restoration.material.zircon")}`);
    expect(text).toContain("→"); // "→"
  });

  it("refreshes live when a plan edit fires notifyStateChange (no remount)", () => {
    __setToothStateForTest(11, { toothSelection: "tooth-base", orthoDrift: "none" });
    render(createElement(App));
    expect(document.querySelector("#plannedChangesBox")).toBeNull();

    act(() => {
      setChartMode("plan");
      __setToothStateForTest(11, { toothSelection: "tooth-base", orthoDrift: "mesial" });
      setChartMode("status");
    });

    const box = document.querySelector("#plannedChangesBox");
    expect(box).toBeTruthy();
    expect(box!.textContent ?? "").toContain(t("ortho.drift.mesial"));
  });
});
