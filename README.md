# React Odontogram Editor Modul

## English

<img width="1721" height="782" alt="react-odontogram-modul-preview" src="https://github.com/user-attachments/assets/26facfbc-26c0-4ae6-9fab-d430b9f036f6" />

🔗 Test URL: https://react-odontogram-modul.vercel.app/

### Overview
This project is an interactive, browser-based odontogram editor that supports fast dental charting with a clean UI. It renders layered SVG tooth templates to represent restorations, caries, endodontic status, mobility, and other clinical details, while providing multi-select, selection filters, and predefined status presets.

### Key features
- Fast selection and multi-select (CMD/CTRL + click)
- Tooth type, restorations, caries surfaces, endo status, mobility, contacts
- Occlusal view, wisdom teeth, bone and pulp visibility toggles
- Status export/import in JSON
- Three numbering systems (FDI, Universal, Palmer)
- I18n (HU/EN/DE) with language switcher

### Modules (with icons)
- :tooth: Odontogram grid and tooth tile UI
- :control_knobs: Controls and status panel
- :art: SVG layering engine and templates
- :label: Tooth numbering and label mapping
- :globe_with_meridians: Localization (HU/EN/DE)
- :floppy_disk: Status export/import

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

### Status export/import format
The export creates a JSON file containing:
- global UI toggles (wisdom, bone, occlusal, pulp, edentulous)
- per-tooth state payloads

Per-tooth fields include:
- `toothSelection`, `crownMaterial`, `bridgeUnit`, `endo`, `mods`, `caries`, `fillingMaterial`, `fillingSurfaces`
- `pulpInflam`, `endoResection`, `fissureSealing`, `contactMesial`, `contactDistal`
- `bruxismWear`, `bruxismNeckWear`, `brokenMesial`, `brokenIncisal`, `brokenDistal`
- `extractionWound`, `extractionPlan`, `bridgePillar`, `mobility`

### Folder structure
- `src/App.tsx` - shell UI, language and numbering controls
- `src/odontogram.ts` - SVG layering logic and UI wiring
- `src/i18n/` - translations and i18n hook
- `src/utils/numbering.ts` - numbering systems
- `src/assets/` - tooth templates and icon SVGs

### Tech stack
- React + Vite + TypeScript
- SVG layering via DOM manipulation
- Lightweight i18n

### Notes
- SVG templates are loaded from `src/assets/teeth-svgs` and `src/assets/icon-svgs`, so static hosting must serve the public folder.
- The odontogram engine uses its own internal state (not React state) for performance and simplicity.

---

## Magyar

<img width="1725" height="952" alt="react-odontogram-modul-preview" src="https://github.com/user-attachments/assets/8694c7ec-da1b-4664-b7d7-f70ff8737f45" />

🔗 Test URL: https://react-odontogram-modul.vercel.app/

### Áttekintés
A projekt egy interaktív, bongészőben futó odontogram szerkesztő, amely a fogazati statuszrőgzitest modern, gyorsan kezelhető UI-val támogatja. A rendszer külünböző fogtipusokat, restauráiókat, gyökerkezelési állapotokat, fogszuvasodás felületeket, mobilitást és egyeb odontológiai jellemzőket képes retegzett SVG ikonokkal megjeleníteni, miközben többbfogos kiválasztást, szűrőket és előre definiált statusz mintakat is biztosít.

### Fobb funkciók
- Gyors fogkijelölés és többfogos kiválasztás (CMD/CTRL + kattintás)
- Fogtipusok, restaurációk, kariesz felületek, endo állapotok, mobilitás, kontaktok kezelése
- Occlusios nézet, bolcsesseg fogak, csont és pulpa láthatóság kapcsolók
- Allapot export/import JSON formaban
- Harom számozási rendszer (FDI, Universal, Palmer)
- I18n (HU/EN/DE) valaszthato nyelvvel

### Modulok (ikon jelölésel)
- :tooth: Odontogram racs és fogcsempe UI
- :control_knobs: Vezérlok és statusz panel
- :art: SVG retegelo motor és fogsablonok
- :label: Fogszamozás és label generalás
- :globe_with_meridians: Lokalizácio (magyar HU, angol EN, német DE)
- :floppy_disk: Statusz export/import

### Hasznalat
Fejlesztő indítása:
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
A komponens külön is felhasználható React alkalmazásban.
Példakent:
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

### Statusz export/import formátum
Az export egy JSON fájlt hoz létre, amely tartalmazza:
- globális UI kapcsolók (bölcsesség, csont, occlusio, pulpa, edentulous) aktuális állapotát
- fogankénti állapot mezők jellemzőit

Főbb mezők (fogonként):
- `toothSelection`, `crownMaterial`, `bridgeUnit`, `endo`, `mods`, `caries`, `fillingMaterial`, `fillingSurfaces`
- `pulpInflam`, `endoResection`, `fissureSealing`, `contactMesial`, `contactDistal`
- `bruxismWear`, `bruxismNeckWear`, `brokenMesial`, `brokenIncisal`, `brokenDistal`
- `extractionWound`, `extractionPlan`, `bridgePillar`, `mobility`

### Mappastruktúra
- `src/App.tsx` - UI vaza, nyelv es számozás kapcsolók
- `src/odontogram.ts` - SVG rétegelő motor es UI vezérlés
- `src/i18n/` - fordítások es i18n hook
- `src/utils/numbering.ts` - fogszámozási rendszerek
- `src/assets` - fogsablon es ikon SVG-k

### Technologia
- React + Vite + TypeScript
- SVG retegeles DOM manipulációval
- Egyszerű i18n rendszer

### Megjegyzések
- A SVG sablonok `src/assets/teeth-svgs` és `src/assets/icon-svgs` mappa alól kerülnek betöltésre, ezert statikus hostingnal a public mappa elérhetősége kötelező.
- Az UI rétegelés es állapotkezelés jelenleg nem React state-ben, hanem saját belso állapotban működik.

## License

Created by Zoltan Dul (2026)
Use it by MIT license.
