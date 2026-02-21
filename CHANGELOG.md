# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.0]: https://github.com/ZoliQua/React-Odontogram-Modul/releases/tag/v1.0.0
