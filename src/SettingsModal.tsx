import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Language } from "./i18n/translations";
import type { NumberingSystem } from "./utils/numbering";
import type {
  PulpDetailLevel,
  SecondaryCariesMode,
  RootCariesMode,
  RadiographicDepthMode,
  ToothDetailLevel,
} from "./odontogram";

/** Translation function signature (subset of `useI18n`'s `t`). */
type TFn = (key: string, params?: Record<string, string | number>) => string;

/**
 * The full set of live setting values + change handlers the modal drives.
 *
 * Every field maps 1:1 to an existing App-level piece of state / module
 * accessor — the modal never owns behavior, it only surfaces the controls.
 * New settings are added here and wired into a tab's `render()`.
 */
export type SettingsState = {
  numbering: NumberingSystem;
  onNumbering: (value: NumberingSystem) => void;
  language: Language;
  onLanguage: (value: Language) => void;
  isDark: boolean;
  onToggleDark: () => void;
  toothInfo: boolean;
  onToothInfo: (value: boolean) => void;
  secondaryCariesMode: SecondaryCariesMode;
  onSecondaryCariesMode: (value: SecondaryCariesMode) => void;
  icdas: boolean;
  onIcdas: (value: boolean) => void;
  cariesDepth: boolean;
  onCariesDepth: (value: boolean) => void;
  rootCariesMode: RootCariesMode;
  onRootCariesMode: (value: RootCariesMode) => void;
  radiographicDepthMode: RadiographicDepthMode;
  onRadiographicDepthMode: (value: RadiographicDepthMode) => void;
  pulpLevel: PulpDetailLevel;
  onPulpLevel: (value: PulpDetailLevel) => void;
  wearDetailLevel: ToothDetailLevel;
  onWearDetailLevel: (value: ToothDetailLevel) => void;
  discolorationDetailLevel: ToothDetailLevel;
  onDiscolorationDetailLevel: (value: ToothDetailLevel) => void;
  notes: boolean;
  onNotes: (value: boolean) => void;
};

/** Context handed to every tab's `render()`. */
type TabContext = { t: TFn; s: SettingsState };

/**
 * Declarative tab registry. Adding a settings section is a matter of pushing a
 * new `{ id, titleKey, render }` entry (and its i18n keys) — no structural
 * changes to the modal shell. `render` receives the live settings + `t`.
 */
type SettingsTab = {
  id: string;
  titleKey: string;
  render: (ctx: TabContext) => ReactNode;
};

const NUMBERING_OPTIONS: { value: NumberingSystem; labelKey: string }[] = [
  { value: "FDI", labelKey: "numbering.fdi" },
  { value: "UNIVERSAL", labelKey: "numbering.universal" },
  { value: "PALMER", labelKey: "numbering.palmer" },
];

const LANGUAGE_OPTIONS: { value: Language; labelKey: string }[] = [
  { value: "hu", labelKey: "language.hu" },
  { value: "en", labelKey: "language.en" },
  { value: "de", labelKey: "language.de" },
  { value: "es", labelKey: "language.es" },
  { value: "it", labelKey: "language.it" },
  { value: "sk", labelKey: "language.sk" },
  { value: "pl", labelKey: "language.pl" },
  { value: "ru", labelKey: "language.ru" },
  { value: "pt-br", labelKey: "language.pt-br" },
];

const SECONDARY_OPTIONS: { value: SecondaryCariesMode; labelKey: string }[] = [
  { value: "simple", labelKey: "settings.secondaryCaries.simple" },
  { value: "standard", labelKey: "settings.secondaryCaries.standard" },
  { value: "full", labelKey: "settings.secondaryCaries.full" },
];

const ROOT_OPTIONS: { value: RootCariesMode; labelKey: string }[] = [
  { value: "simple", labelKey: "settings.rootCaries.simple" },
  { value: "severity", labelKey: "settings.rootCaries.severity" },
];

const RADIOGRAPHIC_OPTIONS: { value: RadiographicDepthMode; labelKey: string }[] = [
  { value: "off", labelKey: "settings.radiographic.off" },
  { value: "threeLevel", labelKey: "settings.radiographic.threeLevel" },
  { value: "detailed", labelKey: "settings.radiographic.detailed" },
];

const PULP_OPTIONS: { value: PulpDetailLevel; labelKey: string }[] = [
  { value: "simple", labelKey: "pulp.level.simple" },
  { value: "aae", labelKey: "pulp.level.aae" },
  { value: "latin", labelKey: "pulp.level.latin" },
];

const TOOTH_DETAIL_OPTIONS: { value: ToothDetailLevel; labelKey: string }[] = [
  { value: "complex", labelKey: "settings.toothDetail.complex" },
  { value: "simple", labelKey: "settings.toothDetail.simple" },
];

