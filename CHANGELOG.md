# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.21.0] - 2026-07-11
### Added
- The per-tooth tooltip and the whole-mouth summary panel now surface the full set of clinical findings added since v1.16: pulp diagnosis, apical diagnosis (+ lesion subtype), root resorption, peri-implant status, graded root caries, calculus, crown marginal leakage, fracture, contact loss, and bruxism wear. A new "Diagnoses" section groups the pulp/apical/resorption/peri-implant findings; caries carries a coarse severity qualifier (superficial/moderate/deep).

## [1.20.0] - 2026-07-11
### Added
- Peri-implant status axis for implants: peri-implant health / mucositis / peri-implantitis with graded (mild/moderate/severe) crestal bone loss, shown as a dedicated selector on implants.
### Changed
- Implants no longer render the (clinically incorrect) periapical lesion glyph; their inflammation is expressed through the new peri-implant axis. Missing/extraction-socket teeth are unaffected.
- Removed the ad-hoc "Peri-implantitis" relabel of the periodontal-modifier checkbox (superseded by the dedicated axis).
### Migration
- Payload version 2.6 (imports 1.4–2.5 accepted). On import, an implant that carried the inflammation or periodontal modifier becomes peri-implant mucositis (no bone-loss grade is invented).

## [1.19.0] - 2026-07-11

### Changed
- **Merged Pulp/Endo status selector**: the endodontic-treatment (`endo`) and pulp-diagnosis (`pulpDx`) pickers are now one control; a root-treated tooth (`endo != none`) no longer carries a vital pulp diagnosis — the two fields are mutually exclusive, and on such a tooth `pulpDx` is normalized to `normal` with the diseased-pulp glyph suppressed.
- **Merged "Root and periodontium" card**: the separate "Root" and "Periodontium and inflammations" panels are consolidated into a single card.
- **Periapical lesion subtype reduced to granuloma/cyst**: the redundant "abscess" subtype is dropped (it is already covered by the apical diagnosis); the subtype selector (`none` / `granuloma` / `cyst`) is now shown only under symptomatic or asymptomatic apical periodontitis.
- **Reversible pulpitis** now renders a reduced pulp glyph.
- **Retired the duplicate "periapical inflammation" toggle** on present teeth; the apical diagnosis alone drives the periapical glyph.

### Migration
- JSON/FHIR export payload version bumped to **2.5**; imports still accept legacy 1.4–2.4 payloads and migrate them automatically. On import, a treated tooth's pulp diagnosis is normalized to `normal`, and a legacy `abscess` periapical-lesion subtype is dropped — folded into the apical diagnosis when the tooth carries the inflammation modifier, otherwise cleared, since the apical diagnosis already covers abscess.

## [1.18.0] - 2026-07-11

### Added
- **CARS 0–6 score names**: the secondary-caries picker now shows descriptive ICDAS-based names (Sound, First visual change in enamel, Distinct visual change in enamel, Localized enamel breakdown, Underlying dentin shadow, Distinct cavity, Extensive cavity) instead of raw numbers.
- **Root-caries severity opacity**: the `caries-root` artwork layer now renders at an opacity driven by `rootCaries` (`active` 0.5 / `arrested` 0.7 / `active-cavitated` full), instead of a flat opacity regardless of severity.
- **Fillings-panel subcaries summary line**: a line below the filling controls lists any selected tooth with recurrent (subcaries) caries and its surfaces, e.g. "36 (O) has subcaries set on its filling."
- **Anterior "incisal" surface label**: incisors and canines now label their occlusal surface "incisal" throughout the UI (picker, popup, summaries/tooltips); the stored surface key is unchanged (`occlusal`).
- **Contextual per-surface caries popup**: the surface-depth popup now shows only the severity group relevant to the surface's current state (the primary ICDAS-depth group on an unfilled surface, the CARS group on a filled one), instead of always showing both.

### Changed
- **Unified caries severity field**: the separate SP5 ICDAS-depth (`cariesDepths`) and CARS (`secondaryCaries`) fields are replaced by a single per-surface `cariesSeverity` (0–6), read as ICDAS depth on a primary (unfilled) surface and as a CARS score on a recurrent (filled) one. JSON/FHIR export payload version bumped to **2.4**; imports still accept legacy 1.4, 2.0, 2.1, 2.2, and 2.3 payloads and migrate them automatically.

