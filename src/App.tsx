import React, { useEffect } from "react";
import { initOdontogram } from "./odontogram";

export default function App(){
  useEffect(() => {
    initOdontogram();
  }, []);

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <div className="dot"></div>
          <div>
            <div className="title">Odontogram SVG Test UI v4</div>
            <div className="subtitle">Válassz fogat az odontogramon, majd állítsd be a rétegeket.</div>
          </div>
        </div>
        <div className="topbar-actions">
          <button id="btnStatusExport" className="btn btn-ghost btn-sm">Státusz export</button>
          <button id="btnStatusImport" className="btn btn-ghost btn-sm">Státusz import</button>
          <input id="statusImportInput" type="file" accept="application/json" hidden />
        </div>
      </header>

      <main className="layout">
        <section className="chart">
          <div className="chart-header">
            <div>
              <div className="chart-title">Fogászati státusz</div>
              <div className="chart-hint">Kattints egy fogra. Több fog kijelöléséhez a CMD/CTRL + kattintást válaszd.</div>
            </div>
            <div className="chart-actions">
              <button id="btnOcclView" className="btn btn-toggle btn-icon" aria-pressed="true" title="Occlusios nézet láthatósága" aria-label="Occlusios nézet láthatósága" data-icon-src="/svgs/icon_occl.svg" data-xline="1"></button>
              <button id="btnWisdomVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title="Bölcsességfogak láthatósága" aria-label="Bölcsességfogak láthatósága" data-icon-src="/svgs/icon_8.svg" data-xline="1"></button>
              <button id="btnBoneVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title="Csont láthatósága" aria-label="Csont láthatósága" data-icon-src="/svgs/icon_gum.svg" data-xline="1"></button>
              <button id="btnPulpVisible" className="btn btn-toggle btn-icon" aria-pressed="true" title="Pulpa láthatósága" aria-label="Pulpa láthatósága" data-icon-src="/svgs/icon_pulp.svg" data-xline="1"></button>
              <button id="btnSelectNoneChart" className="btn btn-ghost btn-icon" title="Kijelölés törlése" aria-label="Kijelölés törlése">
                <img className="icon-img" src="/svgs/icon_no_selection.svg" alt="" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div id="toothGrid" className="tooth-grid" aria-label="Tooth grid"></div>
        </section>
        <aside className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title-row">
                <span className="panel-title">Vezérlők</span>
                <div className="panel-title-actions">
                  <button id="btnSelectNone" className="btn btn-ghost btn-icon btn-danger" title="Kijelölés törlése" aria-label="Kijelölés törlése">Kijelölés törlése</button>
                  <button id="btnToggleControlsCard" className="icon-btn" title="Vezérlők összecsukása" aria-label="Vezérlők összecsukása">
                    <span className="toggle-icon" aria-hidden="true">−</span>
                  </button>
                </div>
              </div>
              <div className="panel-subtitle">Aktív fog: <span id="activeToothLabel" className="pill">—</span></div>
              <div id="controlsActions" className="panel-subtitle select-actions">
                <div className="select-actions-row">
                  <button id="btnSelectAll" className="btn btn-ghost btn-icon" title="Összes">Összes</button>
                  <button id="btnSelectAllPresent" className="btn btn-ghost btn-icon fade-toggle" title="Fogak">Fogak</button>
                  <button id="btnSelectPermanent" className="btn btn-ghost btn-icon fade-toggle" title="Maradók">Maradók</button>
                  <button id="btnSelectMilk" className="btn btn-ghost btn-icon fade-toggle" title="Tejfogak">Tejfogak</button>
                  <button id="btnSelectImplants" className="btn btn-ghost btn-icon fade-toggle" title="Implantok">Implantok</button>
                  <button id="btnSelectAllMissing" className="btn btn-ghost btn-icon fade-toggle" title="Hiányok">Hiányok</button>
                </div>
                <div className="select-actions-row">
                  <button id="btnSelectUpper" className="btn btn-ghost btn-icon" title="Felső">Felső</button>
                  <button id="btnSelectUpperFront" className="btn btn-ghost btn-icon" title="Felső 6 front">Felső 6 front</button>
                  <button id="btnSelectUpperMolar" className="btn btn-ghost btn-icon" title="Felső molár">Felső molár</button>
                  <button id="btnSelectLower" className="btn btn-ghost btn-icon" title="Alsó">Alsó</button>
                  <button id="btnSelectLowerFront" className="btn btn-ghost btn-icon" title="Alsó 6 front">Alsó 6 front</button>
                  <button id="btnSelectLowerMolar" className="btn btn-ghost btn-icon" title="Alsó molár">Alsó molár</button>
                </div>
              </div>
            </div>
            <div id="warnings" className="warnings"></div>
          </div>

          <div className="panel-body">
            <section className="card" id="statusCard">
              <div className="card-title card-title-row">
                <span>Státuszok</span>
                <button id="btnToggleStatusCard" className="icon-btn" title="Státuszok összecsukása" aria-label="Státuszok összecsukása">
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <div className="row status-actions" id="statusCardBody">
                <button id="btnResetAll" className="btn btn-ghost btn-sm">Szájüreg alaphelyzet</button>
                <button id="btnPrimaryDentition" className="btn btn-ghost btn-sm">Tejfogazat</button>
                <button id="btnMixedDentition" className="btn btn-ghost btn-sm">Vegyes fogazat</button>
                <button id="btnEdentulous" className="btn btn-toggle btn-sm" aria-pressed="false">Fogatlan szájüreg</button>
              </div>
              <div className="row status-extra-row">
                <span>Hozzáadás:</span>
                <select id="statusExtraSelect"></select>
                <button id="statusExtraApply" className="btn btn-ghost btn-sm">OK</button>
              </div>
            </section>

            <section className="card">
              <div className="card-title card-title-row">
                <span>Fog jellemzői</span>
                <button id="btnResetTooth" className="btn btn-ghost btn-sm" title="Fog alaphelyzetbe állítása" aria-label="Fog alaphelyzetbe állítása">Alaphelyzet</button>
              </div>
              <div className="row">
                <span>Alap</span>
                <select id="toothSelect"></select>
              </div>
              <div id="bridgeUnitRow" className="row">
                <span>Fogpótlás</span>
                <select id="bridgeUnitSelect"></select>
              </div>
              <label id="extractionRow" className="row">
                <input type="checkbox" id="extractionWound" />
                <span>friss extrakciós seb</span>
              </label>
              <div id="crownRow" className="row">
                <span>Korona</span>
                <select id="crownSelect"></select>
              </div>
              <div id="brokenCrownRow" className="row inline-checks contact-row">
                <label>
                  <input type="checkbox" id="brokenMesial" />
                  <span>mesial</span>
                </label>
                <label>
                  <input type="checkbox" id="brokenIncisal" />
                  <span>inicisal</span>
                </label>
                <label>
                  <input type="checkbox" id="brokenDistal" />
                  <span>distal</span>
                </label>
              </div>
              <div id="contactPointRow" className="row inline-checks contact-row">
                <label>
                  <input type="checkbox" id="contactMesial" />
                  <span>mesial kontakt hiány</span>
                </label>
                <label>
                  <input type="checkbox" id="contactDistal" />
                  <span>distal kontakt hiány</span>
                </label>
              </div>
              <div id="bruxismRow" className="row inline-checks bruxism-row">
                <label>
                  <input type="checkbox" id="bruxismWear" />
                  <span>Éli kopás</span>
                </label>
                <label>
                  <input type="checkbox" id="bruxismNeckWear" />
                  <span>Nyaki kopás</span>
                </label>
              </div>
              <div id="crownActionsRow" className="row inline-checks bridge-actions-row">
                <label id="bridgePillarRow" className="inline-check">
                  <input type="checkbox" id="bridgePillar" />
                  <span>Hídpillér</span>
                </label>
                <label id="extractionPlanRow" className="inline-check">
                  <input type="checkbox" id="extractionPlan" />
                  <span>Eltávolítandó</span>
                </label>
              </div>
            </section>

            <section id="cariesSection" className="card">
              <div className="card-title card-title-row">
                <span>Fogszuvasodás</span>
                <button id="btnToggleCariesCard" className="icon-btn" title="Fogszuvasodás összecsukása" aria-label="Fogszuvasodás összecsukása">
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <div className="hint">Jelöld ki a szuvasodás felületeit</div>
              <div id="cariesChecks" className="check-grid"></div>
            </section>

            <section id="fillingSection" className="card">
              <div className="card-title card-title-row">
                <span>Tömések és Konzerválás</span>
                <button id="btnToggleFillingCard" className="icon-btn" title="Tömések és Konzerválás összecsukása" aria-label="Tömések és Konzerválás összecsukása">
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <div className="row">
                <span>Típusa</span>
                <select id="fillingSelect"></select>
              </div>
              <div id="fillingSurfaceChecks" className="check-grid hidden"></div>
              <label id="fissureSealingRow" className="row fissure-row">
                <input type="checkbox" id="fissureSealing" />
                <span>Barázdazárt</span>
              </label>
            </section>

            <section id="endoSection" className="card">
              <div className="card-title card-title-row">
                <span>Foggyökér</span>
                <button id="btnToggleEndoCard" className="icon-btn" title="Foggyökér összecsukása" aria-label="Foggyökér összecsukása">
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <div className="hint">Jelöld ki a foggyökér állapotát</div>
              <div className="row">
                <select id="endoSelect"></select>
              </div>
              <div className="row inline-checks">
                <label>
                  <input type="checkbox" id="pulpInflam" />
                  <span>Pulpitis</span>
                </label>
                <label>
                  <input type="checkbox" id="endoResection" />
                  <span>Rezekált fog</span>
                </label>
              </div>
            </section>

            <section id="inflammationSection" className="card">
              <div className="card-title card-title-row">
                <span>Fogágy és Gyulladások</span>
                <button id="btnToggleInflammationCard" className="icon-btn" title="Fogágy és Gyulladások összecsukása" aria-label="Fogágy és Gyulladások összecsukása">
                  <span className="toggle-icon" aria-hidden="true">−</span>
                </button>
              </div>
              <div id="mobilityRow" className="row">
                <span>Mobilitás</span>
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
