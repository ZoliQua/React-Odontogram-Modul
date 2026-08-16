// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { describe, it, expect } from "vitest";
import { svgCases, payloadCases } from "./matrix";

describe("parity matrix", () => {
  it("covers many cases across all 13 templates (9 front + 4 occlusal), deterministically", () => {
    const a = svgCases(); const b = svgCases();
    expect(a.length).toBe(b.length);
    expect(a.length).toBeGreaterThan(200);
    expect(new Set(a.map(c => c.template)).size).toBe(13);
  });
  it("payload cases include empty, edentulous, mixed, branches", () => {
    expect(payloadCases().map(p => p.name)).toEqual(["empty", "edentulous", "mixed", "branches"]);
  });
});
