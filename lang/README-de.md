# 🦷 React Odontogram Modul

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-1.30.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](../README.md#-english) | 🇪🇸 [Español](../README.md#-español) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md)

---

## 🇩🇪 Deutsch

*(Deutsche Version des README — übersetzt aus der englischen Ausgangsversion, Stand v1.30.0)*

### 📋 Übersicht
Dieses Projekt ist ein interaktiver, browserbasierter Odontogramm-Editor, der eine schnelle Zahnstatuserfassung mit einer übersichtlichen Benutzeroberfläche unterstützt. Es rendert geschichtete SVG-Zahnvorlagen zur Darstellung von Restaurationen, Karies, endodontischem Status, Mobilität und anderen klinischen Details, und bietet Mehrfachauswahl, Auswahlfilter und vordefinierte Statusvorlagen.

---
<img width="1728" height="869" alt="react-odontogram-modul-german-preview" src="https://github.com/user-attachments/assets/ea3844c7-62a7-4dfc-bb71-755f9f3f7d07" />

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### ✨ Hauptmerkmale
- 🖱️ Schnelle Auswahl und Mehrfachauswahl (CMD/CTRL + Klick)
- 🦷 Zahntypen: bleibend, Milchzahn, Implantat, subgingival, fehlend
- 🦷 Zahnsubstrat (unabhängig von jeder Restauration): natürlich, Radix (Wurzelrest), frakturiert, für Krone präpariert
- 👑 Restaurationen nach Typ × Material: Krone / Inlay / Onlay / Veneer / Brücke in e.max, Gold, Gradia, Zirkon, Metall, Metallkeramik, Teleskop oder provisorisch (Onlay nur okklusale Ansicht) — Auswahl über einen einzigen kombinierten „Fix: Krone – …"-Picker mit wenigen Klicks; bestehende `metal`-Kronen migrieren zu `metal-ceramic` (Metallkeramik); Implantate verwenden dasselbe Typ-×-Material-Modell, kombiniert mit einer Implantat-Verbinder-Ebene. Der Picker ist nach Zahnart gestaffelt: ein Implantat bietet nur Krone/Brücke (plus die fünf Attachment-Optionen weiter unten); ein fehlender/Lücken-Zahn bietet nur ein Brückenglied (plus herausnehmbare Teil-/Vollprothese); ein `radix`-Substrat blendet die Restaurationssteuerung vollständig aus (an einem Wurzelrest kann keine Restauration angelegt werden)
- 🦿 Herausnehmbare/Abutment-Prothetik auf der eigenen `prosthesis`-Achse („Kivehető:"-Einträge im kombinierten Picker): Implantat-Heilabutment, Locator, Locator mit Suprakonstruktion, Steg, Steg mit Suprakonstruktion; zahngetragene herausnehmbare Teil- oder Vollprothese
- 🌉 Brückenzähne rendern sowohl die Kronenkappe als auch den Sattel-Verbinder; ein Mehrzahn-Brückenspann-Overlay rendert einen durchgehenden, bogenbewussten Verbinder über aufeinanderfolgende Brückenzähne (Glieder + Pfeiler) sowie die dazwischenliegenden Zahnzwischenräume (Ober- und Unterkiefer verwenden gespiegelte Sattelgeometrie, sodass der Verbinder auf beiden Bögen ausgerichtet bleibt), im PNG/JPG/SVG-Export enthalten; das Anwenden einer Brücke über eine Statusvorlage berechnet das Overlay sofort neu
- 🔍 Karieskartierung auf 6 Flächen: mesial, distal, bukkal, lingual, okklusal, subkronal
- 🪥 Füllungsmaterialien pro Fläche: Amalgam, Komposit, GIZ, provisorisch
- 🏥 Ein zusammengeführter „Pulpa-/Endo-Status"-Auswähler (gruppiert: vitale Pulpa vs. behandelt/endodontisch): endodontische Zustände (medikamentöse Füllung, Wurzelfüllung, inkomplette Wurzelfüllung, Glasfaserstift, Metallstift) und die AAE-Pulpadiagnose (`pulpDx`: normal / reversible / irreversible Pulpitis / Nekrose) schließen sich gegenseitig aus — ein wurzelbehandelter Zahn (`endo` gesetzt) kann nicht gleichzeitig eine vitale Pulpadiagnose tragen; bei einer Behandlung wird `pulpDx` auf `normal` normalisiert und das Glyph für die erkrankte Pulpa unterdrückt. Reversible Pulpitis rendert ein reduziertes Pulpa-Glyph. Eine optionale 3-stufige Pulpa-Detailstufe (`pulpDetailLevel`: simple / AAE / praktisches Latein) zeigt über `pulpLatin` 9 praktische lateinische Pulpa-Subtypen an (pulpa sana … gangraena pulpae); Resektion und parapulpaler Stift bleiben eigenständige Sonderindikatoren
- 🦴 Apikale Diagnose (`apicalDx`: symptomatische/asymptomatische apikale Parodontitis, akuter/chronischer apikaler Abszess, kondensierende Osteitis) steuert direkt den periapikalen Glyphen; ein Granulom-/Zysten-Läsionssubtyp-Qualifikator wird nur unter symptomatischer/asymptomatischer apikaler Parodontitis angezeigt (der redundante „Abszess"-Subtyp wurde entfernt — er ist bereits durch die apikale Diagnose abgedeckt)
- 🩹 Zusammengeführte Karte „Wurzel und Parodontium" (ein einzelner ausklappbarer Abschnitt für Wurzel-/periapikale und parodontale Befunde)
- ⚕️ Modifikationen: periapikale Entzündung (nur bei fehlenden/Extraktionsalveolen-Zähnen angezeigt; bei vorhandenen Zähnen ausgeblendet, wo `apicalDx` allein den periapikalen Glyphen steuert, sowie bei Implantaten, wo `periImplant` dies übernimmt), Parodontalerkrankung, Mobilitätsgrade (M1/M2/M3, bei Implantaten ausgeblendet)
- 🦷🔩 Periimplantärer Status (`periImplant`: `none` / `mucositis` / `peri-implantitis-mild` / `peri-implantitis-moderate` / `peri-implantitis-severe`) — Staging nach dem World Workshop 2018, angezeigt als eigener Auswähler bei Implantaten; Mukositis verwendet das parodontale Zahnfleisch-Glyph weiter, Periimplantitis fügt eine abgestufte `peri-implant-bone-loss`-Ebene hinzu (Deckkraft 0,4/0,7/1,0). Implantate rendern das periapikale Läsions-Glyph nicht mehr — ihre Entzündung wird stattdessen über diese Achse ausgedrückt — und die parodontalen Modifikator-Checkboxen sind bei Implantaten ausgeblendet (die behelfsmäßige Umbenennung der „Periimplantitis"-Checkbox entfällt)
- 🏷️ Spezielle Indikatoren: Krone erforderlich, Kronenwechsel erforderlich, geschlossene Lücke nach Extraktion, Extraktionsplan, Fissurenversiegelung, Kontaktpunktverlust
- 👁️ Okklusionsansicht, Weisheitszähne, Knochen- und Pulpa-Sichtbarkeit umschaltbar
- 🔢 12 Auswahlfilter (alle, vorhandene, bleibende, Milch, Implantate, fehlende, Ober-/Unterkiefer, Front/Molaren)
- 📊 Vordefinierte Statusvorlagen (Zurücksetzen, Milchgebiss, Wechselgebiss, zahnlos)
- 📦 34 vordefinierte Restaurationsvorlagen (Brücken, herausnehmbare Prothesen, Stegprothesen mit Implantaten)
- 💾 Status-Export/Import in JSON (Version 2.10; Importe akzeptieren weiterhin die Legacy-Versionen 1.4, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8 und 2.9 und werden automatisch migriert, mit Plugin Custom States und per-Zahn Notizen)
- 🔗 HL7 FHIR R4 Export (Collection-Bundle aus Observations pro Zahn, ISO 3950 Zahnkodierung für das bleibende Gebiss, lokales Codesystem — SNOMED-CT-Mapping geplant)
- ✚ Kreuz-/Plus-Oberflächenauswahl (B/M/O/D/L) für Karies und Füllungen
- 🧱 Füllungsmaterialien pro Fläche (gemischte Füllungen, z. B. bukkal Amalgam + distal Komposit)
- 🖼️ PNG/JPG/SVG-Bildexport des Befunds (herunterladbar; PNG/JPG aus Vektor-SVG gerastert)
- 🦷 Karies/Sekundärkaries als Zustandsautomat pro Fläche: eine kariöse Fläche ohne Füllung wird als primäre Karies dargestellt (ICDAS-gestufte Deckkraft); sobald diese Fläche eine Füllung hat, wird sie stattdessen als Sekundärkaries (rezidivierende Karies) dargestellt (`subcaries-{surface}`-Ebene, CARS-bewertet) — beide sind nie gleichzeitig auf derselben Fläche aktiv
- 🎯 Vereinheitlichter Schweregrad pro Fläche (`cariesSeverity`, 0–6, ersetzt die früheren getrennten ICDAS-Tiefe- und CARS-Felder): wird auf einer primären Fläche als ICDAS-Tiefe gelesen, auf einer rezidivierenden Fläche als benannter CARS-Score (Gesund … Ausgedehnte Kavität), über ein kontextabhängiges Popup, das jeweils nur die zum aktuellen Zustand der Fläche passende Skala zeigt
- 🌱 Wurzelkaries (`rootCaries`: none / active / arrested / active-cavitated), steuert die dedizierte Wurzelkaries-Bildebene mit einer vom Schweregrad abhängigen Deckkraft (active 0,5 / arrested 0,7 / active-cavitated volle Deckkraft)
- 📡 Radiologische Kariestiefe (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 pro Fläche), unabhängig von der visuellen ICDAS-/CARS-Schweregradskala, dargestellt als Badge und über eine eigene FHIR-Observation rückführbar
- 🎚️ Drei Karies-Granularitätseinstellungen (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) sowie ein `cariesDepthEnabled`-Umschalter, die jede Skala auf eine einfachere Auswahlansicht reduzieren, ohne den gespeicherten Wert zu verlieren
- 🩹 Sekundärkaries-Zusammenfassung im Füllungspanel: eine Zeile unterhalb der Füllungssteuerung listet jeden ausgewählten Zahn mit Sekundärkaries samt Flächen auf (z. B. „36 (O) hat Sekundärkaries an der Füllung.")
- 🪛 Füllungsdefekte pro Fläche (`fillingDefect`: none / marginal / fracture / wear) an direkten Restaurationen, unabhängig von Sekundärkaries — erfasst über einen Flächenindikator auf der Füllungskarte (analog zum Kariestiefe-Indikator, die Optionsliste vertikal gestapelt), auf dem Befund dargestellt und im Tooltip sowie in der Ganzmund-Füllungszusammenfassung mit einer expliziten Beschriftung angezeigt (z. B. „36 (O) – Füllungsdefekt: O: marginal"), auf dieselbe Weise, wie Sekundärkaries in der Kariologie-Zeile beschriftet wird; die Füllungskarte zeigt außerdem einen Hinweis für jeden ausgewählten Zahn mit erfasstem Füllungsdefekt (z. B. „36 hat einen erfassten Füllungsdefekt."), parallel zum bestehenden Sekundärkaries-Hinweis
- 🦷💥 Zahnabrieb typisiert nach klinischer Ursache und Lokalisation (`wearEdge`: none / attrition / erosion, inzisal/okklusal; `wearCervical`: none / abrasion / abfraction / erosion, zervikal) — ersetzt die beiden Ein-/Aus-Bruxismus-Abrieb-Flags; erfasst über zwei Dropdowns in der Abrieb-Zeile, verwendet die bestehende Abrieb-Grafik weiter und wird im Tooltip sowie in einem neuen Ganzmund-Zusammenfassungsabschnitt „Abrieb" angezeigt
- 🎨 Zahnverfärbung nach Ursache (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) bei bleibenden und Milchzähnen — färbt die dargestellte natürliche Zahnkrone in einer repräsentativen Farbe ein, wenn der Zahn keine Restauration und natürliches Substrat hat; wird im Tooltip und in einem neuen Ganzmund-Zusammenfassungsabschnitt „Verfärbung" angezeigt; vervollständigt zusammen mit Füllungsdefekten und Abrieb den Satz an Oberflächen- und Strukturbefunden
- ✏️ Frontzähne (Schneide- und Eckzähne) beschriften ihre Kaufläche in der gesamten Oberfläche (Auswahl, Popup, Zusammenfassungen) als „inzisal"; der gespeicherte Flächenschlüssel bleibt `occlusal`
- 🔤 Positionsbewusste Flächenbezeichnung (Einstellungen → Zahndetails → „Flächenbezeichnung", einfach/vollständig, Standard vollständig): im vollständigen Modus folgen der Kariologie-/Füllungs-Flächenbuchstabe und die -bezeichnung der Zahnanatomie — okklusal → I/inzisal bei Frontzähnen, bukkal → L/labial bei Frontzähnen, lingual → P/palatinal bei Oberkieferzähnen und L/lingual bei Unterkieferzähnen (mesial/distal/subkronal sind nicht betroffen); der einfache Modus verwendet immer den generischen B/M/O/D/L/SC-Satz unabhängig von der Zahnposition. Gilt für die Ganzmund-Zusammenfassung sowie für die Kariologie- und Füllungsdefekt-Flächenauswähler (Buchstabe + Beschriftung); der gespeicherte Flächenschlüssel bleibt unverändert
- 🦷↕️ Kieferorthopädische Erfassung pro Zahn (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: boolean) an einem vorhandenen natürlichen Zahn (bleibend oder Milchzahn) — verwendet die seit v2.5.0 ungenutzte KFO-Grafik weiter (keine neue SVG); wird auf dem Befund, im Tooltip und in einem neuen Ganzmund-Zusammenfassungsabschnitt „Kieferorthopädie" angezeigt
- 🪨 Zahnstein sowie Wurzelresorption, typisiert als intern oder extern-zervikal (`resorptionType`)
- 📏 Kariestiefe pro Fläche (oberflächlich / Dentin / tief), oder optionales ICDAS-II-Scoring (0–6) via `enableIcdas`
- 🩹 Kronenrand-Undichtigkeits-Umschalter, nur sichtbar bei Kronen- oder Brückenrestauration
- 🧰 Vereinheitlichte Topbar-Icon-Leiste mit einem tabbasierten Einstellungsdialog (Allgemein / Panels / Zahndetails / Karies / Pulpa / Notizen — Nummerierung, Notizen, Panel-Sichtbarkeit, ICDAS, Kariestiefe-Umschalter, Wurzel-/Radiologische-Karies-Granularität, Pulpa-Detailstufe, Zahnabrieb-/Verfärbungs-Detailstufe, Zahninformationen)
- 🗂️ Einstellungen → Tab „Panels": Ganzmund-Zusammenfassungspanels für Status und Kieferorthopädie unabhängig ein-/ausblenden
- 🩹 Die Sekundärkaries-(CARS-)Einstellungen wurden in den Karies-Tab der Einstellungen zusammengeführt, oberhalb der radiologischen Tiefe positioniert (der separate „Sekundärkaries"-Tab entfällt)
- 🎚️ Zahndetails-Detailstufe (Einstellungen → Zahndetails): eine einfache/komplexe Einstellung für Zahnabrieb und für Verfärbung. Der einfache Modus zeigt pro Befund einen Ja/Nein-Umschalter (Abrieb an → Attrition/Abrasion, Verfärbung an → Sonstige); der komplexe Modus (Standard) behält die Typ-/Ursache-Dropdowns bei, und der gespeicherte Wert bleibt beim Wechsel der Stufe erhalten
- 📋 Zahninformationen-Panel: textuelle Live-Zusammenfassung des gesamten Befunds (Zahnzahlen, vorhandene/fehlende Zähne, Karies inkl. Sekundärkaries, Füllungen, Wurzelbehandlungen, Zahnersatz, Implantate, Parodontalstatus) — standardmäßig sichtbar, in den Einstellungen umschaltbar
- 🗂️ Konsolidiertes Export-Dropdown (Status JSON / FHIR / PNG / JPG)
- 📥 Import-Dropdown mit FHIR-Import (liest exportierte Bundles zurück)
- ⏳ Fortschrittsanzeige beim Bildexport
- 🎓 12-stufige interaktive Einführungstour
- 🔢 Drei Nummerierungssysteme (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) mit Sprachumschalter (190+ Übersetzungsschlüssel pro Sprache)
- 🌗 Dunkler Modus mit Umschalt-Button (eigenständig oder von der übergeordneten App gesteuert)
- 🎨 Benutzerdefinierte Theme-Konfiguration (`themeConfig`-Prop) mit CSS Custom Properties (`--odon-*`)
- 📱 Mobile Touch-UX: Tap-to-Zoom-Popover, Langes-Drücken-Kontextmenü, Pinch-to-Zoom, WCAG 44px Berührungsziele, Kieferbogen-Umschalter
- 🔌 Benutzerdefiniertes SVG-Plugin-System: visuelle Overlays, per-Zahn Custom State, JSON Export/Import-Unterstützung
- ⚠️ Statusvalidierung mit Warnungen bei inkompatiblen Zahnzustandskombinationen
- 🏷️ Automatische Status-Tooltips auf Zahnkacheln (zeigt alle aktiven Zustände)
- 🩺 Modernisierter Tooltip pro Zahn und Ganzmund-Zusammenfassungspanel: beide zeigen den vollständigen Satz klinischer Befunde (Pulpa-/apikale Diagnose + Läsionssubtyp, Wurzelresorption, periimplantärer Status, abgestufte Wurzelkaries, Zahnstein, Kronenrand-Undichtigkeit, Fraktur, Kontaktverlust, typisierter Kanten-/Zervikalabrieb), mit einem eigenen Abschnitt „Diagnosen" im Panel, einem eigenen Abschnitt „Abrieb" und einem groben Kariesschweregrad-Qualifikator (oberflächlich/mäßig/tief)
- ♿ Tastaturzugänglichkeit (WCAG): ARIA listbox/option Rollen, Enter/Leertaste Auswahl, Pfeiltasten-Navigation, focus-visible Umrisse
- 🔒 Schreibgeschützter Modus: alle Interaktionen deaktivieren für Druck-/Berichtsansichten
- ✨ Auswahl-Animationen: pulsierende gestrichelte Umrandung und leuchtender Schatten auf ausgewählten Zähnen (mit Unterstützung für prefers-reduced-motion)
- 📝 Per-Zahn Notizen: Doppelklick zum Hinzufügen/Bearbeiten, Notiz-Symbol neben der Zahnnummer, Hover-Tooltip mit Notiztext, JSON Export/Import
- 🧪 864 automatisierte Tests bestanden (1 zusätzlicher Test übersprungen) (Vitest) in 94 Testdateien für Nummerierung, Übersetzungen, Vorlagen, i18n, App-Komponente, Theme, Touch, Plugins, Barrierefreiheit sowie Parität der klinischen Diagnose-Achsen
- 📖 TypeDoc API-Dokumentation mit JSDoc-Kommentaren für alle öffentlichen Exporte (`npm run docs`)

### 📦 Module
- 🦷 Odontogramm-Raster und Zahngitter-UI
- 🎛️ Steuerung und Statuspanel
- 🎨 SVG-Schichtungsmotor und Vorlagen
- 🔢 Zahnnummerierung und Beschriftung (FDI/Universal/Palmer)
- 🌐 Lokalisierung (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- 💾 Status-Export/Import
- 📋 Status-Extras: vordefinierte Restaurationsvorlagen
- 🎨 Theme-Konfiguration: anpassbare Farbpalette über `--odon-*` CSS-Eigenschaften
- 📱 Mobile Touch-Interaktionen (Tap-to-Zoom, Langes Drücken, Pinch-to-Zoom, Kieferbogen-Umschalter)
- 🔌 Benutzerdefiniertes SVG-Plugin-System
- ⚠️ Statusvalidierung und Tooltip-System
- ♿ Tastaturzugänglichkeit und ARIA-Unterstützung
- 🔒 Schreibgeschützter Modus
- ✨ Auswahl-Animationen
- 📝 Per-Zahn Notizen
- 🧪 Automatisierte Testsuite (Vitest + Testing Library)

### 🛠️ UI-Steuerung

**🔝 Kopfleiste:**
- Sprachumschalter (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR Dropdown)
- Dunkelmodus-Umschalter (Sonnen-/Mond-Symbol, wechselt zwischen hellem und dunklem Thema)
- Nummerierungssystem-Umschalter (FDI/Universal/Palmer Dropdown)
- Status exportieren / Status importieren Buttons

**📊 Diagramm-Kopfzeile:**
- Okklusionsansicht-Umschalter
- Weisheitszahn-Sichtbarkeit-Umschalter
- Knochen-Sichtbarkeit-Umschalter
- Pulpa-Sichtbarkeit-Umschalter
- Auswahl löschen Button

**🔍 Auswahlfilter:**
- Alle auswählen / Alle vorhandenen / Bleibende / Milch / Implantate / Alle fehlenden
- Oberkiefer / Oberkiefer Front 6 / Oberkiefer Molaren
- Unterkiefer / Unterkiefer Front 6 / Unterkiefer Molaren

**📋 Statusvorlagen:**
- Alles zurücksetzen (Mund zurücksetzen)
- Milchgebiss
- Wechselgebiss
- Zahnlos-Umschalter

**📦 Status-Extras Dropdown:**
- Obere/Untere Zirkon-Brücken (12-22, 13-23, 16-26, Vollbogen)
- Obere/Untere Metall-Brücken (12-22, 13-23, 16-26, Vollbogen)
- Obere/Untere Teilprothesen
- Obere/Untere Totalprothesen
- Obere/Untere Stegprothesen mit Implantaten

**🦷 Zahn-Editor-Panel** (für den/die ausgewählten Zahn/Zähne, in ausklappbare Karten gruppiert):
- **Basis-Zeile:** Zahnauswahl (Basistyp inkl. Varianten mit gebrochener Krone) und Zahnsubstrat (natürlich/Radix/frakturiert/crownprep)
- **Restaurations-Zeile:** das kombinierte „Fix: …"/„Kivehető: …"-Restaurations-Dropdown (feste `restorationType`×`restorationMaterial`-Optionen plus die `prosthesis`-Attachment-/Herausnehmbar-Optionen, gestaffelt nach Zahnart); Kronenrand-Undichtigkeits-Checkbox (nur Krone/Brücke); Checkboxen für die Lage der gebrochenen Krone; Umschalter „Krone erforderlich"/„Kronenwechsel erforderlich"
- **Abrieb- und Verfärbungs-Zeile:** Dropdown für inzisalen/okklusalen Abriebtyp, Dropdown für zervikalen Abriebtyp, Dropdown für Verfärbungsursache (jedes wechselt unter Einstellungen → Zahndetails → einfacher Modus zu einem einfachen Ja/Nein-Umschalter)
- **Kieferorthopädie-Karte:** Apparatur, mesiale/distale Drift, vertikale Bewegung (Extrusion/Intrusion), Rotations-Umschalter — angezeigt bei einem vorhandenen natürlichen Zahn
- **Karies-Karte:** Dropdown für den Kariestiefe-Modus, Subkronal-Karies-Checkbox, Dropdown für den Wurzelkaries-Schweregrad sowie der B/M/O/D/L-Flächenauswähler für Karies mit einem kontextabhängigen ICDAS-Tiefe-/CARS-Popup und einem Badge für die radiologische Tiefe
- **Füllungen-Karte:** Dropdown für das Füllungsmaterial, Flächenauswähler für Füllungen (mit Material pro Fläche), Flächenindikator für Füllungsdefekte (marginal/Fraktur/Abrieb), Hinweise zu Sekundärkaries und Füllungsdefekten
- **Wurzel-und-Parodontium-Karte:** zusammengeführter „Pulpa-/Endo-Status"-Auswähler, Auswähler für apikale Diagnose, Auswähler für periapikalen Läsionssubtyp (nur symptomatische/asymptomatische apikale Parodontitis), Auswähler für den Wurzelresorptionstyp, Auswähler für den Mobilitätsgrad, Auswähler für den periimplantären Status (nur Implantate)
- **Spezielle Indikatoren:** Extraktionsplan/-wunde, Lücke geschlossen, Fissurenversiegelung, Kontaktpunktverlust, Zahnstein, parapulpaler Stift, Endo-Resektion, Brückenpfeiler

### 🦷 Zahntypen und Zustände

**Zahnauswahl (Basistyp):**
| Wert | Beschreibung |
|---|---|
| `none` | Fehlender Zahn |
| `tooth-base` | Bleibender Zahn |
| `milktooth` | Milchzahn |
| `implant` | Zahnimplantat |
| `tooth-under-gum` | Subgingivaler (nicht durchgebrochener) Zahn |

**Gebrochene Zahnvarianten:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Zahnsubstrat (bleibende Zähne):**
`natural` (Standard), `radix` (Wurzelrest), `broken`, `crownprep` (für Krone präpariert)

**Restaurationstyp (bleibende Zähne):**
`none`, `crown`, `inlay`, `onlay` (nur okklusale Ansicht), `veneer`, `bridge`

**Restaurationsmaterial (bleibende Zähne):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (bestehende `metal`-Kronen migrieren hierher), `telescope`, `temporary`

**Restaurationsoptionen sind nach Zahnart gestaffelt** (`restorationOptions()` in `src/registry/restorations.ts`): ein Implantat bietet nur die Restaurationstypen `crown`/`bridge` (kombiniert mit einer Implantat-Verbinder-Ebene) plus die fünf `prosthesis`-Attachment-Einträge unten; ein fehlender/Lücken-Zahn bietet nur ein `bridge`-Brückenglied plus die zwei herausnehmbaren `prosthesis`-Prothesen-Einträge; ein `radix`-Substrat blendet die Restaurationssteuerung vollständig aus. Die alten flachen Felder `crownMaterial`/`bridgeUnit` (Implantat-/Brücken-Attachment-Werte vor v1.14) sind aus dem aktiven Modell entfernt — sie werden nur noch als schreibgeschützter Migrationspfad für alte Payloads akzeptiert.

**Prothetik** (`prosthesis`; eigenständige herausnehmbare/Attachment-Achse, als „Kivehető:"-Einträge im kombinierten Restaurations-Dropdown dargestellt):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (Implantat-Attachments, mit oder ohne Suprakonstruktion), `removable-partial`, `removable-full` (zahngetragene Prothesen an einem fehlenden/Lücken-Zahn). Ein Zahn hat entweder eine feste Restauration oder eine Prothetik, nie beides — das Setzen des einen löscht das andere.

**Kronenrand-Undichtigkeit** (`crownLeakage`; boolean): nur sichtbar, wenn `restorationType` gleich `crown` oder `bridge` ist; aktiviert die `crown-leakage`-Bildebene.

**Endodontische Optionen (bleibende Zähne):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodontische Optionen (Milchzähne):**
`none`, `endo-medical-filling`

`endo` und `pulpDx` werden über ein zusammengeführtes „Pulpa-/Endo-Status"-`<select>` dargestellt (gruppiert: vitale Pulpa vs. behandelt/endodontisch) und schließen sich gegenseitig aus — die Wahl einer behandelten Option (`endo != none`) setzt `pulpDx` auf `normal` zurück, und die Wahl einer Pulpadiagnose setzt `endo` auf `none` zurück.

**Füllungsmaterialien (bleibende Zähne):**
`amalgam`, `composite`, `gic`, `temporary`

**Füllungsmaterialien (Milchzähne):**
`composite`, `gic`, `temporary`

**Füllungs-/Kariesflächen:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (nur Karies)

**Modifikationen:**
`inflammation` (periapikale), `parodontal` (parodontale), `mobility` (M1/M2/M3)

**Periapikaler Läsionstyp** (`periapicalType`; qualifiziert den periapikalen Glyphen, nur unter symptomatischer/asymptomatischer apikaler Parodontitis angezeigt):
`none`, `granuloma`, `cyst` — Erfassungsoptionen; der alte Wert `abscess` wird weiterhin akzeptiert/gespeichert, aber im Auswähler nicht mehr angeboten, da er die apikale Diagnose dupliziert. Beim Import wird er verworfen: bei einem Zahn mit dem Entzündungs-Modifikator in `apicalDx` eingefaltet, andernfalls auf `none` zurückgesetzt

**Pulpadiagnose** (AAE-Terminologie; `pulpDx`):
`normal`, `reversible-pulpitis` (rendert ein reduziertes Pulpa-Glyph), `irreversible-pulpitis`, `necrosis` — schließt sich gegenseitig mit `endo` aus; wird bei einem wurzelbehandelten Zahn auf `normal` normalisiert

**Pulpadiagnose, praktisches Latein** (`pulpLatin`; wird vom Pulpa-Auswähler nur angezeigt, wenn `pulpDetailLevel` gleich `latin` ist):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Pulpa-Detailstufe** (`pulpDetailLevel`, globale Einstellung): `simple`, `aae` (Standard), `latin` — steuert, welches Pulpa-Vokabular der Auswähler anbietet

**Apikale Diagnose** (`apicalDx`; steuert den periapikalen Glyphen):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Wurzelresorptionstyp** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Periimplantärer Status** (`periImplant`; nur Implantate, Staging nach dem World Workshop 2018): `mucositis` verwendet das parodontale Zahnfleisch-Glyph weiter; `peri-implantitis-*` fügt die `peri-implant-bone-loss`-Ebene mit schweregradabhängiger Deckkraft hinzu (leicht 0,4 / mäßig 0,7 / schwer 1,0). Implantate rendern das periapikale Läsions-Glyph nicht mehr (ihre Entzündung wird stattdessen über diese Achse ausgedrückt), und die `mods`-Checkboxen für Entzündung/parodontal sind bei Implantaten ausgeblendet:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Kariesschweregrad** (`cariesSeverity`; vereinheitlichtes Feld pro Fläche, `0`–`6`): auf einer Fläche ohne Füllung wird er als ICDAS-Kariestiefenskala gelesen (`superficial` / `dentin` / `deep`, oder die rohen ICDAS-II-Codes `0–6` bei aktiviertem `enableIcdas`) und steuert die primäre `caries-{surface}`-Ebene; auf einer Fläche mit Füllung wird er als benannter CARS-Score gelesen (`0` gesund … `6` ausgedehnte Kavität) und steuert stattdessen die `subcaries-{surface}`-Ebene (Sekundärkaries) — eine Fläche ist nie gleichzeitig primär und rezidivierend

**Wurzelkaries** (`rootCaries`; steuert die `caries-root`-Bildebene bei einem vorhandenen Zahn, Deckkraft abhängig vom Schweregrad — `active` 0,5 / `arrested` 0,7 / `active-cavitated` volle Deckkraft):
`none`, `active`, `arrested`, `active-cavitated`

**Radiologische Kariestiefe** (`radiographicDepth`; pro Fläche, unabhängig von der visuellen ICDAS-/CARS-Skala `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Karies-Granularitätseinstellungen** (global): `secondaryCariesMode` (`simple`/`standard`/`full`, Standard `standard`), `rootCariesMode` (`simple`/`severity`, Standard `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, Standard `off`), `cariesDepthEnabled` (boolean, Standard `true`) — jede reduziert ihre Skala auf eine einfachere Auswahlansicht, ohne den gespeicherten Wert zu verändern

**Spezielle Indikatoren:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Zahnabrieb** (`wearEdge`, `wearCervical`; klinischer Typ je Lokalisation, gestaffelt auf Zahnbasis + keine Restauration + natürliches Substrat; rendert die bestehenden `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`-Ebenen):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Verfärbung** (`discoloration`; Ursache pro Zahn, gestaffelt auf einen natürlichen Zahn (bleibend) oder Milchzahn + keine Restauration + natürliches Substrat; färbt die Füllfarbe der dargestellten natürlichen Zahnkrone ein — keine neue SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Füllungsdefekt** (`fillingDefect`; pro Fläche, Befund an direkten Restaurationen unabhängig von Sekundärkaries — gestaffelt auf die in `fillingSurfaceMaterials` vorhandenen Flächen; rendert die `defect-{surface}`-Bildebene):
`none`, `marginal`, `fracture`, `wear`

**Kieferorthopädie** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; pro Zahn, gestaffelt auf einen vorhandenen natürlichen Zahn — bleibend oder Milchzahn):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (Pfeil-nach-oben-Glyph), `intrusion` (Pfeil-nach-unten-Glyph) — `orthoRotation`: boolean

**Zahndetail-/Notationseinstellungen** (globale Sitzungseinstellungen, Einstellungen → Zahndetails): `wearDetailLevel` und `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, Standard `complex` — der einfache Modus zeigt statt des vollständigen Typ-/Ursache-Dropdowns einen Ja/Nein-Umschalter, ohne den gespeicherten Wert zu verändern) sowie `surfaceNotation` (`simple`/`full`, Standard `full` — steuert, ob Kariologie-/Füllungs-Flächenbuchstaben/-bezeichnungen positionsbewusst sind; siehe „Positionsbewusste Flächenbezeichnung" oben)

### ⚙️ Einstellungen
Wird über das Zahnrad-Symbol in der Kopfleiste geöffnet; ein fokus-gefangener, ARIA-`dialog` mit tabbasiertem Layout (Esc/Klick auf den Hintergrund zum Schließen, Pfeiltasten zum Wechseln der Tabs). Alle Einstellungen sind, sofern nicht anders angegeben, reiner Sitzungs-UI-Zustand — keine davon verändert Pro-Zahn-Daten oder den Export-Payload.

- **Allgemein:** Nummerierungssystem (FDI/Universal/Palmer), Sprache, dunkles/helles Theme, Sichtbarkeit des Zahninformationen-Panels
- **Panels:** Ganzmund-Statuskarte und Kieferorthopädie-Karte unabhängig ein-/ausblenden (beide standardmäßig sichtbar)
- **Zahndetails:** Abrieb-Detailstufe und Verfärbungs-Detailstufe (einfach/komplex, jeweils Standard komplex), Flächenbezeichnung (einfach/vollständig, Standard vollständig)
- **Karies:** ICDAS-II-Scoring-Umschalter (`enableIcdas`), Kariestiefe-Umschalter (`cariesDepthEnabled`), Wurzelkaries-Granularität (`rootCariesMode`: simple/severity), Sekundärkaries-/CARS-Granularität (`secondaryCariesMode`: simple/standard/full), Granularität der radiologischen Tiefe (`radiographicDepthMode`: off/threeLevel/detailed) — der frühere separate „Sekundärkaries"-Tab ist in diesen zusammengeführt, wobei die CARS-Steuerung direkt oberhalb der radiologischen Tiefe positioniert ist
- **Pulpa:** Pulpa-Detailstufe (`pulpDetailLevel`: simple/AAE/praktisches Latein, Standard AAE) — steuert, welches Vokabular der „Pulpa-/Endo-Status"-Auswähler anbietet; eine Änderung aktualisiert die Ganzmund-Zusammenfassung und jeden geöffneten Tooltip live
- **Notizen:** Per-Zahn-Notizen aktivieren/deaktivieren (`enableNotes`)

### 🖼️ SVG-Vorlagensystem

**Zahnvorlagen** (in `src/assets/teeth-svgs/`):
| Vorlage | Verwendende Zähne |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (Schneidezähne) |
| `13.svg` | 13, 23, 33, 43 (Eckzähne) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (Prämolaren) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (Molaren) |

Vorlagen werden für den Unterkiefer um 180 Grad gedreht und für die linke Seite horizontal gespiegelt.

**Icon-SVGs** (in `src/assets/icon-svgs/`):
`icon_8.svg` (Weisheitszahn), `icon_gum.svg` (Knochen), `icon_no_selection.svg` (Auswahl löschen), `icon_occl.svg` (Okklusionsansicht), `icon_pulp.svg` (Pulpa)

### 🔢 Nummerierungssysteme

**FDI (ISO 3950):** Erwachsenenzähne 11-18, 21-28, 31-38, 41-48. Milchzähne 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Erwachsenenzähne nummeriert 1-32. Milchzähne mit Buchstaben A-T.

**Palmer (Zsigmondy-Palmer):** Quadrant + Positionsformat (z. B. UR-1, LL-5). Milchzähne verwenden Buchstaben A-E pro Quadrant.

### 🚀 Verwendung
Entwicklung:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Vorschau:
```bash
npm run preview
```

### 🔗 Integration
Die Komponente kann in jede React-App eingebettet werden.
Beispiel:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="de"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Dunkelmodus-Integration:**
- **Eigenständiger Modus:** `darkMode`-Prop weglassen — die Komponente verwaltet ihren eigenen Theme-Zustand über den Umschalter in der Kopfleiste und fügt die `.dark`-Klasse auf `<html>` hinzu bzw. entfernt sie.
- **Gesteuerter Modus:** `darkMode` und `onDarkModeChange` übergeben — die übergeordnete App steuert das Theme. Der Umschalter erscheint weiterhin, ruft aber `onDarkModeChange` auf, anstatt den internen Zustand zu verwalten. Die übergeordnete App ist für das Hinzufügen/Entfernen der `.dark`-Klasse auf `<html>` verantwortlich.

**Benutzerdefiniertes Theme:**
```tsx
<App
  themeConfig={{
    colors: {
      accent: '#e74c3c',
      background: '#fafafa',
      text: '#222222',
    },
  }}
/>
```

**Plugin-Integration:**
```tsx
import App, { type OdontogramPlugin, setPluginState } from "./App";

const myPlugin: OdontogramPlugin = {
  id: "implant-brand",
  label: { en: "Implant Brand", hu: "Implantátum márka" },
  layer: "overlay",
  renderSvg: (toothNo, _quadrant, state) => {
    if (!state) return null;
    return `<text x="16" y="60" font-size="6" fill="#3b7bff">${state}</text>`;
  },
};

<App plugins={[myPlugin]} />

// Plugin-Zustand für einen Zahn setzen:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 Tests
```bash
npm run test           # Alle 864 Tests ausführen (1 zusätzlicher Test übersprungen)
npm run test:watch     # Watch-Modus
npm run test:coverage  # Coverage-Bericht
```

### 📖 API-Dokumentation
```bash
npm run docs           # TypeDoc-Dokumentation in docs/ generieren
```

### 📡 Öffentliche API

**Komponenten-Props:**

| Prop | Typ | Standard | Beschreibung |
|---|---|---|---|
| `language` | `string` | `'hu'` | UI-Sprache (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Callback bei Sprachänderung |
| `numberingSystem` | `string` | `'FDI'` | Nummerierungssystem (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback bei Nummerierungsänderung |
| `darkMode` | `boolean` | `undefined` | Dunkelmodus-Zustand. Weglassen für eigenständigen Modus. |
| `onDarkModeChange` | `(dark) => void` | — | Callback beim Umschalten des Dunkelmodus. Erforderlich für gesteuerten Modus. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Benutzerdefinierte Farbüberschreibungen über CSS Custom Properties (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Benutzerdefinierte SVG-Plugins für visuelle Overlays und per-Zahn Custom State. |
| `readOnly` | `boolean` | `undefined` | Alle Interaktionen deaktivieren (Klick, Touch, Tastatur). Nützlich für Druck-/Berichtsansichten. |
| `enableNotes` | `boolean` | `undefined` | Per-Zahn Notizen aktivieren. Doppelklick auf einen Zahn zum Hinzufügen/Bearbeiten. |

**Exportierte Funktionen zur externen Steuerung:**

| Funktion | Beschreibung |
|---|---|
| `initOdontogram()` | Motor initialisieren und alle Zähne rendern |
| `destroyOdontogram()` | Motor aufräumen und Ereignisbehandler entfernen |
| `setNumberingSystem(system)` | Zwischen FDI, Universal, Palmer wechseln |
| `clearSelection()` | Alle Zähne abwählen |
| `setOcclusalVisible(on)` | Okklusionsansicht ein-/ausschalten |
| `setWisdomVisible(on)` | Weisheitszähne anzeigen/verbergen |
| `setShowBase(on)` | Knochenschicht anzeigen/verbergen |
| `setHealthyPulpVisible(on)` | Gesunde Pulpa anzeigen/verbergen |
| `registerPlugins(plugins)` | Benutzerdefinierte SVG-Plugins registrieren |
| `setPluginState(toothNo, pluginId, value)` | Plugin Custom State für einen Zahn setzen |
| `getPluginState(toothNo, pluginId)` | Plugin Custom State eines Zahns abrufen |
| `getToothStateSummary(toothNo)` | Lokalisierte Zusammenfassung aller aktiven Zustände eines Zahns abrufen |
| `getOdontogramSummary()` | Strukturierte, lokalisierte Textzusammenfassung des gesamten Befunds abrufen (Zählungen, Abschnitte) |
| `onStateChange(callback)` | Auf Zustandsänderungen abonnieren; gibt eine Abmeldefunktion zurück |
| `setReadOnly(value)` | Schreibgeschützten Modus aktivieren/deaktivieren |
| `getReadOnly()` | Aktuellen Schreibgeschützt-Zustand abrufen |
| `setNotesEnabled(value)` | Per-Zahn Notizen aktivieren/deaktivieren |
| `getNotesEnabled()` | Aktuellen Notizen-Status abrufen |
| `setPulpDetailLevel(level)` | Vokabular des Pulpa-Auswählers festlegen — `"simple"`, `"aae"` oder `"latin"` |
| `getPulpDetailLevel()` | Aktuelle Pulpa-Detailstufe abrufen |
| `exportFhir(options?)` | Befund als HL7 FHIR R4 Collection-Bundle exportieren (JSON-Download). Optionale `{ subject }`-Referenz; sonst wird ein Platzhalter-Patient eingebettet |
| `exportImage(format)` | Befund als Bild herunterladen — `"png"` oder `"jpg"` |
| `exportSvg()` | Befund als skalierbares SVG (Vektor) herunterladen |
| `importFhirBundle(input)` | Ein von diesem Modul erzeugtes FHIR-R4-Bundle importieren (Objekt oder JSON-String) |
| `setImportFormat(format)` | Parser für den nächsten Datei-Import festlegen — `"status"` oder `"fhir"` |
| `startIntroTour()` | Die 12-stufige interaktive Einführungstour starten |

### 💾 Status Export-/Importformat
Der Export erzeugt eine JSON-Datei (Version `2.10`; Importe akzeptieren weiterhin die Legacy-Versionen `1.4`, `2.0`, `2.1`, `2.2`, `2.3`, `2.4`, `2.5`, `2.6`, `2.7`, `2.8` und `2.9` und werden automatisch migriert) mit folgenden Feldern:

**Globale Felder:**
- `wisdomVisible` - Weisheitszähne sichtbar
- `showBase` - Knochenschicht sichtbar
- `occlusalVisible` - Okklusionsansicht aktiv
- `showHealthyPulp` - Gesunde Pulpa sichtbar
- `edentulous` - Zahnloser Modus aktiv

**Pro-Zahn-Felder (32 Zähne):**
- `toothSelection` - Basiszahntyp
- `toothSubstrate` - Zahnsubstrat (natural/radix/broken/crownprep), unabhängig von jeder Restauration
- `restorationType` - Restaurationstyp (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - Restaurationsmaterial (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), gekoppelt an `restorationType`
- `prosthesis` - herausnehmbare/Attachment-Achse (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), schließt sich mit einer festen `restorationType` von Krone/Brücke gegenseitig aus
- `crownLeakage` - Kronenrand-Undichtigkeits-Flag, nur relevant, wenn `restorationType` gleich Krone oder Brücke ist
- `endo` - endodontischer Zustand; schließt sich mit `pulpDx` gegenseitig aus (über einen zusammengeführten „Pulpa-/Endo-Status"-Auswähler gemeinsam dargestellt — das Behandeln eines Zahns normalisiert `pulpDx` auf `normal`)
- `mods` - Modifikations-Array (Entzündung, parodontal); `inflammation` ist bei vorhandenen Zähnen aus der UI entfernt (dort steuert `apicalDx` den Glyphen), gilt aber weiterhin für fehlende/Extraktionsalveolen-Zähne
- `caries` - aktive Kariesflächen
- `cariesActiveDepth` - der vom Kariestiefe-Auswähler vorgehaltene ICDAS-Tiefenwert beim Anwenden einer neuen Fläche (kein gespeicherter Wert pro Fläche; siehe `cariesSeverity` für das gespeicherte Feld pro Fläche)
- `rootCaries` - Wurzelkaries-Schweregrad (none/active/arrested/active-cavitated)
- `cariesSeverity` - vereinheitlichter Schweregrad pro Fläche (0-6): ICDAS-Tiefe auf einer primären (ungefüllten) Fläche, CARS-Score auf einer rezidivierenden (gefüllten) Fläche
- `radiographicDepth` - radiologische Kariestiefe pro Fläche (none/E1/E2/D1/D2/D3), unabhängig von der visuellen ICDAS-/CARS-Skala
- `fillingMaterial` - Füllungsmaterial
- `fillingSurfaces` - gefüllte Flächen
- `fillingSurfaceMaterials` - Füllungsmaterial pro Fläche (gemischte Füllungen, z. B. bukkal Amalgam + distal Komposit)
- `fillingDefect` - Füllungsdefekt pro Fläche (none/marginal/fracture/wear), an gefüllte Flächen gebunden, unabhängig von Sekundärkaries
- `pulpDx` - AAE-Pulpadiagnose (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); reversible-pulpitis rendert ein reduziertes Glyph
- `pulpLatin` - praktischer lateinischer Pulpa-Subtyp (wird vom Pulpa-Auswähler nur angezeigt, wenn `pulpDetailLevel` gleich `latin` ist)
- `apicalDx` - apikale Diagnose, steuert den periapikalen Glyphen
- `periapicalType` - periapikaler Läsionssubtyp (none/granuloma/cyst), nur unter symptomatischer/asymptomatischer apikaler Parodontitis angezeigt; der alte Wert `abscess` wird beim Import weiterhin akzeptiert
- `resorptionType` - Wurzelresorptionstyp (none/internal/external-cervical)
- `periImplant` - periimplantärer Status nur bei Implantaten (none/mucositis/peri-implantitis-mild/-moderate/-severe), Staging nach dem World Workshop 2018
- `endoResection` - Wurzelspitzenresektions-Flag
- `fissureSealing` - Fissurenversiegelungs-Flag
- `calculus` - Zahnstein-Flag
- `contactMesial` - mesialer Kontaktpunktverlust
- `contactDistal` - distaler Kontaktpunktverlust
- `wearEdge` - inzisaler/okklusaler Abriebtyp (none/attrition/erosion)
- `wearCervical` - zervikaler Abriebtyp (none/abrasion/abfraction/erosion)
- `discoloration` - Verfärbungsursache pro Zahn (none/tetracycline/fluorosis/nonvital/extrinsic/other), färbt die Füllfarbe der natürlichen Zahnkrone bei einem natürlichen Zahn (bleibend/Milchzahn) ohne Restauration
- `orthoAppliance` - kieferorthopädische Apparatur (none/bracket/band)
- `orthoDrift` - kieferorthopädische Drift (none/mesial/distal)
- `orthoVertical` - kieferorthopädische vertikale Bewegung (none/extrusion/intrusion)
- `orthoRotation` - kieferorthopädisches Rotations-Flag
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - Fraktur-Lokalisierungen
- `extractionWound` - Post-Extraktionswunde
- `extractionPlan` - geplante Extraktion
- `parapulpalPin` - parapulpaler Stift-Flag
- `bridgePillar` - Brückenpfeilerzahn
- `mobility` - Mobilitätsgrad (none/m1/m2/m3)
- `crownNeeded` - Indikator „Krone erforderlich"
- `crownReplace` - Indikator „Kronenwechsel erforderlich"
- `missingClosed` - Lücke nach Extraktion geschlossen
- `customStates` - Plugin Custom States (Objekt, nach Plugin-ID indiziert)
- `note` - Textnotiz pro Zahn (String, optional — nur vorhanden, wenn nicht leer)

### 📁 Ordnerstruktur
- `src/App.tsx` - UI-Hülle, Kopfleisten-Steuerung, Sprach-/Nummerierungs-/Dunkelmodus-/Theme-/Plugin-Umschalter
- `src/odontogram.ts` - SVG-Schichtungsmotor, Zahnstatusmanagement, Touch-Interaktionen, Plugin-Overlays, UI-Verdrahtung
- `src/plugin.ts` - `OdontogramPlugin`-Typ, `PluginLayer`, `getQuadrant()`, `LAYER_Z` Z-Index-Prioritäten
- `src/theme.ts` - `OdontogramThemeConfig`-Typ und `applyThemeConfig()`-Hilfsfunktion
- `src/status_extras.ts` - 34 vordefinierte Restaurationsvorlagen (Brücken, Prothesen, Stegkonstruktionen)
- `src/i18n/` - Übersetzungen (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) und i18n-Hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer Nummerierungskonvertierung
- `src/registry/` - deklaratives Register der klinischen Achsen: FHIR-Feldzuordnungen, SVG-Clear-Set/Boolean-Flag-Aktivierung, Restaurationstyp×Material-Matrix, UI-Optionslisten (eine einzige Quelle der Wahrheit, die Export/Import, FHIR und die Auswähler-UI erzeugt)
- `src/fhir/` - HL7-FHIR-R4-Export/Import: `toFhir.ts`/`fromFhir.ts`, Codesysteme, Feldzuordnungen, Primitive
- `src/bridgeOverlay.ts` - Mehrzahn-Brückenspann-Verbinder-Overlay (bogenbewusste Sattelgeometrie)
- `src/SettingsModal.tsx` - tabbasierter Einstellungsdialog (Allgemein/Panels/Zahndetails/Karies/Pulpa/Notizen)
- `src/__tests__/` + `src/registry/__tests__/` - Vitest-Testsuite (864 bestandene Tests, 1 übersprungen, in 94 Dateien)
- `src/assets/teeth-svgs/` - SVG-Zahnvorlagen (6 Dateien: Schneide-, Eck-, Prämolaren, Molaren + Okklusionsansichten)
- `src/assets/icon-svgs/` - Toolbar-Icon-SVGs (5 Dateien)

### ⚙️ Technologie-Stack
- React 18 + Vite + TypeScript
- Tailwind CSS für UI-Styling
- SVG-Schichtung über DOM-Manipulation (kein React-State für Performance)
- Leichtgewichtiges eigenes i18n-System
- Vitest + Testing Library für automatisierte Tests
- TypeDoc für API-Dokumentation
- Vite-Pfadalias: `@` auf `./src` abgebildet

### 📝 Hinweise
- SVG-Vorlagen werden aus `src/assets/teeth-svgs` und `src/assets/icon-svgs` geladen; daher muss statisches Hosting den öffentlichen Ordner bereitstellen.
- Der Odontogramm-Motor verwendet einen eigenen internen Zustand (kein React-State) für Performance und Einfachheit.
- Milchzähne verfügen über einen reduzierten Satz verfügbarer Materialien (kein Amalgam, kein stiftbasiertes Endo).
- Implantatzähne haben andere Kronen-/Abutment-Optionen als natürliche Zähne.

### 📖 Zitierung

Wenn Sie dieses Modul in Ihrer Arbeit verwenden, zitieren Sie es bitte.

**Diese Version (v1.10.0):**
> Dul, Z. (2026). *React Odontogram Modul* (v1.10.0). Zenodo. https://doi.org/10.5281/zenodo.21156788

**Alle Versionen (Konzept-DOI):** https://doi.org/10.5281/zenodo.21156787

Maschinenlesbare Zitationsmetadaten finden Sie in [`CITATION.cff`](../CITATION.cff).
