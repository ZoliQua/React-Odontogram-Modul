# 🦷 React Odontogram Modul

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-1.10.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](../README.md#-english) | 🇪🇸 [Español](../README.md#-español) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md)

---

## 🇩🇪 Deutsch

### 📋 Übersicht
Dieses Projekt ist ein interaktiver, browserbasierter Odontogramm-Editor, der eine schnelle Zahnstatuserfassung mit einer übersichtlichen Benutzeroberfläche unterstützt. Es rendert geschichtete SVG-Zahnvorlagen zur Darstellung von Restaurationen, Karies, endodontischem Status, Mobilität und anderen klinischen Details, und bietet Mehrfachauswahl, Auswahlfilter und vordefinierte Statusvorlagen.

---
<img width="1728" height="869" alt="react-odontogram-modul-german-preview" src="https://github.com/user-attachments/assets/ea3844c7-62a7-4dfc-bb71-755f9f3f7d07" />

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### ✨ Hauptmerkmale
- 🖱️ Schnelle Auswahl und Mehrfachauswahl (CMD/CTRL + Klick)
- 🦷 Zahntypen: bleibend, Milchzahn, Implantat, subgingival, fehlend
- 👑 Kronenmaterialien: natürlich (Vollkrone), frakturiert, für Krone präpariert, Radix, e.max, Zirkon, Metallkeramik, provisorisch, Teleskop
- 🔩 Implantat-Abutments: Heilabutment, Locator, Locator mit Prothese, Steg, Steg mit Prothese
- 🌉 Brückenglieder: Zirkon, Metall, provisorisch, herausnehmbar, Steg, Steg mit Prothese
- 🔍 Karieskartierung auf 6 Flächen: mesial, distal, bukkal, lingual, okklusal, subkronal
- 🪥 Füllungsmaterialien pro Fläche: Amalgam, Komposit, GIZ, provisorisch
- 🏥 Endodontische Zustände: medikamentöse Füllung, Wurzelfüllung, inkomplette Wurzelfüllung, Glasfaserstift, Metallstift, Resektion, parapulpaler Stift
- ⚕️ Modifikationen: periapikale Entzündung (innen/außen), Parodontalerkrankung, Mobilitätsgrade (M1/M2/M3)
- 🏷️ Spezielle Indikatoren: Krone erforderlich, Kronenwechsel erforderlich, geschlossene Lücke, Extraktionsplan, Bruxismus-Abrieb/Zervikaler Abrieb, Fissurenversiegelung, Kontaktpunktverlust
- 👁️ Okklusionsansicht, Weisheitszähne, Knochen- und Pulpa-Sichtbarkeit umschaltbar
- 🔢 12 Auswahlfilter (alle, vorhandene, bleibende, Milch, Implantate, fehlende, Ober-/Unterkiefer, Front/Molaren)
- 📊 Vordefinierte Statusvorlagen (Zurücksetzen, Milchgebiss, Wechselgebiss, zahnlos)
- 📦 34 vordefinierte Restaurationsvorlagen (Brücken, herausnehmbare Prothesen, Stegprothesen mit Implantaten)
- 💾 Status-Export/Import in JSON (Version 1.3, mit Plugin Custom States und per-Zahn Notizen)
- 🔗 HL7 FHIR R4 Export (Collection-Bundle aus Observations pro Zahn, ISO 3950 Zahnkodierung, hybride lokale + SNOMED Kodierung)
- ✚ Kreuz-/Plus-Oberflächenauswahl (B/M/O/D/L) für Karies und Füllungen
- 🧱 Füllungsmaterialien pro Fläche (gemischte Füllungen, z. B. bukkal Amalgam + distal Komposit)
- 🖼️ PNG/JPG/SVG-Bildexport des Befunds (herunterladbar; PNG/JPG aus Vektor-SVG gerastert)
- 🦷 Sekundärkaries — automatisch abgeleitet, wenn Karies eine Füllung überlappt
- 🪨 Zahnstein, Wurzelresorption und typisierte periapikale Läsionen (Granulom / Zyste / Abszess)
- 📏 Kariestiefe pro Fläche (oberflächlich / Dentin / tief) oder optionales ICDAS-II-Scoring (0–6) via `enableIcdas`
- 🧰 Vereinheitlichte Topbar-Icon-Leiste mit Einstellungsmenü (Nummerierung, Notizen, ICDAS, Zahninformationen)
- 📋 Zahninformationen-Panel: textuelle Live-Zusammenfassung des gesamten Befunds (Zahnzahlen, vorhandene/fehlende Zähne, Karies inkl. Sekundärkaries, Füllungen, Wurzelbehandlungen, Zahnersatz, Implantate, Parodontalstatus) — standardmäßig sichtbar, in den Einstellungen umschaltbar
- 🗂️ Konsolidiertes Export-Dropdown (Status JSON / FHIR / PNG / JPG)
- 📥 Import-Dropdown mit FHIR-Import (liest exportierte Bundles zurück)
- ⏳ Fortschrittsanzeige beim Bildexport
- 🎓 12-stufige interaktive Einführungstour
- 🔢 Drei Nummerierungssysteme (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU) mit Sprachumschalter (190+ Übersetzungsschlüssel pro Sprache)
- 🌗 Dunkler Modus mit Umschalt-Button (eigenständig oder von der übergeordneten App gesteuert)
- 🎨 Benutzerdefinierte Theme-Konfiguration (`themeConfig`-Prop) mit CSS Custom Properties (`--odon-*`)
- 📱 Mobile Touch-UX: Tap-to-Zoom-Popover, Langes-Drücken-Kontextmenü, Pinch-to-Zoom, WCAG 44px Berührungsziele, Kieferbogen-Umschalter
- 🔌 Benutzerdefiniertes SVG-Plugin-System: visuelle Overlays, per-Zahn Custom State, JSON Export/Import-Unterstützung
- ⚠️ Statusvalidierung mit Warnungen bei inkompatiblen Zahnzustandskombinationen
- 🏷️ Automatische Status-Tooltips auf Zahnkacheln (zeigt alle aktiven Zustände)
- ♿ Tastaturzugänglichkeit (WCAG): ARIA listbox/option Rollen, Enter/Leertaste Auswahl, Pfeiltasten-Navigation, focus-visible Umrisse
- 🔒 Schreibgeschützter Modus: alle Interaktionen deaktivieren für Druck-/Berichtsansichten
- ✨ Auswahl-Animationen: pulsierende gestrichelte Umrandung und leuchtender Schatten auf ausgewählten Zähnen (mit Unterstützung für prefers-reduced-motion)
- 📝 Per-Zahn Notizen: Doppelklick zum Hinzufügen/Bearbeiten, Notiz-Symbol neben der Zahnnummer, Hover-Tooltip mit Notiztext, JSON Export/Import
- 🧪 202 automatisierte Tests (Vitest) in 16 Testdateien für Nummerierung, Übersetzungen, Vorlagen, i18n, App-Komponente, Theme, Touch, Plugins und Barrierefreiheit
- 📖 TypeDoc API-Dokumentation mit JSDoc-Kommentaren für alle öffentlichen Exporte (`npm run docs`)

### 📦 Module
- 🦷 Odontogramm-Raster und Zahngitter-UI
- 🎛️ Steuerung und Statuspanel
- 🎨 SVG-Schichtungsmotor und Vorlagen
- 🔢 Zahnnummerierung und Beschriftung (FDI/Universal/Palmer)
- 🌐 Lokalisierung (HU/EN/DE/ES/IT/SK/PL/RU)
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
- Sprachumschalter (HU/EN/DE/ES/IT/SK/PL/RU Dropdown)
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

**Kronenmaterialien (bleibende Zähne):**
`radix`, `natural` (Vollkrone, Standard), `broken`, `crownprep` (für Krone präpariert), `emax`, `zircon`, `metal`, `temporary`, `telescope`

**Kronenmaterialien (Implantate):**
`natural` (keine), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Brückenglieder:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Endodontische Optionen (bleibende Zähne):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodontische Optionen (Milchzähne):**
`none`, `endo-medical-filling`

**Füllungsmaterialien (bleibende Zähne):**
`amalgam`, `composite`, `gic`, `temporary`

**Füllungsmaterialien (Milchzähne):**
`composite`, `gic`, `temporary`

**Füllungs-/Kariesflächen:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (nur Karies)

**Modifikationen:**
`inflammation` (periapikale), `parodontal` (parodontale), `mobility` (M1/M2/M3)

**Periapikaler Läsionstyp** (qualifiziert `inflammation`):
`none`, `granuloma`, `cyst`, `abscess`

**Kariestiefe** (pro Fläche): `superficial` / `dentin` / `deep`, oder optionale ICDAS-II-Codes `0–6` bei aktiviertem `enableIcdas`

**Spezielle Indikatoren:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `rootResorption`, `calculus`, `parapulpalPin`

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
npm run test           # Alle 202 Tests ausführen
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
| `language` | `string` | `'hu'` | UI-Sprache (hu/en/de/es/it/sk/pl/ru) |
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
| `exportFhir(options?)` | Befund als HL7 FHIR R4 Collection-Bundle exportieren (JSON-Download). Optionale `{ subject }`-Referenz; sonst wird ein Platzhalter-Patient eingebettet |
| `exportImage(format)` | Befund als Bild herunterladen — `"png"` oder `"jpg"` |
| `exportSvg()` | Befund als skalierbares SVG (Vektor) herunterladen |
| `importFhirBundle(input)` | Ein von diesem Modul erzeugtes FHIR-R4-Bundle importieren (Objekt oder JSON-String) |
| `setImportFormat(format)` | Parser für den nächsten Datei-Import festlegen — `"status"` oder `"fhir"` |
| `startIntroTour()` | Die 12-stufige interaktive Einführungstour starten |

### 💾 Status Export-/Importformat
Der Export erzeugt eine JSON-Datei (Version `1.3`) mit folgenden Feldern:

**Globale Felder:**
- `wisdomVisible` - Weisheitszähne sichtbar
- `showBase` - Knochenschicht sichtbar
- `occlusalVisible` - Okklusionsansicht aktiv
- `showHealthyPulp` - Gesunde Pulpa sichtbar
- `edentulous` - Zahnloser Modus aktiv

**Pro-Zahn-Felder (32 Zähne):**
- `toothSelection` - Basiszahntyp
- `crownMaterial` - Kronen-/Abutment-Material
- `bridgeUnit` - Brückenverbinder-Typ
- `endo` - Endodontischer Zustand
- `mods` - Modifikations-Array (Entzündung, parodontal)
- `caries` - Aktive Kariesflächen
- `fillingMaterial` - Füllungsmaterial
- `fillingSurfaces` - Gefüllte Flächen
- `pulpInflam` - Pulpaentzündungs-Flag
- `endoResection` - Wurzelspitzenresektions-Flag
- `fissureSealing` - Fissurenversiegelungs-Flag
- `contactMesial` - Messialer Kontaktpunktverlust
- `contactDistal` - Distaler Kontaktpunktverlust
- `bruxismWear` - Okklusaler Bruxismus-Abrieb
- `bruxismNeckWear` - Zervikaler Bruxismus-Abrieb
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - Fraktur-Lokalisierungen
- `extractionWound` - Post-Extraktionswunde
- `extractionPlan` - Geplante Extraktion
- `parapulpalPin` - Parapulpaler Stift-Flag
- `bridgePillar` - Brückenpfeiferzahn
- `mobility` - Mobilitätsgrad (none/m1/m2/m3)
- `crownNeeded` - Krone erforderlich Indikator
- `crownReplace` - Kronenwechsel erforderlich Indikator
- `missingClosed` - Lücke geschlossen nach Extraktion
- `customStates` - Plugin Custom States (Objekt, nach Plugin-ID sortiert)
- `note` - Per-Zahn Textnotiz (String, optional — nur vorhanden wenn nicht leer)

### 📁 Ordnerstruktur
- `src/App.tsx` - UI-Hülle, Kopfleisten-Steuerung, Sprach-/Nummerierungs-/Dunkelmodus-/Theme-/Plugin-Umschalter
- `src/odontogram.ts` - SVG-Schichtungsmotor, Zahnstatusmanagement, Touch-Interaktionen, Plugin-Overlays, UI-Verdrahtung
- `src/plugin.ts` - `OdontogramPlugin`-Typ, `PluginLayer`, `getQuadrant()`, `LAYER_Z` Z-Index-Prioritäten
- `src/theme.ts` - `OdontogramThemeConfig`-Typ und `applyThemeConfig()`-Hilfsfunktion
- `src/status_extras.ts` - 34 vordefinierte Restaurationsvorlagen (Brücken, Prothesen, Stegkonstruktionen)
- `src/i18n/` - Übersetzungen (HU/EN/DE/ES/IT/SK/PL/RU) und i18n-Hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer Nummerierungskonvertierung
- `src/__tests__/` - Vitest-Testsuite (202 Tests in 16 Dateien)
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
