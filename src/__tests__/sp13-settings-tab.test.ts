// SP13 Task 3: "Tooth details" settings tab (wear/discoloration detail level).
// Exercises the real SETTINGS_TABS registry entry — not a rendered DOM, since
// this file must stay plain TS (no JSX) per the task brief. We call the tab's
// `render({ t, s })` directly and inspect the returned React element tree.
import { describe, it, expect, vi } from "vitest";
import { Children, isValidElement, type ReactElement } from "react";
import { SETTINGS_TABS, type SettingsState } from "../SettingsModal";

const t = (key: string) => key;

function stubSettings(): SettingsState {
  return {
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
    surfaceNotation: "full",
    onSurfaceNotation: vi.fn(),
    notes: false,
    onNotes: vi.fn(),
    showStatusCard: true,
    onShowStatusCard: vi.fn(),
    showOrthoCard: true,
    onShowOrthoCard: vi.fn(),
  };
}

describe("SP13 Task 3: toothDetails settings tab", () => {
  // SP15 Task 4 (B1/B2) inserted the "panels" tab immediately after "general"
  // and removed the standalone "secondaryCaries" tab (merged into "caries"),
  // so toothDetails is now general+2 rather than general+1. See
  // sp15-settings.test.ts for the panels-tab and merged-caries assertions.
  it("exists in SETTINGS_TABS after the general and panels tabs", () => {
    const generalIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "general");
    const panelsIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "panels");
    const toothDetailsIdx = SETTINGS_TABS.findIndex((tab) => tab.id === "toothDetails");

    expect(generalIdx).toBe(0);
    expect(panelsIdx).toBe(generalIdx + 1);
    expect(toothDetailsIdx).toBeGreaterThan(-1);
    expect(toothDetailsIdx).toBe(panelsIdx + 1);
    expect(SETTINGS_TABS[toothDetailsIdx].titleKey).toBe("settings.tab.toothDetails");
  });

  it("renders three controls bound to wearDetailLevel, discolorationDetailLevel, and surfaceNotation", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "toothDetails")!;
    const s = stubSettings();
    const node = tab.render({ t, s });

    const children = Children.toArray((node as ReactElement).props.children).filter(
      isValidElement,
    ) as ReactElement<any>[];
    expect(children).toHaveLength(3);

    const [wearRow, discoRow, notationRow] = children;

    expect(wearRow.props.value).toBe(s.wearDetailLevel);
    expect(wearRow.props.descKey).toBe("settings.wearDetail.desc");
    expect(wearRow.props.label).toBe(t("settings.wearDetail.label"));
    expect((wearRow.props.options as { value: string; labelKey: string }[]).map((o) => o.value).sort()).toEqual([
      "complex",
      "simple",
    ]);

    expect(discoRow.props.value).toBe(s.discolorationDetailLevel);
    expect(discoRow.props.descKey).toBe("settings.discolorationDetail.desc");
    expect(discoRow.props.label).toBe(t("settings.discolorationDetail.label"));
    expect(
      (discoRow.props.options as { value: string; labelKey: string }[]).map((o) => o.value).sort(),
    ).toEqual(["complex", "simple"]);

    // SP16 Task 2: a new SelectRow bound to surfaceNotation ("full"/"simple").
    expect(notationRow.props.value).toBe(s.surfaceNotation);
    expect(notationRow.props.descKey).toBe("settings.surfaceNotation.desc");
    expect(notationRow.props.label).toBe(t("settings.surfaceNotation.label"));
    expect(
      (notationRow.props.options as { value: string; labelKey: string }[]).map((o) => o.value).sort(),
    ).toEqual(["full", "simple"]);
  });

  it("invoking each control's onChange calls the matching settings handler with the new value", () => {
    const tab = SETTINGS_TABS.find((tab) => tab.id === "toothDetails")!;
    const s = stubSettings();
    const node = tab.render({ t, s });
    const children = Children.toArray((node as ReactElement).props.children).filter(
      isValidElement,
    ) as ReactElement<any>[];
    const [wearRow, discoRow, notationRow] = children;

    wearRow.props.onChange("simple");
    expect(s.onWearDetailLevel).toHaveBeenCalledTimes(1);
    expect(s.onWearDetailLevel).toHaveBeenCalledWith("simple");
    expect(s.onDiscolorationDetailLevel).not.toHaveBeenCalled();

    discoRow.props.onChange("simple");
    expect(s.onDiscolorationDetailLevel).toHaveBeenCalledTimes(1);
    expect(s.onDiscolorationDetailLevel).toHaveBeenCalledWith("simple");

    notationRow.props.onChange("simple");
    expect(s.onSurfaceNotation).toHaveBeenCalledTimes(1);
    expect(s.onSurfaceNotation).toHaveBeenCalledWith("simple");
  });
});
