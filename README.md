# 🦷 React Odontogram Editor Modul

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-1.2.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages / Sprachen / Idiomas / Nyelvek:** [English](#-english) | [Deutsch](#-deutsch) | [Español](#-español) | [Magyar](#-magyar)

---

<img width="1721" height="782" alt="react-odontogram-modul-preview" src="https://github.com/user-attachments/assets/26facfbc-26c0-4ae6-9fab-d430b9f036f6" />

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

## 🇬🇧 English

### 📋 Overview
This project is an interactive, browser-based odontogram editor that supports fast dental charting with a clean UI. It renders layered SVG tooth templates to represent restorations, caries, endodontic status, mobility, and other clinical details, while providing multi-select, selection filters, and predefined status presets.

### ✨ Key Features
- 🖱️ Fast selection and multi-select (CMD/CTRL + click)
- 🦷 Tooth types: permanent, primary (milk), implant, broken variants, crown prep, subgingival
- 👑 Crown materials: natural, e.max, zircon, metal-ceramic, temporary, telescope, radix
- 🔩 Implant abutments: healing abutment, locator, locator with prosthesis, bar, bar with prosthesis
- 🌉 Bridge units: zircon, metal, temporary, removable, bar, bar with prosthesis
- 🔍 Caries charting on 6 surfaces: mesial, distal, buccal, lingual, occlusal, subcrown
- 🪥 Filling materials per surface: amalgam, composite, GIC, temporary
- 🏥 Endodontic states: medicinal filling, root canal filling, incomplete root filling, glass fiber post, metal post, resection, parapulpal pin
- ⚕️ Modifications: periapical inflammation (inside/outside), periodontal disease, mobility grades (M1/M2/M3)
- 🏷️ Special indicators: crown needed, crown replacement needed, missing closed gap, extraction plan, bruxism wear/neck wear, fissure sealing, contact point loss
- 👁️ Occlusal view, wisdom teeth, bone and pulp visibility toggles
- 🔢 12 selection filters (all, present, permanent, milk, implants, missing, upper/lower, front/molars)
- 📊 Predefined status presets (reset, primary dentition, mixed dentition, edentulous)
- 📦 34 predefined restoration templates (bridges, removable dentures, bar dentures with implants)
- 💾 Status export/import in JSON (version 1.1)
- 🔢 Three numbering systems (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU) with language switcher (157+ translation keys per language)
- 🌗 Dark mode support with toggle button (standalone or controlled by parent app)

### 📦 Modules
- 🦷 Odontogram grid and tooth tile UI
- 🎛️ Controls and status panel
- 🎨 SVG layering engine and templates
- 🔢 Tooth numbering and label mapping (FDI/Universal/Palmer)
- 🌐 Localization (HU/EN/DE/ES/IT/SK/PL/RU)
- 💾 Status export/import
- 📋 Status extras: predefined restoration templates

### 🛠️ UI Controls

**🔝 Topbar:**
- Language switcher (HU/EN/DE/ES/IT/SK/PL/RU dropdown)
- Dark mode toggle button (sun/moon icon, switches between light and dark theme)
- Numbering system switcher (FDI/Universal/Palmer dropdown)
- Export Status / Import Status buttons

**📊 Chart header:**
- Occlusal view toggle
- Wisdom teeth visibility toggle
- Bone visibility toggle
- Pulp visibility toggle
- Clear selection button

**🔍 Selection filters:**
- Select All / All Present / Permanent / Milk / Implants / All Missing
- Select Upper / Upper Front 6 / Upper Molars
- Select Lower / Lower Front 6 / Lower Molars

**📋 Status presets:**
- Reset All (reset mouth)
- Primary Dentition
- Mixed Dentition
- Edentulous toggle

**📦 Status extras dropdown:**
- Upper/Lower zircon bridges (12-22, 13-23, 16-26, full arch)
- Upper/Lower metal bridges (12-22, 13-23, 16-26, full arch)
- Upper/Lower partial removable dentures
- Upper/Lower full removable dentures
- Upper/Lower bar dentures with implants

### 🦷 Tooth Types and States

**Tooth selection (base type):**
| Value | Description |
|---|---|
| `none` | Missing tooth |
| `tooth-base` | Permanent tooth |
| `milktooth` | Primary (deciduous) tooth |
| `implant` | Dental implant |
| `tooth-crownprep` | Tooth prepared for crown |
| `tooth-under-gum` | Subgingival (unerupted) tooth |

**Broken tooth variants:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Crown materials (permanent teeth):**
`natural`, `broken`, `radix`, `emax`, `zircon`, `metal`, `temporary`, `telescope`

**Crown materials (implants):**
`natural` (none), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Bridge units:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Endodontic options (permanent teeth):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodontic options (milk teeth):**
`none`, `endo-medical-filling`

**Filling materials (permanent teeth):**
`amalgam`, `composite`, `gic`, `temporary`

**Filling materials (milk teeth):**
`composite`, `gic`, `temporary`

**Filling/caries surfaces:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (caries only)

**Modifications:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Special indicators:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `parapulpalPin`

### 🖼️ SVG Template System

**Tooth templates** (in `src/assets/teeth-svgs/`):
| Template | Teeth using it |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisors) |
| `13.svg` | 13, 23, 33, 43 (canines) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premolars) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molars) |

