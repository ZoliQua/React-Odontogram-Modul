// Part of React Advanced Odontogram - https://github.com/ZoliQua/React-Odontogram-Modul
// Created by Zoltan Dul (https://github.com/ZoliQua) 2025-2026

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Language } from "./i18n/translations";
import type { NumberingSystem } from "./utils/numbering";
import type {
  PulpDetailLevel,
  SecondaryCariesMode,
  RootCariesMode,
  RadiographicDepthMode,
  ToothDetailLevel,
  SurfaceNotation,
  PerioViewMode,
  PerioRowId,
  PerioIndexNameMode,
  PdfSettings,
  PdfDateFormat,
  PdfToothSpacing,
  PdfBorderThickness,
  PdfToothNumberSize,
  PdfPerioLabelPlacement,
  PdfPerioFontSize,
  PdfSummaryGrouping,
} from "./odontogram";
import type { PdfColorTheme } from "./perioPdf";

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
  surfaceNotation: SurfaceNotation;
  onSurfaceNotation: (value: SurfaceNotation) => void;
  notes: boolean;
  onNotes: (value: boolean) => void;
  showStatusCard: boolean;
  onShowStatusCard: (value: boolean) => void;
  showOrthoCard: boolean;
  onShowOrthoCard: (value: boolean) => void;
  perioViewMode: PerioViewMode;
  onPerioViewMode: (value: PerioViewMode) => void;
  perioRowVisibility: Record<PerioRowId, boolean>;
  onPerioRowVisibility: (id: PerioRowId, visible: boolean) => void;
  perioIndexNameMode: PerioIndexNameMode;
  onPerioIndexNameMode: (value: PerioIndexNameMode) => void;
  pdfSettings: PdfSettings;
  onPdfSettings: (patch: Partial<PdfSettings>) => void;
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
  { value: "zh", labelKey: "language.zh" },
  { value: "ar", labelKey: "language.ar" },
  { value: "fr", labelKey: "language.fr" },
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

const SURFACE_NOTATION_OPTIONS: { value: SurfaceNotation; labelKey: string }[] = [
  { value: "full", labelKey: "settings.surfaceNotation.full" },
  { value: "simple", labelKey: "settings.surfaceNotation.simple" },
];

const PERIO_VIEW_MODE_OPTIONS: { value: PerioViewMode; labelKey: string }[] = [
  { value: "toggle", labelKey: "settings.perioViewMode.toggle" },
  { value: "popup", labelKey: "settings.perioViewMode.popup" },
];

const PERIO_INDEX_NAME_MODE_OPTIONS: { value: PerioIndexNameMode; labelKey: string }[] = [
  { value: "translated", labelKey: "settings.perioIndexNameMode.translated" },
  { value: "canonical", labelKey: "settings.perioIndexNameMode.canonical" },
];

/**
 * Declarative row-id groups for the Periodontal settings tab. Each group is a
 * sub-heading + the row ids it covers; a `ToggleRow` is rendered per id,
 * bound to `s.perioRowVisibility[id]` / `s.onPerioRowVisibility(id, v)`.
 */
