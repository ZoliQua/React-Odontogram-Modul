// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { useEffect, useRef, useState } from "react";
import { destroyOdontogram, initOdontogram, setNumberingSystem, clearSelection, setOcclusalVisible, setWisdomVisible, setShowBase, setHealthyPulpVisible, registerPlugins, setPluginState, getPluginState, getToothStateSummary, getOdontogramSummary, formatToothLabel, onStateChange, setReadOnly, getReadOnly, setNotesEnabled, getNotesEnabled, setIcdasEnabled, getIcdasEnabled, setPulpDetailLevel, getPulpDetailLevel, setSecondaryCariesMode, getSecondaryCariesMode, setRootCariesMode, getRootCariesMode, setRadiographicDepthMode, getRadiographicDepthMode, setCariesDepthEnabled, getCariesDepthEnabled, setWearDetailLevel, getWearDetailLevel, setDiscolorationDetailLevel, getDiscolorationDetailLevel, setSurfaceNotation, getSurfaceNotation, exportFhir, exportImage, exportSvg, setImportFormat, openPerioOverlay, closePerioOverlay, isPerioOverlayOpen, getPerioViewMode, setPerioViewMode, getPerioRowVisibility, setPerioRowVisibility, getPerioIndexNameMode, setPerioIndexNameMode, getPdfSettings, setPdfSettings, isDualStateConfirmPending, acceptDualStateConfirm, cancelDualStateConfirm, hasAnyPerioData, getChartMode, setChartMode, getStatusChart, getPlanChart, setPlanChart, getPlanChanges, exportStatus, importStatus, exportPdf, exportPerioImage, exportPerioSvg } from "./odontogram";
export { clearSelection, setOcclusalVisible, setWisdomVisible, setShowBase, setHealthyPulpVisible, registerPlugins, setPluginState, getPluginState, getToothStateSummary, getOdontogramSummary, formatToothLabel, onStateChange, setReadOnly, getReadOnly, setNotesEnabled, getNotesEnabled, setIcdasEnabled, getIcdasEnabled, setPulpDetailLevel, getPulpDetailLevel, setSecondaryCariesMode, getSecondaryCariesMode, setRootCariesMode, getRootCariesMode, setRadiographicDepthMode, getRadiographicDepthMode, setCariesDepthEnabled, getCariesDepthEnabled, setWearDetailLevel, getWearDetailLevel, setDiscolorationDetailLevel, getDiscolorationDetailLevel, setSurfaceNotation, getSurfaceNotation, exportFhir, exportImage, exportSvg, setImportFormat, getPerioViewMode, setPerioViewMode, getPerioRowVisibility, setPerioRowVisibility, getPerioIndexNameMode, setPerioIndexNameMode, getPdfSettings, setPdfSettings, isDualStateConfirmPending, acceptDualStateConfirm, cancelDualStateConfirm, initOdontogram, destroyOdontogram, setNumberingSystem, getChartMode, setChartMode, getStatusChart, getPlanChart, setPlanChart, getPlanChanges, openPerioOverlay, closePerioOverlay, isPerioOverlayOpen, hasAnyPerioData, exportStatus, importStatus, exportPdf, exportPerioImage, exportPerioSvg };
export { default as PerioChart } from "./PerioChart";
import type { OdontogramSummary, PulpDetailLevel, SecondaryCariesMode, RootCariesMode, RadiographicDepthMode, ToothDetailLevel, SurfaceNotation, PerioViewMode, PerioRowId, PerioIndexNameMode } from "./odontogram";
export type { PulpDetailLevel, SecondaryCariesMode, RootCariesMode, RadiographicDepthMode, ToothDetailLevel, SurfaceNotation, PerioViewMode, PerioRowId, PerioIndexNameMode } from "./odontogram";
export type { OdontogramSummary, OdontogramSummarySection } from "./odontogram";
export type { FhirExportOptions } from "./fhir/types";
import { startIntroTour } from "./tour";
export { startIntroTour } from "./tour";
import { useI18n } from "./i18n/useI18n";
import SettingsModal, { type SettingsState } from "./SettingsModal";
import PerioChart from "./PerioChart";
import PerioSidebar from "./PerioSidebar";
import DualStateConfirm from "./DualStateConfirm";
import ExportOptionsModal from "./ExportOptionsModal";
import type { Language } from "./i18n/translations";
import type { NumberingSystem } from "./utils/numbering";
import { applyThemeConfig, type OdontogramThemeConfig } from "./theme";
export type { OdontogramThemeConfig };
import type { OdontogramPlugin, PluginLayer } from "./plugin";
export type { OdontogramPlugin, PluginLayer };
// Toolbar icons rendered as inline SVG (via `loadInlineIcon`, which parses the
// `data-icon-src` markup) are imported `?raw` so they inline into the JS bundle
// as strings — no runtime fetch. `iconNoSelectionUrl` is rendered as an
// `<img src>` instead, so it stays a URL import: the library build inlines this
// small asset as a self-contained `data:` URI (Vite `assetsInlineLimit`).
import icon8Svg from "./assets/icon-svgs/icon_8.svg?raw";
import iconGumSvg from "./assets/icon-svgs/icon_gum.svg?raw";
import iconNoSelectionUrl from "./assets/icon-svgs/icon_no_selection.svg";
import iconOcclSvg from "./assets/icon-svgs/icon_occl.svg?raw";
import iconPulpSvg from "./assets/icon-svgs/icon_pulp.svg?raw";
// Brand logo — `?inline` forces a base64 data URI so it is bundled into the
// library (self-contained, no runtime asset fetch), same guarantee as the
// ?raw-inlined SVGs above.
import brandLogoUrl from "./assets/react-module-logo.png?inline";

