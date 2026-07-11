# React Odontogram Editor

## Critical Defaults
- This is a **standalone React library** — it must work independently of DentalQuoteCreator
- Never introduce DentalQuoteCreator-specific dependencies or imports
- Preserve the public API (`OdontogramShell` props interface)
- All changes must maintain backward compatibility with existing integrations

## Architecture
- **React 18.3** + **TypeScript 5.5** — single-page interactive dental charting component
- **Vite 7.3** — dev server and library build
- **Tailwind CSS** — utility-first styling with custom theme via CSS variables (`--odon-*`)
- SVG-based tooth rendering with per-surface interaction

## Key Files
- `src/App.tsx` — main `OdontogramShell` component (exported as default)
- `src/odontogram.ts` — core odontogram state logic and types
- `src/plugin.ts` — plugin system for extending functionality
- `src/status_extras.ts` — additional dental status types (bridges, implants, etc.)
- `src/theme.ts` — theme configuration and CSS variable mapping
- `src/i18n/translations.ts` — multilingual labels (HU, EN, DE, ES)
- `src/utils/numbering.ts` — tooth numbering systems (FDI, Universal, Palmer)
- `src/assets/teeth-svgs/` — SVG templates for individual teeth (11-48)
- `src/assets/icon-svgs/` — UI icons

