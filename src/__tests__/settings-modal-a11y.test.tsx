// FIX 2 (a11y): the settings-modal tablist uses a roving tabindex, so without
// an Arrow-key handler only the active tab is keyboard/AT reachable (the other
// four are mouse-only). This verifies APG-tabs keyboard support: Left/Right
// (and Up/Down) move + activate wrapping; Home → first, End → last.
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import SettingsModal, { type SettingsState } from "../SettingsModal";

afterEach(cleanup);

const t = (key: string) => key;

const settings: SettingsState = {
  numbering: "FDI",
  onNumbering: vi.fn(),
  language: "en",
  onLanguage: vi.fn(),
  isDark: false,
  onToggleDark: vi.fn(),
  toothInfo: false,
  onToothInfo: vi.fn(),
  secondaryCariesMode: "standard",
  onSecondaryCariesMode: vi.fn(),
  icdas: false,
  onIcdas: vi.fn(),
  cariesDepth: false,
  onCariesDepth: vi.fn(),
  rootCariesMode: "simple",
  onRootCariesMode: vi.fn(),
  radiographicDepthMode: "off",
  onRadiographicDepthMode: vi.fn(),
  pulpLevel: "aae",
  onPulpLevel: vi.fn(),
  wearDetailLevel: "complex",
  onWearDetailLevel: vi.fn(),
  discolorationDetailLevel: "complex",
  onDiscolorationDetailLevel: vi.fn(),
  notes: false,
  onNotes: vi.fn(),
};

const renderModal = () =>
  render(<SettingsModal open onClose={vi.fn()} t={t} settings={settings} />);

const tabs = () => screen.getAllByRole("tab");
const selectedTab = () => tabs().find((el) => el.getAttribute("aria-selected") === "true");

describe("FIX 2: SettingsModal tablist keyboard navigation", () => {
  it("ArrowRight moves and activates the next tab (wrapping at the end)", () => {
    renderModal();
    const all = tabs();
    expect(selectedTab()).toBe(all[0]);

    fireEvent.keyDown(all[0], { key: "ArrowRight" });
    expect(selectedTab()).toBe(all[1]);
    expect(document.activeElement).toBe(all[1]);

    // wrap: ArrowRight from the last tab returns to the first
    fireEvent.keyDown(selectedTab()!, { key: "End" });
    expect(selectedTab()).toBe(all[all.length - 1]);
    fireEvent.keyDown(selectedTab()!, { key: "ArrowRight" });
    expect(selectedTab()).toBe(all[0]);
  });

  it("ArrowLeft wraps from the first tab to the last", () => {
    renderModal();
    const all = tabs();
    fireEvent.keyDown(all[0], { key: "ArrowLeft" });
    expect(selectedTab()).toBe(all[all.length - 1]);
    expect(document.activeElement).toBe(all[all.length - 1]);
  });

  it("Home selects the first tab and End the last", () => {
    renderModal();
    const all = tabs();
    fireEvent.keyDown(all[0], { key: "End" });
    expect(selectedTab()).toBe(all[all.length - 1]);
    fireEvent.keyDown(selectedTab()!, { key: "Home" });
    expect(selectedTab()).toBe(all[0]);
    expect(document.activeElement).toBe(all[0]);
  });

  it("keeps the roving tabindex: exactly one tab has tabIndex 0 after navigation", () => {
    renderModal();
    fireEvent.keyDown(tabs()[0], { key: "ArrowRight" });
    const zero = tabs().filter((el) => el.getAttribute("tabindex") === "0");
    expect(zero).toHaveLength(1);
    expect(zero[0]).toBe(selectedTab());
  });
});