### Fixed
- **Caries/subcaries is now a proper per-surface state machine**: recurrent caries renders the `subcaries-{surface}` layer at the surface's CARS severity and is no longer settable alongside primary caries on the same surface — a surface is always exactly one of primary caries, recurrent (subcaries), or sound, eliminating the previous ambiguity where both a `caries-{surface}` and a derived recurrent state could coexist.

## [1.17.0] - 2026-07-11

### Added
- **Root caries** clinical axis (`rootCaries`): none / active / arrested / active-cavitated — wires the previously dormant `caries-root` artwork layer on a present tooth's main-view templates.
- **Stored secondary (recurrent) caries score** (`secondaryCaries`): a per-surface CARS 0–6 score, rendered as the `subcaries-{surface}` layer's opacity (`0.30 + (score-1)/5 × 0.70`) — replaces the old render-time derivation from `caries ∩ fillingSurfaceMaterials`.
- **Radiographic caries depth** (`radiographicDepth`): a per-surface none / E1 / E2 / D1 / D2 / D3 finding, independent of the visual ICDAS depth scale — surfaced as a `data-radio` badge attribute on the surface indicator, and round-trips through FHIR via its own `radiographic-caries-depth` Observation.
- **Three caries granularity settings** (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) plus `cariesDepthEnabled`, letting the picker UI collapse each scale to a simpler view without losing the underlying stored value.
- **Tabbed Settings modal** (General / Caries / Secondary caries / Pulpa / Notes), replacing the previous flat settings dropdown.

### Changed
- JSON export payload bumped to **version 2.3**; imports still accept legacy 1.4, 2.0, 2.1, and 2.2 payloads and migrate them automatically (a migrated `caries ∩ fillingSurfaceMaterials` surface is promoted to the canonical "moderate" `secondaryCaries` score of 3, unless a stored score is already present).
- Secondary (recurrent) caries is now a **stored, scored** clinical finding (`secondaryCaries`), not derived at render/summary time from `caries ∩ fillingSurfaceMaterials`.

## [1.16.0] - 2026-07-11

### Added
- **AAE pulp diagnosis** clinical axis (`pulpDx`): normal / reversible pulpitis / irreversible pulpitis / necrosis — replaces the retired `pulpInflam` boolean, with a byte-identical SVG render for the migrated "inflamed pulp" case (on both permanent and milk-tooth branches).
- **Practical-Latin pulp subtypes** (`pulpLatin`): pulpa sana, hyperaemia pulpae, pulpitis acuta serosa/purulenta, pulpitis chronica clausa/ulcerosa/hyperplastica, necrosis pulpae, gangraena pulpae — surfaced through a new 3-level **pulp detail setting** (`pulpDetailLevel`: `simple` / `aae` / `latin`, default `aae`) that collapses the pulp picker to the appropriate vocabulary; `getPulpDetailLevel()`/`setPulpDetailLevel()` public API.
- **Apical diagnosis** clinical axis (`apicalDx`): normal / symptomatic apical periodontitis / asymptomatic apical periodontitis / acute apical abscess / chronic apical abscess / condensing osteitis — now drives the periapical glyph directly on a present tooth.
- **Root resorption type** (`resorptionType`): internal / external-cervical — replaces the retired `rootResorption` boolean, with a byte-identical SVG render (including the `inflammationHome` z-order lift when combined with an apical diagnosis).

### Changed
- JSON export payload bumped to **version 2.2**; imports still accept legacy 1.4, 2.0, and 2.1 payloads and migrate them automatically (`pulpInflam` → `pulpDx`, `rootResorption` → `resorptionType`, `mods.inflammation`/`periapicalType` → `apicalDx`).
- The periapical glyph is now driven by the `apicalDx` diagnosis axis, decoupled from the `mods.inflammation` modifier (existing `mods.inflammation` payloads still migrate to an equivalent `apicalDx` value; render is byte-identical for migrated states).
- The legacy `pulpInflam` and `rootResorption` boolean clinical axes are retired from the live state model (kept only as a read-only input-side migration path for legacy payloads).

## [1.15.0] - 2026-07-11

