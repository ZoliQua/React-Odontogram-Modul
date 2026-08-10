// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// Task 4 (Arabic+Chinese sub-project): RTL layout for Arabic.
//
// The shell root (`.odontogram-root`) carries a reactive `dir`/`lang` pair
// driven by the active UI language — `dir="rtl"` for Arabic, `dir="ltr"`
// for every other language (including the newly-added `zh`, which is LTR).
// The dental chart (`#toothGrid`) is a 16-col grid filled 18->28 and must
// NEVER auto-reverse under an RTL shell — it stays `dir="ltr"` regardless
// of the active language. This mirrors `App.test.tsx`'s mock harness
// (odontogram.ts manipulates real DOM/SVGs and is mocked out) since nothing
// here needs a live `initOdontogram()`/SVG-grid mount.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import App from '../App';

// Mock odontogram.ts since it manipulates real DOM and SVGs (same harness as App.test.tsx).
vi.mock('../odontogram', () => ({
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
  getPulpDetailLevel: vi.fn().mockReturnValue('aae'),
  setSecondaryCariesMode: vi.fn(),
  getSecondaryCariesMode: vi.fn().mockReturnValue('standard'),
  setRootCariesMode: vi.fn(),
  getRootCariesMode: vi.fn().mockReturnValue('simple'),
  setRadiographicDepthMode: vi.fn(),
  getRadiographicDepthMode: vi.fn().mockReturnValue('off'),
  setCariesDepthEnabled: vi.fn(),
  getCariesDepthEnabled: vi.fn().mockReturnValue(true),
  setWearDetailLevel: vi.fn(),
  getWearDetailLevel: vi.fn().mockReturnValue('complex'),
  setDiscolorationDetailLevel: vi.fn(),
  getDiscolorationDetailLevel: vi.fn().mockReturnValue('complex'),
  setSurfaceNotation: vi.fn(),
  getSurfaceNotation: vi.fn().mockReturnValue('full'),
  hasAnyPerioData: vi.fn().mockReturnValue(false),
  getCaseMeta: vi.fn().mockReturnValue({
    age: null, smokingStatus: 'unknown', cigarettesPerDay: null,
    diabetesStatus: 'unknown', hba1c: null, toothLossPerio: null, maxRblPercent: null,
    diagnosisOverride: null, stageOverride: null, gradeOverride: null, extentOverride: null,
    patientName: null, examDate: null,
  }),
  setPatientName: vi.fn(),
  setExamDate: vi.fn(),
  exportPdf: vi.fn().mockResolvedValue(undefined),
  getOdontogramSummary: vi.fn().mockReturnValue({
    overview: '', permanentList: null, missingList: null,
    sections: [], implants: null, toothTable: { columns: [], rows: [], legend: "" }, periodontalHasFindings: false, periodontalTitle: '', periodontalText: '',
  }),
  onStateChange: vi.fn().mockReturnValue(() => {}),
  openPerioOverlay: vi.fn(),
  closePerioOverlay: vi.fn(),
  isPerioOverlayOpen: vi.fn().mockReturnValue(false),
  getPerioViewMode: vi.fn().mockReturnValue('toggle'),
  setPerioViewMode: vi.fn(),
  getPerioRowVisibility: vi.fn().mockReturnValue({
    plaque: true, bop: true, cal: true, gm: true, pd: true, furcation: true,
    mobility: true, cej: true, rootConcavity: true, pi: true, gi: true,
    mpi: true, mbi: true, kg: true, gt: true, miller: true,
  }),
  setPerioRowVisibility: vi.fn(),
  getPerioIndexNameMode: vi.fn().mockReturnValue('translated'),
  setPerioIndexNameMode: vi.fn(),
  getPdfSettings: vi.fn().mockReturnValue({ defaultName: "John Doe", defaultDob: "1980-01-01", showAge: true, dateFormat: "iso", colorTheme: "blue", showBone: true, showHealthyPulp: true, toothSpacing: "wide", border: false, borderThickness: "medium", borderColor: "#000000", toothNumberSize: "normal", includeOdontogramText: true, includeOdontogramTable: true, perioToothSpacing: "wide", perioShowEmptyRows: true, perioLabelPlacement: "center", perioFontSize: "normal", includePerioTable: true, includePerioAbbrev: true, showDisclaimer: true, disclaimerText: "", summaryGrouping: "jaw", showGenerator: true }),
  setPdfSettings: vi.fn(),
  isDualStateConfirmPending: vi.fn().mockReturnValue(false),
  acceptDualStateConfirm: vi.fn(),
  cancelDualStateConfirm: vi.fn(),
  exportFhir: vi.fn(),
  exportImage: vi.fn(),
  exportSvg: vi.fn(),
  setImportFormat: vi.fn(),
}));

describe('Arabic RTL layout', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    document.documentElement.classList.remove('dark');
  });

  it('sets dir=rtl on the shell root for Arabic but keeps the tooth grid LTR', () => {
    const { container } = render(<App language="ar" />);
    const root = container.querySelector('.odontogram-root') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.getAttribute('dir')).toBe('rtl');
    expect(root.getAttribute('lang')).toBe('ar');
    const grid = container.querySelector('#toothGrid') as HTMLElement;
    // chart is pinned LTR (attribute or computed) regardless of the RTL shell
    expect(grid).toBeTruthy();
    expect(grid.getAttribute('dir')).toBe('ltr');
  });

  it('uses dir=ltr on the shell root for a non-RTL language (en)', () => {
    const { container } = render(<App language="en" />);
    const root = container.querySelector('.odontogram-root') as HTMLElement;
    expect(root.getAttribute('dir')).toBe('ltr');
    expect(root.getAttribute('lang')).toBe('en');
  });

  it('uses dir=ltr on the shell root for Chinese (zh is LTR, not RTL)', () => {
    const { container } = render(<App language="zh" />);
    const root = container.querySelector('.odontogram-root') as HTMLElement;
    expect(root.getAttribute('dir')).toBe('ltr');
    expect(root.getAttribute('lang')).toBe('zh');
  });
});
