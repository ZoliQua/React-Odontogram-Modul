# React Odontogram Editor Modul

## English

<img width="1721" height="782" alt="react-odontogram-modul-preview" src="https://github.com/user-attachments/assets/26facfbc-26c0-4ae6-9fab-d430b9f036f6" />

Test URL: https://react-odontogram-modul.vercel.app/

### Overview
This project is an interactive, browser-based odontogram editor that supports fast dental charting with a clean UI. It renders layered SVG tooth templates to represent restorations, caries, endodontic status, mobility, and other clinical details, while providing multi-select, selection filters, and predefined status presets.

### Key features
- Fast selection and multi-select (CMD/CTRL + click)
- Tooth types: permanent, primary (milk), implant, broken variants, crown prep, subgingival
- Crown materials: natural, e.max, zircon, metal-ceramic, temporary, telescope
- Implant abutments: healing abutment, locator, locator with prosthesis, bar, bar with prosthesis
- Bridge units: zircon, metal, temporary, removable, bar, bar with prosthesis
- Caries charting on 6 surfaces: mesial, distal, buccal, lingual, occlusal, subcrown
- Filling materials per surface: amalgam, composite, GIC, temporary
- Endodontic states: medicinal filling, root canal filling, glass fiber post, metal post, resection
- Modifications: periapical inflammation, periodontal disease, mobility grades (M1/M2/M3)
- Special indicators: crown needed, crown replacement needed, missing closed gap, extraction plan, bruxism wear/neck wear, fissure sealing, contact point loss
- Occlusal view, wisdom teeth, bone and pulp visibility toggles
- 12 selection filters (all, present, permanent, milk, implants, missing, upper/lower, front/molars)
- Predefined status presets (reset, primary dentition, mixed dentition, edentulous)
- 34 predefined restoration templates (bridges, removable dentures, bar dentures with implants)
- Status export/import in JSON (version 1.1)
- Three numbering systems (FDI, Universal, Palmer)
- I18n (HU/EN/DE) with language switcher (155+ translation keys per language)

### Modules
- Odontogram grid and tooth tile UI
- Controls and status panel
- SVG layering engine and templates
- Tooth numbering and label mapping (FDI/Universal/Palmer)
- Localization (HU/EN/DE)
- Status export/import
- Status extras: predefined restoration templates

### UI Controls

**Topbar:**
- Language switcher (HU/EN/DE dropdown)
- Numbering system switcher (FDI/Universal/Palmer dropdown)
- Export Status / Import Status buttons

**Chart header:**
- Occlusal view toggle
- Wisdom teeth visibility toggle
- Bone visibility toggle
- Pulp visibility toggle
- Clear selection button

**Selection filters:**
- Select All / All Present / Permanent / Milk / Implants / All Missing
- Select Upper / Upper Front 6 / Upper Molars
- Select Lower / Lower Front 6 / Lower Molars

**Status presets:**
- Reset All (reset mouth)
- Primary Dentition
- Mixed Dentition
- Edentulous toggle

**Status extras dropdown:**
- Upper/Lower zircon bridges (12-22, 13-23, 16-26, full arch)
- Upper/Lower metal bridges (12-22, 13-23, 16-26, full arch)
- Upper/Lower partial removable dentures
- Upper/Lower full removable dentures
- Upper/Lower bar dentures with implants

### Tooth types and states

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
`natural`, `broken`, `emax`, `zircon`, `metal`, `temporary`, `telescope`

**Crown materials (implants):**
`natural` (none), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Bridge units:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Endodontic options (permanent teeth):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-glass-pin`, `endo-metal-pin`

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
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`

### SVG template system

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

### Numbering systems

**FDI (ISO 3950):** Adult teeth 11-18, 21-28, 31-38, 41-48. Primary teeth 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Adult teeth numbered 1-32. Primary teeth lettered A-T.

**Palmer (Zsigmondy-Palmer):** Quadrant + position format (e.g. UR-1, LL-5). Primary teeth use letters A-E per quadrant.

### Usage
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

