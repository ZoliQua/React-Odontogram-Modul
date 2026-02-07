import React, { useEffect, useRef, useState } from "react";
import { initOdontogram, setNumberingSystem } from "./odontogram";
import { useI18n } from "./i18n/useI18n";
import type { Language } from "./i18n/translations";
import type { NumberingSystem } from "./utils/numbering";

type AppProps = {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  numberingSystem?: NumberingSystem;
  onNumberingChange?: (system: NumberingSystem) => void;
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
];

export default function App({
  language,
  onLanguageChange,
  numberingSystem,
  onNumberingChange,
}: AppProps){
  const { lang, setLang, t } = useI18n({ language, onLanguageChange });
  const [internalNumbering, setInternalNumbering] = useState<NumberingSystem>(numberingSystem ?? "FDI");
  const currentNumbering = numberingSystem ?? internalNumbering;
  const [languageOpen, setLanguageOpen] = useState(false);
  const [numberingOpen, setNumberingOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement | null>(null);
  const numberingRef = useRef<HTMLDivElement | null>(null);

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
  }, []);

  useEffect(() => {
    setNumberingSystem(currentNumbering);
  }, [currentNumbering]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if(!languageRef.current?.contains(target)){
        setLanguageOpen(false);
      }
      if(!numberingRef.current?.contains(target)){
        setNumberingOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const numberingLabelKey = currentNumbering === "FDI"
    ? "numbering.fdi"
    : currentNumbering === "UNIVERSAL"
      ? "numbering.universal"
      : "numbering.palmer";

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <div className="dot"></div>
          <div>
            <div className="title">{t("app.title")}</div>
            <div className="subtitle">{t("app.subtitle")}</div>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="topbar-group dropdown" ref={languageRef}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setLanguageOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={languageOpen}
            >
              {t("language.label")}: {t(LANGUAGE_OPTIONS.find((opt) => opt.value === lang)?.labelKey ?? "language.hu")}
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
          <div className="topbar-group dropdown" ref={numberingRef}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setNumberingOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={numberingOpen}
            >
              {t("numbering.label")}: {t(numberingLabelKey)}
            </button>
            {numberingOpen && (
              <div className="dropdown-menu" role="menu" aria-label={t("numbering.label")}>
                {NUMBERING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={"dropdown-item"}
                    role="menuitemradio"
                    aria-checked={currentNumbering === opt.value}
                    onClick={() => {
                      setNumbering(opt.value);
                      setNumberingOpen(false);
                    }}
                  >
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button id="btnStatusExport" className="btn btn-ghost btn-sm">{t("topbar.exportStatus")}</button>
          <button id="btnStatusImport" className="btn btn-ghost btn-sm">{t("topbar.importStatus")}</button>
          <input id="statusImportInput" type="file" accept="application/json" hidden />
        </div>
      </header>

      <main className="layout">
        <section className="chart">
          <div className="chart-header">
            <div>
              <div className="chart-title">{t("chart.title")}</div>
              <div className="chart-hint">{t("chart.hint")}</div>
            </div>
            <div className="chart-actions">
              <button id="btnOcclView" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.occlusal")} aria-label={t("chart.actions.occlusal")} data-icon-src="/svgs/icon_occl.svg" data-xline="1"></button>
              <button id="btnWisdomVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.wisdom")} aria-label={t("chart.actions.wisdom")} data-icon-src="/svgs/icon_8.svg" data-xline="1"></button>
              <button id="btnBoneVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.bone")} aria-label={t("chart.actions.bone")} data-icon-src="/svgs/icon_gum.svg" data-xline="1"></button>
              <button id="btnPulpVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title={t("chart.actions.pulp")} aria-label={t("chart.actions.pulp")} data-icon-src="/svgs/icon_pulp.svg" data-xline="1"></button>
              <button id="btnSelectNoneChart" className="btn btn-ghost btn-icon" title={t("chart.actions.clearSelection")} aria-label={t("chart.actions.clearSelection")}>
                <img className="icon-img" src="/svgs/icon_no_selection.svg" alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div id="toothGrid" className="tooth-grid" aria-label={t("chart.aria.toothGrid")}></div>
        </section>
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

            <section className="card">
              <div className="card-title card-title-row">
                <span>{t("tooth.title")}</span>
                <button id="btnResetTooth" className="btn btn-ghost btn-sm" title={t("tooth.resetTitle")} aria-label={t("tooth.resetTitle")}>{t("tooth.reset")}</button>
              </div>
              <div className="row">
                <span>{t("tooth.baseLabel")}</span>
                <select id="toothSelect"></select>
              </div>
              <div id="bridgeUnitRow" className="row">
                <span>{t("tooth.bridgeLabel")}</span>
                <select id="bridgeUnitSelect"></select>
              </div>
              <label id="extractionRow" className="row">
                <input type="checkbox" id="extractionWound" />
                <span>{t("tooth.extractionWound")}</span>
              </label>
              <div id="crownRow" className="row">
                <span>{t("tooth.crownLabel")}</span>
                <select id="crownSelect"></select>
              </div>
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
              <div id="bruxismRow" className="row inline-checks bruxism-row">
                <label>
                  <input type="checkbox" id="bruxismWear" />
                  <span>{t("tooth.bruxism.edgeWear")}</span>
                </label>
                <label>
                  <input type="checkbox" id="bruxismNeckWear" />
                  <span>{t("tooth.bruxism.neckWear")}</span>
                </label>
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
            </section>

            <section id="cariesSection" className="card">
              <div className="card-title card-title-row">
                <span>{t("caries.title")}</span>
                <button id="btnToggleCariesCard" className="icon-btn" title={t("actions.collapse", { label: t("caries.title") })} aria-label={t("actions.collapse", { label: t("caries.title") })}>
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <div className="hint">{t("caries.hint")}</div>
              <div id="cariesChecks" className="check-grid"></div>
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
              <div id="fillingSurfaceChecks" className="check-grid hidden"></div>
              <label id="fissureSealingRow" className="row fissure-row">
                <input type="checkbox" id="fissureSealing" />
                <span>{t("filling.fissureSealing")}</span>
              </label>
            </section>

            <section id="endoSection" className="card">
              <div className="card-title card-title-row">
                <span>{t("endo.title")}</span>
                <button id="btnToggleEndoCard" className="icon-btn" title={t("actions.collapse", { label: t("endo.title") })} aria-label={t("actions.collapse", { label: t("endo.title") })}>
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <div className="hint">{t("endo.hint")}</div>
              <div className="row">
                <select id="endoSelect"></select>
              </div>
              <div className="row inline-checks">
                <label>
                  <input type="checkbox" id="pulpInflam" />
                  <span>{t("endo.pulpitis")}</span>
                </label>
                <label>
                  <input type="checkbox" id="endoResection" />
                  <span>{t("endo.resection")}</span>
                </label>
              </div>
            </section>

            <section id="inflammationSection" className="card">
              <div className="card-title card-title-row">
                <span>{t("inflammation.title")}</span>
                <button id="btnToggleInflammationCard" className="icon-btn" title={t("actions.collapse", { label: t("inflammation.title") })} aria-label={t("actions.collapse", { label: t("inflammation.title") })}>
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <div id="mobilityRow" className="row">
                <span>{t("inflammation.mobilityLabel")}</span>
                <select id="mobilitySelect"></select>
              </div>
              <div id="modsChecks" className="check-grid"></div>
            </section>

          </div>
        </aside>
      </main>
    </>
  );
}