Templates are rotated 180 degrees for the lower jaw and mirrored horizontally for the left side.

**Icon SVGs** (in `src/assets/icon-svgs/`):
`icon_8.svg` (wisdom), `icon_gum.svg` (bone), `icon_no_selection.svg` (clear), `icon_occl.svg` (occlusal view), `icon_pulp.svg` (pulp)

### 🔢 Numbering Systems

**FDI (ISO 3950):** Adult teeth 11-18, 21-28, 31-38, 41-48. Primary teeth 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Adult teeth numbered 1-32. Primary teeth lettered A-T.

**Palmer (Zsigmondy-Palmer):** Quadrant + position format (e.g. UR-1, LL-5). Primary teeth use letters A-E per quadrant.

### 🚀 Usage
Development:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Preview:
```bash
npm run preview
```

### 🔗 Integration
The component can be embedded in any React app.
Example:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="en"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Dark mode integration:**
- **Standalone mode:** Omit `darkMode` prop — the component manages its own theme state via the topbar toggle button and adds/removes the `.dark` class on `<html>`.
- **Controlled mode:** Pass `darkMode` and `onDarkModeChange` — the parent app controls the theme. The toggle button still appears but calls `onDarkModeChange` instead of managing internal state. The parent is responsible for adding/removing the `.dark` class on `<html>`.

### 📡 Public API