### Integration
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
    />
  );
}
```

### Public API

The engine exports the following functions for external control:

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

### Status export/import format
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
- `bridgePillar` - bridge abutment tooth
- `mobility` - mobility grade (none/m1/m2/m3)
- `crownNeeded` - crown needed indicator
- `crownReplace` - crown replacement needed indicator
- `missingClosed` - gap closed after extraction

### Folder structure
- `src/App.tsx` - shell UI, topbar controls, language/numbering switcher
- `src/odontogram.ts` - SVG layering engine, tooth state management, UI wiring
- `src/status_extras.ts` - 34 predefined restoration templates (bridges, dentures, bar constructions)
- `src/i18n/` - translations (HU/EN/DE) and i18n hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer numbering conversion
- `src/assets/teeth-svgs/` - SVG tooth templates (6 files: incisors, canines, premolars, molars + occlusal views)
- `src/assets/icon-svgs/` - toolbar icon SVGs (5 files)

### Tech stack
- React 18 + Vite + TypeScript
- Tailwind CSS for UI styling
- SVG layering via DOM manipulation (non-React state for performance)
- Lightweight custom i18n system
- Vite path alias: `@` mapped to `./src`

### Notes
- SVG templates are loaded from `src/assets/teeth-svgs` and `src/assets/icon-svgs`, so static hosting must serve the public folder.
- The odontogram engine uses its own internal state (not React state) for performance and simplicity.
- Milk teeth have a reduced set of available materials (no amalgam fillings, no pin-based endo).
- Implant teeth have a different set of crown/abutment options than natural teeth.

---

## Magyar

<img width="1725" height="952" alt="react-odontogram-modul-preview" src="https://github.com/user-attachments/assets/8694c7ec-da1b-4664-b7d7-f70ff8737f45" />

Test URL: https://react-odontogram-modul.vercel.app/

### Attekintes
A projekt egy interaktiv, bongeszoben futo odontogram szerkeszto, amely a fogazati statuszrogzitest modern, gyorsan kezelheto UI-val tamogatja. A rendszer kulonbozo fogtipusokat, restauraciokat, gyokerkezelesi allapotokat, fogszuvasodas feluleteket, mobilitast es egyeb odontologiai jellemzoket kepes retegzett SVG ikonokkal megjeleniteni, mikozben tobbfogos kivalasztast, szuroket es elore definialt statusz mintakat is biztosit.

### Fobb funkciok
- Gyors fogkijeloles es tobbfogos kivalasztas (CMD/CTRL + kattintas)
- Fogtipusok: marado, tej, implantatum, tort valtozatok, koronaelokeszites, iny alatti
- Korona anyagok: termeszetes, e.max, cirkon, fem-keramia, ideiglenes, teleszkop
- Implantatum feleptmenyek: gyogyulo csavar, lokator, lokator protezissel, bar, bar protezissel
- Hidtagok: cirkon, fem, ideiglenes, kiveteheto, bar, bar protezissel
- Kariesz kartografaas 6 feluleten: mezialis, disztalis, bukkalis, lingualis, okkluzalis, korona alatti
- Tomes anyagok feluletenkent: amalgam, kompozit, GIC, ideiglenes
- Endodonciai allapotok: gyogyszeres tomes, gyokertomes, uvegszalas csap, fem csap, rezekcio
- Modositok: periapikalis gyulladas, parodontalis betegseg, mobilitas fokok (M1/M2/M3)
- Specialis jelzok: korona szukseges, korona csere szukseges, zart hezag, extrakcios terv, bruxizmus koptatas/nyaki koptatas, fisszura zaras, kontaktpont vesztes
- Okkluzalis nezet, bolcsessegfog, csont es pulpa lathatosag kapcsolok
- 12 kivalasztasi szuro (osszes, jelenlevo, marado, tej, implantatum, hianyzo, felso/also, front/molarisok)
- Elore definialt statusz mintak (alaphelyzet, tejfogazat, vegyes fogazat, fogatlan)
- 34 elore definialt restauracios sablon (hidak, kiveteheto protezisek, bar protezisek implantokkal)
- Allapot export/import JSON formatumban (1.1 verzio)
- Harom szamozasi rendszer (FDI, Universal, Palmer)
- I18n (HU/EN/DE) valaszthato nyelvvel (155+ forditasi kulcs nyelvenkent)

### Modulok
- Odontogram racs es fogcsempe UI
- Vezerlok es statusz panel
- SVG retegelo motor es fogsablonok
- Fogszamozas es cimke generaas (FDI/Universal/Palmer)
- Lokalizacio (HU/EN/DE)
- Statusz export/import
- Statusz extr: elore definialt restauracios sablonok

### UI vezerlok

**Fejlec sav:**
- Nyelvvalaszto (HU/EN/DE lenyilo)
- Szamozasi rendszer valaszto (FDI/Universal/Palmer lenyilo)
- Statusz exportalas / Statusz importalas gombok

**Diagram fejlec:**
- Okkluzalis nezet kapcsolo
- Bolcsessegfog lathatosag kapcsolo
- Csont lathatosag kapcsolo
- Pulpa lathatosag kapcsolo
- Kivalasztas torlese gomb

**Kivalasztasi szurok:**
- Osszes kivalasztasa / Osszes jelenlevo / Marado / Tej / Implantatumok / Osszes hianyzo
- Felso / Felso front 6 / Felso molarisok
- Also / Also front 6 / Also molarisok

**Statusz mintak:**
- Osszes visszaallitasa (szajureg reset)
- Tejfogazat
- Vegyes fogazat
- Fogatlan kapcsolo

**Statusz extrak lenyilo:**
- Felso/Also cirkon hidak (12-22, 13-23, 16-26, teljes iv)
- Felso/Also fem hidak (12-22, 13-23, 16-26, teljes iv)
- Felso/Also reszleges kiveteheto protezisek
- Felso/Also teljes kiveteheto protezisek
- Felso/Also bar protezisek implantatumokkal

### Fogtipusok es allapotok

**Fog kivalasztas (alaptipus):**
| Ertek | Leiras |
|---|---|
| `none` | Hianyzo fog |
| `tooth-base` | Marado fog |
| `milktooth` | Tejfog |
| `implant` | Fogimplantatum |
| `tooth-crownprep` | Koronaelokeszitett fog |
| `tooth-under-gum` | Iny alatti (elobuvatlan) fog |

**Tort fog valtozatok:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Korona anyagok (marado fogak):**
`natural`, `broken`, `emax`, `zircon`, `metal`, `temporary`, `telescope`

**Korona anyagok (implantatumok):**
`natural` (nincs), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Hidtagok:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Endodonciai lehetosegek (marado fogak):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-glass-pin`, `endo-metal-pin`

