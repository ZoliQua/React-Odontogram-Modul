# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-03-09

Automatizált tesztelés, API dokumentáció és egyedi téma konfiguráció.

### Added
- **Vitest tesztelési keretrendszer** — 128 teszt 6 fájlban, teljes lefedettség a publikus API-ra
  - `numbering.test.ts` — FDI/Universal/Palmer konverzió mind a 32 felnőtt + 20 tejfogra, edge case-ek
  - `translations.test.ts` — mind a 8 nyelv kulcskonzisztencia, üres értékek, placeholder-ek ellenőrzése
  - `status_extras.test.ts` — 21 preset struktúra validáció (ívek, anyagok, fogak, átfedések)
  - `useI18n.test.ts` — `t()` fordító függvény, nyelvváltás, listener rendszer
  - `App.test.tsx` — renderelés, controlled/standalone mód, dark mode, dropdown-ok
  - `theme.test.ts` — CSS custom property alkalmazás, null/undefined kezelés
- **TypeDoc API dokumentáció** — JSDoc kommentek minden exportált típusra és függvényre
  - `typedoc.json` konfiguráció GitHub Pages támogatással
  - `npm run docs` script a `docs/` könyvtár generálásához
- **Téma konfiguráció rendszer** (`OdontogramThemeConfig`)
  - 8 szín property: `background`, `panel`, `card`, `text`, `muted`, `line`, `accent`, `accent2`
  - CSS custom property-k (`--odon-*`) fallback rendszerrel — Tailwind és vanilla CSS projektekhez egyaránt
  - Új `themeConfig` prop az `App` komponensen
  - `applyThemeConfig()` utility függvény runtime szín felülíráshoz
  - Dark mode és theme config egymással kompatibilis
- Új npm scriptek: `test`, `test:watch`, `test:coverage`, `docs`

### Changed
- `src/App.tsx` — új `themeConfig` prop, `OdontogramThemeConfig` export, `.odontogram-root` wrapper div a CSS custom property-khez
- `src/index.css` — CSS változók átírva `var(--odon-*, fallback)` formátumra, új `.odontogram-root` és `.dark .odontogram-root` szelektorok
- `src/theme.ts` — új fájl: `OdontogramThemeConfig` típus és `applyThemeConfig()` függvény
- `src/odontogram.ts` — JSDoc kommentek a publikus API függvényekhez (`initOdontogram`, `destroyOdontogram`, `setNumberingSystem`, `clearSelection`, `setWisdomVisible`, `setShowBase`, `setOcclusalVisible`, `setHealthyPulpVisible`)
- `src/i18n/translations.ts` — JSDoc kommentek a `Language` típushoz és `translations` objektumhoz
- `src/i18n/useI18n.ts` — JSDoc kommentek: `t()`, `getI18nLanguage()`, `setI18nLanguage()`, `onI18nChange()`, `useI18n()`
- `src/utils/numbering.ts` — JSDoc kommentek: `NumberingSystem` típus, `toLabel()` függvény példákkal
- `src/status_extras.ts` — JSDoc komment a `STATUS_EXTRAS` objektumhoz
- `vitest.config.ts` — új fájl: Vitest konfiguráció jsdom környezettel
- `package.json` — verzió 1.2.0 → 1.3.0, új dev dependency-k (vitest, @testing-library/react, @testing-library/jest-dom, jsdom, typedoc)

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

[1.3.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ZoliQua/React-Odontogram-Modul/releases/tag/v1.0.0