**Component props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `language` | `string` | `'hu'` | UI language (hu/en/de/es/it/sk/pl/ru) |
| `onLanguageChange` | `(lang) => void` | — | Callback when language changes |
| `numberingSystem` | `string` | `'FDI'` | Numbering system (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback when numbering changes |
| `darkMode` | `boolean` | `undefined` | Dark mode state. Omit for standalone mode. |
| `onDarkModeChange` | `(dark) => void` | — | Callback when dark mode toggles. Required for controlled mode. |

**Exported functions for external control:**

| Function | Description |
|---|---|
| `initOdontogram()` | Initialize the engine and render all teeth |
| `destroyOdontogram()` | Clean up the engine and remove event listeners |
| `setNumberingSystem(system)` | Switch between FDI, Universal, Palmer |
| `clearSelection()` | Deselect all teeth |
| `setOcclusalVisible(on)` | Toggle occlusal view on/off |
| `setWisdomVisible(on)` | Show/hide wisdom teeth |
| `setShowBase(on)` | Show/hide bone layer |
| `setHealthyPulpVisible(on)` | Show/hide healthy pulp |

### 💾 Status Export/Import Format
The export creates a JSON file (version `1.1`) containing:

**Global fields:**
- `wisdomVisible` - wisdom teeth visible
- `showBase` - bone layer visible
- `occlusalVisible` - occlusal view active
- `showHealthyPulp` - healthy pulp visible
- `edentulous` - edentulous mode active

**Per-tooth fields (32 teeth):**
- `toothSelection` - base tooth type
- `crownMaterial` - crown/abutment material
- `bridgeUnit` - bridge connector type
- `endo` - endodontic state
- `mods` - modifications array (inflammation, parodontal)
- `caries` - active caries surfaces
- `fillingMaterial` - filling material
- `fillingSurfaces` - filled surfaces
- `pulpInflam` - pulp inflammation flag
- `endoResection` - apicoectomy flag
- `fissureSealing` - fissure sealant flag
- `contactMesial` - mesial contact point loss
- `contactDistal` - distal contact point loss
- `bruxismWear` - occlusal bruxism wear
- `bruxismNeckWear` - cervical bruxism wear
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - fracture locations
- `extractionWound` - post-extraction wound
- `extractionPlan` - planned extraction
- `parapulpalPin` - parapulpal pin flag
- `bridgePillar` - bridge abutment tooth
- `mobility` - mobility grade (none/m1/m2/m3)
- `crownNeeded` - crown needed indicator
- `crownReplace` - crown replacement needed indicator
- `missingClosed` - gap closed after extraction

### 📁 Folder Structure
- `src/App.tsx` - shell UI, topbar controls, language/numbering/dark mode switcher
- `src/odontogram.ts` - SVG layering engine, tooth state management, UI wiring
- `src/status_extras.ts` - 34 predefined restoration templates (bridges, dentures, bar constructions)
- `src/i18n/` - translations (HU/EN/DE/ES/IT/SK/PL/RU) and i18n hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer numbering conversion
- `src/assets/teeth-svgs/` - SVG tooth templates (6 files: incisors, canines, premolars, molars + occlusal views)
- `src/assets/icon-svgs/` - toolbar icon SVGs (5 files)

### ⚙️ Tech Stack
- React 18 + Vite + TypeScript
- Tailwind CSS for UI styling
- SVG layering via DOM manipulation (non-React state for performance)
- Lightweight custom i18n system
- Vite path alias: `@` mapped to `./src`

### 📝 Notes
- SVG templates are loaded from `src/assets/teeth-svgs` and `src/assets/icon-svgs`, so static hosting must serve the public folder.
- The odontogram engine uses its own internal state (not React state) for performance and simplicity.
- Milk teeth have a reduced set of available materials (no amalgam fillings, no pin-based endo).
- Implant teeth have a different set of crown/abutment options than natural teeth.

---

## 🇩🇪 Deutsch

### 📋 Übersicht
Dieses Projekt ist ein interaktiver, browserbasierter Odontogramm-Editor, der eine schnelle Zahnstatuserfassung mit einer übersichtlichen Benutzeroberfläche unterstützt. Es rendert geschichtete SVG-Zahnvorlagen zur Darstellung von Restaurationen, Karies, endodontischem Status, Mobilität und anderen klinischen Details, und bietet Mehrfachauswahl, Auswahlfilter und vordefinierte Statusvorlagen.

### ✨ Hauptmerkmale
- 🖱️ Schnelle Auswahl und Mehrfachauswahl (CMD/CTRL + Klick)
- 🦷 Zahntypen: bleibend, Milch, Implantat, gebrochene Varianten, Kronenpräparation, subgingival
- 👑 Kronenmaterialien: natürlich, E.max, Zirkon, Metallkeramik, provisorisch, Teleskop, Radix
- 🔩 Implantat-Abutments: Heilabutment, Locator, Locator mit Prothese, Steg, Steg mit Prothese
- 🌉 Brückenglieder: Zirkon, Metall, provisorisch, herausnehmbar, Steg, Steg mit Prothese
- 🔍 Karieskartierung auf 6 Flächen: mesial, distal, bukkal, lingual, okklusal, subkronal
- 🪥 Füllungsmaterialien pro Fläche: Amalgam, Komposit, GIZ, provisorisch
- 🏥 Endodontische Zustände: medikamentöse Füllung, Wurzelfüllung, inkomplette Wurzelfüllung, Glasfaserstift, Metallstift, Resektion, parapulpaler Stift
- ⚕️ Modifikationen: periapikale Entzündung (innen/außen), Parodontalerkrankung, Mobilitätsgrade (M1/M2/M3)
- 🏷️ Spezielle Indikatoren: Krone erforderlich, Kronenwechsel erforderlich, geschlossene Lücke, Extraktionsplan, Bruxismus-Abrieb/Zervikaler Abrieb, Fissurenversiegelung, Kontaktpunktverlust
- 👁️ Okklusionsansicht, Weisheitszähne, Knochen- und Pulpa-Sichtbarkeit
- 🔢 12 Auswahlfilter (alle, vorhandene, bleibende, Milch, Implantate, fehlende, Ober-/Unterkiefer, Front/Molaren)
- 📊 Vordefinierte Statusvorlagen (Zurücksetzen, Milchgebiss, Wechselgebiss, zahnlos)
- 📦 34 vordefinierte Restaurationsvorlagen (Brücken, herausnehmbare Prothesen, Stegprothesen mit Implantaten)
- 💾 Status-Export/Import in JSON (Version 1.1)
- 🔢 Drei Nummerierungssysteme (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU) mit Sprachumschalter (157+ Übersetzungsschlüssel pro Sprache)
- 🌗 Dunkler Modus mit Umschalt-Button (eigenständig oder von der übergeordneten App gesteuert)

### 📦 Module
- 🦷 Odontogramm-Raster und Zahngitter-UI
- 🎛️ Steuerung und Statuspanel
- 🎨 SVG-Schichtungsmotor und Vorlagen
- 🔢 Zahnnummerierung und Beschriftung (FDI/Universal/Palmer)
- 🌐 Lokalisierung (HU/EN/DE/ES/IT/SK/PL/RU)
- 💾 Status-Export/Import
- 📋 Status-Extras: vordefinierte Restaurationsvorlagen

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
- Oberer/Unterer Zirkon-Brücken (12-22, 13-23, 16-26, Vollbogen)
- Oberer/Unterer Metall-Brücken (12-22, 13-23, 16-26, Vollbogen)
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
| `tooth-crownprep` | Für Krone präparierter Zahn |
| `tooth-under-gum` | Subgingivaler (nicht durchgebrochener) Zahn |

**Gebrochene Zahnvarianten:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Kronenmaterialien (bleibende Zähne):**
`natural`, `broken`, `radix`, `emax`, `zircon`, `metal`, `temporary`, `telescope`

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

**Spezielle Indikatoren:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `parapulpalPin`

### 🖼️ SVG-Vorlagensystem

**Zahnvorlagen** (`src/assets/teeth-svgs/`):
| Vorlage | Verwendende Zähne |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (Schneidezähne) |
| `13.svg` | 13, 23, 33, 43 (Eckzähne) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (Prämolaren) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (Molaren) |

Vorlagen werden für den Unterkiefer um 180 Grad gedreht und für die linke Seite horizontal gespiegelt.

**Icon-SVGs** (`src/assets/icon-svgs/`):
`icon_8.svg` (Weisheit), `icon_gum.svg` (Knochen), `icon_no_selection.svg` (Löschen), `icon_occl.svg` (Okklusionsansicht), `icon_pulp.svg` (Pulpa)

### 🔢 Nummerierungssysteme

**FDI (ISO 3950):** Erwachsene Zähne 11-18, 21-28, 31-38, 41-48. Milchzähne 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Erwachsene Zähne nummeriert 1-32. Milchzähne mit Buchstaben A-T.

**Palmer (Zsigmondy-Palmer):** Quadrant + Positionsformat (z.B. UR-1, LL-5). Milchzähne verwenden Buchstaben A-E pro Quadrant.

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
- **Eigenständiger Modus:** `darkMode`-Prop weglassen — die Komponente verwaltet ihren eigenen Theme-Zustand über den Umschalter in der Kopfleiste und fügt die `.dark`-Klasse auf `<html>` hinzu/entfernt sie.
- **Gesteuerter Modus:** `darkMode` und `onDarkModeChange` übergeben — die übergeordnete App steuert das Theme. Der Umschalter erscheint weiterhin, ruft aber `onDarkModeChange` auf, anstatt den internen Zustand zu verwalten. Die übergeordnete App ist für das Hinzufügen/Entfernen der `.dark`-Klasse auf `<html>` verantwortlich.

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

### 📁 Ordnerstruktur
- `src/App.tsx` - UI-Hülle, Kopfleisten-Steuerung, Sprach-/Nummerierungs-/Dunkelmodus-Umschalter
- `src/odontogram.ts` - SVG-Schichtungsmotor, Zahnstatusmanagement, UI-Verdrahtung
- `src/status_extras.ts` - 34 vordefinierte Restaurationsvorlagen (Brücken, Prothesen, Stegkonstruktionen)
- `src/i18n/` - Übersetzungen (HU/EN/DE/ES/IT/SK/PL/RU) und i18n-Hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer Nummerierungskonvertierung
- `src/assets/teeth-svgs/` - SVG-Zahnvorlagen (6 Dateien: Schneide-, Eck-, Prämolaren, Molaren + Okklusionsansichten)
- `src/assets/icon-svgs/` - Toolbar-Icon-SVGs (5 Dateien)

### ⚙️ Technologie-Stack
- React 18 + Vite + TypeScript
- Tailwind CSS für UI-Styling
- SVG-Schichtung über DOM-Manipulation (nicht React-State für Performance)
- Leichtgewichtiges eigenes i18n-System
- Vite-Pfadalias: `@` auf `./src` abgebildet

---

## 🇪🇸 Español

### 📋 Descripción general
Este proyecto es un editor de odontograma interactivo basado en navegador que permite un registro rápido del estado dental con una interfaz limpia. Renderiza plantillas SVG de dientes en capas para representar restauraciones, caries, estado endodóntico, movilidad y otros detalles clínicos, proporcionando selección múltiple, filtros de selección y estados predefinidos.

### ✨ Características principales
- 🖱️ Selección rápida y selección múltiple (CMD/CTRL + clic)
- 🦷 Tipos de diente: permanente, primario (de leche), implante, variantes fracturadas, preparación para corona, subgingival
- 👑 Materiales de corona: natural, e.max, circonio, metalcerámica, provisional, telescópica, radix
- 🔩 Pilares de implante: pilar de cicatrización, localizador, localizador con prótesis, barra, barra con prótesis
- 🌉 Pónticos: circonio, metal, provisional, removible, barra, barra con prótesis
- 🔍 Registro de caries en 6 superficies: mesial, distal, bucal, lingual, oclusal, subcoronal
- 🪥 Materiales de obturación por superficie: amalgama, composite, ionómero de vidrio, temporal
- 🏥 Estados endodónticos: obturación medicinal, tratamiento de conductos, obturación incompleta, poste de fibra de vidrio, poste metálico, resección, pin parapulpar
- ⚕️ Modificaciones: inflamación periapical (interna/externa), enfermedad periodontal, grados de movilidad (M1/M2/M3)
- 🏷️ Indicadores especiales: corona necesaria, reemplazo de corona necesario, espacio cerrado, plan de extracción, desgaste por bruxismo/desgaste cervical, sellado de fisuras, pérdida de punto de contacto
- 👁️ Vista oclusal, muelas del juicio, visibilidad de hueso y pulpa
- 🔢 12 filtros de selección (todos, presentes, permanentes, de leche, implantes, ausentes, superior/inferior, frontales/molares)
- 📊 Estados predefinidos (restablecer, dentición primaria, dentición mixta, edéntulo)
- 📦 34 plantillas de restauración predefinidas (puentes, prótesis removibles, prótesis con barra e implantes)
- 💾 Exportación/importación de estado en JSON (versión 1.1)
- 🔢 Tres sistemas de numeración (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU) con selector de idioma (157+ claves de traducción por idioma)
- 🌗 Modo oscuro con botón de alternancia (independiente o controlado por la aplicación principal)

### 📦 Módulos
- 🦷 Cuadrícula del odontograma e interfaz de mosaicos dentales
- 🎛️ Panel de controles y estado
- 🎨 Motor de capas SVG y plantillas
- 🔢 Numeración dental y mapeo de etiquetas (FDI/Universal/Palmer)
- 🌐 Localización (HU/EN/DE/ES/IT/SK/PL/RU)
- 💾 Exportación/importación de estado
- 📋 Extras de estado: plantillas de restauración predefinidas

### 🛠️ Controles de interfaz

**🔝 Barra superior:**
- Selector de idioma (HU/EN/DE/ES/IT/SK/PL/RU desplegable)
- Botón de modo oscuro (icono sol/luna, alterna entre tema claro y oscuro)
- Selector de sistema de numeración (FDI/Universal/Palmer desplegable)
- Botones Exportar estado / Importar estado

**📊 Encabezado del gráfico:**
- Alternador de vista oclusal
- Alternador de visibilidad de muelas del juicio
- Alternador de visibilidad de hueso
- Alternador de visibilidad de pulpa
- Botón borrar selección

**🔍 Filtros de selección:**
- Seleccionar todos / Todos presentes / Permanentes / De leche / Implantes / Todos ausentes
- Superior / Superior 6 frontales / Molares superiores
- Inferior / Inferior 6 frontales / Molares inferiores

**📋 Estados predefinidos:**
- Restablecer todo (restablecer boca)
- Dentición primaria
- Dentición mixta
- Edéntulo alternador

**📦 Desplegable de extras de estado:**
- Puentes de circonio superiores/inferiores (12-22, 13-23, 16-26, arco completo)
- Puentes metálicos superiores/inferiores (12-22, 13-23, 16-26, arco completo)
- Prótesis parciales removibles superiores/inferiores
- Prótesis completas removibles superiores/inferiores
- Prótesis con barra superiores/inferiores con implantes

### 🦷 Tipos de dientes y estados

**Selección de diente (tipo base):**
| Valor | Descripción |
|---|---|
| `none` | Diente ausente |
| `tooth-base` | Diente permanente |
| `milktooth` | Diente primario (deciduo) |
| `implant` | Implante dental |
| `tooth-crownprep` | Diente preparado para corona |
| `tooth-under-gum` | Diente subgingival (no erupcionado) |

**Variantes de diente fracturado:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Materiales de corona (dientes permanentes):**
`natural`, `broken`, `radix`, `emax`, `zircon`, `metal`, `temporary`, `telescope`

**Materiales de corona (implantes):**
`natural` (ninguno), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Pónticos:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Opciones endodónticas (dientes permanentes):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opciones endodónticas (dientes de leche):**
`none`, `endo-medical-filling`

**Materiales de obturación (dientes permanentes):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiales de obturación (dientes de leche):**
`composite`, `gic`, `temporary`

**Superficies de obturación/caries:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (solo caries)

**Modificaciones:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Indicadores especiales:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `parapulpalPin`

### 🖼️ Sistema de plantillas SVG

**Plantillas dentales** (`src/assets/teeth-svgs/`):
| Plantilla | Dientes que la usan |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisivos) |
| `13.svg` | 13, 23, 33, 43 (caninos) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premolares) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molares) |