### Added
- New **`prosthesis`** clinical axis (healing-abutment / locator / locator-denture / bar / bar-denture / removable-partial / removable-full), orthogonal to `restorationType`×`restorationMaterial`, surfaced with a "Kivehető:" prefix in the combined restoration dropdown. Covers implant attachments (healing abutment, locator, bar, with or without an overdenture) and tooth-supported removable partial/full dentures — replacing the legacy `crownMaterial`/`bridgeUnit` attachment and removable values field-for-field (byte-identical render).
- **Implant fixed crowns** now join the `restorationType`×`restorationMaterial` model: implants are no longer gated away from crown/bridge restoration options, and render via composition (`{material}-{type}` layers) plus an implant connector layer, with `metal` migrating to `metal-ceramic` for implants too.
- Multi-tooth **bridge-span overlay**: consecutive bridge teeth (`restorationType: "bridge"` or `bridgePillar`) within one arch now render a single continuous gum-line saddle across the inter-tooth gaps, drawn as an engine-owned `<svg>` over the tooth grid. The overlay is purely presentational (derives spans from existing tooth state; no new state field), repositions on resize, and is included in SVG/PNG/JPG export.
- **Crown marginal-leakage toggle**: a new `crownLeakage` boolean clinical axis + tooth-editor checkbox, shown only for a crown or bridge restoration, activating the previously dormant `crown-leakage` artwork layer. Round-trips through FHIR export/import (`crown-leakage` finding) like any other boolean axis.

### Changed
- JSON export payload bumped to **version 2.1** (adds `prosthesis`, drops `crownMaterial`/`bridgeUnit`); imports still accept legacy 1.4 and 2.0 payloads and migrate them automatically (implant `crownMaterial` fixed crowns → `restorationType`+material; attachment/removable `crownMaterial`/`bridgeUnit` values → `prosthesis`).
- FHIR export now emits a `prosthesis` coding in place of the dropped attachment/removable `crown-material`/`bridge-unit` codings, restoring round-trip fidelity for implant attachments (locator/bar/healing-abutment) that SP3a had dropped from FHIR; implant crowns round-trip via the existing `restoration-type`/`restoration-material` codings.
- The legacy `crownMaterial`/`bridgeUnit` fields are fully retired from state, serialization, and the value-map registry (kept only as a read-only input-side migration path for legacy payloads).

### Fixed
- **Invalid restoration type/material combinations are now corrected on import**: a hand-edited or imported payload that pairs a restoration type with a material it doesn't support (e.g. an inlay in metal) is coerced to that type's first valid material (or dropped to no restoration if the type itself carries none), and a warning is surfaced — instead of silently persisting a combination the renderer would have drawn nothing for.
- **Implant fixed crowns from 2.0-format payloads are no longer silently dropped on import**: an implant crown serialized by an intermediate build as `{restorationType:"none", crownMaterial:<material>}` now correctly folds into `restorationType:"crown"` + that material (with `metal` → `metal-ceramic`), instead of vanishing.
- The combined restoration dropdown now actually lists the **"Kivehető:" (removable) `prosthesis` entries** (implant attachments for an implant tooth; removable partial/full dentures for a gap) and writes the `prosthesis` axis when one is chosen — previously only the "Fix:" half was wired and the removable prefix was unused.
- Selecting a "Kivehető:" prosthesis or a fixed restoration now keeps the two axes mutually exclusive (a tooth has **either** a fixed restoration **or** a prosthesis); import also enforces this coherence (restoration wins if a crafted payload sets both).
- **Stale `crownLeakage` is now cleared** when a restoration changes away from crown/bridge, preventing an orphaned `crown-leakage` finding on a non-crown tooth.

## [1.14.0] - 2026-07-11

### Added
- Two-dimensional restoration model: `restorationType` (crown/inlay/onlay/veneer/bridge) × `restorationMaterial` (e.max/gold/gradia/zirconia/metal/metal-ceramic/telescope/temporary), replacing the flat `crownMaterial` enum as the clinical axis.
- New `toothSubstrate` axis (natural/radix/broken/crownprep) describing the tooth's underlying structure, independent of any restoration placed on it.
- Gold, Gradia, and metal-ceramic (PFM) restoration materials, and inlay/onlay/veneer restoration types, wired from the previously dormant v2.5 artwork into charting.
- Combined, low-click restoration dropdown (type × material in a single control) in the tooth editor.
- Groundwork for crown-marginal-leakage findings (new axis values only; UI is not wired yet — deferred to a later stage).

### Changed
- Legacy `metal` crowns and bridges now migrate to `metal-ceramic` (PFM) on load; the pre-existing full-cast look is now the distinct `metal` restoration material.
- JSON export payload bumped to **version 2.0**; imports still accept legacy 1.4 payloads and migrate them automatically.
- FHIR export now emits `restoration-type` / `restoration-material` / `tooth-substrate` codings in place of the old `crown-material` coding.