// Task 4 (Arabic+Chinese sub-project): languages whose native reading
// direction is right-to-left. Only Arabic today; Chinese (zh) is LTR.
// The shell root's `dir` is reactive to the active `lang` (never mutates
// `document.documentElement` — an embedding host page's direction is not
// ours to change), while the dental/perio charts stay pinned `dir="ltr"`
// (see `#toothGrid` below + the defensive CSS rule in `src/index.css`) since
// they are diagrams read 18->28 left-to-right in every locale.
const RTL_LANGUAGES: ReadonlySet<Language> = new Set(["ar"]);
function isRtl(lang: Language): boolean {
  return RTL_LANGUAGES.has(lang);
}

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
   * Surface-notation mode for caries/filling surface letters + captions:
   * `"full"` (default) makes them position-aware (incisal on an anterior
   * tooth, labial on an anterior buccal surface, palatal on an upper lingual
   * surface) or `"simple"` (always the tooth-independent B/O/L set).
   */
  surfaceNotation?: SurfaceNotation;
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
  { value: "zh", labelKey: "language.zh" },
  { value: "ar", labelKey: "language.ar" },
  { value: "fr", labelKey: "language.fr" },
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
  surfaceNotation,
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
  const [notation, setNotation] = useState<SurfaceNotation>(surfaceNotation ?? "full");
  const [toothInfoOn, setToothInfoOn] = useState<boolean>(true);
  const [showStatusCard, setShowStatusCard] = useState<boolean>(showStatusCardProp ?? true);
  const [showOrthoCard, setShowOrthoCard] = useState<boolean>(showOrthoCardProp ?? true);
  const [summary, setSummary] = useState<OdontogramSummary | null>(null);
  const [hasPerio, setHasPerio] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const importRef = useRef<HTMLDivElement | null>(null);
  // P2 Task 1: demo state mirroring the module-level perio-overlay flag
  // (odontogram.ts), kept in sync via the existing onStateChange subscription
  // below so a host that calls openPerioOverlay()/closePerioOverlay() directly
  // (bypassing this button entirely) still gets <PerioChart/> to re-render.
  const [perioOpen, setPerioOpen] = useState(false);
  // "Dental Chart" graphical redesign, Task 1: demo state mirroring the
  // module-level perioViewMode flag (odontogram.ts) — same precedent as
  // `perioOpen` above, kept in sync via onStateChange so a host calling
  // setPerioViewMode() directly (e.g. from the Settings modal) re-renders the
  // housing without a dedicated local setter. `activeView` is purely local UI
  // state (never exposed to a host) — which of the toggle's two segments is
  // showing, only meaningful while `viewMode === "toggle"`.
  const [viewMode, setViewMode] = useState<PerioViewMode>(() => getPerioViewMode());
  const [activeView, setActiveView] = useState<"odontogram" | "dentalChart">("odontogram");
  // UI-2 Task 1: mirror the two Settings -> Periodontal tab module flags into
  // React state, same precedent as `viewMode` mirroring `perioViewMode` above
  // — kept in sync via the shared `onStateChange` subscription so a host
  // calling the setters directly still re-renders the Settings modal.
  const [perioRowVisibility, setPerioRowVisibilityState] = useState<Record<PerioRowId, boolean>>(
    () => getPerioRowVisibility(),
  );
  const [perioIndexNameMode, setPerioIndexNameModeState] = useState<PerioIndexNameMode>(
    () => getPerioIndexNameMode(),
  );
  // 2.2.3: PDF export settings mirror (session-only module state).
  const [pdfSettings, setPdfSettingsState] = useState(() => getPdfSettings());
  // UI-1 Task 1: whether the perio (Dental Chart) view is the one currently
  // showing — ONLY true in toggle-mode dentalChart; popup mode never gates
  // the shared right panel this way (the popup itself renders <PerioSidebar/>
  // in its own body, see PerioChart.tsx). Drives which content the shared
  // right `<aside className="panel">` below renders.
  const isPerioView = viewMode === "toggle" && activeView === "dentalChart";
  // DS-1 Task 2: mirror the module-level "a status edit on a planned tooth is
  // awaiting confirmation" flag into React state via the existing onStateChange
  // subscription (requestDualStateConfirm / accept / cancel all notify), so the
  // blocking confirm dialog opens/closes regardless of which gated edit raised
  // it. Initialized false — a confirm can only be requested by a post-mount
  // edit, so there is never a pending confirm at mount.
  const [confirmOpen, setConfirmOpen] = useState(false);

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
  useEffect(() => { const v = surfaceNotation ?? "full"; setSurfaceNotation(v); setNotation(v); }, [surfaceNotation]);
  useEffect(() => { setShowStatusCard(showStatusCardProp ?? true); }, [showStatusCardProp]);
  useEffect(() => { setShowOrthoCard(showOrthoCardProp ?? true); }, [showOrthoCardProp]);

  // Refresh the tooth-information summary while its panel is open. Recomputes on
  // every state change, and when language/numbering change (which affect labels).
  useEffect(() => {
    if(!toothInfoOn) return;
    const refresh = () => {
      setSummary(getOdontogramSummary());
    };
    refresh();
    return onStateChange(refresh);
  }, [toothInfoOn, lang, currentNumbering]);

  // UI-3b: mirror perio-data presence into React state so the perio export
  // menu items' `disabled` gate stays live. Deliberately its OWN effect,
  // subscribed UNCONDITIONALLY (NOT gated by `toothInfoOn` like the summary
  // effect above) — the export gate must track charted perio data even when
  // the user has the Tooth-info panel turned off.
  useEffect(() => {
    const refresh = () => setHasPerio(hasAnyPerioData());
    refresh();
    return onStateChange(refresh);
  }, []);

  // P2 Task 1: mirror the module-level perio-overlay flag into React state via
  // the existing onStateChange subscription (openPerioOverlay/closePerioOverlay
  // both call notifyStateChange()), so <PerioChart/> re-renders regardless of
  // whether it was opened/closed via this button or a host calling the
  // imperative API directly.
  useEffect(() => {
    const refresh = () => setPerioOpen(isPerioOverlayOpen());
    refresh();
    return onStateChange(refresh);
  }, []);

  // "Dental Chart" graphical redesign, Task 1: mirror the module-level
  // perioViewMode flag into React state the same way perioOpen mirrors
  // isPerioOverlayOpen() above.
  useEffect(() => {
    const refresh = () => setViewMode(getPerioViewMode());
    refresh();
    return onStateChange(refresh);
  }, []);

  // UI-2 Task 1: mirror the module-level perioRowVisibility/perioIndexNameMode
  // flags into React state the same way perioViewMode is mirrored above.
  useEffect(() => {
    const refresh = () => {
      setPerioRowVisibilityState(getPerioRowVisibility());
      setPerioIndexNameModeState(getPerioIndexNameMode());
    };
    refresh();
    return onStateChange(refresh);
  }, []);

  // DS-1 Task 2: mirror the pending-confirm flag into React state. Subscribe
  // only (no initial read) — a confirm is only ever requested by a post-mount
  // edit, so `confirmOpen` starts false and this never calls the module during
  // the initial render.
  useEffect(() => {
    return onStateChange(() => setConfirmOpen(isDualStateConfirmPending()));
  }, []);

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
    surfaceNotation: notation,
    onSurfaceNotation: (v) => { setNotation(v); setSurfaceNotation(v); },
    notes: notesOn,
    onNotes: (v) => { setNotesOn(v); setNotesEnabled(v); },
    showStatusCard,
    onShowStatusCard: (v) => setShowStatusCard(v),
    showOrthoCard,
    onShowOrthoCard: (v) => setShowOrthoCard(v),
    perioViewMode: viewMode,
    onPerioViewMode: (v) => setPerioViewMode(v),
    perioRowVisibility,
    onPerioRowVisibility: (id, v) => setPerioRowVisibility(id, v),
    perioIndexNameMode,
    onPerioIndexNameMode: (v) => setPerioIndexNameMode(v),
    pdfSettings,
    onPdfSettings: (patch) => { setPdfSettings(patch); setPdfSettingsState(getPdfSettings()); },
  };

  return (
    <div ref={themeRootRef} className="odontogram-root" dir={isRtl(lang) ? "rtl" : "ltr"} lang={lang}>
      <header className="topbar">
        <div className="brand">
          <img className="brand-logo" src={brandLogoUrl} alt="" aria-hidden="true" />
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
          <button id="btnPerioSvgExport" hidden aria-hidden="true" tabIndex={-1}>{t("export.menu.perioSvg")}</button>
          <button id="btnPerioPngExport" hidden aria-hidden="true" tabIndex={-1}>{t("export.menu.perioPng")}</button>
          <button id="btnPerioJpgExport" hidden aria-hidden="true" tabIndex={-1}>{t("export.menu.perioJpg")}</button>
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
                <button className="dropdown-item" role="menuitem" disabled={!hasPerio}
                  onClick={() => { (document.getElementById("btnPerioSvgExport") as HTMLButtonElement | null)?.click(); setExportOpen(false); }}>{t("export.menu.perioSvg")}</button>
                <button className="dropdown-item" role="menuitem" disabled={!hasPerio}
                  onClick={() => { (document.getElementById("btnPerioPngExport") as HTMLButtonElement | null)?.click(); setExportOpen(false); }}>{t("export.menu.perioPng")}</button>
                <button className="dropdown-item" role="menuitem" disabled={!hasPerio}
                  onClick={() => { (document.getElementById("btnPerioJpgExport") as HTMLButtonElement | null)?.click(); setExportOpen(false); }}>{t("export.menu.perioJpg")}</button>
                <button className="dropdown-item" role="menuitem"
                  onClick={() => { setExportOpen(false); setPdfOpen(true); }}>{t("export.menu.pdf")}</button>
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
        <div className="perio-launch-bar">
          {viewMode === "toggle" ? (
            <div id="appViewToggle" className="chart-mode-toggle" role="tablist">
              <button
                id="appViewOdontogram"
                type="button"
                className={"chart-mode-btn" + (activeView === "odontogram" ? " is-active" : "")}
                role="tab"
                aria-selected={activeView === "odontogram"}
                onClick={() => setActiveView("odontogram")}
              >
                {t("view.odontogram")}
              </button>
              <button
                id="appViewDentalChart"
                type="button"
                className={"chart-mode-btn" + (activeView === "dentalChart" ? " is-active" : "")}
                role="tab"
                aria-selected={activeView === "dentalChart"}
                onClick={() => setActiveView("dentalChart")}
              >
                {t("view.dentalChart")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="openPerioOverlayBtn"
              className="btn btn-ghost"
              onClick={() => openPerioOverlay()}
              title={t("perio.open")}
              aria-label={t("perio.open")}
            >
              {t("perio.open")}
            </button>
          )}
        </div>
        <div
          className="chart-column"
          style={viewMode === "toggle" && activeView === "dentalChart" ? { display: "none" } : undefined}
        >
        <section className="chart">
          <div className="chart-header">
            <div>
              <div className="chart-title">{t("chart.title")}</div>
              <div className="chart-hint">{t("chart.hint")}</div>
            </div>
            <div id="chartModeToggle" className="chart-mode-toggle" role="tablist">
              <button id="chartModeStatus" type="button" className="chart-mode-btn is-active" role="tab" aria-selected="true">{t("chartMode.status")}</button>
              <button id="chartModePlan" type="button" className="chart-mode-btn" role="tab" aria-selected="false">{t("chartMode.plan")}</button>
              <span id="chartModePlanBadge" className="plan-badge hidden">{t("chartMode.planBadge")}</span>
            </div>
            {/* R2-C Task 2: "dashed = proposed" legend. Always rendered — its
                visibility is pure CSS, scoped by the `.chart.plan-mode
                #proposedLegend` descendant selector (src/index.css), which
                reuses the SAME `.plan-mode` cue the chart card already gets
                from the real, unchanged syncChartModeUi() in odontogram.ts.
                No new React state, no new engine call. */}
            <div id="proposedLegend" className="proposed-legend">
              <span className="proposed-legend-swatch" aria-hidden="true"></span>
              {t("chart.proposedLegend")}
            </div>
            <div className="chart-actions">
              <button id="btnOcclView" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.occlusal")} aria-label={t("chart.actions.occlusal")} data-icon-src={iconOcclSvg} data-xline="1"></button>
              <button id="btnWisdomVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.wisdom")} aria-label={t("chart.actions.wisdom")} data-icon-src={icon8Svg} data-xline="1"></button>
              <button id="btnBoneVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.bone")} aria-label={t("chart.actions.bone")} data-icon-src={iconGumSvg} data-xline="1"></button>
              <button id="btnPulpVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.pulp")} aria-label={t("chart.actions.pulp")} data-icon-src={iconPulpSvg} data-xline="1"></button>
              <button id="btnSelectNoneChart" className="btn btn-ghost btn-icon" title={t("chart.actions.clearSelection")} aria-label={t("chart.actions.clearSelection")}>
                <img className="icon-img" src={iconNoSelectionUrl} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div id="toothGrid" className="tooth-grid" dir="ltr" aria-label={t("chart.aria.toothGrid")}></div>
        </section>
        {toothInfoOn && summary && (
          <section className="tooth-info card" aria-label={t("toothInfo.title")}>
            <div className="card-title">{t("toothInfo.title")}</div>
            <p className="tooth-info-overview">{summary.overview}</p>
            {/* 2.2.3 (round 2): the grouped dentition table replaces the flat
                permanent/missing lists — one column per tooth category, one row
                per anatomical group (whole mouth / jaw / quadrant / sextant per
                the PDF summary-grouping setting). Tooth numbers are coloured by
                status (blue = has content, red+italic = has a problem). */}
            {summary.toothTable.rows.length > 0 && (
              <div className="tooth-info-table-wrap">
                <table className="tooth-info-table">
                  <thead>
                    <tr>
                      <th aria-hidden="true"></th>
                      {summary.toothTable.columns.map((c) => (
                        <th key={c.key} scope="col">{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.toothTable.rows.map((row) => (
                      <tr key={row.key}>
                        <th scope="row">{row.label}</th>
                        {summary.toothTable.columns.map((c) => {
                          const cells = row.cells[c.key] ?? [];
                          return (
                            <td key={c.key}>
                              {cells.map((cell, i) => (
                                <span key={cell.toothNo} className={`tooth-cell tooth-cell-${cell.status}`}>
                                  {cell.label}{i < cells.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="tooth-info-table-legend">{summary.toothTable.legend}</p>
              </div>
            )}
            {summary.individualNotes && (
              <div id="toothInfoNotes" className="tooth-info-notes">
                <span className="tooth-info-heading">{summary.individualNotes.heading}:</span>
                {summary.individualNotes.items.map((n, i) => (
                  <p key={i} className="tooth-info-note-item">
                    {n}
                  </p>
                ))}
              </div>
            )}
            {summary.sections.map((sec) => (
              <p key={sec.key} className="tooth-info-line">
                <span className="tooth-info-heading">{sec.heading}:</span>{" "}
                {sec.items.length
                  ? sec.items.join(", ")
                  : <span className="tooth-info-empty">{sec.emptyText}</span>}
              </p>
            ))}
            {summary.plannedChanges && summary.plannedChanges.length > 0 && (
              <div id="plannedChangesBox" className="planned-changes">
                <div className="tooth-info-heading">{t("toothInfo.plannedChanges")}</div>
                {summary.plannedChanges.map((c, i) => (
                  <p key={`${c.toothNo}-${c.axis}-${i}`} className="planned-changes-item">
                    {formatToothLabel(c.toothNo)}: {t(`planChange.axis.${c.axis}`)} {c.from} → {c.to}
                  </p>
                ))}
              </div>
            )}
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
        {viewMode === "toggle" && activeView === "dentalChart" && (
          <div className="dental-chart-column" dir="ltr">
            <PerioChart inline />
          </div>
        )}
        <aside className="panel">
          {/* Keep the odontogram control panel ALWAYS mounted, toggling only
              its visibility with CSS. Unmounting it on the perio toggle
              produced fresh DOM nodes whose one-time wireControls() listeners
              were never re-attached, silently breaking odontogram editing after
              a round-trip through Periodontal Status. PerioSidebar stays a
              plain conditional (mounted only in the perio view). */}
          {isPerioView && <PerioSidebar />}
          <div className="panel-odontogram-controls" style={isPerioView ? { display: "none" } : undefined}>
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
              <div id="fillingDefectSummary" className="hint hidden"></div>
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
                <div id="perioRow" className="perio-block">
                  <div className="perio-block-title">{t("perio.title")}</div>
                  <div id="perioGrid" className="perio-grid"></div>
                  <div id="perioReadout" className="hint perio-readout"></div>
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
          </div>
        </aside>
      </main>

      {viewMode === "popup" && <PerioChart open={perioOpen} onClose={closePerioOverlay} />}

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        t={t}
        settings={settingsState}
      />

      <DualStateConfirm
        open={confirmOpen}
        t={t}
        onAccept={acceptDualStateConfirm}
        onCancel={cancelDualStateConfirm}
      />

      <ExportOptionsModal
        open={pdfOpen}
        t={t}
        onClose={() => setPdfOpen(false)}
      />
    </div>
  );
}
