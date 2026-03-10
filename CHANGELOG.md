# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.4.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ZoliQua/React-Odontogram-Modul/releases/tag/v1.0.0