**Endodonciai lehetosegek (tejfogak):**
`none`, `endo-medical-filling`

**Tomes anyagok (marado fogak):**
`amalgam`, `composite`, `gic`, `temporary`

**Tomes anyagok (tejfogak):**
`composite`, `gic`, `temporary`

**Tomes/kariesz feluletek:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (csak kariesz)

**Modositok:**
`inflammation` (periapikalis), `parodontal` (parodontalis), `mobility` (M1/M2/M3)

**Specialis jelzok:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`

### SVG sablon rendszer

**Fogsablonok** (`src/assets/teeth-svgs/`):
| Sablon | Hasznalo fogak |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (metszo fogak) |
| `13.svg` | 13, 23, 33, 43 (szemfogak) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (kis orolofogak) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (nagy orolofogak) |

A sablonok az also allcsontnal 180 fokkal elforgatva, a bal oldalnal vizszintesen tukrozve jelennek meg.

**Ikon SVG-k** (`src/assets/icon-svgs/`):
`icon_8.svg` (bolcsesseg), `icon_gum.svg` (csont), `icon_no_selection.svg` (torles), `icon_occl.svg` (okkluzalis nezet), `icon_pulp.svg` (pulpa)

### Szamozasi rendszerek

**FDI (ISO 3950):** Felnott fogak 11-18, 21-28, 31-38, 41-48. Tejfogak 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Felnott fogak 1-32 szamozassal. Tejfogak A-T betukkel.

**Palmer (Zsigmondy-Palmer):** Kvadrans + pozicio formatum (pl. UR-1, LL-5). Tejfogak kvadransonkent A-E betukkel.

### Hasznalat
Fejlesztes inditasa:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Elozetes megtekintes:
```bash
npm run preview
```

### Integracio
A komponens kulon is felhasznalhato React alkalmazasban.
Peldakent:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="hu"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
    />
  );
}
```

### Nyilvanos API