Las plantillas se rotan 180 grados para la mandíbula inferior y se reflejan horizontalmente para el lado izquierdo.

**SVGs de iconos** (`src/assets/icon-svgs/`):
`icon_8.svg` (muela del juicio), `icon_gum.svg` (hueso), `icon_no_selection.svg` (borrar), `icon_occl.svg` (vista oclusal), `icon_pulp.svg` (pulpa)

### 🔢 Sistemas de numeración

**FDI (ISO 3950):** Dientes adultos 11-18, 21-28, 31-38, 41-48. Dientes primarios 51-55, 61-65, 71-75, 81-85.

**Universal (EE.UU.):** Dientes adultos numerados 1-32. Dientes primarios con letras A-T.

**Palmer (Zsigmondy-Palmer):** Formato cuadrante + posición (ej. UR-1, LL-5). Dientes primarios usan letras A-E por cuadrante.

### 🚀 Uso
Desarrollo:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Vista previa:
```bash
npm run preview
```

### 🔗 Integración
El componente se puede integrar en cualquier aplicación React.
Ejemplo:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="es"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Integración del modo oscuro:**
- **Modo independiente:** Omitir la prop `darkMode` — el componente gestiona su propio estado de tema a través del botón en la barra superior y añade/elimina la clase `.dark` en `<html>`.
- **Modo controlado:** Pasar `darkMode` y `onDarkModeChange` — la aplicación principal controla el tema. El botón de alternancia sigue apareciendo pero llama a `onDarkModeChange` en lugar de gestionar el estado interno. La aplicación principal es responsable de añadir/eliminar la clase `.dark` en `<html>`.