### Removed
- The flat `crownMaterial` enum as a clinical axis (a legacy field of the same name is retained internally only to drive implant-attachment rendering, per the migration plan).

## [1.13.0] - 2026-07-11

### Changed
- Internal architecture: FHIR export/import, value validation, SVG clear-set + boolean-flag layer activation, and the stable UI option lists are now generated from a single declarative clinical-axis registry (`src/registry/`) instead of scattered ad-hoc maps. Behavior-preserving — the JSON payload (version 1.4) and FHIR output are byte-identical to 1.12.0, guarded by frozen parity goldens.

### Removed
- Dead code orphaned by the registry migration (unused SVG-group helpers, duplicated dependency literals, superseded `GROUPS` layer lists).

## [1.12.0] - 2026-07-11

### Changed
- Updated tooth SVG assets to artwork version 2.5.0 (new dental-material, orthodontic, planning, root-fracture, filling-defect and root-caries layers added as dormant layers; not yet wired into charting — see the architecture-constitution spec).

### Fixed
- Corrected the `inicisal` → `incisal` broken-crown layer-id typo across the engine and SVG assets.
- Fixed the `prosthesis-bridge-connector` → `prosthesis-connector` id in `16_occl.svg` so the removable-prosthesis connector renders in the occlusal view.

## [1.11.1] - 2026-07-10

Documentation accuracy and FHIR value-map consistency.

### Fixed
- Corrected the HL7 FHIR export claim in every README language variant (including
  the new pt-BR) and the CHANGELOG: the export emits local + ISO 3950 (permanent
  dentition) codings — SNOMED CT is not yet emitted (mapping planned). Aligned the
  `src/fhir/codesystems.ts` comments accordingly.

### Changed
- FHIR export: added the `crownprep` ("Prepared for crown") crown material to the
  local value map so it exports with a proper display; removed the obsolete
  `tooth-crownprep` tooth-selection value (it is now a crown material, not a base type).
- Extended the FHIR value-map test to cover `periapicalType`.
- `package.json` — version 1.11.0 → 1.11.1.

## [1.11.0] - 2026-07-10

Brazilian Portuguese (pt-BR) UI language.

### Added
- **Brazilian Portuguese (`pt-br`)** as a 9th UI language: full translation of every i18n key in `src/i18n/translations.ts`, added to the topbar language switcher (`LANGUAGE_OPTIONS` in `src/App.tsx`) and to the `Language` type. Localized `language.pt-br` display name added to all existing languages.
- New `lang/README-pt-br.md` (translated from the English README); the 🇧🇷 Português (BR) entry added to every README language switcher.

### Changed
- `package.json` — version 1.10.0 → 1.11.0.
- README language lists and API docs updated from `HU/EN/DE/ES/IT/SK/PL/RU` to include `PT-BR` across all languages.

## [1.10.0] - 2026-07-03

Tooth-information panel, dynamic subtitle, crown-prep type, SVG/z-order fixes, and a multilingual README overhaul.

### Added
- **Tooth information panel** — live textual summary of the whole chart: tooth counts, present/missing lists, and Caries (incl. secondary) / Fillings / Root canals / Prosthetics / Implants (only when present) / periodontal status. Shown by default; toggleable in the Settings menu. Plural-aware phrasing per language; refreshes live.
- New public API: `getOdontogramSummary()` (structured, localized summary) and `onStateChange(callback)` (subscribe to state changes; returns an unsubscribe function).
- Dynamic topbar subtitle reflecting the current language, numbering system, and light/dark mode.
- `crownprep` ("Prepared for crown") as a permanent-tooth crown material — moved from the Base dropdown into the Crown dropdown; mirrors the "broken" crown behavior and renders the crown-prep layer. Crown list reordered with `radix` first; default stays `natural` (Full crown).
- Standalone per-language README files under `lang/` (de, hu, it, sk, pl, ru); `README.md` keeps English + Spanish with a language switcher.
- ~40 new i18n keys × 8 languages (tooth-info panel, dynamic subtitle, implants, crown-prep label reuse).

### Changed
- Renamed the app to **React Odontogram Modul** (from "…Editor Modul") across all languages.
- Re-normalized the tooth 14 SVG to the current layer format (typed periapical glyphs, calculus, subcaries, resorption, fissure sealing).
- Refined the Hungarian endodontic wording to precise clinical terms.
- CHANGELOG brought up to date (1.5.0–1.10.0); README rigorously reviewed to match current behavior.
- `package.json` — version 1.9.0 → 1.10.0.

