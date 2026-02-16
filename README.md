# React Odontogram Editor Modul

## English

<img width="1721" height="782" alt="react-odontogram-modul-preview" src="https://github.com/user-attachments/assets/26facfbc-26c0-4ae6-9fab-d430b9f036f6" />

Test URL: https://react-odontogram-modul.vercel.app/

### Overview
This project is an interactive, browser-based odontogram editor that supports fast dental charting with a clean UI. It renders layered SVG tooth templates to represent restorations, caries, endodontic status, mobility, and other clinical details, while providing multi-select, selection filters, and predefined status presets.

### Key features
- Fast selection and multi-select (CMD/CTRL + click)
- Tooth types: permanent, primary (milk), implant, broken variants, crown prep, subgingival
- Crown materials: natural, e.max, zircon, metal-ceramic, temporary, telescope, radix
- Implant abutments: healing abutment, locator, locator with prosthesis, bar, bar with prosthesis
- Bridge units: zircon, metal, temporary, removable, bar, bar with prosthesis
- Caries charting on 6 surfaces: mesial, distal, buccal, lingual, occlusal, subcrown
- Filling materials per surface: amalgam, composite, GIC, temporary
- Endodontic states: medicinal filling, root canal filling, incomplete root filling, glass fiber post, metal post, resection, parapulpal pin
- Modifications: periapical inflammation (inside/outside), periodontal disease, mobility grades (M1/M2/M3)
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
`natural`, `broken`, `radix`, `emax`, `zircon`, `metal`, `temporary`, `telescope`

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

**Special indicators:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `parapulpalPin`

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
- `parapulpalPin` - parapulpal pin flag
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

### Áttekintés
A projekt egy interaktív, böngészőben futó odontogram szerkesztő, amely a fogazati státuszrögzítést modern, gyorsan kezelhető UI-val támogatja. A rendszer különböző fogtípusokat, restaurációkat, gyökérkezelési állapotokat, fogszuvasodás felületeket, mobilitást és egyéb odontológiai jellemzőket képes rétegzett SVG ikonokkal megjeleníteni, miközben többfogos kiválasztást, szűrőket és előre definiált státusz mintákat is biztosít.

### Főbb funkciók
- Gyors fogkijelölés és többfogos kiválasztás (CMD/CTRL + kattintás)
- Fogtípusok: maradó, tej, implantátum, tört változatok, koronaelőkészítés, íny alatti
- Korona anyagok: természetes, e.max, cirkón, fém-kerámia, ideiglenes, teleszkóp, radix
- Implantátum felépítmények: gyógyuló csavar, lokátor, lokátor protézissel, bár, bár protézissel
- Hídtagok: cirkón, fém, ideiglenes, kivehető, bár, bár protézissel
- Kariesz kartografálás 6 felületen: meziális, disztális, bukkális, linguális, okkluzális, korona alatti
- Tömés anyagok felületenként: amalgám, kompozit, GIC, ideiglenes
- Endodonciai állapotok: gyógyszeres tömés, gyökértömés, incomplét gyökértömés, üvegszálas csap, fém csap, rezekció, parapulpális csap
- Módosítók: periapikális gyulladás (belső/külső), parodontális betegség, mobilitás fokok (M1/M2/M3)
- Speciális jelzők: korona szükséges, korona csere szükséges, zárt hézag, extrakciós terv, bruxizmus koptatás/nyaki koptatás, fisszúra zárás, kontaktpont vesztés
- Okkluzális nézet, bölcsességfog, csont és pulpa láthatóság kapcsolók
- 12 kiválasztási szűrő (összes, jelenlévő, maradó, tej, implantátum, hiányzó, felső/alsó, front/molárisok)
- Előre definiált státusz minták (alaphelyzet, tejfogazat, vegyes fogazat, fogatlan)
- 34 előre definiált restaurációs sablon (hidak, kivehető protézisek, bár protézisek implantokkal)
- Állapot export/import JSON formátumban (1.1 verzió)
- Három számozási rendszer (FDI, Universal, Palmer)
- I18n (HU/EN/DE) választható nyelvvel (155+ fordítási kulcs nyelvenként)