## Tooth State Model
Each tooth has:
- `toothSelection`: tooth-base | missing | implant | pontic
- `toothSubstrate`: natural | radix | broken | crownprep
- `restorationType`: none | crown | inlay | onlay | veneer | bridge (implant-gated crowns/bridges compose with an implant connector layer). Restoration options are gated by tooth kind via `restorationOptions()` (`src/registry/restorations.ts`): an implant tooth offers only crown/bridge, plus the five `prosthesis` attachment entries; a missing/gap tooth (`toothSelection === "none"`) offers only a bridge pontic, plus the two removable-denture `prosthesis` entries; a `radix` substrate hides the restoration control entirely (`restorationRowHidden()` in `src/odontogram.ts`) — no restoration can be authored on a root remnant. A `bridge` restoration renders both the crown cap AND the saddle-connector layer via `composeRestorationLayers()`; the multi-tooth bridge-span overlay connector is arch-aware (mirrored saddle-Y fraction for the lower arch, `SADDLE_Y_FRACTION_LOWER` in `src/bridgeOverlay.ts`), and applying a bridge via a Statuses preset explicitly re-triggers the overlay recompute
- `restorationMaterial`: none | emax | gold | gradia | zircon | metal | metal-ceramic | telescope | temporary
- `prosthesis`: none | healing-abutment | locator | locator-denture | bar | bar-denture | removable-partial | removable-full — orthogonal implant-attachment / removable-denture axis, surfaced as "Kivehető:" entries in the combined restoration dropdown (gated per tooth kind — see `restorationType` above)
- `crownLeakage`: boolean — marginal-leakage finding, shown only when `restorationType` is crown or bridge. Both the tooltip (`getStateSummary`) and whole-mouth summary (`getOdontogramSummary`) gate this line on the exact same predicate as the `#crownLeakageRow` control (`!restorationRowHidden(state)` AND crown/bridge), so a tooth with a stale crown/bridge payload but a hidden restoration row (radix/milktooth/extraction/under-gum) never shows a leakage line the control itself doesn't display
- `endo`: none | endo-medical-filling | endo-filling | endo-filling-incomplete | endo-glass-pin | endo-metal-pin — mutually exclusive with `pulpDx`; both are surfaced through one merged "Pulp / Endo status" selector (vital vs. treated groups), and setting `endo` to a treated value normalizes `pulpDx` to `normal` (suppressing the diseased-pulp glyph)
- `pulpDx`: normal | reversible-pulpitis | irreversible-pulpitis | necrosis — AAE pulp diagnosis (replaced the retired `pulpInflam` boolean); mutually exclusive with `endo` (see above); `reversible-pulpitis` renders a reduced pulp glyph
- `pulpLatin`: none | pulpa-sana | hyperaemia-pulpae | pulpitis-acuta-serosa | pulpitis-acuta-purulenta | pulpitis-chronica-clausa | pulpitis-chronica-ulcerosa | pulpitis-chronica-hyperplastica | necrosis-pulpae | gangraena-pulpae — practical-Latin pulp subtypes, surfaced by the pulp picker only when the `pulpDetailLevel` setting (`simple` | `aae` | `latin`, default `aae`) is `latin`. `setPulpDetailLevel()` calls `notifyStateChange()`, so switching the level live-refreshes the whole-mouth summary and every tooth's tooltip immediately instead of staying stale until the next tooth edit
- `apicalDx`: normal | symptomatic-apical-periodontitis | asymptomatic-apical-periodontitis | acute-apical-abscess | chronic-apical-abscess | condensing-osteitis — drives the periapical glyph directly, decoupled from the `mods.inflammation` modifier. The `mods.inflammation` toggle (`syncInflammationModVisibility()` in `src/odontogram.ts`) is shown ONLY for missing (`toothSelection === "none"`) and extraction-socket (`no-tooth-after-extraction`) teeth — it is hidden on present teeth (where `apicalDx` drives the glyph) and on implants (where `periImplant` drives it instead)
- `periapicalType`: none | granuloma | cyst — periapical lesion subtype qualifying the `apicalDx` glyph, offered by the picker only under symptomatic/asymptomatic apical periodontitis; the legacy `abscess` value is still accepted/stored (folded into `apicalDx` on import) but no longer authorable, since it duplicates the apical diagnosis
- `resorptionType`: none | internal | external-cervical — replaced the retired `rootResorption` boolean
- `periImplant`: none | mucositis | peri-implantitis-mild | peri-implantitis-moderate | peri-implantitis-severe — implant-only peri-implant status (2018 World Workshop staging); `mucositis` reuses the existing periodontal gum glyph, `peri-implantitis-*` additionally activates the `peri-implant-bone-loss` layer at severity-scaled opacity (0.4/0.7/1.0); retires the implant `mods.inflammation` periapical glyph (missing/extraction-socket teeth are unaffected) and hides the inflammation/parodontal modifier checkboxes on implants
- `mods.mobility` (M1/M2/M3 grades): the mobility control is hidden/disabled on implant teeth (`mobilityRowHidden()`/`mobilityDisabled()` in `src/odontogram.ts`) — implants don't carry periodontal mobility
- `caries`: array of surface identifiers (mesial, occlusal, distal, buccal, lingual)
- `fillingSurfaces`: array of filled surfaces
- `rootCaries`: none | active | arrested | active-cavitated — wires the `caries-root` artwork layer on a present tooth, at an opacity driven by severity (`active` 0.5 / `arrested` 0.7 / `active-cavitated` full)
- `caries`/`fillingSurfaceMaterials`/`cariesSeverity`: caries is a per-surface **state machine**, not two independent fields. `cariesSeverity` (0-6) is the single unified per-surface severity — replacing the old separate `cariesDepths` (ICDAS) and `secondaryCaries` (CARS) fields. A surface in `caries` with **no** filling on it renders as primary caries (`caries-{surface}`, ICDAS-tiered opacity from `cariesSeverity`); the same surface **with** a filling present renders as recurrent caries instead (`subcaries-{surface}`, CARS-scored opacity from `cariesSeverity`) — a surface is never both at once. A contextual popup shows only the severity group relevant to the surface's current state (primary ICDAS-depth group when unfilled, CARS group when filled)
- `radiographicDepth`: per-surface none | E1 | E2 | D1 | D2 | D3 — radiographic caries depth, independent of the visual ICDAS/CARS severity scale (`cariesSeverity`); surfaced as a `data-radio` badge attribute
- `fillingDefect`: per-surface none | marginal | fracture | wear — filling-defect finding on a DIRECT restoration (marginal defect/overhang, fracture/chip, or worn/deficient material), independent of recurrent caries; gated to surfaces present in `fillingSurfaceMaterials` (only a filled surface can carry a defect). Authored via a left-side per-surface indicator on the Fillings card (mirrors the right-side caries-depth indicator); renders on the chart by activating the existing `defect-{surface}` artwork layer; shown in the tooltip and the whole-mouth fillings summary, labeled explicitly (`fillingDefect.label` prefix) the same way recurrent caries is labeled on the Caries summary line. Payload version 2.7
- `wearEdge`: none | attrition | erosion — incisal/occlusal tooth-wear type; `wearCervical`: none | abrasion | abfraction | erosion — cervical tooth-wear type. Replaced the two on/off bruxism-wear flags (`bruxismWear`/`bruxismNeckWear`); authored via two dropdowns on the wear row. Render the existing `tooth-bruxism-wear`/`tooth-bruxism-neck-wear` layers (no new SVG), gated on `toothSelection === "tooth-base"` + `restorationType === "none"` + `toothSubstrate === "natural"`. Shown in the tooltip and a dedicated whole-mouth "Wear" summary section. Payload version 2.8; a legacy edge-wear flag migrates to `attrition`, a legacy cervical-wear flag migrates to `abrasion`
- `discoloration`: none | tetracycline | fluorosis | nonvital | extrinsic | other — per-tooth discoloration cause. Tints the shown natural crown's fill (`tooth-base` or `milktooth-base`, whichever is active) a cause-specific colour at render time; gated on a natural, unrestored tooth-base or milk tooth (`toothSelection` tooth-base or milktooth + `restorationType === "none"` + `toothSubstrate === "natural"`). Fill is not part of the SVG-fingerprint parity check (only id/opacity/class are), so the tint is parity-safe. Shown in the tooltip and a dedicated whole-mouth "Discoloration" summary section. Payload version 2.9; additive, no migration needed
- `orthoAppliance`: none | bracket | band; `orthoDrift`: none | mesial | distal; `orthoVertical`: none | extrusion | intrusion (extrusion renders an arrow-up glyph, intrusion an arrow-down glyph); `orthoRotation`: boolean — per-tooth orthodontic charting axes. Reuse the dormant v2.5.0 ortho artwork (no new SVG); gated on a present natural tooth (`toothSelection` tooth-base or milktooth — the shared `orthoAllowed` predicate). Shown on the chart, in the tooltip, and a new whole-mouth "Orthodontics" summary section. Payload version 2.10; additive, no migration needed
- Wear (`wearEdge`/`wearCervical`) and `discoloration` each have an app-level session detail level (`ToothDetailLevel`: `simple` | `complex`, default `complex`), set via Settings → Tooth details. Simple mode swaps the type/cause dropdown for a yes/no toggle per finding (wear on → `attrition`/`abrasion`, discoloration on → `other`); complex mode (default) shows the full dropdown. The setting only toggles which control is visible/derives its checked state from the stored value — it never mutates `state`, so the stored value survives switching levels. No payload/render/FHIR change.
- `SurfaceNotation`: `simple` | `full` (default `full`) — app-level session setting (`getSurfaceNotation`/`setSurfaceNotation` in `src/odontogram.ts`), set via Settings → Tooth details → "Surface notation". Drives `surfaceLetter()`/`surfaceLabelKey()`, which resolve the DISPLAY letter/caption for a caries/filling surface given the tooth's arch (`isUpperTooth`) and anterior/posterior position (`isAnteriorTooth`); shared by the whole-mouth summary AND both the caries and filling-defect surface pickers (letter + caption). Mapping — FULL: occlusal → "I"/incisal on an anterior tooth (else "O"/occlusal); buccal → "L"/labial on an anterior tooth (else "B"/buccal); lingual → "P"/palatal on an upper tooth (else "L"/lingual — a lower-anterior tooth therefore shows "L" for both buccal and lingual, disambiguated by cross-position + caption); mesial → "M", distal → "D", subcrown → "SC" (unaffected by the setting). SIMPLE: always the tooth-independent B/M/O/D/L/SC set. The stored `surface` key (e.g. `"occlusal"`, `"buccal"`, `"lingual"`) is never affected — only the displayed letter/label changes.
- Settings → "Panels" tab (`settings.panels.*`; `showStatusCard`/`onShowStatusCard`, `showOrthoCard`/`onShowOrthoCard` in `App.tsx`): independently toggles whether the whole-mouth Statuses card and Orthodontics card render (both default visible). Session-level UI state only — no payload/render/FHIR change to per-tooth data.
- Settings tabs are `general | panels | toothDetails | caries | pulpa | notes` (`SETTINGS_TABS` in `src/SettingsModal.tsx`). The former separate "Secondary caries" tab is merged into the "Caries" tab, with the CARS (secondary-caries) control positioned directly above Radiographic depth.
- `extractionPlan`, `crownNeeded`, `crownReplace`: boolean flags
- The per-tooth tooltip (`getStateSummary`) and the whole-mouth summary panel (`getOdontogramSummary`) surface all clinical axes above — pulp/apical diagnosis (+ lesion subtype), root resorption, peri-implant status, graded root caries, calculus, crown marginal leakage, fracture, contact loss, and typed edge/cervical wear — not just what is drawn on the chart. The panel groups pulp/apical/resorption/peri-implant findings into a dedicated `diagnoses` summary section, adds a dedicated `wear` summary section, and caries surfaces a coarse severity qualifier (superficial/moderate/deep) alongside the per-surface state.

