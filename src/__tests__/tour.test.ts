import { describe, it, expect } from "vitest";
import { TOUR_STEPS, clampStep } from "../tour";
import { translations } from "../i18n/translations";

describe("intro tour model", () => {
  it("has exactly 12 steps, each with a selector and i18n keys", () => {
    expect(TOUR_STEPS).toHaveLength(12);
    for (const s of TOUR_STEPS) {
      expect(typeof s.selector).toBe("string");
      expect(s.titleKey).toMatch(/^intro\.step\d+\.title$/);
      expect(s.textKey).toMatch(/^intro\.step\d+\.text$/);
    }
  });
  it("has the tour i18n keys in all 8 languages", () => {
    for (const lang of Object.keys(translations)) {
      for (const s of TOUR_STEPS) {
        expect(translations[lang as keyof typeof translations][s.titleKey], `${lang}:${s.titleKey}`).toBeDefined();
        expect(translations[lang as keyof typeof translations][s.textKey], `${lang}:${s.textKey}`).toBeDefined();
      }
      expect(translations[lang as keyof typeof translations]["intro.start"]).toBeDefined();
    }
  });
  it("clampStep keeps the index within bounds", () => {
    expect(clampStep(-1)).toBe(0);
    expect(clampStep(99)).toBe(11);
    expect(clampStep(5)).toBe(5);
  });
});