### Modulok
- Odontogram rács és fogcsempe UI
- Vezérlők és státusz panel
- SVG rétegelő motor és fogsablonok
- Fogszámozás és címke generálás (FDI/Universal/Palmer)
- Lokalizáció (HU/EN/DE)
- Státusz export/import
- Státusz extrák: előre definiált restaurációs sablonok

### UI vezérlők

**Fejléc sáv:**
- Nyelvválasztó (HU/EN/DE legördülő)
- Számozási rendszer választó (FDI/Universal/Palmer legördülő)
- Státusz exportálás / Státusz importálás gombok

**Diagram fejléc:**
- Okkluzális nézet kapcsoló
- Bölcsességfog láthatóság kapcsoló
- Csont láthatóság kapcsoló
- Pulpa láthatóság kapcsoló
- Kiválasztás törlése gomb

**Kiválasztási szűrők:**
- Összes kiválasztása / Összes jelenlévő / Maradó / Tej / Implantátumok / Összes hiányzó
- Felső / Felső front 6 / Felső molárisok
- Alsó / Alsó front 6 / Alsó molárisok

**Státusz minták:**
- Összes visszaállítása (szájüreg reset)
- Tejfogazat
- Vegyes fogazat
- Fogatlan kapcsoló

**Státusz extrák legördülő:**
- Felső/Alsó cirkón hidak (12-22, 13-23, 16-26, teljes ív)
- Felső/Alsó fém hidak (12-22, 13-23, 16-26, teljes ív)
- Felső/Alsó részleges kivehető protézisek
- Felső/Alsó teljes kivehető protézisek
- Felső/Alsó bár protézisek implantátumokkal

### Fogtípusok és állapotok

**Fog kiválasztás (alaptípus):**
| Érték | Leírás |
|---|---|
| `none` | Hiányzó fog |
| `tooth-base` | Maradó fog |
| `milktooth` | Tejfog |
| `implant` | Fogimplantátum |
| `tooth-crownprep` | Koronaelőkészített fog |
| `tooth-under-gum` | Íny alatti (előbújatlan) fog |

**Tört fog változatok:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Korona anyagok (maradó fogak):**
`natural`, `broken`, `radix`, `emax`, `zircon`, `metal`, `temporary`, `telescope`

**Korona anyagok (implantátumok):**
`natural` (nincs), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Hídtagok:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Endodonciai lehetőségek (maradó fogak):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodonciai lehetőségek (tejfogak):**
`none`, `endo-medical-filling`

**Tömés anyagok (maradó fogak):**
`amalgam`, `composite`, `gic`, `temporary`

**Tömés anyagok (tejfogak):**
`composite`, `gic`, `temporary`

**Tömés/kariesz felületek:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (csak kariesz)

**Módosítók:**
`inflammation` (periapikális), `parodontal` (parodontális), `mobility` (M1/M2/M3)

**Speciális jelzők:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `parapulpalPin`

### SVG sablon rendszer

**Fogsablonok** (`src/assets/teeth-svgs/`):
| Sablon | Használó fogak |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (metszőfogak) |
| `13.svg` | 13, 23, 33, 43 (szemfogak) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (kis őrlőfogak) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (nagy őrlőfogak) |

A sablonok az alsó állcsontnál 180 fokkal elforgatva, a bal oldalnál vízszintesen tükrözve jelennek meg.

**Ikon SVG-k** (`src/assets/icon-svgs/`):
`icon_8.svg` (bölcsesség), `icon_gum.svg` (csont), `icon_no_selection.svg` (törlés), `icon_occl.svg` (okkluzális nézet), `icon_pulp.svg` (pulpa)

### Számozási rendszerek

**FDI (ISO 3950):** Felnőtt fogak 11-18, 21-28, 31-38, 41-48. Tejfogak 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Felnőtt fogak 1-32 számozással. Tejfogak A-T betűkkel.

**Palmer (Zsigmondy-Palmer):** Kvadráns + pozíció formátum (pl. UR-1, LL-5). Tejfogak kvadránsonként A-E betűkkel.

### Használat
Fejlesztés indítása:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Előzetes megtekintés:
```bash
npm run preview
```

### Integráció
A komponens külön is felhasználható React alkalmazásban.
Példaként:
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

### Nyilvános API