## Integration with DentalQuoteCreator
- Used as git submodule at: `src/modules/odontogram/engine`
- Host app imports via path alias: `@odontogram-shell` → `src/App.tsx`
- Type declarations: `src/modules/odontogram/odontogram-shell.d.ts` in the host project
- Theme is synced via `themeConfig` prop (CSS variables)

## Build & Check
- `npm run dev` — start Vite dev server
- `npm run build` — production build (`tsc -b && vite build`)
- `npm test` — run Vitest tests
- `npm run test:coverage` — coverage report
- `npx tsc -b --noEmit` — type check only

## Conventions
- Tooth IDs use FDI notation (11-48) as internal keys
- All user-facing strings go through `src/i18n/translations.ts`
- SVG layers follow naming: `{toothId}_{surface}.svg`
- State is serialized as JSON for storage/transfer
- Read-only mode is supported via `readOnly` prop
- Keyboard accessibility (WCAG) is implemented for tooth navigation

## Documentation (mandatory)
- Updating the documentation is **mandatory** for every user-facing change (new
  feature, changed behavior, new/renamed public API, new state field or enum value).
- Keep `CHANGELOG.md` current — add an entry (Keep a Changelog format) and bump the
  version in `package.json` and the README version badge for each release.
- **English is the source of truth** for the README; translate the others from it.
- Maintain a README for **every UI language the program supports** (currently
  HU, EN, DE, ES, IT, SK, PL, RU, PT-BR — see `Language` in `src/i18n/translations.ts`).
  `README.md` holds English + Spanish; the rest live in `lang/README-<code>.md`
  (e.g. `lang/README-de.md`, `lang/README-pl.md`, `lang/README-ru.md`). When a new
  UI language is added, add its README too and update every language switcher.

## Scope Control
- Do not add dependencies on external dental systems or APIs
- Do not add routing — this is a single component, not an app
- Keep the bundle size minimal — no heavy libraries
- SVG assets should be optimized (no unnecessary metadata)
