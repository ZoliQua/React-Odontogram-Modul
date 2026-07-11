import { describe, it, expect } from "vitest";
import { optionsFor } from "../uiOptions";
import { t } from "../../i18n/useI18n";

describe("stable option labelKeys resolve (source language)", () => {
  const axes = ["toothSelection", "mobility", "periapicalType", "mods", "endo"];
  it("every labelKey has a non-empty hu translation", () => {
    for (const ax of axes) for (const o of optionsFor(ax))
      expect(t(o.labelKey, "hu"), `${ax}:${o.labelKey}`).not.toBe(o.labelKey); // t() falls back to the key if missing
  });
});