/** A single settings row: label + description + a control on the right. */
function SettingRow({
  t,
  label,
  descKey,
  children,
}: {
  t: TFn;
  label: string;
  descKey: string;
  children: ReactNode;
}) {
  const descId = useId();
  return (
    <div className="odon-settings-row">
      <div className="odon-settings-row-text">
        <div className="odon-settings-row-label">{label}</div>
        <div className="odon-settings-row-desc" id={descId}>
          {t(descKey)}
        </div>
      </div>
      <div className="odon-settings-row-control" data-desc={descId}>
        {children}
      </div>
    </div>
  );
}

/** A labelled <select> control bound to a string-enum setting. */
function SelectRow<V extends string>({
  t,
  label,
  descKey,
  value,
  options,
  onChange,
}: {
  t: TFn;
  label: string;
  descKey: string;
  value: V;
  options: { value: V; labelKey: string }[];
  onChange: (value: V) => void;
}) {
  return (
    <SettingRow t={t} label={label} descKey={descKey}>
      <select
        className="odon-settings-select"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as V)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.labelKey)}
          </option>
        ))}
      </select>
    </SettingRow>
  );
}

/** A labelled on/off switch (accessible checkbox). */
function ToggleRow({
  t,
  label,
  descKey,
  checked,
  onChange,
}: {
  t: TFn;
  label: string;
  descKey: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <SettingRow t={t} label={label} descKey={descKey}>
      <label className="odon-settings-switch">
        <input
          type="checkbox"
          aria-label={label}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="odon-settings-switch-track" aria-hidden="true" />
      </label>
    </SettingRow>
  );
}