### Fixed
- Global visibility toggles (wisdom/occlusal/bone/pulp/edentulous) and card collapse now use delegated listeners, so they survive React StrictMode's double mount instead of cancelling themselves out — this also restored the periodontal/periapical inflammation buttons.
- Inflammation glyph z-order: when `endo-resection` and/or `endo-resorption` is active together with an inflammation glyph, the inflammation group is lifted above the tooth group (keeping the lower-tooth mirror transform) so the glyph stays visible.
- Calculus row spacing in its default state; no tooth-base gloss on broken/radix crowns.

## [1.9.0] - 2026-07-01

Unified topbar icon row and optional ICDAS II caries scoring.

### Added
- Unified topbar icon row with a Settings menu (numbering, notes, ICDAS, tooth information).
- Optional **ICDAS II** per-surface caries scoring (0–6) via the `enableIcdas` prop / Settings toggle, with a numeric badge on scored surfaces; included in FHIR export.

### Changed
- Consolidated the topbar controls (intro, language, dark mode, settings, export, import) into a single icon row.

## [1.8.0] - 2026-06-30

Clinical marking layers, native SVG export, and per-surface caries depth.

### Added
- Clinical marking layers (v2.1.4 tooth SVGs): calculus, root resorption, secondary (recurrent) caries, and typed periapical lesions (granuloma / cyst / abscess).
- Per-surface caries depth (superficial / dentin / deep) with a depth selector and popup.
- Native SVG export of the chart; PNG/JPG now rasterize from the vector SVG.

### Fixed
- Lesion type options and filling cross size; clearer note icon; persistent note icon after tooth-number refresh; calculus toggle id collision.

## [1.7.0] - 2026-06-23

Export/Import dropdowns, FHIR import, progress overlay, intro tour, and periapical lesion types.

### Added
- Consolidated Export dropdown (Status JSON / FHIR / PNG / JPG) and an Import dropdown with status/FHIR routing.
- HL7 FHIR R4 import — parse self-produced FHIR Bundles back into chart state (round-trip).
- Phased progress overlay during image export.
- 12-step interactive intro tour.
- Periapical lesion entity type (granuloma / cyst / abscess).

## [1.6.0] - 2026-06-20

Cross-surface selection UI, mixed fillings, and PNG/JPG export.

### Added
- Cross/plus surface selection UI (B/M/O/D/L) for caries and fillings.
- Per-surface restoration materials (mixed fillings, e.g. buccal amalgam + distal composite); JSON schema 1.4 + FHIR support.
- Engine PNG/JPG export of the odontogram.

### Fixed
- Molar filters now include all molars; hide `tooth-base-beauty` gloss on implants.

## [1.5.0] - 2026-06-14

HL7 FHIR R4 export, MIT license, and English default language.

