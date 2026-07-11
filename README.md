# 🦷 React Odontogram Modul

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-1.29.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
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
- 🦷 Tooth substrate (orthogonal to any restoration): natural, radix (root remnant), broken, prepared for crown
- 👑 Restorations by type × material: crown / inlay / onlay / veneer / bridge in e.max, gold, gradia, zirconia, metal, metal-ceramic, telescope or temporary (onlay is occlusal-view only) — chosen from one combined low-click "Fix: Crown – …" picker; legacy `metal` crowns migrate to `metal-ceramic` (PFM); implants use the same type × material model, composed with an implant connector layer. The picker is scoped by tooth kind: an implant offers only crown/bridge (plus its five attachment options, below); a missing/gap tooth offers only a bridge pontic (plus removable-partial/-full); a `radix` substrate hides the restoration control entirely (no restoration can be authored on a root remnant)
- 🦿 Removable/attachment prosthetics on the dedicated `prosthesis` axis ("Kivehető:" entries in the combined picker): implant healing abutment, locator, locator with overdenture, bar, bar with overdenture; tooth-supported removable partial or full denture
- 🌉 Bridge teeth render both the crown cap and the saddle connector; a multi-tooth bridge-span overlay renders one continuous, arch-aware connector across consecutive bridge teeth (pontics + abutments) and the inter-tooth gaps between them (upper vs. lower arch use mirrored saddle geometry, keeping the connector aligned on both arches), included in PNG/JPG/SVG export; applying a bridge via a Statuses preset recomputes the overlay immediately
- 🔍 Caries charting on 6 surfaces: mesial, distal, buccal, lingual, occlusal, subcrown
- 🪥 Filling materials per surface: amalgam, composite, GIC, temporary
- 🏥 One merged "Pulp / Endo status" selector (grouped: vital pulp vs. treated/endo): endodontic states (medicinal filling, root canal filling, incomplete root filling, glass fiber post, metal post) and AAE pulp diagnosis (`pulpDx`: normal / reversible / irreversible pulpitis / necrosis) are mutually exclusive — a root-treated tooth (`endo` set) cannot also carry a vital pulp diagnosis; on treatment, `pulpDx` is normalized to `normal` and the diseased-pulp glyph is suppressed. Reversible pulpitis renders a reduced pulp glyph. An optional 3-level pulp detail setting (`pulpDetailLevel`: simple / AAE / practical-Latin) surfaces 9 practical-Latin pulp subtypes (pulpa sana … gangraena pulpae) via `pulpLatin`; resection and parapulpal pin remain separate special indicators
- 🦴 Apical diagnosis (`apicalDx`: symptomatic/asymptomatic apical periodontitis, acute/chronic apical abscess, condensing osteitis) drives the periapical glyph directly; a granuloma/cyst lesion-subtype qualifier is shown only under symptomatic/asymptomatic apical periodontitis (the redundant "abscess" subtype was dropped — it's already covered by the apical diagnosis)
- 🩹 Merged "Root and periodontium" card (single collapsible section for root/periapical and periodontal findings)
- ⚕️ Modifications: periapical inflammation (shown only on missing/extraction-socket teeth; hidden on present teeth, where `apicalDx` alone drives the periapical glyph, and on implants, where `periImplant` covers it), periodontal disease, mobility grades (M1/M2/M3, hidden on implants)
- 🦷🔩 Peri-implant status (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — 2018 World Workshop staging, shown as a dedicated selector on implants; mucositis reuses the periodontal gum glyph, peri-implantitis adds a graded `peri-implant-bone-loss` layer (opacity 0.4/0.7/1.0). Implants no longer render the periapical lesion glyph — their inflammation is expressed through this axis instead — and the periodontal-modifier checkboxes are hidden on implants (the ad-hoc "Peri-implantitis" checkbox relabel is retired)
- 🏷️ Special indicators: crown needed, crown replacement needed, missing closed gap, extraction plan, fissure sealing, contact point loss
- 👁️ Occlusal view, wisdom teeth, bone and pulp visibility toggles
- 🔢 12 selection filters (all, present, permanent, milk, implants, missing, upper/lower, front/molars)
- 📊 Predefined status presets (reset, primary dentition, mixed dentition, edentulous)
- 📦 34 predefined restoration templates (bridges, removable dentures, bar dentures with implants)
- 💾 Status export/import in JSON (version 2.10; imports still accept legacy 1.4, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, and 2.9 and migrate automatically, with plugin custom states and per-tooth notes)
- 🔗 HL7 FHIR R4 export (collection Bundle of per-tooth Observations, ISO 3950 tooth coding for permanent dentition, local code system — SNOMED CT mapping planned)
- ✚ Cross/plus surface selection UI (B/M/O/D/L) for caries and fillings
- 🧱 Per-surface restoration materials (mixed fillings, e.g. buccal amalgam + distal composite)
- 🖼️ PNG/JPG/SVG image export of the chart (downloadable; PNG/JPG rasterized from vector SVG)
- 🦷 Caries/subcaries is a per-surface state machine: a caried surface with no filling renders as primary caries (ICDAS-tiered opacity); once a filling is present on that surface it renders as recurrent caries instead (the `subcaries-{surface}` layer, CARS-scored) — the two are never both active on the same surface
- 🎯 Unified per-surface severity (`cariesSeverity`, 0–6, replacing the old separate ICDAS-depth + CARS fields): read as ICDAS depth on a primary surface, as a named CARS score (Sound … Extensive cavity) on a recurrent one, via a contextual popup that shows only the scale relevant to the surface's current state
- 🌱 Root caries (`rootCaries`: none / active / arrested / active-cavitated), wiring the dedicated root-caries artwork layer at a severity-driven opacity (active 0.5 / arrested 0.7 / active-cavitated full)
- 📡 Radiographic caries depth (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 per surface), independent of the visual ICDAS/CARS severity scale, surfaced as a badge and round-tripped through its own FHIR Observation
- 🎚️ Three caries granularity settings (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) plus a `cariesDepthEnabled` toggle, collapsing each scale to a simpler picker view without losing the stored value
- 🩹 Fillings-panel subcaries summary line: lists any selected tooth with recurrent caries and its surfaces below the filling controls (e.g. "36 (O) has subcaries set on its filling.")
- 🪛 Per-surface filling defects (`fillingDefect`: none / marginal / fracture / wear) on direct restorations, independent of recurrent caries — authored via a per-surface indicator on the Fillings card (mirroring the caries-depth indicator, its option list stacked vertically), rendered on the chart, and shown in the tooltip and the whole-mouth fillings summary with an explicit label (e.g. "36 (O) – Filling defect: O: marginal"), the same way recurrent caries is labeled on the Caries line; the Fillings card also shows a hint note for any selected tooth with a recorded filling defect (e.g. "36 has a filling defect recorded."), parallel to the existing subcaries hint note
- 🦷💥 Tooth wear typed by clinical cause and location (`wearEdge`: none / attrition / erosion, incisal/occlusal; `wearCervical`: none / abrasion / abfraction / erosion, cervical) — replacing the two on/off bruxism-wear flags; authored via two dropdowns on the wear row, reuses the existing wear artwork, and shown in the tooltip and a new whole-mouth "Wear" summary section
- 🎨 Tooth discoloration by cause (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) on permanent and milk teeth — tints the shown natural crown a representative colour when the tooth has no restoration and natural substrate; shown in the tooltip and a new whole-mouth "Discoloration" summary section; completes the surface & structural conditions set alongside filling defects and wear
- ✏️ Anterior teeth (incisors/canines) label their occlusal surface "incisal" throughout the UI (picker, popup, summaries); the stored surface key stays `occlusal`
- 🔤 Position-aware surface notation (Settings → Tooth details → "Surface notation", simple/full, default full): in full mode the caries/filling surface letter and label follow tooth anatomy — occlusal → I/incisal on anterior teeth, buccal → L/labial on anterior teeth, lingual → P/palatal on upper teeth and L/lingual on lower teeth (mesial/distal/subcrown are unaffected); simple mode always uses the generic B/M/O/D/L/SC set regardless of tooth position. Applies to the whole-mouth summary and to both the caries and filling-defect surface pickers (letter + caption); the stored surface key is unaffected
- 🦷↕️ Per-tooth orthodontic charting (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: boolean) on a present natural tooth (permanent or milk) — reuses the dormant v2.5.0 ortho artwork (no new SVG); shown on the chart, in the tooltip, and a new whole-mouth "Orthodontics" summary section
- 🪨 Calculus, and root resorption typed as internal or external-cervical (`resorptionType`)
- 📏 Per-surface caries depth (superficial / dentin / deep), or optional ICDAS II scoring (0–6) via `enableIcdas`
- 🩹 Crown marginal-leakage toggle, shown only for a crown or bridge restoration
- 🧰 Unified topbar icon row with a tabbed Settings modal (General / Panels / Tooth details / Caries / Pulpa / Notes — numbering, notes, panel visibility, ICDAS, caries-depth toggle, root/radiographic caries granularity, pulp detail level, tooth wear/discoloration detail level, tooth information)
- 🗂️ Settings → "Panels" tab: independently show/hide the Statuses and Orthodontics whole-mouth summary panels
- 🩹 Secondary-caries (CARS) settings control merged into the Caries settings tab, positioned above Radiographic depth (the separate "Secondary caries" tab is retired)
- 🎚️ Tooth details detail level (Settings → Tooth details): a simple/complex setting for tooth wear and for discoloration. Simple mode shows a yes/no toggle per finding (wear on → attrition/abrasion, discoloration on → other); complex mode (default) keeps the type/cause dropdowns, and the stored value is preserved when switching levels
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
- 🩺 Modernized per-tooth tooltip and whole-mouth summary panel: both surface the full set of clinical findings (pulp/apical diagnosis + lesion subtype, root resorption, peri-implant status, graded root caries, calculus, crown marginal leakage, fracture, contact loss, typed edge/cervical wear), with a dedicated "Diagnoses" section in the panel, a dedicated "Wear" section, and a coarse caries-severity qualifier (superficial/moderate/deep)
- ♿ Keyboard accessibility (WCAG): ARIA listbox/option roles, Enter/Space selection, arrow key navigation, focus-visible outlines
- 🔒 Read-only mode: disable all interactions for print/report/view use cases
- ✨ Selection animations: pulsing dashed border and glowing drop-shadow on selected teeth (with prefers-reduced-motion support)
- 📝 Per-tooth notes: double-click to add/edit notes, note icon next to tooth number, hover tooltip with note text, JSON export/import
- 🧪 858 automated tests passing (1 additional test skipped) (Vitest) across 93 test files covering numbering, translations, presets, i18n, App component, theme, touch, plugins, accessibility, and clinical-axis/diagnosis parity
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

**Tooth substrate (permanent teeth):**
`natural` (default), `radix` (root remnant), `broken`, `crownprep` (prepared for crown)

**Restoration type (permanent teeth):**
`none`, `crown`, `inlay`, `onlay` (occlusal view only), `veneer`, `bridge`

**Restoration material (permanent teeth):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (legacy `metal` crowns migrate here), `telescope`, `temporary`

**Crown materials (implants):**
`natural` (none), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Bridge units:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Endodontic options (permanent teeth):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodontic options (milk teeth):**
`none`, `endo-medical-filling`

`endo` and `pulpDx` are surfaced through one merged "Pulp / Endo status" `<select>` (grouped: vital pulp vs. treated/endo) and are mutually exclusive — choosing a treated (`endo != none`) option resets `pulpDx` to `normal` and choosing a pulp diagnosis resets `endo` to `none`.

**Filling materials (permanent teeth):**
`amalgam`, `composite`, `gic`, `temporary`

**Filling materials (milk teeth):**
`composite`, `gic`, `temporary`

**Filling/caries surfaces:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (caries only)

**Modifications:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Periapical lesion type** (`periapicalType`; qualifies the periapical glyph, shown only under symptomatic/asymptomatic apical periodontitis):
`none`, `granuloma`, `cyst` — authoring options; the legacy `abscess` value is still accepted/stored but no longer offered in the picker, since it duplicates the apical diagnosis. On import it is dropped: folded into `apicalDx` when the tooth carries the inflammation modifier, otherwise cleared to `none`

**Pulp diagnosis** (AAE terminology; `pulpDx`):
`normal`, `reversible-pulpitis` (renders a reduced pulp glyph), `irreversible-pulpitis`, `necrosis` — mutually exclusive with `endo`; normalized to `normal` on a root-treated tooth

**Pulp diagnosis, practical Latin** (`pulpLatin`; shown by the pulp picker only when `pulpDetailLevel` is `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Pulp detail level** (`pulpDetailLevel`, global setting): `simple`, `aae` (default), `latin` — controls which pulp vocabulary the picker offers

**Apical diagnosis** (`apicalDx`; drives the periapical glyph):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Root resorption type** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Peri-implant status** (`periImplant`; implant-only, 2018 World Workshop staging): `mucositis` reuses the periodontal gum glyph; `peri-implantitis-*` adds the `peri-implant-bone-loss` layer at severity-scaled opacity (mild 0.4 / moderate 0.7 / severe 1.0). Implants no longer render the periapical lesion glyph (their inflammation is expressed via this axis instead), and the `mods` inflammation/parodontal checkboxes are hidden on implants:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Caries severity** (`cariesSeverity`; unified per-surface field, `0`–`6`): on a surface with no filling it is read as the ICDAS caries-depth scale (`superficial` / `dentin` / `deep`, or the raw ICDAS II codes `0–6` when `enableIcdas` is set) and renders the primary `caries-{surface}` layer; on a surface with a filling it is read as a named CARS score (`0` sound … `6` extensive cavity) and renders the `subcaries-{surface}` (recurrent-caries) layer instead — a surface is never both primary and recurrent at once

**Root caries** (`rootCaries`; wires the `caries-root` artwork layer on a present tooth, opacity driven by severity — `active` 0.5 / `arrested` 0.7 / `active-cavitated` full):
`none`, `active`, `arrested`, `active-cavitated`

**Radiographic caries depth** (`radiographicDepth`; per surface, independent of the visual ICDAS/CARS `cariesSeverity` scale):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Caries granularity settings** (global): `secondaryCariesMode` (`simple`/`standard`/`full`, default `standard`), `rootCariesMode` (`simple`/`severity`, default `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, default `off`), `cariesDepthEnabled` (boolean, default `true`) — each collapses its scale to a simpler picker view without altering the stored value

**Special indicators:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Tooth wear** (`wearEdge`, `wearCervical`; per-location clinical type, gated on tooth-base + no restoration + natural substrate; render the existing `tooth-bruxism-wear`/`tooth-bruxism-neck-wear` layers):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Discoloration** (`discoloration`; per-tooth cause, gated on a natural tooth-base or milk tooth + no restoration + natural substrate; tints the shown natural crown's fill — no new SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

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
npm run test           # Run all 563 tests
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
| `setPulpDetailLevel(level)` | Set the pulp picker's vocabulary — `"simple"`, `"aae"`, or `"latin"` |
| `getPulpDetailLevel()` | Get the current pulp detail level |
| `exportFhir(options?)` | Export the chart as an HL7 FHIR R4 collection Bundle (JSON download). Optional `{ subject }` reference; otherwise a placeholder Patient is embedded |
| `exportImage(format)` | Download the chart as an image — `"png"` or `"jpg"` |
| `exportSvg()` | Download the chart as a scalable SVG (vector) |
| `importFhirBundle(input)` | Import a FHIR R4 Bundle (object or JSON string) produced by this module |
| `setImportFormat(format)` | Set the next file import's parser — `"status"` or `"fhir"` |
| `startIntroTour()` | Launch the 12-step interactive intro tour |

### 💾 Status Export/Import Format
The export creates a JSON file (version `2.4`; imports also accept legacy `1.4`, `2.0`, `2.1`, `2.2`, and `2.3` and migrate automatically) containing:

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
- `endo` - endodontic state; mutually exclusive with `pulpDx` (surfaced together via one merged "Pulp / Endo status" picker — treating a tooth normalizes `pulpDx` to `normal`)
- `mods` - modifications array (inflammation, parodontal); `inflammation` is retired from the UI on present teeth (`apicalDx` drives the glyph there) but still applies to missing/extraction-socket teeth
- `caries` - active caries surfaces
- `rootCaries` - root caries severity (none/active/arrested/active-cavitated)
- `cariesSeverity` - unified per-surface severity (0-6): ICDAS depth on a primary (unfilled) surface, CARS score on a recurrent (filled) surface
- `radiographicDepth` - per-surface radiographic caries depth (none/E1/E2/D1/D2/D3), independent of the visual ICDAS/CARS scale
- `fillingMaterial` - filling material
- `fillingSurfaces` - filled surfaces
- `fillingDefect` - per-surface filling defect (none/marginal/fracture/wear), filled-surface-gated, independent of recurrent caries
- `pulpDx` - AAE pulp diagnosis (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); reversible-pulpitis renders a reduced glyph
- `pulpLatin` - practical-Latin pulp subtype (shown by the pulp picker only when `pulpDetailLevel` is `latin`)
- `apicalDx` - apical diagnosis driving the periapical glyph
- `periapicalType` - periapical lesion subtype (none/granuloma/cyst), shown only under symptomatic/asymptomatic apical periodontitis; legacy `abscess` still accepted on import
- `resorptionType` - root resorption type (none/internal/external-cervical)
- `endoResection` - apicoectomy flag
- `fissureSealing` - fissure sealant flag
- `contactMesial` - mesial contact point loss
- `contactDistal` - distal contact point loss
- `wearEdge` - incisal/occlusal wear type (none/attrition/erosion)
- `wearCervical` - cervical wear type (none/abrasion/abfraction/erosion)
- `discoloration` - per-tooth discoloration cause (none/tetracycline/fluorosis/nonvital/extrinsic/other), tints the natural crown fill on a natural tooth-base/milk tooth with no restoration
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
- `src/__tests__/` - Vitest test suite (563 tests across 55 files)
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
- 🦷 Sustrato dental (ortogonal a cualquier restauración): natural, radix (resto radicular), fracturado, preparado para corona
- 👑 Restauraciones por tipo × material: corona / incrustación (inlay) / incrustación oclusal (onlay) / carilla / puente en e.max, oro, gradia, circonio, metal, metal-cerámica, telescópica o temporal (el onlay es solo de vista oclusal) — se eligen desde un único selector combinado "Fix: Corona – …" de pocos clics; las coronas `metal` heredadas migran a `metal-ceramic` (metal-cerámica); los implantes usan el mismo modelo tipo × material, compuesto con una capa de conector de implante. El selector se acota según el tipo de diente: un implante solo ofrece corona/puente (más sus cinco opciones de anclaje, ver abajo); un diente ausente/hueco solo ofrece póntico de puente (más removible parcial/completa); un sustrato `radix` oculta por completo el control de restauración (no se puede registrar restauración sobre un resto radicular)
- 🦿 Prótesis removibles/de anclaje en el eje dedicado `prosthesis` (entradas "Kivehető:" en el selector combinado): pilar de cicatrización del implante, localizador, localizador con sobredentadura, barra, barra con sobredentadura; prótesis parcial o completa removible soportada por dientes
- 🌉 Los dientes de puente renderizan tanto la corona como el conector de silla de montar; una superposición de tramo de puente multidiente renderiza un conector continuo y adaptado a la arcada a través de los dientes de puente consecutivos (pónticos + pilares) y los espacios entre ellos (la arcada superior e inferior usan geometría de silla espejada, manteniendo el conector alineado en ambas arcadas), incluido en la exportación PNG/JPG/SVG; añadir un puente mediante un estado predefinido recalcula la superposición de inmediato
- 🔍 Registro de caries en 6 superficies: mesial, distal, bucal, lingual, oclusal, subcoronal
- 🪥 Materiales de obturación por superficie: amalgama, composite, ionómero de vidrio, temporal
- 🏥 Un único selector combinado "Estado pulpar / endo" (agrupado: pulpa vital vs. tratada/endo): los estados endodónticos (obturación medicinal, tratamiento de conductos, obturación incompleta, poste de fibra de vidrio, poste metálico) y el diagnóstico pulpar AAE (`pulpDx`: normal / pulpitis reversible / irreversible / necrosis) son mutuamente excluyentes — un diente con tratamiento de conducto (`endo` distinto de `none`) no puede tener a la vez un diagnóstico pulpar vital; al tratarlo, `pulpDx` se normaliza a `normal` y se suprime el glifo de pulpa enferma. La pulpitis reversible se renderiza con un glifo reducido. Un ajuste opcional de 3 niveles de detalle pulpar (`pulpDetailLevel`: simple / AAE / latín práctico) muestra 9 subtipos en latín práctico (pulpa sana … gangraena pulpae) mediante `pulpLatin`; resección y pin parapulpar siguen siendo indicadores especiales aparte
- 🦴 Diagnóstico apical (`apicalDx`: periodontitis apical sintomática/asintomática, absceso apical agudo/crónico, osteítis condensante) determina directamente el glifo periapical; el subtipo de lesión granuloma/quiste solo se muestra bajo periodontitis apical sintomática/asintomática (se eliminó el subtipo redundante "absceso", ya cubierto por el diagnóstico apical)
- 🩹 Tarjeta combinada "Raíz y periodonto" (sección colapsable única para hallazgos radiculares/periapicales y periodontales)
- ⚕️ Modificaciones: inflamación periapical (visible solo en dientes ausentes/alvéolo de extracción; oculta en dientes presentes, donde el glifo periapical lo determina únicamente `apicalDx`, y en implantes, donde lo cubre `periImplant`), enfermedad periodontal, grados de movilidad (M1/M2/M3, ocultos en implantes)
- 🦷🔩 Estado periimplantario (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — clasificación del World Workshop 2018, mostrada como un selector dedicado en los implantes; la mucositis reutiliza el glifo gingival periodontal, y la periimplantitis añade una capa graduada `peri-implant-bone-loss` (opacidad 0.4/0.7/1.0). Los implantes ya no renderizan el glifo de lesión periapical — su inflamación se expresa mediante este eje — y las casillas de modificadores periodontales quedan ocultas en los implantes (se retira el renombrado ad-hoc "Peri-implantitis" de la casilla)
- 🏷️ Indicadores especiales: corona necesaria, reemplazo de corona necesario, espacio cerrado, plan de extracción, sellado de fisuras, pérdida de punto de contacto
- 👁️ Vista oclusal, muelas del juicio, visibilidad de hueso y pulpa
- 🔢 12 filtros de selección (todos, presentes, permanentes, de leche, implantes, ausentes, superior/inferior, frontales/molares)
- 📊 Estados predefinidos (restablecer, dentición primaria, dentición mixta, edéntulo)
- 📦 34 plantillas de restauración predefinidas (puentes, prótesis removibles, prótesis con barra e implantes)
- 💾 Exportación/importación de estado en JSON (versión 2.10; las importaciones siguen aceptando las versiones 1.4, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8 y 2.9 y se migran automáticamente, con estados personalizados de plugins y notas por diente)
- 🔗 Exportación HL7 FHIR R4 (Bundle de colección con Observations por diente, codificación dental ISO 3950 para dentición permanente, sistema de códigos local — mapeo SNOMED CT planificado)
- ✚ Selección de superficies en cruz (B/M/O/D/L) para caries y obturaciones
- 🧱 Materiales de obturación por superficie (obturaciones mixtas, p. ej. bucal amalgama + distal composite)
- 🖼️ Exportación de imagen PNG/JPG/SVG del odontograma (descargable; PNG/JPG rasterizado desde SVG vectorial)
- 🦷 Caries/subcaries como máquina de estados por superficie: una superficie cariada sin obturación se renderiza como caries primaria (opacidad por niveles ICDAS); en cuanto esa superficie tiene una obturación, se renderiza como caries recurrente (capa `subcaries-{surface}`, puntuada con CARS) — ambas nunca están activas a la vez en la misma superficie
- 🎯 Severidad unificada por superficie (`cariesSeverity`, 0–6, sustituye los antiguos campos separados de profundidad ICDAS + CARS): se lee como profundidad ICDAS en una superficie primaria y como puntuación CARS con nombre (Sana … Cavidad extensa) en una recurrente, mediante un popup contextual que muestra solo la escala relevante para el estado actual de la superficie
- 🌱 Caries radicular (`rootCaries`: none / active / arrested / active-cavitated), que activa la capa de ilustración dedicada de caries radicular con una opacidad según la severidad (active 0.5 / arrested 0.7 / active-cavitated completa)
- 📡 Profundidad radiográfica de caries (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 por superficie), independiente de la escala visual ICDAS/CARS, mostrada como una insignia y recuperable mediante su propia Observation FHIR
- 🎚️ Tres ajustes de granularidad de caries (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) más un interruptor `cariesDepthEnabled`, que reducen cada escala a una vista de selector más simple sin perder el valor almacenado
- 🩹 Línea de resumen de subcaries en el panel de obturaciones: lista, debajo de los controles de obturación, cualquier diente seleccionado con caries recurrente y sus superficies (p. ej. "36 (O) tiene subcaries junto a su obturación.")
- 🪛 Defectos de obturación por superficie (`fillingDefect`: none / marginal / fracture / wear) en restauraciones directas, independientes de la caries recurrente — se registran mediante un indicador por superficie en la tarjeta de Obturaciones (espejo del indicador de profundidad de caries, con su lista de opciones apilada verticalmente), se renderizan en el odontograma y se muestran en el tooltip y en el resumen de obturaciones de toda la boca con una etiqueta explícita (p. ej. "36 (O) – Defecto de obturación: O: marginal"), igual que la caries recurrente se etiqueta en la línea de Caries; la tarjeta de Obturaciones también muestra una nota para cualquier diente seleccionado con un defecto de obturación registrado (p. ej. "En 36 hay un defecto de obturación registrado."), en paralelo a la nota de subcaries ya existente
- 🦷💥 Desgaste dental tipificado por causa clínica y localización (`wearEdge`: none / attrition / erosion, incisal/oclusal; `wearCervical`: none / abrasion / abfraction / erosion, cervical) — sustituye los dos indicadores on/off de desgaste por bruxismo; se registra mediante dos menús desplegables en la fila de desgaste, reutiliza el arte existente y se muestra en el tooltip y en una nueva sección de resumen "Desgaste" de toda la boca
- 🎨 Decoloración dental por causa (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) en dientes permanentes y temporales — tiñe la corona natural mostrada con un color representativo cuando el diente no tiene restauración y su sustrato es natural; se muestra en el tooltip y en una nueva sección de resumen "Decoloración" de toda la boca; completa el conjunto de condiciones de superficie y estructurales junto con los defectos de obturación y el desgaste
- ✏️ Los dientes anteriores (incisivos/caninos) rotulan su superficie oclusal como "incisal" en toda la interfaz (selector, popup, resúmenes); la clave de superficie almacenada sigue siendo `occlusal`
- 🔤 Notación de superficie según la posición del diente (Ajustes → Detalles del diente → "Notación de superficie", simple/completa, por defecto completa): en modo completo, la letra y la etiqueta de superficie de caries/obturación siguen la anatomía dental — oclusal → I/incisal en dientes anteriores, bucal → L/labial en dientes anteriores, lingual → P/palatino en dientes superiores y L/lingual en dientes inferiores (mesial/distal/subcoronal no cambian); el modo simple usa siempre el conjunto genérico B/M/O/D/L/SC, sin importar la posición del diente. Se aplica al resumen de toda la boca y a ambos selectores de superficie (caries y defecto de obturación), tanto la letra como el texto; la clave de superficie almacenada no se ve afectada
- 🦷↕️ Registro ortodóntico por diente (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: booleano) en un diente natural presente (permanente o temporal) — reutiliza el arte ortodóntico inactivo de la v2.5.0 (sin SVG nuevo); se muestra en el gráfico, en el tooltip y en una nueva sección de resumen "Ortodoncia" de toda la boca
- 🪨 Cálculo, y reabsorción radicular tipificada como interna o cervical externa (`resorptionType`)
- 📏 Profundidad de caries por superficie (superficial / dentina / profunda), o puntuación ICDAS II opcional (0–6) con `enableIcdas`
- 🩹 Indicador de filtración marginal de corona, visible solo con una restauración de corona o puente
- 🧰 Barra superior unificada de iconos con un modal de Ajustes por pestañas (General / Paneles / Detalles del diente / Caries / Pulpa / Notas — numeración, notas, visibilidad de paneles, ICDAS, interruptor de profundidad de caries, granularidad de caries radicular/radiográfica, nivel de detalle pulpar, nivel de detalle de desgaste/decoloración dental, información dental)
- 🗂️ Ajustes → pestaña "Paneles": muestra/oculta de forma independiente los paneles de resumen de Estados y de Ortodoncia
- 🩹 El control de caries secundaria (CARS) se fusionó en la pestaña de Ajustes de Caries, colocado encima de Profundidad radiográfica (se retira la pestaña separada "Caries secundaria")
- 🎚️ Nivel de detalle dental: un ajuste simple/complejo para el desgaste dental y la decoloración (Ajustes → Detalles del diente). El modo simple muestra un interruptor sí/no por hallazgo (desgaste activado → attrition/abrasion, decoloración activada → other); el modo complejo (por defecto) conserva los menús desplegables de tipo/causa, y el valor almacenado se conserva al cambiar de nivel
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
- 🩺 Tooltip por diente y panel de resumen de toda la boca modernizados: ambos muestran el conjunto completo de hallazgos clínicos (diagnóstico pulpar/apical + subtipo de lesión, reabsorción radicular, estado periimplantario, caries radicular graduada, cálculo, filtración marginal de corona, fractura, pérdida de contacto, desgaste tipificado incisal/oclusal y cervical), con una sección "Diagnósticos" dedicada, una sección "Desgaste" dedicada en el panel y un calificador de gravedad de caries de grano grueso (superficial/moderada/profunda)
- ♿ Accesibilidad por teclado (WCAG): roles ARIA listbox/option, selección con Enter/Espacio, navegación con flechas, contornos focus-visible
- 🔒 Modo solo lectura: desactivar todas las interacciones para vistas de impresión/informes
- ✨ Animaciones de selección: borde punteado pulsante y sombra brillante en los dientes seleccionados
- 📝 Notas por diente: doble clic para añadir/editar notas, icono de nota junto al número de diente, tooltip con texto de nota, exportación/importación JSON
- 🧪 858 pruebas automatizadas superadas (1 prueba adicional omitida) (Vitest) en 93 archivos de test, para numeración, traducciones, plantillas, i18n, componente App, tema, táctil, plugins, accesibilidad y paridad de ejes clínicos/diagnósticos
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

**Sustrato dental (dientes permanentes):**
`natural` (predeterminado), `radix` (resto radicular), `broken`, `crownprep` (preparado para corona)

**Tipo de restauración (dientes permanentes):**
`none`, `crown`, `inlay`, `onlay` (solo vista oclusal), `veneer`, `bridge`

**Material de restauración (dientes permanentes):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (las coronas `metal` heredadas migran aquí), `telescope`, `temporary`

**Materiales de corona (implantes):**
`natural` (ninguno), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Pónticos:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Opciones endodónticas (dientes permanentes):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opciones endodónticas (dientes de leche):**
`none`, `endo-medical-filling`

`endo` y `pulpDx` se presentan mediante un único `<select>` combinado "Estado pulpar / endo" (agrupado: pulpa vital vs. tratada/endo) y son mutuamente excluyentes — elegir una opción tratada (`endo` distinto de `none`) restablece `pulpDx` a `normal`, y elegir un diagnóstico pulpar restablece `endo` a `none`.

**Materiales de obturación (dientes permanentes):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiales de obturación (dientes de leche):**
`composite`, `gic`, `temporary`

**Superficies de obturación/caries:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (solo caries)

**Modificaciones:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Tipo de lesión periapical** (`periapicalType`; califica el glifo periapical, solo se muestra bajo periodontitis apical sintomática/asintomática):
`none`, `granuloma`, `cyst` — opciones del selector; el valor heredado `abscess` sigue aceptándose/almacenándose pero ya no se ofrece en el selector, por ser redundante con el diagnóstico apical. Al importar se descarta: se incorpora a `apicalDx` si el diente tiene el modificador de inflamación, o se limpia a `none` en caso contrario

**Diagnóstico pulpar** (terminología AAE; `pulpDx`):
`normal`, `reversible-pulpitis` (renderiza un glifo reducido), `irreversible-pulpitis`, `necrosis` — mutuamente excluyente con `endo`; se normaliza a `normal` en un diente con tratamiento de conducto

**Diagnóstico pulpar, latín práctico** (`pulpLatin`; el selector de pulpa solo lo muestra cuando `pulpDetailLevel` es `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Nivel de detalle pulpar** (`pulpDetailLevel`, ajuste global): `simple`, `aae` (por defecto), `latin` — controla el vocabulario que ofrece el selector de pulpa

**Diagnóstico apical** (`apicalDx`; determina el glifo periapical):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Tipo de reabsorción radicular** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Estado periimplantario** (`periImplant`; solo implantes, clasificación del World Workshop 2018): `mucositis` reutiliza el glifo gingival periodontal; `peri-implantitis-*` añade la capa `peri-implant-bone-loss` con opacidad graduada por severidad (leve 0.4 / moderada 0.7 / severa 1.0). Los implantes ya no renderizan el glifo de lesión periapical (su inflamación se expresa mediante este eje), y las casillas de modificadores inflamación/periodontal quedan ocultas en los implantes:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Severidad de caries** (`cariesSeverity`; campo unificado por superficie, `0`–`6`): en una superficie sin obturación se lee como escala de profundidad ICDAS (`superficial` / `dentin` / `deep`, o los códigos ICDAS II sin procesar `0–6` cuando `enableIcdas` está activado) y renderiza la capa primaria `caries-{surface}`; en una superficie con obturación se lee como una puntuación CARS con nombre (`0` sana … `6` cavidad extensa) y renderiza en su lugar la capa `subcaries-{surface}` (caries recurrente) — una superficie nunca es primaria y recurrente a la vez

**Caries radicular** (`rootCaries`; activa la capa de ilustración `caries-root` en un diente presente, con opacidad según la severidad — `active` 0.5 / `arrested` 0.7 / `active-cavitated` completa):
`none`, `active`, `arrested`, `active-cavitated`

**Profundidad radiográfica de caries** (`radiographicDepth`; por superficie, independiente de la escala visual ICDAS/CARS `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Ajustes de granularidad de caries** (globales): `secondaryCariesMode` (`simple`/`standard`/`full`, por defecto `standard`), `rootCariesMode` (`simple`/`severity`, por defecto `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, por defecto `off`), `cariesDepthEnabled` (booleano, por defecto `true`) — cada uno reduce su escala a una vista de selector más simple sin alterar el valor almacenado

**Indicadores especiales:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Desgaste dental** (`wearEdge`, `wearCervical`; tipo clínico por localización, condicionado a diente natural + sin restauración + sustrato natural; renderizan las capas existentes `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Decoloración** (`discoloration`; causa por diente, condicionada a un diente natural (permanente o temporal) sin restauración y sustrato natural; tiñe el relleno de la corona natural mostrada — sin SVG nuevo):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

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
| `setPulpDetailLevel(level)` | Definir el vocabulario del selector de pulpa — `"simple"`, `"aae"` o `"latin"` |
| `getPulpDetailLevel()` | Obtener el nivel de detalle pulpar actual |
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
- `src/__tests__/` - suite de pruebas Vitest (563 pruebas en 55 archivos)
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
