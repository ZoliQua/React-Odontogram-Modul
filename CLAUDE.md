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
- `restorationType`: none | crown | inlay | onlay | veneer | bridge (implant-gated crowns/bridges compose with an implant connector layer)
- `restorationMaterial`: none | emax | gold | gradia | zircon | metal | metal-ceramic | telescope | temporary
- `prosthesis`: none | healing-abutment | locator | locator-denture | bar | bar-denture | removable-partial | removable-full — orthogonal implant-attachment / removable-denture axis, surfaced as "Kivehető:" entries in the combined restoration dropdown
- `crownLeakage`: boolean — marginal-leakage finding, shown only when `restorationType` is crown or bridge
- `endo`: none | root-canal | post-core | apicoectomy
- `pulpDx`: normal | reversible-pulpitis | irreversible-pulpitis | necrosis — AAE pulp diagnosis (replaced the retired `pulpInflam` boolean)
- `pulpLatin`: none | pulpa-sana | hyperaemia-pulpae | pulpitis-acuta-serosa | pulpitis-acuta-purulenta | pulpitis-chronica-clausa | pulpitis-chronica-ulcerosa | pulpitis-chronica-hyperplastica | necrosis-pulpae | gangraena-pulpae — practical-Latin pulp subtypes, surfaced by the pulp picker only when the `pulpDetailLevel` setting (`simple` | `aae` | `latin`, default `aae`) is `latin`
- `apicalDx`: normal | symptomatic-apical-periodontitis | asymptomatic-apical-periodontitis | acute-apical-abscess | chronic-apical-abscess | condensing-osteitis — drives the periapical glyph directly, decoupled from the `mods.inflammation` modifier
- `resorptionType`: none | internal | external-cervical — replaced the retired `rootResorption` boolean
- `caries`: array of surface identifiers (mesial, occlusal, distal, buccal, lingual)
- `fillingSurfaces`: array of filled surfaces
- `extractionPlan`, `crownNeeded`, `crownReplace`: boolean flags

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
