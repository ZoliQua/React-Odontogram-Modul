import { useEffect, useRef, useState } from "react";
import { destroyOdontogram, initOdontogram, setNumberingSystem, clearSelection, setOcclusalVisible, setWisdomVisible, setShowBase, setHealthyPulpVisible, registerPlugins, setPluginState, getPluginState, getToothStateSummary, getOdontogramSummary, onStateChange, setReadOnly, getReadOnly, setNotesEnabled, getNotesEnabled, setIcdasEnabled, getIcdasEnabled, setPulpDetailLevel, getPulpDetailLevel, setSecondaryCariesMode, getSecondaryCariesMode, setRootCariesMode, getRootCariesMode, setRadiographicDepthMode, getRadiographicDepthMode, setCariesDepthEnabled, getCariesDepthEnabled, setWearDetailLevel, getWearDetailLevel, setDiscolorationDetailLevel, getDiscolorationDetailLevel, exportFhir, exportImage, exportSvg, setImportFormat } from "./odontogram";
export { clearSelection, setOcclusalVisible, setWisdomVisible, setShowBase, setHealthyPulpVisible, registerPlugins, setPluginState, getPluginState, getToothStateSummary, getOdontogramSummary, onStateChange, setReadOnly, getReadOnly, setNotesEnabled, getNotesEnabled, setIcdasEnabled, getIcdasEnabled, setPulpDetailLevel, getPulpDetailLevel, setSecondaryCariesMode, getSecondaryCariesMode, setRootCariesMode, getRootCariesMode, setRadiographicDepthMode, getRadiographicDepthMode, setCariesDepthEnabled, getCariesDepthEnabled, setWearDetailLevel, getWearDetailLevel, setDiscolorationDetailLevel, getDiscolorationDetailLevel, exportFhir, exportImage, exportSvg, setImportFormat };
import type { OdontogramSummary, PulpDetailLevel, SecondaryCariesMode, RootCariesMode, RadiographicDepthMode, ToothDetailLevel } from "./odontogram";
export type { PulpDetailLevel, SecondaryCariesMode, RootCariesMode, RadiographicDepthMode, ToothDetailLevel } from "./odontogram";
export type { OdontogramSummary, OdontogramSummarySection } from "./odontogram";
export type { FhirExportOptions } from "./fhir/types";
import { startIntroTour } from "./tour";
export { startIntroTour } from "./tour";
import { useI18n } from "./i18n/useI18n";
import SettingsModal, { type SettingsState } from "./SettingsModal";
import type { Language } from "./i18n/translations";
import type { NumberingSystem } from "./utils/numbering";
import { applyThemeConfig, type OdontogramThemeConfig } from "./theme";
export type { OdontogramThemeConfig };
import type { OdontogramPlugin, PluginLayer } from "./plugin";
export type { OdontogramPlugin, PluginLayer };
import icon8Url from "./assets/icon-svgs/icon_8.svg";
import iconGumUrl from "./assets/icon-svgs/icon_gum.svg";
import iconNoSelectionUrl from "./assets/icon-svgs/icon_no_selection.svg";
import iconOcclUrl from "./assets/icon-svgs/icon_occl.svg";
import iconPulpUrl from "./assets/icon-svgs/icon_pulp.svg";

/**
 * Props for the main Odontogram application component.
 *
 * All props are optional — when omitted, the component operates in
 * **standalone** mode with internal state. When provided, the component
 * operates in **controlled** mode and delegates state to the parent.
 */
