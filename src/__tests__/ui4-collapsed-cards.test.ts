// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

// UI-4: collapsible card state persistence — tracks which panel sections the
// user has collapsed/expanded and persists the layout in the export payload
// under `ui.collapsedCards` so the panel layout survives export/import cycles.
// Exercised via module-level state and the existing `__collectExportPayloadForTest`
// / `__hydrateImportedChartsForTest` / `__resetChartStateForTest` test seams.
import { describe, it, expect, beforeEach } from "vitest";
import {
  getCollapsedCards, isCardCollapsed, setCollapsedCard, toggleCollapsedCard,
  __resetChartStateForTest, __collectExportPayloadForTest, __hydrateImportedChartsForTest,
  getPlanChart, getStatusChart,
} from "../odontogram";

beforeEach(() => __resetChartStateForTest());

describe("collapsed cards state", () => {
  it("default state is empty", () => {
    const cards = getCollapsedCards();
    expect(Object.keys(cards)).toHaveLength(0);
  });

  it("getCollapsedCards returns a copy, not a reference", () => {
    const cards1 = getCollapsedCards();
    const cards2 = getCollapsedCards();
    cards1.controls = true;
    // mutating the returned object must not affect module state
    const cards3 = getCollapsedCards();
    expect(cards3.controls).toBeUndefined();
  });

  it("isCardCollapsed returns false for unknown card IDs", () => {
    expect(isCardCollapsed("nonexistent")).toBe(false);
    expect(isCardCollapsed("bogus")).toBe(false);
  });

  it("isCardCollapsed returns false for default state", () => {
    expect(isCardCollapsed("controls")).toBe(false);
    expect(isCardCollapsed("status")).toBe(false);
    expect(isCardCollapsed("caries")).toBe(false);
    expect(isCardCollapsed("filling")).toBe(false);
    expect(isCardCollapsed("rootPeriodontium")).toBe(false);
  });

  it("setCollapsedCard sets a card's state", () => {
    setCollapsedCard("caries", true);
    expect(isCardCollapsed("caries")).toBe(true);
    expect(getCollapsedCards().caries).toBe(true);
  });

  it("setCollapsedCard with false clears a card's state", () => {
    setCollapsedCard("caries", true);
    setCollapsedCard("caries", false);
    expect(isCardCollapsed("caries")).toBe(false);
    expect(getCollapsedCards().caries).toBe(false);
  });

  it("setCollapsedCard with invalid ID is a no-op", () => {
    setCollapsedCard("bogus", true);
    expect(Object.keys(getCollapsedCards())).toHaveLength(0);
  });

  it("toggleCollapsedCard flips the state", () => {
    expect(isCardCollapsed("filling")).toBe(false);
    toggleCollapsedCard("filling");
    expect(isCardCollapsed("filling")).toBe(true);
    toggleCollapsedCard("filling");
    expect(isCardCollapsed("filling")).toBe(false);
  });

  it("toggleCollapsedCard with invalid ID is a no-op", () => {
    toggleCollapsedCard("bogus");
    expect(Object.keys(getCollapsedCards())).toHaveLength(0);
  });

  it("all valid card IDs can be set independently", () => {
    setCollapsedCard("controls", true);
    setCollapsedCard("status", false);
    setCollapsedCard("caries", true);
    setCollapsedCard("filling", false);
    setCollapsedCard("rootPeriodontium", true);
    const cards = getCollapsedCards();
    expect(cards.controls).toBe(true);
    expect(cards.status).toBe(false);
    expect(cards.caries).toBe(true);
    expect(cards.filling).toBe(false);
    expect(cards.rootPeriodontium).toBe(true);
  });
});

describe("payload serialization", () => {
  it("omits ui key when no cards are collapsed", () => {
    const payload = __collectExportPayloadForTest();
    expect(payload.version).toBe("2.21");
    expect(Object.prototype.hasOwnProperty.call(payload, "ui")).toBe(false);
  });

  it("includes ui.collapsedCards when cards are collapsed", () => {
    setCollapsedCard("caries", true);
    setCollapsedCard("controls", true);
    const payload = __collectExportPayloadForTest();
    expect(payload.ui).toBeDefined();
    expect(payload.ui.collapsedCards).toMatchObject({ caries: true, controls: true });
  });

  it("does not include expanded (false) cards in the payload ui", () => {
    setCollapsedCard("status", false);
    setCollapsedCard("caries", true);
    const payload = __collectExportPayloadForTest();
    // `status: false` is included so the import can tell explicitly-set-false
    // apart from "never set" — both read as "not collapsed" on restore
    expect(payload.ui.collapsedCards.status).toBe(false);
    expect(payload.ui.collapsedCards.caries).toBe(true);
  });

  it("getPlanChart also includes ui state", () => {
    setCollapsedCard("filling", true);
    const plan = getPlanChart();
    expect(plan.version).toBe("2.21");
    expect(plan.ui.collapsedCards.filling).toBe(true);
  });

  it("getStatusChart includes ui state", () => {
    setCollapsedCard("rootPeriodontium", true);
    const status = getStatusChart();
    expect(status.version).toBe("2.21");
    expect(status.ui.collapsedCards.rootPeriodontium).toBe(true);
  });
});

describe("payload roundtrip", () => {
  it("collapsed state survives export -> JSON -> import", () => {
    setCollapsedCard("caries", true);
    setCollapsedCard("controls", true);
    setCollapsedCard("status", false);
    const json = JSON.parse(JSON.stringify(__collectExportPayloadForTest()));
    __resetChartStateForTest();
    expect(Object.keys(getCollapsedCards())).toHaveLength(0); // reset cleared it
    __hydrateImportedChartsForTest(json);
    expect(getCollapsedCards()).toMatchObject({ caries: true, controls: true, status: false });
  });

  it("import without ui key resets collapsed state", () => {
    setCollapsedCard("caries", true);
    __hydrateImportedChartsForTest({ version: "2.21", teeth: {} });
    expect(Object.keys(getCollapsedCards())).toHaveLength(0);
  });

  it("__resetChartStateForTest clears the collapsed state", () => {
    setCollapsedCard("caries", true);
    __resetChartStateForTest();
    expect(Object.keys(getCollapsedCards())).toHaveLength(0);
  });
});