const PERIO_ROW_GROUPS: { titleKey: string; ids: PerioRowId[] }[] = [
  { titleKey: "settings.perio.group.pocket", ids: ["pd", "gm", "cal", "bop"] },
  { titleKey: "settings.perio.group.hygiene", ids: ["plaque", "pi", "gi"] },
  { titleKey: "settings.perio.group.mucogingival", ids: ["cej", "rootConcavity", "kg", "gt"] },
  { titleKey: "settings.perio.group.support", ids: ["furcation", "mobility", "miller"] },
  { titleKey: "settings.perio.group.periimplant", ids: ["mpi", "mbi"] },
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
  disabled = false,
}: {
  t: TFn;
  label: string;
  descKey: string;
  value: V;
  options: { value: V; labelKey: string }[];
  onChange: (value: V) => void;
  disabled?: boolean;
}) {
  return (
    <SettingRow t={t} label={label} descKey={descKey}>
      <select
        className="odon-settings-select"
        aria-label={label}
        value={value}
        disabled={disabled}
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

/** A labelled free-text (or typed) input control bound to a string setting. */
function InputRow({
  t,
  label,
  descKey,
  value,
  type = "text",
  disabled,
  onChange,
}: {
  t: TFn;
  label: string;
  descKey: string;
  value: string;
  type?: "text" | "date" | "color";
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <SettingRow t={t} label={label} descKey={descKey}>
      <input
        className="odon-settings-input"
        type={type}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </SettingRow>
  );
}

/** A labelled multi-line text area bound to a string setting (with placeholder
 *  + disabled support — used for the editable disclaimer). */
function TextAreaRow({
  t,
  label,
  descKey,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  t: TFn;
  label: string;
  descKey: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <SettingRow t={t} label={label} descKey={descKey}>
      <textarea
        className="odon-settings-textarea"
        aria-label={label}
        rows={3}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </SettingRow>
  );
}

const PDF_DATE_FORMAT_OPTIONS: { value: PdfDateFormat; labelKey: string }[] = [
  { value: "iso", labelKey: "settings.pdf.dateFormat.iso" },
  { value: "dmy", labelKey: "settings.pdf.dateFormat.dmy" },
  { value: "mdy", labelKey: "settings.pdf.dateFormat.mdy" },
];
const PDF_COLOR_THEME_OPTIONS: { value: PdfColorTheme; labelKey: string }[] = [
  { value: "blue", labelKey: "settings.pdf.theme.blue" },
  { value: "teal", labelKey: "settings.pdf.theme.teal" },
  { value: "amber", labelKey: "settings.pdf.theme.amber" },
  { value: "slate", labelKey: "settings.pdf.theme.slate" },
];
const PDF_TOOTH_SPACING_OPTIONS: { value: PdfToothSpacing; labelKey: string }[] = [
  { value: "wide", labelKey: "settings.pdf.spacing.wide" },
  { value: "medium", labelKey: "settings.pdf.spacing.medium" },
  { value: "close", labelKey: "settings.pdf.spacing.close" },
];
const PDF_BORDER_THICKNESS_OPTIONS: { value: PdfBorderThickness; labelKey: string }[] = [
  { value: "thin", labelKey: "settings.pdf.thickness.thin" },
  { value: "medium", labelKey: "settings.pdf.thickness.medium" },
  { value: "thick", labelKey: "settings.pdf.thickness.thick" },
];
const PDF_TOOTH_NUMBER_SIZE_OPTIONS: { value: PdfToothNumberSize; labelKey: string }[] = [
  { value: "small", labelKey: "settings.pdf.numberSize.small" },
  { value: "normal", labelKey: "settings.pdf.numberSize.normal" },
  { value: "xlarge", labelKey: "settings.pdf.numberSize.xlarge" },
];
const PDF_SUMMARY_GROUPING_OPTIONS: { value: PdfSummaryGrouping; labelKey: string }[] = [
  { value: "whole", labelKey: "settings.pdf.summaryGrouping.whole" },
  { value: "jaw", labelKey: "settings.pdf.summaryGrouping.jaw" },
  { value: "quadrant", labelKey: "settings.pdf.summaryGrouping.quadrant" },
  { value: "sextant", labelKey: "settings.pdf.summaryGrouping.sextant" },
];
const PDF_PERIO_PLACEMENT_OPTIONS: { value: PdfPerioLabelPlacement; labelKey: string }[] = [
  { value: "center", labelKey: "settings.pdf.perioPlacement.center" },
  { value: "edge", labelKey: "settings.pdf.perioPlacement.edge" },
];
const PDF_PERIO_FONT_OPTIONS: { value: PdfPerioFontSize; labelKey: string }[] = [
  { value: "small", labelKey: "settings.pdf.perioFont.small" },
  { value: "normal", labelKey: "settings.pdf.perioFont.normal" },
  { value: "xlarge", labelKey: "settings.pdf.perioFont.xlarge" },
];

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
    id: "panels",
    titleKey: "settings.tab.panels",
    render: ({ t, s }) => (
      <>
        <ToggleRow
          t={t}
          label={t("settings.panels.statuses")}
          descKey="settings.panels.statuses.desc"
          checked={s.showStatusCard}
          onChange={s.onShowStatusCard}
        />
        <ToggleRow
          t={t}
          label={t("settings.panels.orthodontics")}
          descKey="settings.panels.orthodontics.desc"
          checked={s.showOrthoCard}
          onChange={s.onShowOrthoCard}
        />
        <SelectRow<PerioViewMode>
          t={t}
          label={t("settings.perioViewMode")}
          descKey="settings.perioViewMode.desc"
          value={s.perioViewMode}
          options={PERIO_VIEW_MODE_OPTIONS}
          onChange={s.onPerioViewMode}
        />
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
        <SelectRow<SurfaceNotation>
          t={t}
          label={t("settings.surfaceNotation.label")}
          descKey="settings.surfaceNotation.desc"
          value={s.surfaceNotation}
          options={SURFACE_NOTATION_OPTIONS}
          onChange={s.onSurfaceNotation}
        />
      </>
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
        <SelectRow<SecondaryCariesMode>
          t={t}
          label={t("caries.secondaryLabel")}
          descKey="settings.secondaryCaries.desc"
          value={s.secondaryCariesMode}
          options={SECONDARY_OPTIONS}
          onChange={s.onSecondaryCariesMode}
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
  {
    id: "periodontal",
    titleKey: "settings.tab.periodontal",
    render: ({ t, s }) => (
      <>
        {PERIO_ROW_GROUPS.map((group) => (
          <div key={group.titleKey}>
            <div className="odon-settings-group-title">{t(group.titleKey)}</div>
            {group.ids.map((id) => (
              <ToggleRow
                key={id}
                t={t}
                label={t(`settings.perio.row.${id}`)}
                descKey={`settings.perio.row.${id}.desc`}
                checked={s.perioRowVisibility[id]}
                onChange={(v) => s.onPerioRowVisibility(id, v)}
              />
            ))}
          </div>
        ))}
        <SelectRow<PerioIndexNameMode>
          t={t}
          label={t("settings.perioIndexNameMode")}
          descKey="settings.perioIndexNameMode.desc"
          value={s.perioIndexNameMode}
          options={PERIO_INDEX_NAME_MODE_OPTIONS}
          onChange={s.onPerioIndexNameMode}
        />
      </>
    ),
  },
  {
    id: "pdf",
    titleKey: "settings.tab.pdf",
    render: ({ t, s }) => (
      <>
        <InputRow
          t={t}
          label={t("settings.pdf.defaultName")}
          descKey="settings.pdf.defaultName.desc"
          value={s.pdfSettings.defaultName}
          onChange={(v) => s.onPdfSettings({ defaultName: v })}
        />
        <InputRow
          t={t}
          label={t("settings.pdf.defaultDob")}
          descKey="settings.pdf.defaultDob.desc"
          type="date"
          value={s.pdfSettings.defaultDob}
          onChange={(v) => s.onPdfSettings({ defaultDob: v })}
        />
        <ToggleRow
          t={t}
          label={t("settings.pdf.showAge")}
          descKey="settings.pdf.showAge.desc"
          checked={s.pdfSettings.showAge}
          onChange={(v) => s.onPdfSettings({ showAge: v })}
        />
        <SelectRow<PdfDateFormat>
          t={t}
          label={t("settings.pdf.dateFormat")}
          descKey="settings.pdf.dateFormat.desc"
          value={s.pdfSettings.dateFormat}
          options={PDF_DATE_FORMAT_OPTIONS}
          onChange={(v) => s.onPdfSettings({ dateFormat: v })}
        />
        <SelectRow<PdfColorTheme>
          t={t}
          label={t("settings.pdf.theme")}
          descKey="settings.pdf.theme.desc"
          value={s.pdfSettings.colorTheme}
          options={PDF_COLOR_THEME_OPTIONS}
          onChange={(v) => s.onPdfSettings({ colorTheme: v })}
        />

        <div className="odon-settings-group-title">{t("settings.pdf.section.odontogram")}</div>
        <ToggleRow
          t={t}
          label={t("settings.pdf.showBone")}
          descKey="settings.pdf.showBone.desc"
          checked={s.pdfSettings.showBone}
          onChange={(v) => s.onPdfSettings({ showBone: v })}
        />
        <ToggleRow
          t={t}
          label={t("settings.pdf.showHealthyPulp")}
          descKey="settings.pdf.showHealthyPulp.desc"
          checked={s.pdfSettings.showHealthyPulp}
          onChange={(v) => s.onPdfSettings({ showHealthyPulp: v })}
        />
        <SelectRow<PdfToothSpacing>
          t={t}
          label={t("settings.pdf.spacing")}
          descKey="settings.pdf.spacing.desc"
          value={s.pdfSettings.toothSpacing}
          options={PDF_TOOTH_SPACING_OPTIONS}
          onChange={(v) => s.onPdfSettings({ toothSpacing: v })}
        />
        <ToggleRow
          t={t}
          label={t("settings.pdf.border")}
          descKey="settings.pdf.border.desc"
          checked={s.pdfSettings.border}
          onChange={(v) => s.onPdfSettings({ border: v })}
        />
        <SelectRow<PdfBorderThickness>
          t={t}
          label={t("settings.pdf.borderThickness")}
          descKey="settings.pdf.borderThickness.desc"
          value={s.pdfSettings.borderThickness}
          options={PDF_BORDER_THICKNESS_OPTIONS}
          onChange={(v) => s.onPdfSettings({ borderThickness: v })}
          disabled={!s.pdfSettings.border}
        />
        <SelectRow<PdfToothNumberSize>
          t={t}
          label={t("settings.pdf.numberSize")}
          descKey="settings.pdf.numberSize.desc"
          value={s.pdfSettings.toothNumberSize}
          options={PDF_TOOTH_NUMBER_SIZE_OPTIONS}
          onChange={(v) => s.onPdfSettings({ toothNumberSize: v })}
        />
        <ToggleRow
          t={t}
          label={t("settings.pdf.includeText")}
          descKey="settings.pdf.includeText.desc"
          checked={s.pdfSettings.includeOdontogramText}
          onChange={(v) => s.onPdfSettings({ includeOdontogramText: v })}
        />
        <ToggleRow
          t={t}
          label={t("settings.pdf.includeTable")}
          descKey="settings.pdf.includeTable.desc"
          checked={s.pdfSettings.includeOdontogramTable}
          onChange={(v) => s.onPdfSettings({ includeOdontogramTable: v })}
        />
        <SelectRow<PdfSummaryGrouping>
          t={t}
          label={t("settings.pdf.summaryGrouping")}
          descKey="settings.pdf.summaryGrouping.desc"
          value={s.pdfSettings.summaryGrouping}
          options={PDF_SUMMARY_GROUPING_OPTIONS}
          onChange={(v) => s.onPdfSettings({ summaryGrouping: v })}
        />

        <div className="odon-settings-group-title">{t("settings.pdf.section.perio")}</div>
        <SelectRow<PdfToothSpacing>
          t={t}
          label={t("settings.pdf.perioSpacing")}
          descKey="settings.pdf.perioSpacing.desc"
          value={s.pdfSettings.perioToothSpacing}
          options={PDF_TOOTH_SPACING_OPTIONS}
          onChange={(v) => s.onPdfSettings({ perioToothSpacing: v })}
        />
        <ToggleRow
          t={t}
          label={t("settings.pdf.perioEmptyRows")}
          descKey="settings.pdf.perioEmptyRows.desc"
          checked={s.pdfSettings.perioShowEmptyRows}
          onChange={(v) => s.onPdfSettings({ perioShowEmptyRows: v })}
        />
        <SelectRow<PdfPerioLabelPlacement>
          t={t}
          label={t("settings.pdf.perioPlacement")}
          descKey="settings.pdf.perioPlacement.desc"
          value={s.pdfSettings.perioLabelPlacement}
          options={PDF_PERIO_PLACEMENT_OPTIONS}
          onChange={(v) => s.onPdfSettings({ perioLabelPlacement: v })}
        />
        <SelectRow<PdfPerioFontSize>
          t={t}
          label={t("settings.pdf.perioFont")}
          descKey="settings.pdf.perioFont.desc"
          value={s.pdfSettings.perioFontSize}
          options={PDF_PERIO_FONT_OPTIONS}
          onChange={(v) => s.onPdfSettings({ perioFontSize: v })}
        />
        <ToggleRow
          t={t}
          label={t("settings.pdf.includePerioTable")}
          descKey="settings.pdf.includePerioTable.desc"
          checked={s.pdfSettings.includePerioTable}
          onChange={(v) => s.onPdfSettings({ includePerioTable: v })}
        />
        <ToggleRow
          t={t}
          label={t("settings.pdf.includePerioAbbrev")}
          descKey="settings.pdf.includePerioAbbrev.desc"
          checked={s.pdfSettings.includePerioAbbrev}
          onChange={(v) => s.onPdfSettings({ includePerioAbbrev: v })}
        />

        <div className="odon-settings-group-title">{t("settings.pdf.section.footer")}</div>
        <ToggleRow
          t={t}
          label={t("settings.pdf.showDisclaimer")}
          descKey="settings.pdf.showDisclaimer.desc"
          checked={s.pdfSettings.showDisclaimer}
          onChange={(v) => s.onPdfSettings({ showDisclaimer: v })}
        />
        <TextAreaRow
          t={t}
          label={t("settings.pdf.disclaimerText")}
          descKey="settings.pdf.disclaimerText.desc"
          value={s.pdfSettings.disclaimerText}
          placeholder={t("pdf.disclaimer")}
          disabled={!s.pdfSettings.showDisclaimer}
          onChange={(v) => s.onPdfSettings({ disclaimerText: v })}
        />
        <ToggleRow
          t={t}
          label={t("settings.pdf.showGenerator")}
          descKey="settings.pdf.showGenerator.desc"
          checked={s.pdfSettings.showGenerator}
          onChange={(v) => s.onPdfSettings({ showGenerator: v })}
        />
      </>
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