type AppProps = {
  /** Override the UI language (controlled mode). */
  language?: Language;
  /** Callback when the user changes the language. */
  onLanguageChange?: (lang: Language) => void;
  /** Override the tooth numbering system (controlled mode). */
  numberingSystem?: NumberingSystem;
  /** Callback when the user changes the numbering system. */
  onNumberingChange?: (system: NumberingSystem) => void;
  /** Override dark mode state (controlled mode). */
  darkMode?: boolean;
  /** Callback when the user toggles dark mode. */
  onDarkModeChange?: (dark: boolean) => void;
  /**
   * Custom theme configuration. Overrides the default color palette via
   * CSS custom properties (`--odon-*`). See {@link OdontogramThemeConfig}.
   */
  themeConfig?: OdontogramThemeConfig;
  /**
   * Custom SVG plugins for extending the odontogram with additional visual
   * overlays and per-tooth custom state. See {@link OdontogramPlugin}.
   */
  plugins?: OdontogramPlugin[];
  /**
   * When true, disables all interactions (click, touch, keyboard).
   * Useful for print/report/view modes.
   */
  readOnly?: boolean;
  /**
   * When true, enables per-tooth notes. Double-click a tooth to add/edit a note.
   * Notes are shown in hover tooltips and included in JSON export/import.
   */
  enableNotes?: boolean;
  /**
   * Enable ICDAS II per-surface caries scoring (0–6). When enabled, the depth
   * selector/popup expose ICDAS codes 1–6 and the surface indicator shows a
   * numeric badge; otherwise the 3-level scale is used.
   */
  enableIcdas?: boolean;
  /**
   * Pulp-diagnosis detail level for the pulp control:
   * `"simple"` (healthy / pulpitis), `"aae"` (4 AAE pulp diagnoses, default) or
   * `"latin"` (9 practical-Latin subtypes). A stored value round-trips at every
   * level; the level only governs how the pulp control presents it.
   */
  pulpDetailLevel?: PulpDetailLevel;
  /**
   * Secondary-caries (CARS) granularity for the per-surface score picker:
   * `"simple"` ([0,3]), `"standard"` ([0,1,3,6], default) or `"full"` ([0..6]).
   * A stored score round-trips at every mode; the mode only governs the offered
   * option list. (The mode UI lives in the Settings modal; this prop is the
   * controlled entry point.)
   */
  secondaryCariesMode?: SecondaryCariesMode;
  /**
   * Root-caries granularity for the per-tooth picker: `"simple"` (none /
   * present, default) or `"severity"` (the full none/active/arrested/
   * active-cavitated enum). Non-collapsing across modes.
   */
  rootCariesMode?: RootCariesMode;
  /**
   * Radiographic-depth granularity for the per-surface picker: `"off"`
   * (hidden, default), `"threeLevel"` (superficial/middle/deep) or `"detailed"`
   * (E1..D3). When off, the per-surface radiographic badge is not shown.
   */
  radiographicDepthMode?: RadiographicDepthMode;
  /**
   * Whether the visual caries-depth encoding (per-surface depth picker + the
   * opacity/contour depth tier in the render) is active. Default `true`; set
   * `false` to render caried surfaces at the SVG default with no depth tier.
   */
  cariesDepthEnabled?: boolean;
  /**
   * Detail level for the per-tooth wear control: `"simple"` (yes/no toggle for
   * attrition) or `"complex"` (wear type per edge and cervix, default).
   */
  wearDetailLevel?: ToothDetailLevel;
  /**
   * Detail level for the per-tooth discoloration control: `"simple"` (yes/no
   * toggle) or `"complex"` (choose the discoloration cause, default).
   */
  discolorationDetailLevel?: ToothDetailLevel;
  /**
   * Whether the Statuses panel (`#statusCard`) is shown. Default `true`. The
   * panel visibility is a settings-driven wrapper around the section — the
   * section's own imperative collapse/expand behavior is unaffected.
   */
  showStatusCard?: boolean;
  /**
   * Whether the Orthodontics panel (`#orthoCard`) is shown. Default `true`.
   * Composes with the panel's own imperative ortho-eligibility gate (hidden
   * when no selected tooth is ortho-eligible) — both must be satisfied for
   * the panel to render.
   */
  showOrthoCard?: boolean;
};

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

/**
 * Root React component for the Odontogram Editor.
 *
 * Renders the full dental chart UI: top bar with language/numbering/dark-mode
 * controls, the SVG tooth grid, and the right-hand control panel for setting
 * tooth states (caries, fillings, crowns, endo, inflammation, etc.).
 *
 * @example
 * ```tsx
 * // Standalone usage
 * <App />
 *
 * // Controlled by a host application
 * <App
 *   language="en"
 *   onLanguageChange={setLang}
 *   numberingSystem="FDI"
 *   onNumberingChange={setNumbering}
 *   darkMode={isDark}
 *   onDarkModeChange={setDark}
 * />
 * ```
 */
