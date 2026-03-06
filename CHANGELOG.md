# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.2.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/ZoliQua/React-Odontogram-Modul/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/ZoliQua/React-Odontogram-Modul/releases/tag/v1.0.0
