# 🦷 React Odontogram Modul

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-1.11.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](../README.md#-english) | 🇪🇸 [Español](../README.md#-español) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md)

---

## 🇵🇱 Polski

### 📋 Przegląd
Ten projekt to interaktywny edytor odontogramu oparty na przeglądarce, umożliwiający szybkie dokumentowanie statusu stomatologicznego w przejrzystym interfejsie. Renderuje warstwowe szablony SVG zębów w celu reprezentowania uzupełnień, próchnicy, stanu endodontycznego, ruchomości i innych szczegółów klinicznych, oferując wielokrotne zaznaczanie, filtry wyboru i predefiniowane presety statusu.

---
<img width="1728" height="922" alt="react-odontogram-modul-english-preview" src="https://github.com/user-attachments/assets/0d6e076e-a840-408c-93cc-974e0767aaaf" />

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### ✨ Kluczowe funkcje
- 🖱️ Szybkie zaznaczanie i wielokrotne zaznaczanie (CMD/CTRL + klik)
- 🦷 Typy zębów: stały, mleczny, implant, poddziąsłowy, brakujący
- 👑 Materiały korony: naturalna (korona pełna), złamana, przygotowana pod koronę, radix, e.max, cyrkon, metalowo-ceramiczna, tymczasowa, teleskopowa
- 🔩 Filary implantów: śruba gojąca, lokator, lokator z protezą, belka, belka z protezą
- 🌉 Elementy mostowe: cyrkon, metal, tymczasowy, ruchomy, belka, belka z protezą
- 🔍 Dokumentowanie próchnicy na 6 powierzchniach: mezjalnej, dystalnej, policzkowej, językowej, okluzyjnej, podkoronowej
- 🪥 Materiały wypełnień na powierzchnię: amalgamat, kompozyt, GIC, tymczasowe
- 🏥 Stany endodontyczne: wypełnienie lecznicze, wypełnienie kanałowe, niekompletne wypełnienie kanałowe, wkład z włókna szklanego, wkład metalowy, resekcja, wkład parapulpalny
- ⚕️ Modyfikacje: zapalenie okołowierzchołkowe (wewnętrzne/zewnętrzne), choroba przyzębia, stopnie ruchomości (M1/M2/M3)
- 🏷️ Wskaźniki specjalne: korona wymagana, wymiana korony konieczna, zamknięta luka, plan ekstrakcji, starcie bruksistyczne/szyjkowe, lakowanie bruzd, utrata punktu stycznego
- 👁️ Widok okluzyjny, zęby mądrości, widoczność kości i miazgi
- 🔢 12 filtrów wyboru (wszystkie, obecne, stałe, mleczne, implanty, brakujące, górne/dolne, przednie/trzonowe)
- 📊 Predefiniowane presety statusu (reset, uzębienie mleczne, uzębienie mieszane, bezzębny)
- 📦 34 predefiniowane szablony uzupełnień (mosty, protezy ruchome, protezy na belce z implantami)
- 💾 Eksport/import statusu w formacie JSON (wersja 1.3, z niestandardowymi stanami wtyczek i notatkami do zębów)
- 🔗 Eksport HL7 FHIR R4 (kolekcja Bundle z obserwacjami na ząb, kodowanie zębów wg ISO 3950, hybrydowe kodowanie lokalne + SNOMED)
- ✚ Interfejs wyboru powierzchni w układzie krzyżowym (B/M/O/D/L) dla próchnicy i wypełnień
- 🧱 Materiały wypełnień na powierzchnię (mieszane wypełnienia, np. policzkowe amalgamat + dystalne kompozyt)
- 🖼️ Eksport obrazu PNG/JPG/SVG wykresu (do pobrania; PNG/JPG rastrowane z wektorowego SVG)
- 🦷 Próchnica wtórna (nawracająca) — automatycznie wyznaczana, gdy próchnica nakłada się na wypełnienie
- 🪨 Kamień nazębny, resorpcja korzenia i typowane zmiany okołowierzchołkowe (ziarniniak / torbiel / ropień)
- 📏 Głębokość próchnicy na powierzchnię (powierzchowna / zębina / głęboka), lub opcjonalne punktowanie ICDAS II (0–6) za pomocą `enableIcdas`
- 🧰 Ujednolicony wiersz ikon paska górnego z menu Ustawień (numeracja, notatki, ICDAS, informacje o zębach)
- 📋 Panel informacji o zębach: na żywo tekstowe podsumowanie całego wykresu (liczba zębów, listy obecnych/brakujących, próchnica w tym wtórna, wypełnienia, kanały korzeniowe, protetyka, implanty, stan przyzębia) — wyświetlany domyślnie, przełączany w Ustawieniach
- 🗂️ Skonsolidowane menu Eksportu (Status JSON / FHIR / PNG / JPG)
- 📥 Menu Importu z importem FHIR (zwrotne wczytywanie wyeksportowanych Bundli)
- ⏳ Nakładka postępu podczas eksportu obrazu
- 🎓 12-krokowy interaktywny samouczek wprowadzający
- 🔢 Trzy systemy numeracji (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) z przełącznikiem języka (190+ kluczy tłumaczeń na język)
- 🌗 Obsługa trybu ciemnego z przyciskiem przełączania (samodzielny lub kontrolowany przez aplikację nadrzędną)
- 🎨 Konfiguracja niestandardowego motywu (właściwość `themeConfig`) z właściwościami niestandardowymi CSS (`--odon-*`)
- 📱 Mobilny interfejs dotykowy: wyskakujące okno powiększenia przy dotknięciu, menu kontekstowe przy długim przytrzymaniu, powiększanie szczypnięciem, cele dotykowe WCAG 44px, nawigacja po łukach
- 🔌 Niestandardowy system wtyczek SVG: wstrzykiwanie nakładek wizualnych, niestandardowy stan na ząb, obsługa eksportu/importu JSON
- ⚠️ Ostrzeżenia walidacyjne stanu dla niezgodnych kombinacji stanów zębów
- 🏷️ Automatyczna etykietka stanu na kafelkach zębów (pokazuje wszystkie aktywne stany)
- ♿ Dostępność klawiaturowa (WCAG): role ARIA listbox/option, wybór Enter/Spacja, nawigacja strzałkami, kontury focus-visible
- 🔒 Tryb tylko do odczytu: wyłączenie wszystkich interakcji do drukowania/raportowania/przeglądania
- ✨ Animacje zaznaczenia: pulsująca przerywana ramka i świecący cień na zaznaczonych zębach (z obsługą prefers-reduced-motion)
- 📝 Notatki do zębów: dwuklik, aby dodać/edytować notatki, ikona notatki obok numeru zęba, etykietka po najechaniu z tekstem notatki, eksport/import JSON
- 🧪 202 testy automatyczne (Vitest) w 16 plikach testowych obejmujące numerację, tłumaczenia, presety, i18n, komponent App, motyw, dotyk, wtyczki i dostępność
- 📖 Dokumentacja API TypeDoc z komentarzami JSDoc dla wszystkich publicznych eksportów (`npm run docs`)

### 📦 Moduły
- 🦷 Siatka odontogramu i interfejs kafelków zębów
- 🎛️ Panel sterowania i statusu
- 🎨 Silnik warstwowania SVG i szablony
- 🔢 Numeracja zębów i mapowanie etykiet (FDI/Universal/Palmer)
- 🌐 Lokalizacja (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- 💾 Eksport/import statusu
- 📋 Dodatki statusu: predefiniowane szablony uzupełnień
- 🎨 Konfiguracja motywu: konfigurowalna paleta kolorów za pomocą właściwości CSS `--odon-*`
- 📱 Mobilne interakcje dotykowe (powiększenie przy dotknięciu, długie przytrzymanie, powiększanie szczypnięciem, przełącznik łuku)
- 🔌 Niestandardowy system wtyczek SVG
- ⚠️ System walidacji stanu i etykietek
- ♿ Dostępność klawiaturowa i obsługa ARIA
- 🔒 Tryb tylko do odczytu
- ✨ Animacje zaznaczenia
- 📝 System notatek do zębów
- 🧪 Zautomatyzowany zestaw testów (Vitest + Testing Library)

### 🛠️ Kontrolki interfejsu

**🔝 Pasek górny:**
- Przełącznik języka (lista rozwijana HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- Przycisk przełączania trybu ciemnego (ikona słońca/księżyca, przełącza między jasnym i ciemnym motywem)
- Przełącznik systemu numeracji (lista rozwijana FDI/Universal/Palmer)
- Przyciski Eksportuj status / Importuj status

**📊 Nagłówek wykresu:**
- Przełącznik widoku okluzyjnego
- Przełącznik widoczności zębów mądrości
- Przełącznik widoczności kości
- Przełącznik widoczności miazgi
- Przycisk wyczyść zaznaczenie

**🔍 Filtry wyboru:**
- Zaznacz wszystkie / Wszystkie obecne / Stałe / Mleczne / Implanty / Wszystkie brakujące
- Zaznacz górne / Górne 6 przednich / Trzonowce górne
- Zaznacz dolne / Dolne 6 przednich / Trzonowce dolne

**📋 Presety statusu:**
- Resetuj wszystko (resetuj jamę ustną)
- Uzębienie mleczne
- Uzębienie mieszane
- Przełącznik bezzębności

**📦 Lista rozwijana Dodatki statusu:**
- Górne/dolne mosty cyrkonowe (12-22, 13-23, 16-26, pełny łuk)
- Górne/dolne mosty metalowe (12-22, 13-23, 16-26, pełny łuk)
- Górne/dolne częściowe protezy ruchome
- Górne/dolne całkowite protezy ruchome
- Górne/dolne protezy na belce z implantami

### 🦷 Typy zębów i stany

**Wybór zęba (typ podstawowy):**
| Wartość | Opis |
|---|---|
| `none` | Ząb brakujący |
| `tooth-base` | Ząb stały |
| `milktooth` | Ząb mleczny (mleczak) |
| `implant` | Implant stomatologiczny |
| `tooth-under-gum` | Ząb poddziąsłowy (niewyrznienty) |

**Warianty zęba złamanego:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Materiały korony (zęby stałe):**
`radix`, `natural` (korona pełna, domyślna), `broken`, `crownprep` (przygotowany pod koronę), `emax`, `zircon`, `metal`, `temporary`, `telescope`

**Materiały korony (implanty):**
`natural` (brak), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Elementy mostowe:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Opcje endodontyczne (zęby stałe):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opcje endodontyczne (zęby mleczne):**
`none`, `endo-medical-filling`

**Materiały wypełnień (zęby stałe):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiały wypełnień (zęby mleczne):**
`composite`, `gic`, `temporary`

**Powierzchnie wypełnienia/próchnicy:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (tylko próchnica)

**Modyfikacje:**
`inflammation` (okołowierzchołkowe), `parodontal` (przyzębia), `mobility` (M1/M2/M3)

**Typ zmiany okołowierzchołkowej** (kwalifikuje `inflammation`):
`none`, `granuloma`, `cyst`, `abscess`

**Głębokość próchnicy** (na powierzchnię): `superficial` / `dentin` / `deep`, lub opcjonalne kody ICDAS II `0–6` gdy ustawiono `enableIcdas`

**Wskaźniki specjalne:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `rootResorption`, `calculus`, `parapulpalPin`

### 🖼️ System szablonów SVG

**Szablony zębów** (w `src/assets/teeth-svgs/`):
| Szablon | Zęby używające go |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (siekacze) |
| `13.svg` | 13, 23, 33, 43 (kły) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (zęby przedtrzonowe) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (trzonowce) |

Szablony są obracane o 180 stopni dla żuchwy i odbijane poziomo dla lewej strony.

**Ikony SVG** (w `src/assets/icon-svgs/`):
`icon_8.svg` (mądrość), `icon_gum.svg` (kość), `icon_no_selection.svg` (wyczyść), `icon_occl.svg` (widok okluzyjny), `icon_pulp.svg` (miazga)

### 🔢 Systemy numeracji

**FDI (ISO 3950):** Zęby dorosłych 11-18, 21-28, 31-38, 41-48. Zęby mleczne 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Zęby dorosłych numerowane 1-32. Zęby mleczne oznaczone literami A-T.

**Palmer (Zsigmondy-Palmer):** Format kwadrant + pozycja (np. UR-1, LL-5). Zęby mleczne używają liter A-E na kwadrant.

### 🚀 Użycie
Programowanie:
```bash
npm install
npm run dev
```
Kompilacja:
```bash
npm run build
```
Podgląd:
```bash
npm run preview
```

### 🔗 Integracja
Komponent może być osadzony w dowolnej aplikacji React.
Przykład:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="pl"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Integracja trybu ciemnego:**
- **Tryb samodzielny:** Pomiń właściwość `darkMode` — komponent zarządza własnym stanem motywu za pomocą przycisku przełączania na pasku górnym i dodaje/usuwa klasę `.dark` na `<html>`.
- **Tryb kontrolowany:** Przekaż `darkMode` i `onDarkModeChange` — aplikacja nadrzędna kontroluje motyw. Przycisk przełączania nadal jest widoczny, ale wywołuje `onDarkModeChange` zamiast zarządzać stanem wewnętrznym. Aplikacja nadrzędna jest odpowiedzialna za dodawanie/usuwanie klasy `.dark` na `<html>`.

**Niestandardowy motyw:**
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

**Integracja wtyczki:**
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

// Set plugin state for a tooth:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 Testowanie
```bash
npm run test           # Uruchom wszystkie 202 testy
npm run test:watch     # Tryb obserwowania
npm run test:coverage  # Raport pokrycia
```

### 📖 Dokumentacja API
```bash
npm run docs           # Generuj dokumentację TypeDoc w docs/
```

### 📡 Publiczne API

**Właściwości komponentu:**

| Właściwość | Typ | Domyślna | Opis |
|---|---|---|---|
| `language` | `string` | `'hu'` | Język interfejsu (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Wywołanie zwrotne przy zmianie języka |
| `numberingSystem` | `string` | `'FDI'` | System numeracji (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Wywołanie zwrotne przy zmianie numeracji |
| `darkMode` | `boolean` | `undefined` | Stan trybu ciemnego. Pomiń dla trybu samodzielnego. |
| `onDarkModeChange` | `(dark) => void` | — | Wywołanie zwrotne przy przełączeniu trybu ciemnego. Wymagane dla trybu kontrolowanego. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Niestandardowe zastąpienia kolorów za pomocą właściwości niestandardowych CSS (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Niestandardowe wtyczki SVG do nakładek wizualnych i niestandardowego stanu na ząb. |
| `readOnly` | `boolean` | `undefined` | Wyłączenie wszystkich interakcji (klik, dotyk, klawiatura). Przydatne do drukowania/raportowania. |
| `enableNotes` | `boolean` | `undefined` | Włącz notatki do zębów. Dwuklik na ząb, aby dodać/edytować notatki. |

**Eksportowane funkcje do kontroli zewnętrznej:**

| Funkcja | Opis |
|---|---|
| `initOdontogram()` | Zainicjuj silnik i wyrenderuj wszystkie zęby |
| `destroyOdontogram()` | Wyczyść silnik i usuń nasłuchiwacze zdarzeń |
| `setNumberingSystem(system)` | Przełącz między FDI, Universal, Palmer |
| `clearSelection()` | Odznacz wszystkie zęby |
| `setOcclusalVisible(on)` | Włącz/wyłącz widok okluzyjny |
| `setWisdomVisible(on)` | Pokaż/ukryj zęby mądrości |
| `setShowBase(on)` | Pokaż/ukryj warstwę kości |
| `setHealthyPulpVisible(on)` | Pokaż/ukryj zdrową miazgę |
| `registerPlugins(plugins)` | Zarejestruj niestandardowe wtyczki SVG |
| `setPluginState(toothNo, pluginId, value)` | Ustaw niestandardowy stan wtyczki dla zęba |
| `getPluginState(toothNo, pluginId)` | Pobierz niestandardowy stan wtyczki dla zęba |
| `getToothStateSummary(toothNo)` | Pobierz zlokalizowane podsumowanie wszystkich aktywnych stanów |
| `getOdontogramSummary()` | Pobierz ustrukturyzowane, zlokalizowane tekstowe podsumowanie całego wykresu (liczby, sekcje) |
| `onStateChange(callback)` | Subskrybuj zmiany stanu; zwraca funkcję anulowania subskrypcji |
| `setReadOnly(value)` | Włącz/wyłącz tryb tylko do odczytu |
| `getReadOnly()` | Pobierz bieżący stan tylko do odczytu |
| `setNotesEnabled(value)` | Włącz/wyłącz notatki do zębów |
| `getNotesEnabled()` | Pobierz bieżący stan włączenia notatek |
| `exportFhir(options?)` | Eksportuj wykres jako kolekcję HL7 FHIR R4 Bundle (pobieranie JSON). Opcjonalne odwołanie `{ subject }`; w przeciwnym razie osadzany jest zastępczy pacjent |
| `exportImage(format)` | Pobierz wykres jako obraz — `"png"` lub `"jpg"` |
| `exportSvg()` | Pobierz wykres jako skalowalny SVG (wektorowy) |
| `importFhirBundle(input)` | Zaimportuj pakiet FHIR R4 Bundle (obiekt lub ciąg JSON) wygenerowany przez ten moduł |
| `setImportFormat(format)` | Ustaw parser dla następnego importu pliku — `"status"` lub `"fhir"` |
| `startIntroTour()` | Uruchom 12-krokowy interaktywny samouczek wprowadzający |

### 💾 Format eksportu/importu statusu
Eksport tworzy plik JSON (wersja `1.3`) zawierający:

**Pola globalne:**
- `wisdomVisible` - widoczność zębów mądrości
- `showBase` - widoczność warstwy kości
- `occlusalVisible` - aktywny widok okluzyjny
- `showHealthyPulp` - widoczność zdrowej miazgi
- `edentulous` - aktywny tryb bezzębności

**Pola na ząb (32 zęby):**
- `toothSelection` - podstawowy typ zęba
- `crownMaterial` - materiał korony/filara
- `bridgeUnit` - typ łącznika mostowego
- `endo` - stan endodontyczny
- `mods` - tablica modyfikacji (zapalenie, przyzębie)
- `caries` - aktywne powierzchnie z próchnicą
- `fillingMaterial` - materiał wypełnienia
- `fillingSurfaces` - powierzchnie wypełnione
- `pulpInflam` - flaga zapalenia miazgi
- `endoResection` - flaga apikoektomii
- `fissureSealing` - flaga lakowania bruzd
- `contactMesial` - utrata punktu stycznego mezjalnego
- `contactDistal` - utrata punktu stycznego dystalnego
- `bruxismWear` - starcie okluzyjne bruksistyczne
- `bruxismNeckWear` - szyjkowe starcie bruksistyczne
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - lokalizacje złamań
- `extractionWound` - rana po ekstrakcji
- `extractionPlan` - planowana ekstrakcja
- `parapulpalPin` - flaga wkładu parapulpalnego
- `bridgePillar` - ząb jako filar mostu
- `mobility` - stopień ruchomości (none/m1/m2/m3)
- `crownNeeded` - wskaźnik wymaganej korony
- `crownReplace` - wskaźnik konieczności wymiany korony
- `missingClosed` - luka zamknięta po ekstrakcji
- `customStates` - niestandardowe stany wtyczek (obiekt, indeksowany po identyfikatorze wtyczki)
- `note` - tekstowa notatka do zęba (ciąg znakowy, opcjonalny — obecny tylko gdy niepusty)

### 📁 Struktura folderów
- `src/App.tsx` - powłoka interfejsu, kontrolki paska górnego, przełącznik języka/numeracji/trybu ciemnego/motywu/wtyczki
- `src/odontogram.ts` - silnik warstwowania SVG, zarządzanie stanem zębów, interakcje dotykowe, nakładki wtyczek, okablowanie interfejsu
- `src/plugin.ts` - typ `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, priorytety z-index `LAYER_Z`
- `src/theme.ts` - typ `OdontogramThemeConfig` i narzędzie `applyThemeConfig()`
- `src/status_extras.ts` - 34 predefiniowane szablony uzupełnień (mosty, protezy, konstrukcje belkowe)
- `src/i18n/` - tłumaczenia (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) i hook i18n
- `src/utils/numbering.ts` - konwersja numeracji FDI, Universal, Palmer
- `src/__tests__/` - zestaw testów Vitest (202 testy w 16 plikach)
- `src/assets/teeth-svgs/` - szablony SVG zębów (6 plików: siekacze, kły, zęby przedtrzonowe, trzonowce + widoki okluzyjne)
- `src/assets/icon-svgs/` - ikony SVG paska narzędzi (5 plików)

### ⚙️ Stos technologiczny
- React 18 + Vite + TypeScript
- Tailwind CSS do stylowania interfejsu
- Warstwowanie SVG przez manipulację DOM (nie stan React dla wydajności)
- Lekki niestandardowy system i18n
- Vitest + Testing Library do testów automatycznych
- TypeDoc do dokumentacji API
- Alias ścieżki Vite: `@` mapowany na `./src`

### 📝 Uwagi
- Szablony SVG są ładowane z `src/assets/teeth-svgs` i `src/assets/icon-svgs`, więc statyczny hosting musi serwować folder publiczny.
- Silnik odontogramu używa własnego stanu wewnętrznego (nie stanu React) dla wydajności i prostoty.
- Zęby mleczne mają ograniczony zestaw dostępnych materiałów (bez wypełnień amalgamatowych, bez endodoncji opartej na wkładach).
- Zęby z implantami mają inny zestaw opcji korony/filara niż zęby naturalne.

### 📖 Jak cytować

Jeśli używasz tego modułu w swojej pracy, zacytuj go.

**Ta wersja (v1.10.0):**
> Dul, Z. (2026). *React Odontogram Modul* (v1.10.0). Zenodo. https://doi.org/10.5281/zenodo.21156788

**Wszystkie wersje (DOI koncepcyjny):** https://doi.org/10.5281/zenodo.21156787

Metadane cytowania w formacie maszynowym znajdują się w [`CITATION.cff`](../CITATION.cff).