export default function App({
  language,
  onLanguageChange,
  numberingSystem,
  onNumberingChange,
  darkMode,
  onDarkModeChange,
  themeConfig,
  plugins,
  readOnly: readOnlyProp,
  enableNotes,
  enableIcdas,
  pulpDetailLevel,
  secondaryCariesMode,
  rootCariesMode,
  radiographicDepthMode,
  cariesDepthEnabled,
  wearDetailLevel,
  discolorationDetailLevel,
  showStatusCard: showStatusCardProp,
  showOrthoCard: showOrthoCardProp,
}: AppProps){
  const { lang, setLang, t } = useI18n({ language, onLanguageChange });
  const [internalNumbering, setInternalNumbering] = useState<NumberingSystem>(numberingSystem ?? "FDI");
  const themeRootRef = useRef<HTMLDivElement | null>(null);
  const currentNumbering = numberingSystem ?? internalNumbering;
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notesOn, setNotesOn] = useState<boolean>(enableNotes ?? false);
  const [icdasOn, setIcdasOn] = useState<boolean>(enableIcdas ?? false);
  const [pulpLevel, setPulpLevel] = useState<PulpDetailLevel>(pulpDetailLevel ?? "aae");
  const [secondaryMode, setSecondaryMode] = useState<SecondaryCariesMode>(secondaryCariesMode ?? "standard");
  const [rootMode, setRootMode] = useState<RootCariesMode>(rootCariesMode ?? "simple");
  const [radiographicMode, setRadiographicMode] = useState<RadiographicDepthMode>(radiographicDepthMode ?? "off");
  const [cariesDepthOn, setCariesDepthOn] = useState<boolean>(cariesDepthEnabled ?? true);
  const [wearLevel, setWearLevel] = useState<ToothDetailLevel>(wearDetailLevel ?? "complex");
  const [discoLevel, setDiscoLevel] = useState<ToothDetailLevel>(discolorationDetailLevel ?? "complex");
  const [toothInfoOn, setToothInfoOn] = useState<boolean>(true);
  const [showStatusCard, setShowStatusCard] = useState<boolean>(showStatusCardProp ?? true);
  const [showOrthoCard, setShowOrthoCard] = useState<boolean>(showOrthoCardProp ?? true);
  const [summary, setSummary] = useState<OdontogramSummary | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const importRef = useRef<HTMLDivElement | null>(null);

  // Dark mode: controlled via prop or standalone via internal state
  const [internalDark, setInternalDark] = useState<boolean>(() => {
    if (darkMode !== undefined) return darkMode;
    if (typeof document !== "undefined") return document.documentElement.classList.contains("dark");
    return false;
  });
  const isDark = darkMode !== undefined ? darkMode : internalDark;

  // Only manage the .dark class when standalone (no darkMode prop from parent)
  useEffect(() => {
    if (darkMode === undefined) {
      document.documentElement.classList.toggle("dark", isDark);
    }
  }, [isDark, darkMode]);

  const toggleDark = () => {
    const next = !isDark;
    if (darkMode !== undefined) {
      onDarkModeChange?.(next);
    } else {
      setInternalDark(next);
      onDarkModeChange?.(next);
    }
  };

  const setNumbering = (next: NumberingSystem) => {
    if(numberingSystem){
      onNumberingChange?.(next);
      return;
    }
    setInternalNumbering(next);
    onNumberingChange?.(next);
  };

  useEffect(() => {
    initOdontogram();
    return () => {
      destroyOdontogram();
    };
  }, []);

  useEffect(() => {
    setNumberingSystem(currentNumbering);
  }, [currentNumbering]);

  // Apply custom theme config as CSS custom properties
  useEffect(() => {
    applyThemeConfig(themeRootRef.current, themeConfig);
  }, [themeConfig]);

  // Register plugins when provided or changed
  useEffect(() => {
    registerPlugins(plugins ?? []);
  }, [plugins]);

  // Sync read-only mode
  useEffect(() => {
    setReadOnly(readOnlyProp ?? false);
  }, [readOnlyProp]);

  // Sync notes enabled
  useEffect(() => {
    setNotesEnabled(enableNotes ?? false);
    setNotesOn(enableNotes ?? false);
  }, [enableNotes]);

  // Sync ICDAS mode enabled
  useEffect(() => {
    setIcdasEnabled(enableIcdas ?? false);
    setIcdasOn(enableIcdas ?? false);
  }, [enableIcdas]);

  // Sync pulp-detail level (controlled prop -> engine + local segmented control)
  useEffect(() => {
    setPulpDetailLevel(pulpDetailLevel ?? "aae");
    setPulpLevel(pulpDetailLevel ?? "aae");
  }, [pulpDetailLevel]);

  // SP5 Task 5: sync the caries-granularity settings (controlled props -> engine).
  // The mode-picker UI itself lives in the Settings modal (Task 6); these props
  // are the controlled entry point so hosts (and tests) can drive the modes.
  useEffect(() => {
    const v = secondaryCariesMode ?? "standard";
    setSecondaryCariesMode(v);
    setSecondaryMode(v);
  }, [secondaryCariesMode]);
  useEffect(() => {
    const v = rootCariesMode ?? "simple";
    setRootCariesMode(v);
    setRootMode(v);
  }, [rootCariesMode]);
  useEffect(() => {
    const v = radiographicDepthMode ?? "off";
    setRadiographicDepthMode(v);
    setRadiographicMode(v);
  }, [radiographicDepthMode]);
  useEffect(() => {
    const v = cariesDepthEnabled ?? true;
    setCariesDepthEnabled(v);
    setCariesDepthOn(v);
  }, [cariesDepthEnabled]);
  useEffect(() => { const v = wearDetailLevel ?? "complex"; setWearDetailLevel(v); setWearLevel(v); }, [wearDetailLevel]);
  useEffect(() => { const v = discolorationDetailLevel ?? "complex"; setDiscolorationDetailLevel(v); setDiscoLevel(v); }, [discolorationDetailLevel]);
  useEffect(() => { setShowStatusCard(showStatusCardProp ?? true); }, [showStatusCardProp]);
  useEffect(() => { setShowOrthoCard(showOrthoCardProp ?? true); }, [showOrthoCardProp]);

  // Refresh the tooth-information summary while its panel is open. Recomputes on
  // every state change, and when language/numbering change (which affect labels).
  useEffect(() => {
    if(!toothInfoOn) return;
    const refresh = () => setSummary(getOdontogramSummary());
    refresh();
    return onStateChange(refresh);
  }, [toothInfoOn, lang, currentNumbering]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if(!languageRef.current?.contains(target)){
        setLanguageOpen(false);
      }
      if(!exportRef.current?.contains(target)){
        setExportOpen(false);
      }
      if(!importRef.current?.contains(target)){
        setImportOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Live settings surface for the tabbed Settings modal. Each handler updates
  // local React state AND calls the same module accessor the old dropdown did —
  // so the setting still does exactly what it did, only from a new location.
  const settingsState: SettingsState = {
    numbering: currentNumbering,
    onNumbering: setNumbering,
    language: lang,
    onLanguage: setLang,
    isDark,
    onToggleDark: toggleDark,
    toothInfo: toothInfoOn,
    onToothInfo: (v) => setToothInfoOn(v),
    secondaryCariesMode: secondaryMode,
    onSecondaryCariesMode: (v) => { setSecondaryMode(v); setSecondaryCariesMode(v); },
    icdas: icdasOn,
    onIcdas: (v) => { setIcdasOn(v); setIcdasEnabled(v); },
    cariesDepth: cariesDepthOn,
    onCariesDepth: (v) => { setCariesDepthOn(v); setCariesDepthEnabled(v); },
    rootCariesMode: rootMode,
    onRootCariesMode: (v) => { setRootMode(v); setRootCariesMode(v); },
    radiographicDepthMode: radiographicMode,
    onRadiographicDepthMode: (v) => { setRadiographicMode(v); setRadiographicDepthMode(v); },
    pulpLevel,
    onPulpLevel: (v) => { setPulpLevel(v); setPulpDetailLevel(v); },
    wearDetailLevel: wearLevel,
    onWearDetailLevel: (v) => { setWearLevel(v); setWearDetailLevel(v); },
    discolorationDetailLevel: discoLevel,
    onDiscolorationDetailLevel: (v) => { setDiscoLevel(v); setDiscolorationDetailLevel(v); },
    notes: notesOn,
    onNotes: (v) => { setNotesOn(v); setNotesEnabled(v); },
    showStatusCard,
    onShowStatusCard: (v) => setShowStatusCard(v),
    showOrthoCard,
    onShowOrthoCard: (v) => setShowOrthoCard(v),
  };

  return (
    <div ref={themeRootRef} className="odontogram-root">
      <header className="topbar">
        <div className="brand">
          <div className="dot"></div>
          <div>
            <div className="title">{t("app.title")}</div>
            <div className="subtitle">{`${t("app.subtitleLang")} ${t("app.subtitleNumbering." + currentNumbering)} ${t(isDark ? "app.subtitleMode.dark" : "app.subtitleMode.light")}`}</div>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="btn-theme" onClick={() => startIntroTour()} title={t("intro.start")} aria-label={t("intro.start")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          </button>
          <div className="topbar-group dropdown" ref={languageRef}>
            <button className="btn-theme" onClick={() => setLanguageOpen((open) => !open)} aria-haspopup="menu" aria-expanded={languageOpen} title={t("language.label")} aria-label={t("language.label")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
            </button>
            {languageOpen && (
              <div className="dropdown-menu" role="menu" aria-label={t("language.label")}>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className="dropdown-item"
                    role="menuitemradio"
                    aria-checked={lang === opt.value}
                    onClick={() => {
                      setLang(opt.value);
                      setLanguageOpen(false);
                    }}
                  >
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="btn-theme"
            onClick={toggleDark}
            title={isDark ? t("theme.light") : t("theme.dark")}
            aria-label={isDark ? t("theme.light") : t("theme.dark")}
          >
            {isDark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            )}
          </button>
          <div className="topbar-group">
            <button className="btn-theme" onClick={() => setSettingsOpen(true)} aria-haspopup="dialog" aria-expanded={settingsOpen} title={t("settings.title")} aria-label={t("settings.title")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
          </div>
          {/* Hidden export buttons kept for host capture + wireControls wiring */}
          <button id="btnStatusExport" hidden aria-hidden="true" tabIndex={-1}>{t("topbar.exportStatus")}</button>
          <button id="btnStatusFhirExport" hidden aria-hidden="true" tabIndex={-1}>{t("topbar.exportFhir")}</button>
          <button id="btnStatusPngExport" hidden aria-hidden="true" tabIndex={-1}>{t("topbar.exportPng")}</button>
          <button id="btnStatusJpgExport" hidden aria-hidden="true" tabIndex={-1}>{t("topbar.exportJpg")}</button>
          <button id="btnStatusSvgExport" hidden aria-hidden="true" tabIndex={-1}>{t("export.menu.svg")}</button>
          <div className="topbar-group dropdown" ref={exportRef}>
            <button id="btnExportMenu" className="btn-theme" onClick={() => setExportOpen((o) => !o)} aria-haspopup="menu" aria-expanded={exportOpen} title={t("topbar.export")} aria-label={t("topbar.export")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            </button>
            {exportOpen && (
              <div className="dropdown-menu" role="menu" aria-label={t("topbar.export")}>
                <button className="dropdown-item" role="menuitem" onClick={() => { (document.getElementById("btnStatusExport") as HTMLButtonElement | null)?.click(); setExportOpen(false); }}>{t("export.menu.statusJson")}</button>
                <button className="dropdown-item" role="menuitem" onClick={() => { (document.getElementById("btnStatusFhirExport") as HTMLButtonElement | null)?.click(); setExportOpen(false); }}>{t("export.menu.fhir")}</button>
                <button className="dropdown-item" role="menuitem" onClick={() => { (document.getElementById("btnStatusPngExport") as HTMLButtonElement | null)?.click(); setExportOpen(false); }}>{t("export.menu.png")}</button>
                <button className="dropdown-item" role="menuitem" onClick={() => { (document.getElementById("btnStatusJpgExport") as HTMLButtonElement | null)?.click(); setExportOpen(false); }}>{t("export.menu.jpg")}</button>
                <button className="dropdown-item" role="menuitem" onClick={() => { (document.getElementById("btnStatusSvgExport") as HTMLButtonElement | null)?.click(); setExportOpen(false); }}>{t("export.menu.svg")}</button>
              </div>
            )}
          </div>
          <button id="btnStatusImport" hidden aria-hidden="true" tabIndex={-1}>{t("topbar.importStatus")}</button>
          <div className="topbar-group dropdown" ref={importRef}>
            <button id="btnImportMenu" className="btn-theme" onClick={() => setImportOpen((o) => !o)} aria-haspopup="menu" aria-expanded={importOpen} title={t("topbar.import")} aria-label={t("topbar.import")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 8l5-5 5 5M12 3v12"/></svg>
            </button>
            {importOpen && (
              <div className="dropdown-menu" role="menu" aria-label={t("topbar.import")}>
                <button className="dropdown-item" role="menuitem" onClick={() => { setImportFormat("status"); (document.getElementById("btnStatusImport") as HTMLButtonElement | null)?.click(); setImportOpen(false); }}>{t("import.menu.statusJson")}</button>
                <button className="dropdown-item" role="menuitem" onClick={() => { setImportFormat("fhir"); (document.getElementById("btnStatusImport") as HTMLButtonElement | null)?.click(); setImportOpen(false); }}>{t("import.menu.fhir")}</button>
              </div>
            )}
          </div>
          <input id="statusImportInput" type="file" accept="application/json" hidden />
        </div>
      </header>

      <main className="layout">
        <div className="chart-column">
        <section className="chart">
          <div className="chart-header">
            <div>
              <div className="chart-title">{t("chart.title")}</div>
              <div className="chart-hint">{t("chart.hint")}</div>
            </div>
            <div className="chart-actions">
              <button id="btnOcclView" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.occlusal")} aria-label={t("chart.actions.occlusal")} data-icon-src={iconOcclUrl} data-xline="1"></button>
              <button id="btnWisdomVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.wisdom")} aria-label={t("chart.actions.wisdom")} data-icon-src={icon8Url} data-xline="1"></button>
              <button id="btnBoneVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.bone")} aria-label={t("chart.actions.bone")} data-icon-src={iconGumUrl} data-xline="1"></button>
              <button id="btnPulpVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.pulp")} aria-label={t("chart.actions.pulp")} data-icon-src={iconPulpUrl} data-xline="1"></button>
              <button id="btnSelectNoneChart" className="btn btn-ghost btn-icon" title={t("chart.actions.clearSelection")} aria-label={t("chart.actions.clearSelection")}>
                <img className="icon-img" src={iconNoSelectionUrl} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div id="toothGrid" className="tooth-grid" aria-label={t("chart.aria.toothGrid")}></div>
        </section>
        {toothInfoOn && summary && (
          <section className="tooth-info card" aria-label={t("toothInfo.title")}>
            <div className="card-title">{t("toothInfo.title")}</div>
            <p className="tooth-info-overview">{summary.overview}</p>
            {summary.permanentList && <p className="tooth-info-list">{summary.permanentList}</p>}
            {summary.missingList && <p className="tooth-info-list">{summary.missingList}</p>}
            {summary.sections.map((sec) => (
              <p key={sec.key} className="tooth-info-line">
                <span className="tooth-info-heading">{sec.heading}:</span>{" "}
                {sec.items.length
                  ? sec.items.join(", ")
                  : <span className="tooth-info-empty">{sec.emptyText}</span>}
              </p>
            ))}
            {summary.implants && (
              <p className="tooth-info-line">
                <span className="tooth-info-heading">{summary.implants.heading}:</span>{" "}
                {summary.implants.text}
              </p>
            )}
            <p className="tooth-info-line">
              <span className="tooth-info-heading">{summary.periodontalTitle}:</span>{" "}
              {summary.periodontalText}
            </p>
          </section>
        )}
        </div>
        <aside className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title-row">
                <span className="panel-title">{t("panel.controls")}</span>
                <div className="panel-title-actions">
                  <button id="btnSelectNone" className="btn btn-ghost btn-icon btn-danger" title={t("panel.clearSelection")} aria-label={t("panel.clearSelection")}>{t("panel.clearSelection")}</button>
                  <button id="btnToggleControlsCard" className="icon-btn" title={t("actions.collapse", { label: t("panel.controls") })} aria-label={t("actions.collapse", { label: t("panel.controls") })}>
                    <span className="toggle-icon" aria-hidden="true">−</span>
                  </button>
                </div>
              </div>
              <div className="panel-subtitle">{t("panel.activeTooth")}: <span id="activeToothLabel" className="pill">{t("selection.none")}</span></div>
              <div id="controlsActions" className="panel-subtitle select-actions">
                <div className="select-actions-row">
                  <button id="btnSelectAll" className="btn btn-ghost btn-icon" title={t("panel.selectActions.all")}>{t("panel.selectActions.all")}</button>
                  <button id="btnSelectAllPresent" className="btn btn-ghost btn-icon fade-toggle" title={t("panel.selectActions.present")}>{t("panel.selectActions.present")}</button>
                  <button id="btnSelectPermanent" className="btn btn-ghost btn-icon fade-toggle" title={t("panel.selectActions.permanent")}>{t("panel.selectActions.permanent")}</button>
                  <button id="btnSelectMilk" className="btn btn-ghost btn-icon fade-toggle" title={t("panel.selectActions.milk")}>{t("panel.selectActions.milk")}</button>
                  <button id="btnSelectImplants" className="btn btn-ghost btn-icon fade-toggle" title={t("panel.selectActions.implants")}>{t("panel.selectActions.implants")}</button>
                  <button id="btnSelectAllMissing" className="btn btn-ghost btn-icon fade-toggle" title={t("panel.selectActions.missing")}>{t("panel.selectActions.missing")}</button>
                </div>
                <div className="select-actions-row">
                  <button id="btnSelectUpper" className="btn btn-ghost btn-icon" title={t("panel.selectActions.upper")}>{t("panel.selectActions.upper")}</button>
                  <button id="btnSelectUpperFront" className="btn btn-ghost btn-icon" title={t("panel.selectActions.upperFront")}>{t("panel.selectActions.upperFront")}</button>
                  <button id="btnSelectUpperMolar" className="btn btn-ghost btn-icon" title={t("panel.selectActions.upperMolar")}>{t("panel.selectActions.upperMolar")}</button>
                  <button id="btnSelectLower" className="btn btn-ghost btn-icon" title={t("panel.selectActions.lower")}>{t("panel.selectActions.lower")}</button>
                  <button id="btnSelectLowerFront" className="btn btn-ghost btn-icon" title={t("panel.selectActions.lowerFront")}>{t("panel.selectActions.lowerFront")}</button>
                  <button id="btnSelectLowerMolar" className="btn btn-ghost btn-icon" title={t("panel.selectActions.lowerMolar")}>{t("panel.selectActions.lowerMolar")}</button>
                </div>
              </div>
            </div>
            <div id="warnings" className="warnings"></div>
          </div>

          <div className="panel-body">
            <div className={showStatusCard ? "" : "hidden"}>
              <section className="card" id="statusCard">
                <div className="card-title card-title-row">
                  <span>{t("status.title")}</span>
                  <button id="btnToggleStatusCard" className="icon-btn" title={t("actions.collapse", { label: t("status.title") })} aria-label={t("actions.collapse", { label: t("status.title") })}>
                    <span className="toggle-icon" aria-hidden="true">−</span>
                  </button>
                </div>
                <div className="row status-actions" id="statusCardBody">
                  <button id="btnResetAll" className="btn btn-ghost btn-sm">{t("status.resetAll")}</button>
                  <button id="btnPrimaryDentition" className="btn btn-ghost btn-sm">{t("status.primaryDentition")}</button>
                  <button id="btnMixedDentition" className="btn btn-ghost btn-sm">{t("status.mixedDentition")}</button>
                  <button id="btnEdentulous" className="btn btn-toggle btn-sm" aria-pressed="false">{t("status.edentulous")}</button>
                </div>
                <div className="row status-extra-row">
                  <span>{t("status.extraLabel")}</span>
                  <select id="statusExtraSelect"></select>
                  <button id="statusExtraApply" className="btn btn-ghost btn-sm">{t("status.extraApply")}</button>
                </div>
              </section>
            </div>

            <section className="card">
              <div className="card-title card-title-row">
                <span>{t("tooth.title")}</span>
                <button id="btnResetTooth" className="btn btn-ghost btn-sm" title={t("tooth.resetTitle")} aria-label={t("tooth.resetTitle")}>{t("tooth.reset")}</button>
              </div>
              <div className="row">
                <span>{t("tooth.baseLabel")}</span>
                <select id="toothSelect"></select>
              </div>
              <div id="substrateRow" className="row">
                <span>{t("substrate.label")}</span>
                <select id="substrateSelect"></select>
              </div>
              <label id="extractionRow" className="row">
                <input type="checkbox" id="extractionWound" />
                <span>{t("tooth.extractionWound")}</span>
              </label>
              <label id="missingClosedRow" className="row">
                <input type="checkbox" id="missingClosed" />
                <span>{t("tooth.missingClosed")}</span>
              </label>
              <div id="restorationRow" className="row">
                <span>{t("restoration.label")}</span>
                <select id="restorationSelect"></select>
              </div>
              <label id="crownLeakageRow" className="row hidden">
                <input type="checkbox" id="crownLeakage" />
                <span>{t("crownLeakage.label")}</span>
              </label>
              <div id="brokenCrownRow" className="row inline-checks contact-row">
                <label>
                  <input type="checkbox" id="brokenMesial" />
                  <span>{t("tooth.broken.mesial")}</span>
                </label>
                <label>
                  <input type="checkbox" id="brokenIncisal" />
                  <span>{t("tooth.broken.incisal")}</span>
                </label>
                <label>
                  <input type="checkbox" id="brokenDistal" />
                  <span>{t("tooth.broken.distal")}</span>
                </label>
              </div>
              <div id="contactPointRow" className="row inline-checks contact-row">
                <label>
                  <input type="checkbox" id="contactMesial" />
                  <span>{t("tooth.contact.mesialMissing")}</span>
                </label>
                <label>
                  <input type="checkbox" id="contactDistal" />
                  <span>{t("tooth.contact.distalMissing")}</span>
                </label>
              </div>
              <div id="bruxismRow" className="inline-checks bruxism-row wear-stack">
                <div id="wearEdgeRow" className="row">
                  <label id="wearEdgeSelectLabel"><span>{t("tooth.bruxism.edgeWear")}</span><select id="wearEdgeSelect"></select></label>
                  <label id="wearEdgeToggleLabel" className="inline-check hidden"><input type="checkbox" id="wearEdgeToggle" /><span>{t("tooth.bruxism.edgeWear")}</span></label>
                </div>
                <div id="wearCervicalRow" className="row">
                  <label id="wearCervicalSelectLabel"><span>{t("tooth.bruxism.neckWear")}</span><select id="wearCervicalSelect"></select></label>
                  <label id="wearCervicalToggleLabel" className="inline-check hidden"><input type="checkbox" id="wearCervicalToggle" /><span>{t("tooth.bruxism.neckWear")}</span></label>
                </div>
              </div>
              <div id="discolorationRow" className="row inline-checks">
                <label id="discolorationSelectLabel"><span>{t("discoloration.label")}</span><select id="discolorationSelect"></select></label>
                <label id="discolorationToggleLabel" className="inline-check hidden"><input type="checkbox" id="discolorationToggle" /><span>{t("discoloration.label")}</span></label>
              </div>
              <div id="crownActionsRow" className="row inline-checks bridge-actions-row">
                <label id="bridgePillarRow" className="inline-check">
                  <input type="checkbox" id="bridgePillar" />
                  <span>{t("tooth.bridgePillar")}</span>
                </label>
                <label id="extractionPlanRow" className="inline-check">
                  <input type="checkbox" id="extractionPlan" />
                  <span>{t("tooth.extractionPlan")}</span>
                </label>
              </div>
              <label id="crownReplaceRow" className="row">
                <input type="checkbox" id="crownReplace" />
                <span>{t("tooth.crownReplace")}</span>
              </label>
              <label id="crownNeededRow" className="row">
                <input type="checkbox" id="crownNeeded" />
                <span>{t("tooth.crownNeeded")}</span>
              </label>
            </section>

            <div className={showOrthoCard ? "" : "hidden"}>
              <section id="orthoCard" className="card">
                <div className="card-title card-title-row">
                  <span>{t("toothInfo.orthodontics")}</span>
                </div>
                <div id="orthoApplianceRow" className="row">
                  <span>{t("ortho.appliance.label")}</span>
                  <select id="orthoApplianceSelect"></select>
                </div>
                <div id="orthoDriftRow" className="row">
                  <span>{t("ortho.drift.label")}</span>
                  <select id="orthoDriftSelect"></select>
                </div>
                <div id="orthoVerticalRow" className="row">
                  <span>{t("ortho.vertical.label")}</span>
                  <select id="orthoVerticalSelect"></select>
                </div>
                <label id="orthoRotationRow" className="row inline-check">
                  <input type="checkbox" id="orthoRotationToggle" />
                  <span>{t("ortho.rotation.label")}</span>
                </label>
              </section>
            </div>

            <section id="cariesSection" className="card">
              <div className="card-title card-title-row">
                <span>{t("caries.title")}</span>
                <button id="btnToggleCariesCard" className="icon-btn" title={t("actions.collapse", { label: t("caries.title") })} aria-label={t("actions.collapse", { label: t("caries.title") })}>
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <div className="hint">{t("caries.hint")}</div>
              <div id="cariesDepthRow" className="row">
                <span>{t("caries.depthLabel")}</span>
                <select id="cariesDepthSelect"></select>
              </div>
              <div id="cariesChecks"></div>
              <div id="cariesSubcrownRow" className="check-grid subcrown-row"></div>
              <div id="rootCariesRow" className="row">
                <span>{t("caries.rootLabel")}</span>
                <select id="rootCariesSelect"></select>
              </div>
            </section>

            <section id="fillingSection" className="card">
              <div className="card-title card-title-row">
                <span>{t("filling.title")}</span>
                <button id="btnToggleFillingCard" className="icon-btn" title={t("actions.collapse", { label: t("filling.title") })} aria-label={t("actions.collapse", { label: t("filling.title") })}>
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <div className="row">
                <span>{t("filling.typeLabel")}</span>
                <select id="fillingSelect"></select>
              </div>
              <div id="fillingSurfaceChecks" className="hidden"></div>
              <label id="fissureSealingRow" className="row fissure-row">
                <input type="checkbox" id="fissureSealing" />
                <span>{t("filling.fissureSealing")}</span>
              </label>
              <div id="fillingSubcariesSummary" className="hint hidden"></div>
            </section>

            <section id="rootPeriodontiumSection" className="card">
              <div className="card-title card-title-row">
                <span>{t("card.rootPeriodontium")}</span>
                <button id="btnToggleRootPeriodontiumCard" className="icon-btn" title={t("actions.collapse", { label: t("card.rootPeriodontium") })} aria-label={t("actions.collapse", { label: t("card.rootPeriodontium") })}>
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>

              <div id="rpRootBlock">
                <div className="hint">{t("endo.hint")}</div>
                <div id="pulpEndoRow" className="row">
                  <span>{t("pulpEndo.label")}</span>
                  <select id="pulpEndoSelect"></select>
                </div>
                <div id="apicalDxRow" className="row">
                  <span>{t("apical.dxLabel")}</span>
                  <select id="apicalDxSelect"></select>
                </div>
                <div id="periapicalTypeRow" className="row hidden">
                  <span>{t("periapical.typeLabel")}</span>
                  <select id="periapicalTypeSelect"></select>
                </div>
                <div id="resorptionRow" className="row">
                  <span>{t("root.resorption")}</span>
                  <select id="resorptionSelect"></select>
                </div>
                <div className="row inline-checks">
                  <label>
                    <input type="checkbox" id="endoResection" />
                    <span>{t("endo.resection")}</span>
                  </label>
                  <label>
                    <input type="checkbox" id="parapulpalPin" />
                    <span>{t("endo.parapulpalPin")}</span>
                  </label>
                </div>
              </div>

              <div id="rpPerioBlock">
                <div id="mobilityRow" className="row">
                  <span>{t("inflammation.mobilityLabel")}</span>
                  <select id="mobilitySelect"></select>
                </div>
                <div id="modsChecks" className="check-grid"></div>
                <div id="calculusRow" className="row inline-checks hidden">
                  <label><input type="checkbox" id="calculusToggle" /><span>{t("calculus.label")}</span></label>
                </div>
                <div id="periImplantRow" className="row hidden">
                  <span>{t("periImplant.label")}</span>
                  <select id="periImplantSelect"></select>
                </div>
              </div>
            </section>

          </div>
        </aside>
      </main>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        t={t}
        settings={settingsState}
      />
    </div>
  );
}