A motor az alabbi fuggvenyeket exportalja kulso vezerleshez:

| Fuggveny | Leiras |
|---|---|
| `initOdontogram()` | Motor inicializalasa es osszes fog renderelese |
| `destroyOdontogram()` | Motor leallitasa es esemenykezelok eltavolitasa |
| `setNumberingSystem(system)` | Valtas FDI, Universal, Palmer kozott |
| `clearSelection()` | Osszes fog kivalasztasanak torlese |
| `setOcclusalVisible(on)` | Okkluzalis nezet be/ki |
| `setWisdomVisible(on)` | Bolcsessegfogak mutatasa/elrejtese |
| `setShowBase(on)` | Csont reteg mutatasa/elrejtese |
| `setHealthyPulpVisible(on)` | Egeszsege pulpa mutatasa/elrejtese |

### Statusz export/import formatum
Az export egy JSON fajlt hoz letre (`1.1` verzio), amely tartalmazza:

**Globalis mezok:**
- `wisdomVisible` - bolcsessegfogak lathatoak
- `showBase` - csont reteg lathato
- `occlusalVisible` - okkluzalis nezet aktiv
- `showHealthyPulp` - egeszseg pulpa lathato
- `edentulous` - fogatlan mod aktiv

**Fogankenti mezok (32 fog):**
- `toothSelection` - fog alaptipusa
- `crownMaterial` - korona/feleptmeny anyaga
- `bridgeUnit` - hidtag tipusa
- `endo` - endodonciai allapot
- `mods` - modositok tombje (gyulladas, parodontalis)
- `caries` - aktiv kariesz feluletek
- `fillingMaterial` - tomes anyaga
- `fillingSurfaces` - tomott feluletek
- `pulpInflam` - pulpa gyulladas jelzo
- `endoResection` - csucsi rezekcio jelzo
- `fissureSealing` - fisszura zaras jelzo
- `contactMesial` - mezialis kontaktpont vesztes
- `contactDistal` - disztalis kontaktpont vesztes
- `bruxismWear` - okkluzalis bruxizmus koptatas
- `bruxismNeckWear` - nyaki bruxizmus koptatas
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - tores helyek
- `extractionWound` - extrakcios seb
- `extractionPlan` - tervezett extrakio
- `bridgePillar` - hid pillerfog
- `mobility` - mobilitas fok (none/m1/m2/m3)
- `crownNeeded` - korona szukseges jelzo
- `crownReplace` - korona csere szukseges jelzo
- `missingClosed` - zart hezag extrakio utan

### Mappastruktura
- `src/App.tsx` - UI vaz, fejlec vezerlok, nyelv/szamozas valaszto
- `src/odontogram.ts` - SVG retegelo motor, fog allapotkezeles, UI osszekotes
- `src/status_extras.ts` - 34 elore definialt restauracios sablon (hidak, protezisek, bar konstrukciok)
- `src/i18n/` - forditasok (HU/EN/DE) es i18n hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer szamozasi konverzio
- `src/assets/teeth-svgs/` - SVG fogsablonok (6 fajl: metszok, szemfogak, kis orolok, nagy orolok + okkluzalis nezetek)
- `src/assets/icon-svgs/` - eszkoztar ikon SVG-k (5 fajl)

### Technologia
- React 18 + Vite + TypeScript
- Tailwind CSS a UI stilusokhoz
- SVG retegeles DOM manipulacioval (nem React state, a teljesitmeny erdekeben)
- Egyszeru egyedi i18n rendszer
- Vite utvonal alias: `@` a `./src` mappara kepezve

### Megjegyzesek
- A SVG sablonok `src/assets/teeth-svgs` es `src/assets/icon-svgs` mappa alol kerulnek betoltesre, ezert statikus hostingnal a public mappa elerhetosege kotelezo.
- Az UI retegeles es allapotkezeles jelenleg nem React state-ben, hanem sajat belso allapotban mukodik.
- A tejfogaknal szukebb anyagvalasztek all rendelkezesre (nincs amalgam tomes, nincs csapos endo).
- Az implantatum fogaknal a koronalehetosegek elternek a termeszetes fogaketol (lokator, bar, gyogyulo csavar).

## License

Created by Zoltan Dul (2026)
Use it by MIT license.
