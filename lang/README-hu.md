# 🦷 React Odontogram Modul

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-1.18.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](../README.md#-english) | 🇪🇸 [Español](../README.md#-español) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md)

---

## 🇭🇺 Magyar

### 📋 Áttekintés
Ez a projekt egy interaktív, böngészőben futó odontogram szerkesztő, amely a fogazati státuszrögzítést áttekinthető kezelőfelülettel támogatja. A rendszer rétegzett SVG fogsablonok segítségével jeleníti meg a restaurációkat, szuvasodásokat, endodonciai állapotokat, mobilitást és egyéb klinikai jellemzőket, miközben többfogos kiválasztást, kiválasztási szűrőket és előre definiált státusz mintákat is biztosít.

---
<img width="1725" height="913" alt="react-odontogram-modul-hungarian-preview" src="https://github.com/user-attachments/assets/ce7af57c-dc5a-4745-b861-4b85854dbd2e" />

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### ✨ Főbb funkciók
- 🖱️ Gyors fogkijelölés és többfogos kiválasztás (CMD/CTRL + kattintás)
- 🦷 Fogtípusok: maradó, tejfog, implantátum, ínyalatti, hiányzó
- 🦷 Fogszubsztrátum (bármely pótlástól függetlenül): természetes, radix (gyökércsonk), törött, koronára előkészített
- 👑 Pótlások típus × anyag szerint: korona / inlay / onlay / héj (veneer) / híd e.max, arany, gradia, cirkon, fém, fémkerámia, teleszkópos vagy ideiglenes anyagból (az onlay csak okkluzális nézetben érhető el) — egyetlen kombinált, kevés kattintást igénylő „Fix: Korona – …” választóból kiválasztva; a korábbi `metal` koronák automatikusan `metal-ceramic` (fémkerámia) típusra migrálódnak
- 🦿 Kivehető/csatlakozós protetika a dedikált `prosthesis` tengelyen (a kombinált választó „Kivehető:” bejegyzései): implantátum gyógyuló csavarja, lokátor, lokátor protézissel (overdenture), bár, bár protézissel; fogtámasztékú kivehető részleges vagy teljes fogsor
- 🌉 Több fogra kiterjedő híd-overlay: az egymást követő hídtagok (pontikok + pillérek) egyetlen folytonos csatlakozóként jelennek meg a fogak közötti réseken át, a PNG/JPG/SVG exportban is szerepel
- 🔍 Szuvasodás rögzítése 6 felületen: meziális, disztális, bukkális, linguális, okkluzális, korona alatti
- 🪥 Tömőanyagok felületenként: amalgám, kompozit, GIC, ideiglenes
- 🏥 Endodonciai állapotok: gyógyszeres tömés, gyökértömés, nem teljes gyökértömés, üvegszálas csap, fémcsap, rezekció, parapulpális csap
- 🩺 AAE pulpa diagnózis (`pulpDx`: normal / reverzibilis / irreverzibilis pulpitis / necrosis), opcionális 3 szintű pulpa részletezettségi beállítással (`pulpDetailLevel`: simple / AAE / gyakorlati latin), amely 9 gyakorlati latin pulpa altípust jelenít meg (pulpa sana … gangraena pulpae) a `pulpLatin` mezőn keresztül
- 🦴 Apikális diagnózis (`apicalDx`: tünetekkel járó/tünetmentes apikális periodontitis, akut/krónikus apikális tályog, condensing osteitis) közvetlenül meghatározza a periapikális jelölést, opcionális granuloma/ciszta/tályog altípussal
- ⚕️ Módosítók: periapikális gyulladás (belső/külső), parodontális betegség, mobilitási fokok (M1/M2/M3)
- 🏷️ Speciális jelzők: korona szükséges, koronacsere szükséges, zárt foghiány, fogeltávolítási terv, bruxizmus okozta kopás/nyaki kopás, barázdazárás, kontaktpont veszteség
- 👁️ Okkluzális nézet, bölcsességfog, csont és pulpa láthatóság kapcsolók
- 🔢 12 kiválasztási szűrő (összes, jelenlévő, maradó, tej, implantátum, hiányzó, felső/alsó, front/molárisok)
- 📊 Előre definiált státusz minták (alaphelyzet, tejfogazat, vegyes fogazat, fogatlan)
- 📦 34 előre definiált restaurációs sablon (hidak, kivehető protézisek, bár protézisek implantátumokkal)
- 💾 Állapot export/import JSON formátumban (2.4 verzió; az importálás továbbra is elfogadja az 1.4, 2.0, 2.1, 2.2 és 2.3 verziót és automatikusan migrálja, plugin egyedi állapotokkal és fogankénti megjegyzésekkel)
- 🔗 HL7 FHIR R4 export (collection Bundle fogankénti Observation-ökkel, ISO 3950 fogkódolás a maradó fogazatra, lokális kódrendszer — SNOMED CT megfeleltetés tervezett)
- ✚ Kereszt/plusz felület-választó (B/M/O/D/L) szuvasodáshoz és tömésekhez
- 🧱 Felületenkénti tömőanyagok (vegyes tömések, pl. buccal amalgám + distal composite)
- 🖼️ PNG/JPG/SVG képexport az odontogramról (letölthető; a PNG/JPG vektoros SVG-ből raszterizált)
- 🦷 A caries/subcaries felületenkénti állapotgép: egy tömés nélküli szuvas felület elsődleges caries-ként jelenik meg (ICDAS-szintezett átlátszósággal); amint a felületen tömés is van, helyette szekunder (visszatérő) caries-ként jelenik meg (`subcaries-{surface}` réteg, CARS-pontszámmal) — a kettő soha nem lehet egyszerre aktív ugyanazon a felületen
- 🎯 Egységesített, felületenkénti súlyossági érték (`cariesSeverity`, 0–6, amely felváltja a korábbi külön ICDAS-mélység és CARS mezőket): elsődleges felületen ICDAS mélységként, szekunder felületen elnevezett CARS pontszámként (Ép … Kiterjedt üreg) olvasandó, egy kontextusfüggő felugró ablakon keresztül, amely mindig csak a felület aktuális állapotához tartozó skálát mutatja
- 🌱 Gyökér szuvasodás (`rootCaries`: none / active / arrested / active-cavitated), amely bekapcsolja a dedikált gyökér-szuvasodás grafikai réteget, a súlyosságtól függő átlátszósággal (active 0,5 / arrested 0,7 / active-cavitated teljes átlátszóság)
- 📡 Radiológiai szuvasodás mélység (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 felületenként), független a vizuális ICDAS/CARS súlyossági skálától, jelvényként (badge) jelenik meg, és saját FHIR Observation-jén keresztül is vissza-visszatölthető (round-trip)
- 🎚️ Három szuvasodás-részletezettségi beállítás (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`), valamint egy `cariesDepthEnabled` kapcsoló, amelyek mindegyike egyszerűbb választó nézetre egyszerűsíti a saját skáláját a tárolt érték elvesztése nélkül
- 🩹 Subcaries-összegző sor a tömés panelen: a tömés vezérlők alatt felsorolja a kijelölt fogak közül azokat, amelyeken szekunder caries van, a felületeikkel együtt (pl. "36 (O) tömése mellett subcaries van beállítva.")
- ✏️ A frontfogak (metszőfogak/szemfogak) rágófelülete a teljes felületen "metszőéli"-ként jelenik meg (választó, felugró ablak, összegzések); a tárolt felület-kulcs továbbra is `occlusal` marad
- 🪨 Fogkő, valamint belső vagy külső cervikális típusú gyökérreszorpció (`resorptionType`)
- 📏 Felületenkénti szuvasodás mélysége (felületes / dentin / mély), vagy opcionális ICDAS II pontozás (0–6) az `enableIcdas` proppal
- 🩹 Korona szegélyi rés (leakage) kapcsoló, csak korona vagy híd pótlás esetén jelenik meg
- 🧰 Egységes ikon-fejléc lapozott (tabos) Beállítások ablakkal (Általános / Caries / Szekunder caries / Pulpa / Jegyzetek — számozás, jegyzetek, ICDAS, szuvasodás-mélység kapcsoló, gyökér-/radiológiai szuvasodás részletezettség, pulpa részletezettségi szint, fogadatok)
- 📋 Fogadatok panel: élő szöveges összegzés a teljes státuszról (fogszámok, meglévő/hiányzó listák, szuvasodás beleértve a szekundert, tömések, gyökérkezelések, fogpótlások, implantátumok, fogágy állapota) — alaphelyzetben látszik, a Beállításokban kapcsolható
- 🗂️ Egységes Export menü (Státusz JSON / FHIR / PNG / JPG)
- 📥 Import menü FHIR importtal (visszatölti az exportált Bundle-öket)
- ⏳ Folyamatjelző overlay a képexport alatt
- 🎓 12 lépéses interaktív bemutató túra
- 🔢 Három számozási rendszer (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) választható nyelvvel (190+ fordítási kulcs nyelvenként)
- 🌗 Sötét mód támogatás váltógombbal (önálló vagy szülő alkalmazás által vezérelt)
- 🎨 Egyedi téma konfiguráció (`themeConfig` prop) CSS custom property-kkel (`--odon-*`)
- 📱 Mobil érintéses UX: koppintásos nagyítós felugró, hosszú nyomás helyi menü, csípéses zoom, WCAG 44px érintési célpontok, fogív navigáció
- 🔌 Egyedi SVG plugin rendszer: vizuális fedvények, foganként egyedi állapot, JSON export/import támogatás
- ⚠️ Állapot validáció figyelmeztetésekkel inkompatibilis fogállapot-kombinációkra
- 🏷️ Automatikus állapot tooltip a fogcsempéken (összes aktív állapot megjelenítése)
- ♿ Billentyűzet akadálymentesítés (WCAG): ARIA listbox/option szerepkörök, Enter/Space kijelölés, nyílbillentyűs navigáció, focus-visible körvonalak
- 🔒 Csak olvasható mód: összes interakció letiltása nyomtatási/jelentés nézetekhez
- ✨ Kijelölési animációk: pulzáló szaggatott keret és ragyogó árnyék a kijelölt fogakon (prefers-reduced-motion támogatással)
- 📝 Fogankénti megjegyzések: dupla kattintás megjegyzés hozzáadásához/szerkesztéséhez, megjegyzés ikon a fogszám mellett, hover tooltip a megjegyzés szövegével, JSON export/import
- 🧪 563 automatizált teszt (Vitest) 55 tesztfájlban: számozás, fordítások, presetek, i18n, App komponens, téma, érintés, pluginek, akadálymentesítés és klinikai tengelyek/diagnózisok paritása lefedésére
- 📖 TypeDoc API dokumentáció JSDoc kommentekkel minden publikus exporton (`npm run docs`)

### 📦 Modulok
- 🦷 Odontogram rács és fogcsempe UI
- 🎛️ Vezérlők és státusz panel
- 🎨 SVG rétegelő motor és fogsablonok
- 🔢 Fogszámozás és címke generálás (FDI/Universal/Palmer)
- 🌐 Lokalizáció (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- 💾 Státusz export/import
- 📋 Státusz extrák: előre definiált restaurációs sablonok
- 🎨 Téma konfiguráció: testreszabható színpaletta `--odon-*` CSS property-kkel
- 📱 Mobil érintéses interakciók (koppintásos nagyító, hosszú nyomás, csípéses zoom, fogív váltó)
- 🔌 Egyedi SVG plugin rendszer
- ⚠️ Állapot validáció és tooltip rendszer
- ♿ Billentyűzet akadálymentesítés és ARIA támogatás
- 🔒 Csak olvasható mód
- ✨ Kijelölési animációk
- 📝 Fogankénti megjegyzés rendszer
- 🧪 Automatizált tesztcsomag (Vitest + Testing Library)

### 🛠️ UI vezérlők

**🔝 Fejléc sáv:**
- Nyelvválasztó (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR legördülő)
- Sötét mód váltógomb (nap/hold ikon, világos és sötét téma között vált)
- Számozási rendszer választó (FDI/Universal/Palmer legördülő)
- Státusz exportálás / Státusz importálás gombok

**📊 Diagram fejléc:**
- Okkluzális nézet kapcsoló
- Bölcsességfog láthatóság kapcsoló
- Csont láthatóság kapcsoló
- Pulpa láthatóság kapcsoló
- Kiválasztás törlése gomb

**🔍 Kiválasztási szűrők:**
- Összes kiválasztása / Összes jelenlévő / Maradó / Tej / Implantátumok / Összes hiányzó
- Felső / Felső front 6 / Felső molárisok
- Alsó / Alsó front 6 / Alsó molárisok

**📋 Státusz minták:**
- Összes visszaállítása (szájüreg alaphelyzet)
- Tejfogazat
- Vegyes fogazat
- Fogatlan kapcsoló

**📦 Státusz extrák legördülő:**
- Felső/Alsó cirkon hidak (12-22, 13-23, 16-26, teljes ív)
- Felső/Alsó fém hidak (12-22, 13-23, 16-26, teljes ív)
- Felső/Alsó részleges kivehető protézisek
- Felső/Alsó teljes kivehető protézisek
- Felső/Alsó bár protézisek implantátumokkal

### 🦷 Fogtípusok és állapotok

**Fog kiválasztás (alaptípus):**
| Érték | Leírás |
|---|---|
| `none` | Hiányzó fog |
| `tooth-base` | Maradó fog |
| `milktooth` | Tejfog |
| `implant` | Fogimplantátum |
| `tooth-under-gum` | Íny alatti (előbújatlan) fog |

**Tört fog változatok:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Fogszubsztrátum (maradó fogak):**
`natural` (alapértelmezett), `radix` (gyökércsonk), `broken`, `crownprep` (koronaelőkészített)

**Pótlás típusa (maradó fogak):**
`none`, `crown`, `inlay`, `onlay` (csak okkluzális nézet), `veneer`, `bridge`

**Pótlás anyaga (maradó fogak):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (a korábbi `metal` koronák ide migrálódnak), `telescope`, `temporary`

**Korona anyagok (implantátumok):**
`natural` (nincs), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Hídtagok:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Endodonciai lehetőségek (maradó fogak):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodonciai lehetőségek (tejfogak):**
`none`, `endo-medical-filling`

**Tömőanyagok (maradó fogak):**
`amalgam`, `composite`, `gic`, `temporary`

**Tömőanyagok (tejfogak):**
`composite`, `gic`, `temporary`

**Tömés/szuvasodás felületek:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (csak szuvasodáshoz)

**Módosítók:**
`inflammation` (periapikális), `parodontal` (parodontális), `mobility` (M1/M2/M3)

**Periapikális lézió típusa** (`periapicalType`; a periapikális jelölést minősíti, amelyet az `apicalDx` határoz meg):
`none`, `granuloma`, `cyst`, `abscess`

**Pulpa diagnózis** (AAE terminológia; `pulpDx`):
`normal`, `reversible-pulpitis`, `irreversible-pulpitis`, `necrosis`

**Pulpa diagnózis, gyakorlati latin** (`pulpLatin`; a pulpa választó csak akkor jeleníti meg, ha a `pulpDetailLevel` értéke `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Pulpa részletezettségi szint** (`pulpDetailLevel`, globális beállítás): `simple`, `aae` (alapértelmezett), `latin` — meghatározza, hogy a választó milyen pulpa terminológiát kínál

**Apikális diagnózis** (`apicalDx`; a periapikális jelölést határozza meg):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Gyökérreszorpció típusa** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Szuvasodás mélysége** (felületenként): `superficial` / `dentin` / `deep`, vagy opcionális ICDAS II kódok `0–6`, ha az `enableIcdas` aktív

**Caries súlyosság** (`cariesSeverity`; egységesített, felületenkénti mező, `0`–`6`): tömés nélküli felületen ICDAS mélység-skálaként olvasandó (`superficial` / `dentin` / `deep`, vagy a nyers ICDAS II kódok `0–6`, ha az `enableIcdas` be van kapcsolva), és az elsődleges `caries-{surface}` réteget jeleníti meg; tömött felületen elnevezett CARS pontszámként olvasandó (`0` ép … `6` kiterjedt üreg), és helyette a `subcaries-{surface}` (szekunder caries) réteget jeleníti meg — egy felület soha nem elsődleges és szekunder egyszerre

**Gyökér szuvasodás** (`rootCaries`; bekapcsolja a `caries-root` grafikai réteget egy meglévő fogon, a súlyosságtól függő átlátszósággal — `active` 0,5 / `arrested` 0,7 / `active-cavitated` teljes átlátszóság):
`none`, `active`, `arrested`, `active-cavitated`

**Radiológiai szuvasodás mélység** (`radiographicDepth`; felületenként, független a vizuális ICDAS/CARS `cariesSeverity` skálától):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Szuvasodás-részletezettségi beállítások** (globális): `secondaryCariesMode` (`simple`/`standard`/`full`, alapértelmezett `standard`), `rootCariesMode` (`simple`/`severity`, alapértelmezett `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, alapértelmezett `off`), `cariesDepthEnabled` (logikai, alapértelmezett `true`) — mindegyik egyszerűbb választó nézetre egyszerűsíti a saját skáláját a tárolt érték módosítása nélkül

**Speciális jelzők:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `endoResection`, `calculus`, `parapulpalPin`

### 🖼️ SVG sablon rendszer

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

### 🔢 Számozási rendszerek

**FDI (ISO 3950):** Felnőtt fogak 11-18, 21-28, 31-38, 41-48. Tejfogak 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Felnőtt fogak 1-32 számozással. Tejfogak A-T betűkkel.

**Palmer (Zsigmondy-Palmer):** Kvadráns + pozíció formátum (pl. UR-1, LL-5). Tejfogak kvadránsonként A-E betűkkel.

### 🚀 Használat
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

### 🔗 Integráció
A komponens beágyazható bármely React alkalmazásba.
Példa:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="hu"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Sötét mód integráció:**
- **Önálló mód:** A `darkMode` prop elhagyása — a komponens saját maga kezeli a téma állapotát a fejléc váltógombján keresztül, és hozzáadja/eltávolítja a `.dark` osztályt a `<html>` elemen.
- **Vezérelt mód:** A `darkMode` és `onDarkModeChange` átadása — a szülő alkalmazás vezérli a témát. A váltógomb továbbra is megjelenik, de a `onDarkModeChange` callbacket hívja a belső állapot kezelése helyett. A szülő alkalmazás felelős a `.dark` osztály hozzáadásáért/eltávolításáért a `<html>` elemen.

**Egyedi téma:**
```tsx
<App
  themeConfig={{
    colors: {
      accent: '#e74c3c',
      background: '#fafafa',
      text: '#222222',
    },
  }}
/>
```

**Plugin integráció:**
```tsx
import App, { type OdontogramPlugin, setPluginState } from "./App";

const myPlugin: OdontogramPlugin = {
  id: "implant-brand",
  label: { en: "Implant Brand", hu: "Implantátum márka" },
  layer: "overlay",
  renderSvg: (toothNo, _quadrant, state) => {
    if (!state) return null;
    return `<text x="16" y="60" font-size="6" fill="#3b7bff">${state}</text>`;
  },
};

<App plugins={[myPlugin]} />

// Plugin állapot beállítása egy foghoz:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 Tesztelés
```bash
npm run test           # Összes 563 teszt futtatása
npm run test:watch     # Figyelési mód
npm run test:coverage  # Lefedettségi jelentés
```

### 📖 API Dokumentáció
```bash
npm run docs           # TypeDoc dokumentáció generálása a docs/ mappába
```

### 📡 Nyilvános API

**Komponens propok:**

| Prop | Típus | Alapértelmezett | Leírás |
|---|---|---|---|
| `language` | `string` | `'hu'` | UI nyelv (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Callback nyelvváltáskor |
| `numberingSystem` | `string` | `'FDI'` | Számozási rendszer (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback számozásváltáskor |
| `darkMode` | `boolean` | `undefined` | Sötét mód állapot. Elhagyva: önálló mód. |
| `onDarkModeChange` | `(dark) => void` | — | Callback sötét mód váltáskor. Szükséges vezérelt módhoz. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Egyedi szín felülírások CSS custom property-kkel (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Egyedi SVG pluginek vizuális fedvényekhez és foganként egyedi állapothoz. |
| `readOnly` | `boolean` | `undefined` | Összes interakció letiltása (kattintás, érintés, billentyűzet). Nyomtatási/jelentés nézetekhez. |
| `enableNotes` | `boolean` | `undefined` | Fogankénti megjegyzések engedélyezése. Dupla kattintás a fogra megjegyzés hozzáadásához/szerkesztéséhez. |

**Exportált függvények külső vezérléshez:**

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
| `registerPlugins(plugins)` | Egyedi SVG pluginek regisztrálása |
| `setPluginState(toothNo, pluginId, value)` | Plugin egyedi állapot beállítása egy foghoz |
| `getPluginState(toothNo, pluginId)` | Plugin egyedi állapot lekérdezése egy foghoz |
| `getToothStateSummary(toothNo)` | Lokalizált összesítés az összes aktív állapotról |
| `getOdontogramSummary()` | Strukturált, lokalizált szöveges összegzés a teljes státuszról (fogszámok, szekciók) |
| `onStateChange(callback)` | Feliratkozás állapotváltozásra; leiratkozó függvényt ad vissza |
| `setReadOnly(value)` | Csak olvasható mód be/kikapcsolása |
| `getReadOnly()` | Aktuális csak olvasható állapot lekérdezése |
| `setNotesEnabled(value)` | Fogankénti megjegyzések be/kikapcsolása |
| `getNotesEnabled()` | Aktuális megjegyzés-engedélyezés állapot lekérdezése |
| `setPulpDetailLevel(level)` | A pulpa választó terminológiájának beállítása — `"simple"`, `"aae"` vagy `"latin"` |
| `getPulpDetailLevel()` | Aktuális pulpa részletezettségi szint lekérdezése |
| `exportFhir(options?)` | Az odontogram exportálása HL7 FHIR R4 collection Bundle-ként (JSON letöltés). Opcionális `{ subject }` referencia; egyébként placeholder Patient kerül be |
| `exportImage(format)` | Az odontogram letöltése képként — `"png"` vagy `"jpg"` |
| `exportSvg()` | Az odontogram letöltése méretezhető SVG-ként (vektoros) |
| `importFhirBundle(input)` | A modul által készített FHIR R4 Bundle importálása (objektum vagy JSON szöveg) |
| `setImportFormat(format)` | A következő fájlimport értelmezőjének beállítása — `"status"` vagy `"fhir"` |
| `startIntroTour()` | A 12 lépéses interaktív bemutató túra indítása |

### 💾 Állapot Export/Import formátum
Az export egy JSON fájlt hoz létre (`2.4` verziójú; az importálás továbbra is elfogadja a korábbi `1.4`, `2.0`, `2.1`, `2.2` és `2.3` verziókat és automatikusan migrálja őket), amely tartalmazza:

**Globális mezők:**
- `wisdomVisible` - bölcsességfogak láthatók
- `showBase` - csont réteg látható
- `occlusalVisible` - okkluzális nézet aktív
- `showHealthyPulp` - egészséges pulpa látható
- `edentulous` - fogatlan mód aktív

**Fogankénti mezők (32 fog):**
- `toothSelection` - alap fog típusa
- `crownMaterial` - korona/felépítmény anyaga
- `bridgeUnit` - hídtag összekötő típusa
- `endo` - endodonciai állapot
- `mods` - módosítók tömbje (inflammation, parodontal)
- `caries` - aktív szuvasodási felületek
- `rootCaries` - gyökér szuvasodás súlyossága (none/active/arrested/active-cavitated)
- `cariesSeverity` - egységesített, felületenkénti súlyossági érték (0-6): ICDAS mélység egy elsődleges (tömés nélküli) felületen, CARS pontszám egy szekunder (tömött) felületen
- `radiographicDepth` - felületenkénti radiológiai szuvasodás mélység (none/E1/E2/D1/D2/D3), független a vizuális ICDAS/CARS skálától
- `fillingMaterial` - tömőanyag
- `fillingSurfaces` - tömött felületek
- `pulpDx` - AAE pulpa diagnózis (normal/reversible-pulpitis/irreversible-pulpitis/necrosis)
- `pulpLatin` - gyakorlati latin pulpa altípus (a pulpa választó csak akkor jeleníti meg, ha a `pulpDetailLevel` értéke `latin`)
- `apicalDx` - apikális diagnózis, amely meghatározza a periapikális jelölést
- `resorptionType` - gyökérreszorpció típusa (none/internal/external-cervical)
- `endoResection` - rezekció jelzője
- `fissureSealing` - barázdazárás jelzője
- `contactMesial` - meziális kontaktpont veszteség
- `contactDistal` - disztális kontaktpont veszteség
- `bruxismWear` - okkluzális bruxizmus kopás
- `bruxismNeckWear` - cervikális bruxizmus kopás
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - törési helyek
- `extractionWound` - fogeltávolítás utáni seb
- `extractionPlan` - tervezett fogeltávolítás
- `parapulpalPin` - parapulpális csap jelzője
- `bridgePillar` - hídpillér fog
- `mobility` - mobilitási fok (none/m1/m2/m3)
- `crownNeeded` - korona szükséges jelzője
- `crownReplace` - koronacsere szükséges jelzője
- `missingClosed` - záródott foghiány a fogeltávolítás után
- `customStates` - plugin egyedi állapotok (objektum, plugin azonosító szerint kulcsozva)
- `note` - fogankénti szöveges megjegyzés (szöveg, opcionális — csak ha nem üres)

### 📁 Mappastruktúra
- `src/App.tsx` - UI váz, fejléc vezérlők, nyelv/számozás/sötét mód/téma/plugin választó
- `src/odontogram.ts` - SVG rétegelő motor, fog állapotkezelés, érintéses interakciók, plugin fedvények, UI összekötés
- `src/plugin.ts` - `OdontogramPlugin` típus, `PluginLayer`, `getQuadrant()`, `LAYER_Z` z-index prioritások
- `src/theme.ts` - `OdontogramThemeConfig` típus és `applyThemeConfig()` segédfüggvény
- `src/status_extras.ts` - 34 előre definiált restaurációs sablon (hidak, protézisek, bár konstrukciók)
- `src/i18n/` - fordítások (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) és i18n hook
- `src/utils/numbering.ts` - FDI, Universal, Palmer számozási konverzió
- `src/__tests__/` - Vitest tesztcsomag (563 teszt, 55 tesztfájlban: számozás, fordítások, presetek, i18n, App komponens, téma, érintés, pluginek, akadálymentesítés és klinikai tengelyek/diagnózisok paritása)
- `src/assets/teeth-svgs/` - SVG fogsablonok (6 fájl: metszők, szemfogak, kis őrlők, nagy őrlők + okkluzális nézetek)
- `src/assets/icon-svgs/` - eszköztár ikon SVG-k (5 fájl)

### ⚙️ Technológia
- React 18 + Vite + TypeScript
- Tailwind CSS a UI stílusokhoz
- SVG rétegelés DOM manipulációval (nem React state, a teljesítmény érdekében)
- Egyszerű egyedi i18n rendszer
- Vitest + Testing Library automatizált tesztekhez
- TypeDoc API dokumentációhoz
- Vite útvonal alias: `@` a `./src` mappára képezve

### 📝 Megjegyzések
- A SVG sablonok `src/assets/teeth-svgs` és `src/assets/icon-svgs` mappa alól kerülnek betöltésre, ezért statikus hostingnál a public mappa elérhetősége kötelező.
- Az odontogram motor saját belső állapotot használ (nem React state) a teljesítmény és egyszerűség érdekében.
- A tejfogaknál szűkebb anyagválaszték áll rendelkezésre (nincs amalgám tömés, nincs csapos endodonciai kezelés).
- Az implantátum fogaknál a korona/felépítmény lehetőségek eltérnek a természetes fogakétól.

---

### 📖 Hivatkozás

Ha ezt a modult használod a munkádban, kérlek hivatkozz rá.

**Ez a verzió (v1.10.0):**
> Dul, Z. (2026). *React Odontogram Modul* (v1.10.0). Zenodo. https://doi.org/10.5281/zenodo.21156788

**Összes verzió (koncepció DOI):** https://doi.org/10.5281/zenodo.21156787

A géppel olvasható hivatkozási metaadatok a [`CITATION.cff`](../CITATION.cff) fájlban találhatók.

## 📄 License

Created with ❤️ by Zoltan Dul (2026)
Released under the MIT License.