### Added
- **HL7 FHIR R4 export** — a collection Bundle of per-tooth Observations, ISO 3950 tooth coding for permanent dentition, and a local code system (SNOMED CT mapping planned).
- MIT LICENSE file (resolves #7).

### Changed
- Default UI language set to English.
- README completed with FHIR export documentation.

## [1.4.2] - 2026-03-22

Per-tooth notes with double-click editor, label icons, and JSON export/import.

### Added
- **Per-tooth notes system**
  - `note` field added to tooth state model (string, empty by default)
  - Double-click a tooth tile to open the note editor popover
  - Note editor positioned near the tooth tile with viewport clamping
  - Save and Delete buttons in the popover
  - Note icon (📝) displayed next to the tooth number in label cells
  - Note text included in hover tooltips with 📝 prefix
  - Notes included in JSON export/import (optional field, only when non-empty)
  - Touch support: "Note" button added to the zoom popover on touch devices
  - Read-only mode guard: note editor does not open in read-only mode
- New `enableNotes` prop on the `App` component (default `false` — opt-in)
- New `setNotesEnabled(value)` / `getNotesEnabled()` exported API functions
- 4 new i18n keys (`note.title`, `note.save`, `note.delete`, `note.placeholder`) × 8 languages = 32 new translations
- 2 new tests in `a11y.test.ts` for note i18n validation — total 163 tests across 9 files

### Changed
- JSON export/import version bumped from 1.2 to 1.3 (backward compatible — `note` field is optional)
- `src/odontogram.ts` — `note` in `defaultState()`/`serializeState()`/`hydrateState()`, `showNoteEditor()`/`hideNoteEditor()` functions, `dblclick` handler in `addTile()`, note button in zoom popover, `updateToothLabelNoteIcon()`, label icon refresh on import
- `src/App.tsx` — `enableNotes` prop, `setNotesEnabled`/`getNotesEnabled` imports and exports, sync useEffect
- `src/index.css` — note editor popover styles (`.odon-note-popover`, `.odon-note-backdrop`, `.odon-note-textarea`), note icon in label cells (`.tooth-note-icon`), dark mode overrides
- `src/i18n/translations.ts` — 32 new translation entries (4 keys × 8 languages)
- `src/__tests__/App.test.tsx` — mock updates for `setNotesEnabled`/`getNotesEnabled`
- `package.json` — version 1.4.1 → 1.4.2

## [1.4.1] - 2026-03-12

Keyboard accessibility (WCAG), read-only mode, and selection animations.

### Added
- **Keyboard accessibility (WCAG compliance)**
  - ARIA `listbox`/`option` roles on tooth grid and tiles
  - `aria-selected` attribute synced with selection state
  - `aria-multiselectable="true"` on the grid container
  - `aria-hidden="true"` and `tabindex="-1"` on decorative label rows
  - Enter/Space to toggle tooth selection
  - Arrow key navigation (Left/Right within row, Up/Down between upper/lower arches)
  - Escape to clear selection
  - `:focus-visible` outline styles in both light and dark mode
  - Wisdom teeth get `tabindex="-1"` and `aria-hidden` when hidden
- **Read-only mode**
  - New `readOnly` prop on the `App` component
  - New `setReadOnly(value)` / `getReadOnly()` exported API functions
  - When active: all click, touch, and keyboard interactions are disabled
  - Control panel is dimmed (`opacity: 0.5`, `pointer-events: none`)
  - Tooth tiles become non-interactive with `pointer-events: none`
  - All tiles get `tabindex="-1"` to remove from tab order
  - Useful for print, report, and view-only use cases
- **Selection animations**
  - Pulsing dashed border via `::after` pseudo-element (`odon-dash-pulse` keyframes)
  - Glowing `drop-shadow` effect on selected tooth SVGs (`odon-glow-pulse` keyframes)
  - Smooth `.25s ease` transitions for selection/deselection
  - Full dark mode support with separate keyframes (`odon-dash-pulse-dark`, `odon-glow-pulse-dark`)
  - `prefers-reduced-motion: reduce` support — static styles for motion-sensitive users
- New `readOnly.label` i18n key in all 8 languages (HU/EN/DE/ES/IT/SK/PL/RU)
- 7 new tests in `a11y.test.ts` — total 161 tests across 9 files

### Changed
- `src/odontogram.ts` — added `readOnly` state, `onToothKeydown()` handler, `navigateToTooth()` navigation, ARIA attributes in `addTile()`/`addLabelRow()`/`buildGrid()`/`updateSelectionUI()`/`updateToothTileVisibility()`, read-only guards in event handlers
- `src/App.tsx` — new `readOnly` prop, `setReadOnly`/`getReadOnly` imports and exports, sync useEffect
- `src/index.css` — selection animation keyframes and styles, focus-visible styles, read-only mode styles, dark mode overrides, prefers-reduced-motion media query
- `src/i18n/translations.ts` — 1 new key × 8 languages = 8 new translations
- `src/__tests__/App.test.tsx` — mock updates for `setReadOnly`/`getReadOnly`
- `package.json` — version 1.4.0 → 1.4.1

## [1.4.0] - 2026-03-10

Mobile touch UX interactions and custom SVG plugin system.

### Added
- **Mobile touch UX** (touch interactions)
  - Tap-to-zoom — touching a tooth displays a magnified SVG popover
  - Long-press (500ms) — context menu with tooth status summary
  - Pinch-to-zoom — two-finger zoom gesture on the tooth chart
  - Arch toggle navigation — switch between upper/lower arches on screens ≤600px
  - WCAG 44px touch targets via `@media (pointer: coarse)` media query
  - `touch-action: none` for precise gesture handling
  - 14 new i18n keys × 8 languages = 112 new translations (touch.zoom.*, touch.ctx.*, touch.arch.*, chart.hint.touch)
- **Custom SVG Plugin system** (`OdontogramPlugin`)
  - `OdontogramPlugin` type: `id`, `label`, `layer`, `renderSvg()`, optional `panelSection`
  - 3 layer priorities: `base` (z=0), `restoration` (z=3), `overlay` (z=6)
  - Plugin SVG injection into tooth `<g>` elements with z-index ordering
  - Per-tooth `customStates: Record<string, unknown>` for plugin data storage
  - State tooltip: displays all active statuses on tooth tiles
  - State validation with 5 rules — localized warnings for incompatible state combinations
  - JSON export/import version 1.1 → 1.2, with `customStates` support
  - 5 new warning keys × 8 languages = 40 new translations (warn.endoOnMissing, warn.fillingOnMissing, warn.crownReplaceNoCrown, warn.cariesOnMissing, warn.pillarNoCrown)
- 4 new public API functions: `registerPlugins()`, `setPluginState()`, `getPluginState()`, `getToothStateSummary()`
- New `plugins` prop on the `App` component
- `src/plugin.ts` — plugin type definitions (`OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, `LAYER_Z`)
- 26 new tests in 2 files — total 154 tests in 8 files
  - `touch.test.ts` — 10 tests: touch i18n keys, placeholders, consistency
  - `plugin.test.ts` — 16 tests: `getQuadrant()`, `LAYER_Z`, plugin type, warning i18n keys
- `.warning-item` CSS styles (light + dark mode) for state validation warnings

### Changed
- `src/odontogram.ts` — touch event handlers, plugin overlay system, state tooltip, validation, JSON version 1.2
- `src/App.tsx` — `plugins` prop, plugin API exports (`registerPlugins`, `setPluginState`, `getPluginState`, `getToothStateSummary`)
- `src/i18n/translations.ts` — 152 new translation entries (14 touch + 5 warning keys × 8 languages), total 190+ keys per language
- `src/index.css` — touch UI styles (zoom popover, context menu, pinch zoom, arch toggle, WCAG targets) and warning styles
- `src/__tests__/App.test.tsx` — mock updates for new API exports
- `package.json` — version 1.3.0 → 1.4.0
- README.md — all 4 languages (EN/DE/ES/HU) updated with mobile UX and plugin system documentation

## [1.3.0] - 2026-03-09

Automated testing, API documentation, and custom theme configuration.

### Added
- **Vitest testing framework** — 128 tests in 6 files, full coverage of the public API
  - `numbering.test.ts` — FDI/Universal/Palmer conversion for all 32 adult + 20 deciduous teeth, edge cases
  - `translations.test.ts` — key consistency across all 8 languages, empty value checks, placeholder validation
  - `status_extras.test.ts` — 21 preset structure validations (arches, materials, teeth, overlaps)
  - `useI18n.test.ts` — `t()` translation function, language switching, listener system
  - `App.test.tsx` — rendering, controlled/standalone mode, dark mode, dropdowns
  - `theme.test.ts` — CSS custom property application, null/undefined handling
- **TypeDoc API documentation** — JSDoc comments on all exported types and functions
  - `typedoc.json` configuration with GitHub Pages support
  - `npm run docs` script to generate `docs/` directory
- **Theme configuration system** (`OdontogramThemeConfig`)
  - 8 color properties: `background`, `panel`, `card`, `text`, `muted`, `line`, `accent`, `accent2`
  - CSS custom properties (`--odon-*`) with fallback system — works with both Tailwind and vanilla CSS projects
  - New `themeConfig` prop on the `App` component
  - `applyThemeConfig()` utility function for runtime color overrides
  - Dark mode and theme config are fully compatible
- New npm scripts: `test`, `test:watch`, `test:coverage`, `docs`

### Changed
- `src/App.tsx` — new `themeConfig` prop, `OdontogramThemeConfig` export, `.odontogram-root` wrapper div for CSS custom properties
- `src/index.css` — CSS variables rewritten to `var(--odon-*, fallback)` format, new `.odontogram-root` and `.dark .odontogram-root` selectors
- `src/theme.ts` — new file: `OdontogramThemeConfig` type and `applyThemeConfig()` function
- `src/odontogram.ts` — JSDoc comments for public API functions (`initOdontogram`, `destroyOdontogram`, `setNumberingSystem`, `clearSelection`, `setWisdomVisible`, `setShowBase`, `setOcclusalVisible`, `setHealthyPulpVisible`)
- `src/i18n/translations.ts` — JSDoc comments for `Language` type and `translations` object
- `src/i18n/useI18n.ts` — JSDoc comments: `t()`, `getI18nLanguage()`, `setI18nLanguage()`, `onI18nChange()`, `useI18n()`
- `src/utils/numbering.ts` — JSDoc comments: `NumberingSystem` type, `toLabel()` function with examples
- `src/status_extras.ts` — JSDoc comment for `STATUS_EXTRAS` object
- `vitest.config.ts` — new file: Vitest configuration with jsdom environment
- `package.json` — version 1.2.0 → 1.3.0, new dev dependencies (vitest, @testing-library/react, @testing-library/jest-dom, jsdom, typedoc)

## [1.2.0] - 2026-03-06

Dark mode support with standalone and controlled integration modes.

### Added
- **Dark mode** — full light/dark theme switching with comprehensive CSS overrides for all UI elements
  - New toggle button in the topbar (sun/moon icon) placed between the language selector and numbering system selector
  - **Standalone mode**: omit `darkMode` prop — the component manages its own theme state, toggling the `.dark` class on `<html>`
  - **Controlled mode**: pass `darkMode` and `onDarkModeChange` props to let the parent application control the theme
- New component props: `darkMode?: boolean`, `onDarkModeChange?: (dark: boolean) => void`
- Dark mode i18n labels (`theme.light` / `theme.dark`) for all 8 supported languages (HU/EN/DE/ES/IT/SK/PL/RU)
- 40+ dark theme CSS overrides: topbar, chart header, panel, cards, buttons, inputs, selects, tooltips, scrollbars, tooth labels, selection filters, status presets, and all interactive elements
- `.btn-theme` CSS class for the dark mode toggle button styling

### Changed
- `src/App.tsx` — added dark mode state management (internal + controlled), toggle button rendering with sun/moon SVG icons, `.dark` class lifecycle management
- `src/index.css` — added `.dark` block with comprehensive CSS overrides for all color-sensitive selectors
- `src/i18n/translations.ts` — added `theme.light` and `theme.dark` translation keys for all 8 languages
- README.md updated with dark mode integration instructions, component props table, and topbar description in all 4 documentation languages (EN/DE/ES/HU)

## [1.1.0] - 2026-03-03

Multi-language expansion and README overhaul.

### Added
- 5 new UI languages: Spanish (ES), Italian (IT), Slovak (SK), Polish (PL), Russian (RU) — total: 8 languages
- Flag emojis (🇭🇺🇬🇧🇩🇪🇪🇸🇮🇹🇸🇰🇵🇱🇷🇺) in language switcher for each language
- 162 translation keys per language (previously 157, extended with `language.es/it/sk/pl/ru`)
- README sections in 4 languages: English, German, Spanish, Hungarian
- Download, version, license, React, and TypeScript badges in README
- Emoji-enhanced section headers throughout README
- CHANGELOG.md version tracking

### Fixed
- Dropdown localization bug: crown, bridge unit, endo, filling, and mobility select elements now properly update their labels when switching languages (previously only `toothSelect` and `statusExtraSelect` were refreshed)

### Changed
- `Language` type extended from `"hu" | "en" | "de"` to `"hu" | "en" | "de" | "es" | "it" | "sk" | "pl" | "ru"`
- `LANGUAGE_OPTIONS` in App.tsx extended from 3 to 8 entries
- README.md fully rewritten (was EN+HU, now EN/DE/ES/HU with badges and emojis)
- I18n references updated from "HU/EN/DE" to "HU/EN/DE/ES/IT/SK/PL/RU" across all documentation

## [1.0.0] - 2026-02-21

First stable release of the React Odontogram Module — an interactive, SVG-based dental chart editor.

### Added

#### Core
- Interactive SVG-based odontogram with per-tooth visualization
- Multi-tooth annotation and selection system
- Topbar toggle controls for layer visibility
- Exposed selection controls API (start unselected by default)

#### Visual Layers
- Crown replace, crown needed, missing closed
- Radix, endo-filling-incomplete, parapulpal pin
- SVG assets moved to src with asset-import based build

#### Integration
- Submodule-ready architecture for embedding in parent projects
- Vite + React + TypeScript build pipeline
- Stable TypeScript build config with resolved type errors

#### Documentation
- English README with usage instructions
- ISO dental notation reference PDFs
- GitHub Pages support

### Fixed
- Odontogram init lifecycle and import handling
- Topbar toggle buttons duplicate click bindings

[1.11.1]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.11.0...v1.11.1
[1.11.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.10.0...v1.11.0
[1.10.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.9.0...v1.10.0
[1.9.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.8.0...v1.9.0
[1.8.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.4.2...v1.5.0
[1.4.2]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ZoliQua/React-Odontogram-Modul/releases/tag/v1.0.0
