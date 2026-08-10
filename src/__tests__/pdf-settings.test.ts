// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// 2.2.3 Stage A: PDF export settings (session-only module state driving the PDF
// report's defaults / date format / colour theme). Unit-tests the get/set API's
// merge + validation semantics; the rendering effects live in exportPdf (a
// browser-verify path, like the rest of exportPdf).
import { describe, it, expect, afterEach } from "vitest";
import { getPdfSettings, setPdfSettings } from "../odontogram";

// Restore defaults after each test — module state leaks across tests otherwise.
afterEach(() => {
  setPdfSettings({ defaultName: "John Doe", defaultDob: "1980-01-01", showAge: true, dateFormat: "iso", colorTheme: "blue", showBone: true, showHealthyPulp: true, toothSpacing: "wide", border: false, borderThickness: "medium", borderColor: "#000000", toothNumberSize: "normal", includeOdontogramText: true, includeOdontogramTable: true, perioToothSpacing: "wide", perioShowEmptyRows: true, perioLabelPlacement: "center", perioFontSize: "normal", includePerioTable: true, includePerioAbbrev: true, showDisclaimer: true, disclaimerText: "", summaryGrouping: "jaw", showGenerator: true });
});

describe("2.2.3: PDF settings state", () => {
  it("has sensible defaults", () => {
    const s = getPdfSettings();
    expect(s.defaultName).toBe("John Doe");
    expect(s.defaultDob).toBe("1980-01-01");
    expect(s.showAge).toBe(true);
    expect(s.dateFormat).toBe("iso");
    expect(s.colorTheme).toBe("blue");
  });

  it("merges a partial patch, leaving other fields untouched", () => {
    setPdfSettings({ defaultName: "Jane Roe", showAge: false });
    const s = getPdfSettings();
    expect(s.defaultName).toBe("Jane Roe");
    expect(s.showAge).toBe(false);
    expect(s.dateFormat).toBe("iso"); // untouched
  });

  it("accepts valid enum values and ignores invalid ones", () => {
    setPdfSettings({ dateFormat: "dmy", colorTheme: "teal" });
    expect(getPdfSettings().dateFormat).toBe("dmy");
    expect(getPdfSettings().colorTheme).toBe("teal");

    // Invalid values are silently ignored (no-op), leaving the current value.
    setPdfSettings({ dateFormat: "bogus" as never, colorTheme: "rainbow" as never });
    expect(getPdfSettings().dateFormat).toBe("dmy");
    expect(getPdfSettings().colorTheme).toBe("teal");
  });

  it("getPdfSettings returns a copy (external mutation does not leak back)", () => {
    const s = getPdfSettings();
    s.defaultName = "Mutated";
    expect(getPdfSettings().defaultName).not.toBe("Mutated");
  });
});