### 📡 API pública

**Props del componente:**

| Prop | Tipo | Predeterminado | Descripción |
|---|---|---|---|
| `language` | `string` | `'hu'` | Idioma de la UI (hu/en/de/es/it/sk/pl/ru) |
| `onLanguageChange` | `(lang) => void` | — | Callback cuando cambia el idioma |
| `numberingSystem` | `string` | `'FDI'` | Sistema de numeración (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback cuando cambia la numeración |
| `darkMode` | `boolean` | `undefined` | Estado del modo oscuro. Omitir para modo independiente. |
| `onDarkModeChange` | `(dark) => void` | — | Callback al alternar modo oscuro. Requerido para modo controlado. |

**Funciones exportadas para control externo:**

| Función | Descripción |
|---|---|
| `initOdontogram()` | Inicializar el motor y renderizar todos los dientes |
| `destroyOdontogram()` | Limpiar el motor y eliminar los event listeners |
| `setNumberingSystem(system)` | Cambiar entre FDI, Universal, Palmer |
| `clearSelection()` | Deseleccionar todos los dientes |
| `setOcclusalVisible(on)` | Alternar vista oclusal on/off |
| `setWisdomVisible(on)` | Mostrar/ocultar muelas del juicio |
| `setShowBase(on)` | Mostrar/ocultar capa de hueso |
| `setHealthyPulpVisible(on)` | Mostrar/ocultar pulpa sana |

### 📁 Estructura de carpetas
- `src/App.tsx` - UI principal, controles de barra superior, selector de idioma/numeración/modo oscuro
- `src/odontogram.ts` - Motor de capas SVG, gestión de estado dental, cableado UI
- `src/status_extras.ts` - 34 plantillas de restauración predefinidas (puentes, prótesis, construcciones con barra)
- `src/i18n/` - traducciones (HU/EN/DE/ES/IT/SK/PL/RU) y hook i18n
- `src/utils/numbering.ts` - conversión de numeración FDI, Universal, Palmer
- `src/assets/teeth-svgs/` - plantillas SVG dentales (6 archivos: incisivos, caninos, premolares, molares + vistas oclusales)
- `src/assets/icon-svgs/` - SVGs de iconos de barra de herramientas (5 archivos)

### ⚙️ Stack tecnológico
- React 18 + Vite + TypeScript
- Tailwind CSS para estilos de UI
- Capas SVG mediante manipulación del DOM (no React state por rendimiento)
- Sistema i18n propio ligero
- Alias de ruta Vite: `@` mapeado a `./src`

---

## 🇭🇺 Magyar

<img width="1725" height="952" alt="react-odontogram-modul-preview" src="https://github.com/user-attachments/assets/8694c7ec-da1b-4664-b7d7-f70ff8737f45" />

### 📋 Áttekintés
A projekt egy interaktív, böngészőben futó odontogram szerkesztő, amely a fogazati státuszrögzítést modern, gyorsan kezelhető UI-val támogatja. A rendszer különböző fogtípusokat, restaurációkat, gyökérkezelési állapotokat, fogszuvasodás felületeket, mobilitást és egyéb odontológiai jellemzőket képes rétegzett SVG ikonokkal megjeleníteni, miközben többfogos kiválasztást, szűrőket és előre definiált státusz mintákat is biztosít.

### ✨ Főbb funkciók
- 🖱️ Gyors fogkijelölés és többfogos kiválasztás (CMD/CTRL + kattintás)
- 🦷 Fogtípusok: maradó, tej, implantátum, tört változatok, koronaelőkészítés, íny alatti
- 👑 Korona anyagok: természetes, e.max, cirkón, fém-kerámia, ideiglenes, teleszkóp, radix
- 🔩 Implantátum felépítmények: gyógyuló csavar, lokátor, lokátor protézissel, bár, bár protézissel
- 🌉 Hídtagok: cirkón, fém, ideiglenes, kivehető, bár, bár protézissel
- 🔍 Kariesz kartografálás 6 felületen: meziális, disztális, bukkális, linguális, okkluzális, korona alatti
- 🪥 Tömés anyagok felületenként: amalgám, kompozit, GIC, ideiglenes
- 🏥 Endodonciai állapotok: gyógyszeres tömés, gyökértömés, incomplét gyökértömés, üvegszálas csap, fém csap, rezekció, parapulpális csap
- ⚕️ Módosítók: periapikális gyulladás (belső/külső), parodontális betegség, mobilitás fokok (M1/M2/M3)
- 🏷️ Speciális jelzők: korona szükséges, korona csere szükséges, zárt hézag, extrakciós terv, bruxizmus koptatás/nyaki koptatás, fisszúra zárás, kontaktpont vesztés
- 👁️ Okkluzális nézet, bölcsességfog, csont és pulpa láthatóság kapcsolók
- 🔢 12 kiválasztási szűrő (összes, jelenlévő, maradó, tej, implantátum, hiányzó, felső/alsó, front/molárisok)
- 📊 Előre definiált státusz minták (alaphelyzet, tejfogazat, vegyes fogazat, fogatlan)
- 📦 34 előre definiált restaurációs sablon (hidak, kivehető protézisek, bár protézisek implantokkal)
- 💾 Állapot export/import JSON formátumban (1.1 verzió)
- 🔢 Három számozási rendszer (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU) választható nyelvvel (157+ fordítási kulcs nyelvenként)
- 🌗 Sötét mód támogatás váltógombbal (önálló vagy szülő alkalmazás által vezérelt)

### 📦 Modulok
- 🦷 Odontogram rács és fogcsempe UI
- 🎛️ Vezérlők és státusz panel
- 🎨 SVG rétegelő motor és fogsablonok
- 🔢 Fogszámozás és címke generálás (FDI/Universal/Palmer)
- 🌐 Lokalizáció (HU/EN/DE/ES/IT/SK/PL/RU)
- 💾 Státusz export/import
- 📋 Státusz extrák: előre definiált restaurációs sablonok

### 🛠️ UI vezérlők

**🔝 Fejléc sáv:**
- Nyelvválasztó (HU/EN/DE/ES/IT/SK/PL/RU legördülő)
- Sötét mód váltógomb (nap/hold ikon, világos és sötét téma között vált)
- Számozási rendszer választó (FDI/Universal/Palmer legördülő)
- Státusz exportálás / Státusz importálás gombok

**📊 Diagram fejléc:**
- Okkluzális nézet kapcsoló
- Bölcsességfog láthatóság kapcsoló
- Csont láthatóság kapcsoló
- Pulpa láthatóság kapcsoló
- Kiválasztás törlése gomb

**🔍 Kiválasztási szűrők:**
- Összes kiválasztása / Összes jelenlévő / Maradó / Tej / Implantátumok / Összes hiányzó
- Felső / Felső front 6 / Felső molárisok
- Alsó / Alsó front 6 / Alsó molárisok

**📋 Státusz minták:**
- Összes visszaállítása (szájüreg reset)
- Tejfogazat
- Vegyes fogazat
- Fogatlan kapcsoló

**📦 Státusz extrák legördülő:**
- Felső/Alsó cirkón hidak (12-22, 13-23, 16-26, teljes ív)
- Felső/Alsó fém hidak (12-22, 13-23, 16-26, teljes ív)
- Felső/Alsó részleges kivehető protézisek
- Felső/Alsó teljes kivehető protézisek
- Felső/Alsó bár protézisek implantátumokkal

### 🦷 Fogtípusok és állapotok

**Fog kiválasztás (alaptípus):**
| Érték | Leírás |
|---|---|
| `none` | Hiányzó fog |
| `tooth-base` | Maradó fog |
| `milktooth` | Tejfog |
| `implant` | Fogimplantátum |
| `tooth-crownprep` | Koronaelőkészített fog |
| `tooth-under-gum` | Íny alatti (előbújatlan) fog |

**Tört fog változatok:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Korona anyagok (maradó fogak):**
`natural`, `broken`, `radix`, `emax`, `zircon`, `metal`, `temporary`, `telescope`

**Korona anyagok (implantátumok):**
`natural` (nincs), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Hídtagok:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Endodonciai lehetőségek (maradó fogak):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodonciai lehetőségek (tejfogak):**
`none`, `endo-medical-filling`

**Tömés anyagok (maradó fogak):**
`amalgam`, `composite`, `gic`, `temporary`

**Tömés anyagok (tejfogak):**
`composite`, `gic`, `temporary`

**Tömés/kariesz felületek:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (csak kariesz)

**Módosítók:**
`inflammation` (periapikális), `parodontal` (parodontális), `mobility` (M1/M2/M3)

**Speciális jelzők:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `parapulpalPin`

### 🖼️ SVG sablon rendszer

**Fogsablonok** (`src/assets/teeth-svgs/`):
| Sablon | Használó fogak |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (metszőfogak) |
| `13.svg` | 13, 23, 33, 43 (szemfogak) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (kis őrlőfogak) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (nagy őrlőfogak) |

A sablonok az alsó állcsontnál 180 fokkal elforgatva, a bal oldalnál vízszintesen tükrözve jelennek meg.

**Ikon SVG-k** (`src/assets/icon-svgs/`):
`icon_8.svg` (bölcsesség), `icon_gum.svg` (csont), `icon_no_selection.svg` (törlés), `icon_occl.svg` (okkluzális nézet), `icon_pulp.svg` (pulpa)

### 🔢 Számozási rendszerek

**FDI (ISO 3950):** Felnőtt fogak 11-18, 21-28, 31-38, 41-48. Tejfogak 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Felnőtt fogak 1-32 számozással. Tejfogak A-T betűkkel.

**Palmer (Zsigmondy-Palmer):** Kvadráns + pozíció formátum (pl. UR-1, LL-5). Tejfogak kvadránsonként A-E betűkkel.

### 🚀 Használat
Fejlesztés indítása:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Előzetes megtekintés:
```bash
npm run preview
```

### 🔗 Integráció
A komponens külön is felhasználható React alkalmazásban.
Példaként:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="hu"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Sötét mód integráció:**
- **Önálló mód:** A `darkMode` prop elhagyása — a komponens saját maga kezeli a téma állapotát a fejléc váltógombján keresztül, és hozzáadja/eltávolítja a `.dark` osztályt a `<html>` elemen.
- **Vezérelt mód:** A `darkMode` és `onDarkModeChange` átadása — a szülő alkalmazás vezérli a témát. A váltógomb továbbra is megjelenik, de a `onDarkModeChange` callbacket hívja a belső állapot kezelése helyett. A szülő alkalmazás felelős a `.dark` osztály hozzáadásáért/eltávolításáért a `<html>` elemen.

### 📡 Nyilvános API

**Komponens propok:**

| Prop | Típus | Alapértelmezett | Leírás |
|---|---|---|---|
| `language` | `string` | `'hu'` | UI nyelv (hu/en/de/es/it/sk/pl/ru) |
| `onLanguageChange` | `(lang) => void` | — | Callback nyelvváltáskor |
| `numberingSystem` | `string` | `'FDI'` | Számozási rendszer (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback számozásváltáskor |
| `darkMode` | `boolean` | `undefined` | Sötét mód állapot. Elhagyva: önálló mód. |
| `onDarkModeChange` | `(dark) => void` | — | Callback sötét mód váltáskor. Szükséges vezérelt módhoz. |

**Exportált függvények külső vezérléshez:**

| Függvény | Leírás |
|---|---|
| `initOdontogram()` | Motor inicializálása és összes fog renderelése |
| `destroyOdontogram()` | Motor leállítása és eseménykezelők eltávolítása |
| `setNumberingSystem(system)` | Váltás FDI, Universal, Palmer között |
| `clearSelection()` | Összes fog kiválasztásának törlése |
| `setOcclusalVisible(on)` | Okkluzális nézet be/ki |
| `setWisdomVisible(on)` | Bölcsességfogak mutatása/elrejtése |
| `setShowBase(on)` | Csont réteg mutatása/elrejtése |
| `setHealthyPulpVisible(on)` | Egészséges pulpa mutatása/elrejtése |

### 📁 Mappastruktúra
- `src/App.tsx` - UI váz, fejléc vezérlők, nyelv/számozás/sötét mód választó
- `src/odontogram.ts` - SVG rétegelő motor, fog állapotkezelés, UI összekötés
- `src/status_extras.ts` - 34 előre definiált restaurációs sablon (hidak, protézisek, bár konstrukciók)
- `src/i18n/` - fordítások (HU/EN/DE/ES/IT/SK/PL/RU) és i18n hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer számozási konverzió
- `src/assets/teeth-svgs/` - SVG fogsablonok (6 fájl: metszők, szemfogak, kis őrlők, nagy őrlők + okkluzális nézetek)
- `src/assets/icon-svgs/` - eszköztár ikon SVG-k (5 fájl)

### ⚙️ Technológia
- React 18 + Vite + TypeScript
- Tailwind CSS a UI stílusokhoz
- SVG rétegelés DOM manipulációval (nem React state, a teljesítmény érdekében)
- Egyszerű egyedi i18n rendszer
- Vite útvonal alias: `@` a `./src` mappára képezve

### 📝 Megjegyzések
- A SVG sablonok `src/assets/teeth-svgs` és `src/assets/icon-svgs` mappa alól kerülnek betöltésre, ezért statikus hostingnál a public mappa elérhetősége kötelező.
- Az UI rétegelés és állapotkezelés jelenleg nem React state-ben, hanem saját belső állapotban működik.
- A tejfogaknál szűkebb anyagválaszték áll rendelkezésre (nincs amalgám tömés, nincs csapos endo).
- Az implantátum fogaknál a koronalehetőségek eltérnek a természetes fogakétól (lokátor, bár, gyógyuló csavar).

---

## 📄 License

Created by Zoltan Dul (2026)
Use it by MIT license.