A motor az alábbi függvényeket exportálja külső vezérléshez:

| Függvény | Leírás |
|---|---|
| `initOdontogram()` | Motor inicializálása és összes fog renderelése |
| `destroyOdontogram()` | Motor leállítása és eseménykezelők eltávolítása |
| `setNumberingSystem(system)` | Váltás FDI, Universal, Palmer között |
| `clearSelection()` | Összes fog kiválasztásának törlése |
| `setOcclusalVisible(on)` | Okkluzális nézet be/ki |
| `setWisdomVisible(on)` | Bölcsességfogak mutatása/elrejtése |
| `setShowBase(on)` | Csont réteg mutatása/elrejtése |
| `setHealthyPulpVisible(on)` | Egészséges pulpa mutatása/elrejtése |

### Státusz export/import formátum
Az export egy JSON fájlt hoz létre (`1.1` verzió), amely tartalmazza:

**Globális mezők:**
- `wisdomVisible` - bölcsességfogak láthatóak
- `showBase` - csont réteg látható
- `occlusalVisible` - okkluzális nézet aktív
- `showHealthyPulp` - egészséges pulpa látható
- `edentulous` - fogatlan mód aktív

**Fogankénti mezők (32 fog):**
- `toothSelection` - fog alaptípusa
- `crownMaterial` - korona/felépítmény anyaga
- `bridgeUnit` - hídtag típusa
- `endo` - endodonciai állapot
- `mods` - módosítók tömbje (gyulladás, parodontális)
- `caries` - aktív kariesz felületek
- `fillingMaterial` - tömés anyaga
- `fillingSurfaces` - tömött felületek
- `pulpInflam` - pulpa gyulladás jelző
- `endoResection` - csúcsi rezekció jelző
- `fissureSealing` - fisszúra zárás jelző
- `contactMesial` - meziális kontaktpont vesztés
- `contactDistal` - disztális kontaktpont vesztés
- `bruxismWear` - okkluzális bruxizmus koptatás
- `bruxismNeckWear` - nyaki bruxizmus koptatás
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - törés helyek
- `extractionWound` - extrakciós seb
- `extractionPlan` - tervezett extrakció
- `parapulpalPin` - parapulpális csap jelző
- `bridgePillar` - híd pillérfog
- `mobility` - mobilitás fok (none/m1/m2/m3)
- `crownNeeded` - korona szükséges jelző
- `crownReplace` - korona csere szükséges jelző
- `missingClosed` - zárt hézag extrakció után

### Mappastruktúra
- `src/App.tsx` - UI váz, fejléc vezérlők, nyelv/számozás választó
- `src/odontogram.ts` - SVG rétegelő motor, fog állapotkezelés, UI összekötés
- `src/status_extras.ts` - 34 előre definiált restaurációs sablon (hidak, protézisek, bár konstrukciók)
- `src/i18n/` - fordítások (HU/EN/DE) és i18n hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer számozási konverzió
- `src/assets/teeth-svgs/` - SVG fogsablonok (6 fájl: metszők, szemfogak, kis őrlők, nagy őrlők + okkluzális nézetek)
- `src/assets/icon-svgs/` - eszköztár ikon SVG-k (5 fájl)

### Technológia
- React 18 + Vite + TypeScript
- Tailwind CSS a UI stílusokhoz
- SVG rétegelés DOM manipulációval (nem React state, a teljesítmény érdekében)
- Egyszerű egyedi i18n rendszer
- Vite útvonal alias: `@` a `./src` mappára képezve

### Megjegyzések
- A SVG sablonok `src/assets/teeth-svgs` és `src/assets/icon-svgs` mappa alól kerülnek betöltésre, ezért statikus hostingnál a public mappa elérhetősége kötelező.
- Az UI rétegelés és állapotkezelés jelenleg nem React state-ben, hanem saját belső állapotban működik.
- A tejfogaknál szűkebb anyagválaszték áll rendelkezésre (nincs amalgám tömés, nincs csapos endo).
- Az implantátum fogaknál a koronalehetőségek eltérnek a természetes fogakétól (lokátor, bár, gyógyuló csavar).

## License

Created by Zoltan Dul (2026)
Use it by MIT license.