export const SETTINGS_TABS: SettingsTab[] = [
  {
    id: "general",
    titleKey: "settings.tab.general",
    render: ({ t, s }) => (
      <>
        <SelectRow<NumberingSystem>
          t={t}
          label={t("numbering.label")}
          descKey="settings.numbering.desc"
          value={s.numbering}
          options={NUMBERING_OPTIONS}
          onChange={s.onNumbering}
        />
        <SelectRow<Language>
          t={t}
          label={t("language.label")}
          descKey="settings.language.desc"
          value={s.language}
          options={LANGUAGE_OPTIONS}
          onChange={s.onLanguage}
        />
        <ToggleRow
          t={t}
          label={t("settings.theme.label")}
          descKey="settings.theme.desc"
          checked={s.isDark}
          onChange={() => s.onToggleDark()}
        />
        <ToggleRow
          t={t}
          label={t("settings.toothInfo")}
          descKey="settings.toothInfo.desc"
          checked={s.toothInfo}
          onChange={s.onToothInfo}
        />
        <div className="odon-settings-row odon-settings-row-disabled" aria-disabled="true">
          <div className="odon-settings-row-text">
            <div className="odon-settings-row-label">
              {t("settings.exportImport.title")}{" "}
              <span className="odon-settings-badge">{t("settings.comingSoon")}</span>
            </div>
            <div className="odon-settings-row-desc">{t("settings.exportImport.desc")}</div>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "toothDetails",
    titleKey: "settings.tab.toothDetails",
    render: ({ t, s }) => (
      <>
        <SelectRow<ToothDetailLevel>
          t={t}
          label={t("settings.wearDetail.label")}
          descKey="settings.wearDetail.desc"
          value={s.wearDetailLevel}
          options={TOOTH_DETAIL_OPTIONS}
          onChange={s.onWearDetailLevel}
        />
        <SelectRow<ToothDetailLevel>
          t={t}
          label={t("settings.discolorationDetail.label")}
          descKey="settings.discolorationDetail.desc"
          value={s.discolorationDetailLevel}
          options={TOOTH_DETAIL_OPTIONS}
          onChange={s.onDiscolorationDetailLevel}
        />
      </>
    ),
  },
  {
    id: "secondaryCaries",
    titleKey: "settings.tab.secondaryCaries",
    render: ({ t, s }) => (
      <SelectRow<SecondaryCariesMode>
        t={t}
        label={t("caries.secondaryLabel")}
        descKey="settings.secondaryCaries.desc"
        value={s.secondaryCariesMode}
        options={SECONDARY_OPTIONS}
        onChange={s.onSecondaryCariesMode}
      />
    ),
  },
  {
    id: "caries",
    titleKey: "settings.tab.caries",
    render: ({ t, s }) => (
      <>
        <ToggleRow
          t={t}
          label={t("icdas.enable")}
          descKey="settings.icdas.desc"
          checked={s.icdas}
          onChange={s.onIcdas}
        />
        <ToggleRow
          t={t}
          label={t("settings.cariesDepth.label")}
          descKey="settings.cariesDepth.desc"
          checked={s.cariesDepth}
          onChange={s.onCariesDepth}
        />
        <SelectRow<RootCariesMode>
          t={t}
          label={t("caries.rootLabel")}
          descKey="settings.rootCaries.desc"
          value={s.rootCariesMode}
          options={ROOT_OPTIONS}
          onChange={s.onRootCariesMode}
        />
        <SelectRow<RadiographicDepthMode>
          t={t}
          label={t("caries.radiographicLabel")}
          descKey="settings.radiographic.desc"
          value={s.radiographicDepthMode}
          options={RADIOGRAPHIC_OPTIONS}
          onChange={s.onRadiographicDepthMode}
        />
      </>
    ),
  },
  {
    id: "pulpa",
    titleKey: "settings.tab.pulpa",
    render: ({ t, s }) => (
      <SelectRow<PulpDetailLevel>
        t={t}
        label={t("pulp.level.label")}
        descKey="settings.pulpLevel.desc"
        value={s.pulpLevel}
        options={PULP_OPTIONS}
        onChange={s.onPulpLevel}
      />
    ),
  },
  {
    id: "notes",
    titleKey: "settings.tab.notes",
    render: ({ t, s }) => (
      <ToggleRow
        t={t}
        label={t("settings.notes")}
        descKey="settings.notes.desc"
        checked={s.notes}
        onChange={s.onNotes}
      />
    ),
  },
];

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Focus-trapped, ARIA-labelled settings dialog. Opened from the topbar gear.
 *
 * - `role="dialog"` + `aria-modal`, labelled by its title.
 * - Esc closes; backdrop click closes; focus is trapped inside while open and
 *   returned to the opener element on close.
 * - Content is driven by the declarative {@link SETTINGS_TABS} registry.
 */
export default function SettingsModal({
  open,
  onClose,
  t,
  settings,
}: {
  open: boolean;
  onClose: () => void;
  t: TFn;
  settings: SettingsState;
}) {
  const [activeTab, setActiveTab] = useState<string>(SETTINGS_TABS[0].id);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const tablistRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Capture the opener + move focus into the dialog when it opens; restore
  // focus to the opener when it closes/unmounts.
  useEffect(() => {
    if (!open) return;
    openerRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? dialog)?.focus();
    return () => {
      openerRef.current?.focus?.();
    };
  }, [open]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && active === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    },
    [onClose],
  );

  // FIX 2 (a11y): APG-tabs keyboard support on the tablist. With a roving
  // tabindex only the active tab is Tab-reachable, so without this handler the
  // other tabs are mouse-only. Arrow Left/Right (and Up/Down) move between tabs
  // wrapping; Home → first, End → last. Activation is automatic (moving focus
  // also selects), matching the existing click-to-activate model. `.focus()`
  // works regardless of the roving `tabIndex`, so the just-selected tab (whose
  // DOM node already exists — same stable id) is focused synchronously.
  const onTabListKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const nav = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"];
      if (!nav.includes(e.key)) return;
      e.preventDefault();
      const count = SETTINGS_TABS.length;
      if (count === 0) return;
      const cur = SETTINGS_TABS.findIndex((tab) => tab.id === activeTab);
      const idx = cur < 0 ? 0 : cur;
      let next = idx;
      if (e.key === "Home") next = 0;
      else if (e.key === "End") next = count - 1;
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (idx + 1) % count;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (idx - 1 + count) % count;
      const nextTab = SETTINGS_TABS[next];
      if (!nextTab) return;
      if (nextTab.id !== activeTab) setActiveTab(nextTab.id);
      tablistRef.current
        ?.querySelector<HTMLElement>(`#odon-settings-tab-${nextTab.id}`)
        ?.focus();
    },
    [activeTab],
  );

  if (!open) return null;

  const current = SETTINGS_TABS.find((tab) => tab.id === activeTab) ?? SETTINGS_TABS[0];

  return (
    <div
      className="odon-settings-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="odon-settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="odon-settings-header">
          <h2 className="odon-settings-title" id={titleId}>
            {t("settings.title")}
          </h2>
          <button
            type="button"
            className="odon-settings-close"
            onClick={onClose}
            aria-label={t("settings.close")}
            title={t("settings.close")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="odon-settings-body">
          <div
            ref={tablistRef}
            className="odon-settings-tabs"
            role="tablist"
            aria-label={t("settings.title")}
            onKeyDown={onTabListKeyDown}
          >
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`odon-settings-tab-${tab.id}`}
                aria-selected={tab.id === activeTab}
                aria-controls={`odon-settings-panel-${tab.id}`}
                tabIndex={tab.id === activeTab ? 0 : -1}
                className={
                  "odon-settings-tab" + (tab.id === activeTab ? " is-active" : "")
                }
                onClick={() => setActiveTab(tab.id)}
              >
                {t(tab.titleKey)}
              </button>
            ))}
          </div>
          <div
            className="odon-settings-panel"
            role="tabpanel"
            id={`odon-settings-panel-${current.id}`}
            aria-labelledby={`odon-settings-tab-${current.id}`}
          >
            {current.render({ t, s: settings })}
          </div>
        </div>
      </div>
    </div>
  );
}
