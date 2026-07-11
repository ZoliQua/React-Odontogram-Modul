# 🦷 React Odontogram Modul

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-1.13.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![DOI](src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](#-english) | 🇪🇸 [Español](#-español) | 🇩🇪 [Deutsch](lang/README-de.md) | 🇭🇺 [Magyar](lang/README-hu.md) | 🇮🇹 [Italiano](lang/README-it.md) | 🇸🇰 [Slovenčina](lang/README-sk.md) | 🇵🇱 [Polski](lang/README-pl.md) | 🇷🇺 [Русский](lang/README-ru.md) | 🇧🇷 [Português (BR)](lang/README-pt-br.md)

## 🇬🇧 English

### 📋 Overview
This project is an interactive, browser-based odontogram editor that supports fast dental charting with a clean UI. It renders layered SVG tooth templates to represent restorations, caries, endodontic status, mobility, and other clinical details, while providing multi-select, selection filters, and predefined status presets.

---
<img width="1728" height="922" alt="react-odontogram-modul-english-preview" src="https://github.com/user-attachments/assets/0d6e076e-a840-408c-93cc-974e0767aaaf" />

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### ✨ Key Features
- 🖱️ Fast selection and multi-select (CMD/CTRL + click)
- 🦷 Tooth types: permanent, primary (milk), implant, subgingival, missing
- 👑 Crown materials: natural (full crown), broken, prepared for crown, radix, e.max, zircon, metal-ceramic, temporary, telescope
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
- 💾 Status export/import in JSON (version 1.4, with plugin custom states and per-tooth notes)
- 🔗 HL7 FHIR R4 export (collection Bundle of per-tooth Observations, ISO 3950 tooth coding for permanent dentition, local code system — SNOMED CT mapping planned)
- ✚ Cross/plus surface selection UI (B/M/O/D/L) for caries and fillings
- 🧱 Per-surface restoration materials (mixed fillings, e.g. buccal amalgam + distal composite)
- 🖼️ PNG/JPG/SVG image export of the chart (downloadable; PNG/JPG rasterized from vector SVG)
- 🦷 Secondary (recurrent) caries — auto-derived when caries overlaps a filling
- 🪨 Calculus, root resorption, and typed periapical lesions (granuloma / cyst / abscess)
- 📏 Per-surface caries depth (superficial / dentin / deep), or optional ICDAS II scoring (0–6) via `enableIcdas`
- 🧰 Unified topbar icon row with a Settings menu (numbering, notes, ICDAS, tooth information)
- 📋 Tooth information panel: live text summary of the whole chart (tooth counts, present/missing lists, caries incl. secondary, fillings, root canals, prosthetics, implants, periodontal status) — shown by default, toggleable in Settings
- 🗂️ Consolidated Export dropdown (Status JSON / FHIR / PNG / JPG)
- 📥 Import dropdown with FHIR import (round-trips exported Bundles)
- ⏳ Progress overlay during image export
- 🎓 12-step interactive intro tour
- 🔢 Three numbering systems (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) with language switcher (190+ translation keys per language)
- 🌗 Dark mode support with toggle button (standalone or controlled by parent app)
- 🎨 Custom theme configuration (`themeConfig` prop) with CSS custom properties (`--odon-*`)
- 📱 Mobile touch UX: tap-to-zoom popover, long-press context menu, pinch-to-zoom, WCAG 44px touch targets, arch toggle navigation
- 🔌 Custom SVG plugin system: inject visual overlays, per-tooth custom state, JSON export/import support
- ⚠️ State validation warnings for incompatible tooth state combinations
- 🏷️ Automatic state tooltip on tooth tiles (shows all active states)
- ♿ Keyboard accessibility (WCAG): ARIA listbox/option roles, Enter/Space selection, arrow key navigation, focus-visible outlines
- 🔒 Read-only mode: disable all interactions for print/report/view use cases
- ✨ Selection animations: pulsing dashed border and glowing drop-shadow on selected teeth (with prefers-reduced-motion support)
- 📝 Per-tooth notes: double-click to add/edit notes, note icon next to tooth number, hover tooltip with note text, JSON export/import
- 🧪 202 automated tests (Vitest) across 16 test files covering numbering, translations, presets, i18n, App component, theme, touch, plugins and accessibility
- 📖 TypeDoc API documentation with JSDoc comments on all public exports (`npm run docs`)

### 📦 Modules
- 🦷 Odontogram grid and tooth tile UI
- 🎛️ Controls and status panel
- 🎨 SVG layering engine and templates
- 🔢 Tooth numbering and label mapping (FDI/Universal/Palmer)
- 🌐 Localization (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- 💾 Status export/import
- 📋 Status extras: predefined restoration templates
- 🎨 Theme configuration: customizable color palette via `--odon-*` CSS properties
- 📱 Mobile touch interactions (tap-to-zoom, long-press, pinch-to-zoom, arch toggle)
- 🔌 Custom SVG plugin system
- ⚠️ State validation and tooltip system
- ♿ Keyboard accessibility and ARIA support
- 🔒 Read-only mode
- ✨ Selection animations
- 📝 Per-tooth notes system
- 🧪 Automated test suite (Vitest + Testing Library)

### 🛠️ UI Controls

**🔝 Topbar:**
- Language switcher (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR dropdown)
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
| `tooth-under-gum` | Subgingival (unerupted) tooth |

**Broken tooth variants:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Crown materials (permanent teeth):**
`radix`, `natural` (full crown, default), `broken`, `crownprep` (prepared for crown), `emax`, `zircon`, `metal`, `temporary`, `telescope`

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

**Periapical lesion type** (qualifies `inflammation`):
`none`, `granuloma`, `cyst`, `abscess`

**Caries depth** (per surface): `superficial` / `dentin` / `deep`, or optional ICDAS II codes `0–6` when `enableIcdas` is set

**Special indicators:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `rootResorption`, `calculus`, `parapulpalPin`

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

**Custom theme:**
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

**Plugin integration:**
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

// Set plugin state for a tooth:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 Testing
```bash
npm run test           # Run all 202 tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

### 📖 API Documentation
```bash
npm run docs           # Generate TypeDoc docs in docs/
```

### 📡 Public API

**Component props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `language` | `string` | `'hu'` | UI language (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Callback when language changes |
| `numberingSystem` | `string` | `'FDI'` | Numbering system (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback when numbering changes |
| `darkMode` | `boolean` | `undefined` | Dark mode state. Omit for standalone mode. |
| `onDarkModeChange` | `(dark) => void` | — | Callback when dark mode toggles. Required for controlled mode. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Custom color overrides via CSS custom properties (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Custom SVG plugins for visual overlays and per-tooth custom state. |
| `readOnly` | `boolean` | `undefined` | Disable all interactions (click, touch, keyboard). Useful for print/report views. |
| `enableNotes` | `boolean` | `undefined` | Enable per-tooth notes. Double-click a tooth to add/edit notes. |

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
| `registerPlugins(plugins)` | Register custom SVG plugins |
| `setPluginState(toothNo, pluginId, value)` | Set a plugin's custom state for a tooth |
| `getPluginState(toothNo, pluginId)` | Get a plugin's custom state for a tooth |
| `getToothStateSummary(toothNo)` | Get localized summary of all active states |
| `getOdontogramSummary()` | Get a structured, localized text summary of the whole chart (counts, sections) |
| `onStateChange(callback)` | Subscribe to state changes; returns an unsubscribe function |
| `setReadOnly(value)` | Enable/disable read-only mode |
| `getReadOnly()` | Get current read-only state |
| `setNotesEnabled(value)` | Enable/disable per-tooth notes |
| `getNotesEnabled()` | Get current notes-enabled state |
| `exportFhir(options?)` | Export the chart as an HL7 FHIR R4 collection Bundle (JSON download). Optional `{ subject }` reference; otherwise a placeholder Patient is embedded |
| `exportImage(format)` | Download the chart as an image — `"png"` or `"jpg"` |
| `exportSvg()` | Download the chart as a scalable SVG (vector) |
| `importFhirBundle(input)` | Import a FHIR R4 Bundle (object or JSON string) produced by this module |
| `setImportFormat(format)` | Set the next file import's parser — `"status"` or `"fhir"` |
| `startIntroTour()` | Launch the 12-step interactive intro tour |

### 💾 Status Export/Import Format
The export creates a JSON file (version `1.4`) containing:

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
- `customStates` - plugin custom states (object, keyed by plugin ID)
- `note` - per-tooth text note (string, optional — only present when non-empty)

### 📁 Folder Structure
- `src/App.tsx` - shell UI, topbar controls, language/numbering/dark mode/theme/plugin switcher
- `src/odontogram.ts` - SVG layering engine, tooth state management, touch interactions, plugin overlays, UI wiring
- `src/plugin.ts` - `OdontogramPlugin` type, `PluginLayer`, `getQuadrant()`, `LAYER_Z` z-index priorities
- `src/theme.ts` - `OdontogramThemeConfig` type and `applyThemeConfig()` utility
- `src/status_extras.ts` - 34 predefined restoration templates (bridges, dentures, bar constructions)
- `src/i18n/` - translations (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) and i18n hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer numbering conversion
- `src/__tests__/` - Vitest test suite (202 tests across 16 files)
- `src/assets/teeth-svgs/` - SVG tooth templates (6 files: incisors, canines, premolars, molars + occlusal views)
- `src/assets/icon-svgs/` - toolbar icon SVGs (5 files)

### ⚙️ Tech Stack
- React 18 + Vite + TypeScript
- Tailwind CSS for UI styling
- SVG layering via DOM manipulation (non-React state for performance)
- Lightweight custom i18n system
- Vitest + Testing Library for automated tests
- TypeDoc for API documentation
- Vite path alias: `@` mapped to `./src`

### 📝 Notes
- SVG templates are loaded from `src/assets/teeth-svgs` and `src/assets/icon-svgs`, so static hosting must serve the public folder.
- The odontogram engine uses its own internal state (not React state) for performance and simplicity.
- Milk teeth have a reduced set of available materials (no amalgam fillings, no pin-based endo).
- Implant teeth have a different set of crown/abutment options than natural teeth.

### 📖 How to cite

If you use this module in your work, please cite it.

**This version (v1.10.0):**
> Dul, Z. (2026). *React Odontogram Modul* (v1.10.0). Zenodo. https://doi.org/10.5281/zenodo.21156788

**All versions (concept DOI):** https://doi.org/10.5281/zenodo.21156787

Machine-readable citation metadata is in [`CITATION.cff`](CITATION.cff).

## 🇪🇸 Español

### 📋 Descripción general
Este proyecto es un editor de odontograma interactivo basado en navegador que permite un registro rápido del estado dental con una interfaz limpia. Renderiza plantillas SVG de dientes en capas para representar restauraciones, caries, estado endodóntico, movilidad y otros detalles clínicos, proporcionando selección múltiple, filtros de selección y estados predefinidos.

---
<img width="1727" height="870" alt="react-odontogram-modul-spanish-preview" src="https://github.com/user-attachments/assets/ef914e4f-0c7e-4c8b-a95b-76d94080a1a6" />

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### ✨ Características principales
- 🖱️ Selección rápida y selección múltiple (CMD/CTRL + clic)
- 🦷 Tipos de dientes: permanente, primario (de leche), implante, subgingival, ausente
- 👑 Materiales de corona: natural (corona completa), fracturada, preparado para corona, radix, e.max, circonio, metal-cerámica, temporal, telescópica
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
- 💾 Exportación/importación de estado en JSON (versión 1.4, con estados personalizados de plugins y notas por diente)
- 🔗 Exportación HL7 FHIR R4 (Bundle de colección con Observations por diente, codificación dental ISO 3950 para dentición permanente, sistema de códigos local — mapeo SNOMED CT planificado)
- ✚ Selección de superficies en cruz (B/M/O/D/L) para caries y obturaciones
- 🧱 Materiales de obturación por superficie (obturaciones mixtas, p. ej. bucal amalgama + distal composite)
- 🖼️ Exportación de imagen PNG/JPG/SVG del odontograma (descargable; PNG/JPG rasterizado desde SVG vectorial)
- 🦷 Caries secundaria — derivada automáticamente cuando la caries coincide con una obturación
- 🪨 Cálculo, reabsorción radicular y lesiones periapicales tipificadas (granuloma / quiste / absceso)
- 📏 Profundidad de caries por superficie (superficial / dentina / profunda), o puntuación ICDAS II opcional (0–6) con `enableIcdas`
- 🧰 Barra superior unificada de iconos con menú de Ajustes (numeración, notas, ICDAS, información dental)
- 📋 Panel de información dental: resumen de texto en vivo de todo el odontograma (recuentos de dientes, listas presentes/ausentes, caries incl. secundaria, obturaciones, endodoncias, prótesis, implantes, estado periodontal) — visible por defecto, conmutable en Ajustes
- 🗂️ Menú de exportación unificado (Estado JSON / FHIR / PNG / JPG)
- 📥 Menú de importación con importación FHIR (recupera Bundles exportados)
- ⏳ Superposición de progreso durante la exportación de imagen
- 🎓 Tour interactivo de introducción de 12 pasos
- 🔢 Tres sistemas de numeración (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) con selector de idioma (190+ claves de traducción por idioma)
- 🌗 Modo oscuro con botón de alternancia (independiente o controlado por la aplicación principal)
- 🎨 Configuración de tema personalizado (prop `themeConfig`) con CSS custom properties (`--odon-*`)
- 📱 UX táctil móvil: popover de zoom al tocar, menú contextual con pulsación larga, zoom con pellizco, áreas táctiles WCAG 44px, navegación por arcada
- 🔌 Sistema de plugins SVG personalizados: superposiciones visuales, estado personalizado por diente, soporte de exportación/importación JSON
- ⚠️ Validación de estado con advertencias para combinaciones incompatibles
- 🏷️ Tooltip automático de estado en las losetas dentales (muestra todos los estados activos)
- ♿ Accesibilidad por teclado (WCAG): roles ARIA listbox/option, selección con Enter/Espacio, navegación con flechas, contornos focus-visible
- 🔒 Modo solo lectura: desactivar todas las interacciones para vistas de impresión/informes
- ✨ Animaciones de selección: borde punteado pulsante y sombra brillante en los dientes seleccionados
- 📝 Notas por diente: doble clic para añadir/editar notas, icono de nota junto al número de diente, tooltip con texto de nota, exportación/importación JSON
- 🧪 202 pruebas automatizadas (Vitest) para numeración, traducciones, plantillas, i18n, componente App, tema, táctil, plugins y accesibilidad
- 📖 Documentación API TypeDoc con comentarios JSDoc en todas las exportaciones públicas (`npm run docs`)

### 📦 Módulos
- 🦷 Cuadrícula del odontograma e interfaz de mosaicos dentales
- 🎛️ Panel de controles y estado
- 🎨 Motor de capas SVG y plantillas
- 🔢 Numeración dental y mapeo de etiquetas (FDI/Universal/Palmer)
- 🌐 Localización (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- 💾 Exportación/importación de estado
- 📋 Extras de estado: plantillas de restauración predefinidas
- 🎨 Configuración de tema: paleta de colores personalizable mediante propiedades CSS `--odon-*`
- 📱 Interacciones táctiles móviles (zoom al tocar, pulsación larga, zoom con pellizco, alternador de arcada)
- 🔌 Sistema de plugins SVG personalizados
- ⚠️ Sistema de validación de estado y tooltips
- ♿ Accesibilidad por teclado y soporte ARIA
- 🔒 Modo solo lectura
- ✨ Animaciones de selección
- 📝 Notas por diente
- 🧪 Suite de pruebas automatizadas (Vitest + Testing Library)

### 🛠️ Controles de interfaz

**🔝 Barra superior:**
- Selector de idioma (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR desplegable)
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
| `tooth-under-gum` | Diente subgingival (no erupcionado) |

**Variantes de diente fracturado:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Materiales de corona (dientes permanentes):**
`radix`, `natural` (corona completa, predeterminado), `broken`, `crownprep` (preparado para corona), `emax`, `zircon`, `metal`, `temporary`, `telescope`

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

**Tipo de lesión periapical** (califica `inflammation`):
`none`, `granuloma`, `cyst`, `abscess`

**Profundidad de caries** (por superficie): `superficial` / `dentin` / `deep`, o códigos ICDAS II opcionales `0–6` cuando `enableIcdas` está activado

**Indicadores especiales:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `rootResorption`, `calculus`, `parapulpalPin`

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
| `language` | `string` | `'hu'` | Idioma de la UI (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Callback cuando cambia el idioma |
| `numberingSystem` | `string` | `'FDI'` | Sistema de numeración (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback cuando cambia la numeración |
| `darkMode` | `boolean` | `undefined` | Estado del modo oscuro. Omitir para modo independiente. |
| `onDarkModeChange` | `(dark) => void` | — | Callback al alternar modo oscuro. Requerido para modo controlado. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Personalización de colores mediante CSS custom properties (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Plugins SVG personalizados para superposiciones visuales y estado personalizado por diente. |
| `readOnly` | `boolean` | `undefined` | Desactivar todas las interacciones (clic, táctil, teclado). Útil para vistas de impresión/informes. |
| `enableNotes` | `boolean` | `undefined` | Activar notas por diente. Doble clic en un diente para añadir/editar notas. |

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
| `registerPlugins(plugins)` | Registrar plugins SVG personalizados |
| `setPluginState(toothNo, pluginId, value)` | Establecer estado personalizado del plugin para un diente |
| `getPluginState(toothNo, pluginId)` | Obtener estado personalizado del plugin de un diente |
| `getToothStateSummary(toothNo)` | Obtener resumen localizado de todos los estados activos |
| `getOdontogramSummary()` | Obtener un resumen de texto estructurado y localizado de todo el odontograma (recuentos, secciones) |
| `onStateChange(callback)` | Suscribirse a los cambios de estado; devuelve una función para cancelar la suscripción |
| `setReadOnly(value)` | Activar/desactivar modo solo lectura |
| `getReadOnly()` | Obtener estado actual de solo lectura |
| `setNotesEnabled(value)` | Activar/desactivar notas por diente |
| `getNotesEnabled()` | Obtener estado actual de notas |
| `exportFhir(options?)` | Exportar el odontograma como Bundle de colección HL7 FHIR R4 (descarga JSON). Referencia `{ subject }` opcional; si no, se incluye un Patient de marcador |
| `exportImage(format)` | Descargar el odontograma como imagen — `"png"` o `"jpg"` |
| `exportSvg()` | Descargar el odontograma como SVG escalable (vectorial) |
| `importFhirBundle(input)` | Importar un Bundle FHIR R4 (objeto o cadena JSON) producido por este módulo |
| `setImportFormat(format)` | Definir el parser de la próxima importación — `"status"` o `"fhir"` |
| `startIntroTour()` | Iniciar el tour interactivo de introducción de 12 pasos |

### 📁 Estructura de carpetas
- `src/App.tsx` - UI principal, controles de barra superior, selector de idioma/numeración/modo oscuro/tema
- `src/odontogram.ts` - Motor de capas SVG, gestión de estado dental, cableado UI
- `src/plugin.ts` - tipo `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, prioridades Z `LAYER_Z`
- `src/theme.ts` - tipo `OdontogramThemeConfig` y función `applyThemeConfig()`
- `src/status_extras.ts` - 34 plantillas de restauración predefinidas (puentes, prótesis, construcciones con barra)
- `src/i18n/` - traducciones (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) y hook i18n
- `src/utils/numbering.ts` - conversión de numeración FDI, Universal, Palmer
- `src/__tests__/` - suite de pruebas Vitest (202 pruebas)
- `src/assets/teeth-svgs/` - plantillas SVG dentales (6 archivos: incisivos, caninos, premolares, molares + vistas oclusales)
- `src/assets/icon-svgs/` - SVGs de iconos de barra de herramientas (5 archivos)

### ⚙️ Stack tecnológico
- React 18 + Vite + TypeScript
- Tailwind CSS para estilos de UI
- Capas SVG mediante manipulación del DOM (no React state por rendimiento)
- Sistema i18n propio ligero
- Vitest + Testing Library para pruebas automatizadas
- TypeDoc para documentación de API
- Alias de ruta Vite: `@` mapeado a `./src`

---

### 📖 Cómo citar

Si utilizas este módulo en tu trabajo, por favor cítalo.

**Esta versión (v1.10.0):**
> Dul, Z. (2026). *React Odontogram Modul* (v1.10.0). Zenodo. https://doi.org/10.5281/zenodo.21156788

**Todas las versiones (DOI de concepto):** https://doi.org/10.5281/zenodo.21156787

Los metadatos de citación legibles por máquina están en [`CITATION.cff`](CITATION.cff).

## 📄 License

Created with ❤️ by Zoltan Dul (2026)
Released under the MIT License.
