# 🦷 React Odontogram Modul

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-1.13.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](../README.md#-english) | 🇪🇸 [Español](../README.md#-español) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md)

---

## 🇮🇹 Italiano

### 📋 Panoramica
Questo progetto è un editor di odontogramma interattivo basato su browser che supporta la registrazione rapida dello stato dentale con un'interfaccia pulita. Renderizza template SVG dentali a strati per rappresentare restauri, carie, stato endodontico, mobilità e altri dettagli clinici, offrendo selezione multipla, filtri di selezione e preset di stato predefiniti.

---
<img width="1728" height="922" alt="react-odontogram-modul-english-preview" src="https://github.com/user-attachments/assets/0d6e076e-a840-408c-93cc-974e0767aaaf" />

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### ✨ Funzionalità principali
- 🖱️ Selezione rapida e selezione multipla (CMD/CTRL + clic)
- 🦷 Tipi di dente: permanente, deciduo (da latte), impianto, sottogengivale, mancante
- 👑 Materiali per corone: naturale (corona completa), fratturato, preparato per corona, radix, e.max, zirconio, metalloceramica, provvisorio, telescopico
- 🔩 Abutment per impianti: abutment di guarigione, locator, locator con protesi, barra, barra con protesi
- 🌉 Elementi di ponte: zirconio, metallo, provvisorio, rimovibile, barra, barra con protesi
- 🔍 Registrazione delle carie su 6 superfici: mesiale, distale, buccale, linguale, occlusale, sottocoronale
- 🪥 Materiali di otturazione per superficie: amalgama, composito, vetroionomero, provvisorio
- 🏥 Stati endodontici: otturazione medicinale, otturazione canalare, otturazione canalare incompleta, perno in fibra di vetro, perno metallico, resezione, perno parapulpale
- ⚕️ Modifiche: infiammazione periapicale (interna/esterna), malattia parodontale, gradi di mobilità (M1/M2/M3)
- 🏷️ Indicatori speciali: corona necessaria, sostituzione corona necessaria, spazio chiuso dopo estrazione, estrazione pianificata, usura da bruxismo/usura cervicale, sigillatura dei solchi, perdita del punto di contatto
- 👁️ Vista occlusale, denti del giudizio, visibilità di osso e polpa
- 🔢 12 filtri di selezione (tutti, presenti, permanenti, decidui, impianti, mancanti, superiori/inferiori, frontali/molari)
- 📊 Preset di stato predefiniti (ripristino, dentizione primaria, dentizione mista, edentulo)
- 📦 34 template di restauro predefiniti (ponti, protesi rimovibili, protesi su barra con impianti)
- 💾 Esportazione/importazione dello stato in JSON (versione 1.4, con stati personalizzati dei plugin e note per dente)
- 🔗 Esportazione HL7 FHIR R4 (Bundle di raccolta di Observation per dente, codifica dentale ISO 3950 per la dentizione permanente, sistema di codici locale — mappatura SNOMED CT pianificata)
- ✚ Interfaccia di selezione superfici a croce (B/M/O/D/L) per carie e otturazioni
- 🧱 Materiali di restauro per superficie (otturazioni miste, es. buccale amalgama + distale composito)
- 🖼️ Esportazione immagine PNG/JPG/SVG dell'odontogramma (scaricabile; PNG/JPG rasterizzato da SVG vettoriale)
- 🦷 Carie secondaria (ricorrente) — derivata automaticamente quando la carie si sovrappone a un'otturazione
- 🪨 Tartaro, riassorbimento radicolare e lesioni periapicali tipizzate (granuloma / cisti / ascesso)
- 📏 Profondità della carie per superficie (superficiale / dentina / profonda), o punteggio ICDAS II opzionale (0–6) tramite `enableIcdas`
- 🧰 Barra superiore di icone unificata con menu Impostazioni (numerazione, note, ICDAS, informazioni dentali)
- 📋 Pannello informazioni dentali: riepilogo testuale in tempo reale dell'intero odontogramma (conteggio denti, elenchi presenti/mancanti, carie incl. secondaria, otturazioni, trattamenti canalari, protesi, impianti, stato parodontale) — visibile per impostazione predefinita, attivabile/disattivabile nelle Impostazioni
- 🗂️ Menu di esportazione unificato (Stato JSON / FHIR / PNG / JPG)
- 📥 Menu di importazione con importazione FHIR (ricarica Bundle esportati)
- ⏳ Overlay di avanzamento durante l'esportazione delle immagini
- 🎓 Tour introduttivo interattivo in 12 passi
- 🔢 Tre sistemi di numerazione (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) con selettore di lingua (190+ chiavi di traduzione per lingua)
- 🌗 Supporto modalità scura con pulsante di attivazione (autonoma o controllata dall'app principale)
- 🎨 Configurazione tema personalizzato (prop `themeConfig`) con proprietà CSS personalizzate (`--odon-*`)
- 📱 UX touch su mobile: popover zoom al tocco, menu contestuale con pressione prolungata, zoom a pizzico, target touch WCAG 44px, navigazione per arcata
- 🔌 Sistema di plugin SVG personalizzati: overlay visivi, stato personalizzato per dente, supporto esportazione/importazione JSON
- ⚠️ Avvisi di validazione dello stato per combinazioni di stati dentali incompatibili
- 🏷️ Tooltip automatico dello stato sui riquadri dentali (mostra tutti gli stati attivi)
- ♿ Accessibilità da tastiera (WCAG): ruoli ARIA listbox/option, selezione con Invio/Spazio, navigazione con tasti freccia, contorni focus-visible
- 🔒 Modalità sola lettura: disabilita tutte le interazioni per casi d'uso di stampa/report/visualizzazione
- ✨ Animazioni di selezione: bordo tratteggiato pulsante e ombra luminosa sui denti selezionati (con supporto prefers-reduced-motion)
- 📝 Note per dente: doppio clic per aggiungere/modificare note, icona nota accanto al numero del dente, tooltip al passaggio del cursore con il testo della nota, esportazione/importazione JSON
- 🧪 202 test automatizzati (Vitest) in 16 file di test che coprono numerazione, traduzioni, preset, i18n, componente App, tema, touch, plugin e accessibilità
- 📖 Documentazione API TypeDoc con commenti JSDoc su tutti gli export pubblici (`npm run docs`)

### 📦 Moduli
- 🦷 Griglia dell'odontogramma e interfaccia dei riquadri dentali
- 🎛️ Pannello di controllo e stato
- 🎨 Motore di stratificazione SVG e template
- 🔢 Numerazione dentale e mappatura delle etichette (FDI/Universal/Palmer)
- 🌐 Localizzazione (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- 💾 Esportazione/importazione dello stato
- 📋 Extra di stato: template di restauro predefiniti
- 🎨 Configurazione del tema: palette di colori personalizzabile tramite proprietà CSS `--odon-*`
- 📱 Interazioni touch su mobile (zoom al tocco, pressione prolungata, zoom a pizzico, selettore arcata)
- 🔌 Sistema di plugin SVG personalizzati
- ⚠️ Sistema di validazione dello stato e tooltip
- ♿ Accessibilità da tastiera e supporto ARIA
- 🔒 Modalità sola lettura
- ✨ Animazioni di selezione
- 📝 Sistema di note per dente
- 🧪 Suite di test automatizzati (Vitest + Testing Library)

### 🛠️ Controlli dell'interfaccia

**🔝 Barra superiore:**
- Selettore di lingua (menu a tendina HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- Pulsante modalità scura (icona sole/luna, alterna tra tema chiaro e scuro)
- Selettore del sistema di numerazione (menu a tendina FDI/Universal/Palmer)
- Pulsanti Esporta stato / Importa stato

**📊 Intestazione del grafico:**
- Attivazione/disattivazione vista occlusale
- Attivazione/disattivazione visibilità denti del giudizio
- Attivazione/disattivazione visibilità osso
- Attivazione/disattivazione visibilità polpa
- Pulsante cancella selezione

**🔍 Filtri di selezione:**
- Seleziona tutti / Tutti i presenti / Permanenti / Decidui / Impianti / Tutti i mancanti
- Superiori / Superiori 6 frontali / Molari superiori
- Inferiori / Inferiori 6 frontali / Molari inferiori

**📋 Preset di stato:**
- Ripristina tutto (ripristina bocca)
- Dentizione primaria
- Dentizione mista
- Attivazione/disattivazione edentulo

**📦 Menu a tendina extra di stato:**
- Ponti in zirconio superiori/inferiori (12-22, 13-23, 16-26, arcata completa)
- Ponti in metalloceramica superiori/inferiori (12-22, 13-23, 16-26, arcata completa)
- Protesi parziali rimovibili superiori/inferiori
- Protesi totali rimovibili superiori/inferiori
- Protesi su barra superiori/inferiori con impianti

### 🦷 Tipi di dente e stati

**Selezione del dente (tipo base):**
| Valore | Descrizione |
|---|---|
| `none` | Dente mancante |
| `tooth-base` | Dente permanente |
| `milktooth` | Dente deciduo (da latte) |
| `implant` | Impianto dentale |
| `tooth-under-gum` | Dente sottogengivale (non erotto) |

**Varianti di dente fratturato:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Materiali per corone (denti permanenti):**
`radix`, `natural` (corona completa, predefinito), `broken`, `crownprep` (preparato per corona), `emax`, `zircon`, `metal`, `temporary`, `telescope`

**Materiali per corone (impianti):**
`natural` (nessuno), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Elementi di ponte:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Opzioni endodontiche (denti permanenti):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opzioni endodontiche (denti decidui):**
`none`, `endo-medical-filling`

**Materiali di otturazione (denti permanenti):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiali di otturazione (denti decidui):**
`composite`, `gic`, `temporary`

**Superfici di otturazione/carie:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (solo carie)

**Modifiche:**
`inflammation` (periapicale), `parodontal` (parodontale), `mobility` (M1/M2/M3)

**Tipo di lesione periapicale** (qualifica `inflammation`):
`none`, `granuloma`, `cyst`, `abscess`

**Profondità della carie** (per superficie): `superficial` / `dentin` / `deep`, o codici ICDAS II opzionali `0–6` quando `enableIcdas` è attivo

**Indicatori speciali:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `rootResorption`, `calculus`, `parapulpalPin`

### 🖼️ Sistema di template SVG

**Template dentali** (in `src/assets/teeth-svgs/`):
| Template | Denti che lo utilizzano |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisivi) |
| `13.svg` | 13, 23, 33, 43 (canini) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premolari) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molari) |

I template vengono ruotati di 180 gradi per la mascella inferiore e specchiati orizzontalmente per il lato sinistro.

**SVG icone** (in `src/assets/icon-svgs/`):
`icon_8.svg` (giudizio), `icon_gum.svg` (osso), `icon_no_selection.svg` (cancella), `icon_occl.svg` (vista occlusale), `icon_pulp.svg` (polpa)

### 🔢 Sistemi di numerazione

**FDI (ISO 3950):** Denti adulti 11-18, 21-28, 31-38, 41-48. Denti decidui 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Denti adulti numerati 1-32. Denti decidui con lettere A-T.

**Palmer (Zsigmondy-Palmer):** Formato quadrante + posizione (es. UR-1, LL-5). I denti decidui usano le lettere A-E per quadrante.

### 🚀 Utilizzo
Sviluppo:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Anteprima:
```bash
npm run preview
```

### 🔗 Integrazione
Il componente può essere incorporato in qualsiasi app React.
Esempio:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="it"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Integrazione modalità scura:**
- **Modalità autonoma:** Omettere la prop `darkMode` — il componente gestisce il proprio stato del tema tramite il pulsante di attivazione nella barra superiore e aggiunge/rimuove la classe `.dark` sull'elemento `<html>`.
- **Modalità controllata:** Passare `darkMode` e `onDarkModeChange` — l'app principale controlla il tema. Il pulsante di attivazione continua ad apparire, ma chiama `onDarkModeChange` invece di gestire lo stato interno. L'app principale è responsabile dell'aggiunta/rimozione della classe `.dark` sull'elemento `<html>`.

**Tema personalizzato:**
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

**Integrazione plugin:**
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

### 🧪 Test
```bash
npm run test           # Esegui tutti i 202 test
npm run test:watch     # Modalità watch
npm run test:coverage  # Report di copertura
```

### 📖 Documentazione API
```bash
npm run docs           # Genera la documentazione TypeDoc in docs/
```

### 📡 API pubblica

**Props del componente:**

| Prop | Tipo | Predefinito | Descrizione |
|---|---|---|---|
| `language` | `string` | `'hu'` | Lingua dell'interfaccia (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Callback quando cambia la lingua |
| `numberingSystem` | `string` | `'FDI'` | Sistema di numerazione (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback quando cambia la numerazione |
| `darkMode` | `boolean` | `undefined` | Stato modalità scura. Omettere per la modalità autonoma. |
| `onDarkModeChange` | `(dark) => void` | — | Callback quando si attiva/disattiva la modalità scura. Obbligatorio per la modalità controllata. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Override dei colori personalizzati tramite proprietà CSS personalizzate (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Plugin SVG personalizzati per overlay visivi e stato personalizzato per dente. |
| `readOnly` | `boolean` | `undefined` | Disabilita tutte le interazioni (clic, touch, tastiera). Utile per visualizzazioni di stampa/report. |
| `enableNotes` | `boolean` | `undefined` | Abilita le note per dente. Doppio clic su un dente per aggiungere/modificare note. |

**Funzioni esportate per il controllo esterno:**

| Funzione | Descrizione |
|---|---|
| `initOdontogram()` | Inizializza il motore e renderizza tutti i denti |
| `destroyOdontogram()` | Arresta il motore e rimuove i listener degli eventi |
| `setNumberingSystem(system)` | Passa tra FDI, Universal, Palmer |
| `clearSelection()` | Deseleziona tutti i denti |
| `setOcclusalVisible(on)` | Attiva/disattiva la vista occlusale |
| `setWisdomVisible(on)` | Mostra/nasconde i denti del giudizio |
| `setShowBase(on)` | Mostra/nasconde il livello osseo |
| `setHealthyPulpVisible(on)` | Mostra/nasconde la polpa sana |
| `registerPlugins(plugins)` | Registra plugin SVG personalizzati |
| `setPluginState(toothNo, pluginId, value)` | Imposta lo stato personalizzato di un plugin per un dente |
| `getPluginState(toothNo, pluginId)` | Ottiene lo stato personalizzato di un plugin per un dente |
| `getToothStateSummary(toothNo)` | Ottiene un riepilogo localizzato di tutti gli stati attivi |
| `getOdontogramSummary()` | Ottiene un riepilogo testuale strutturato e localizzato dell'intero odontogramma (conteggi, sezioni) |
| `onStateChange(callback)` | Sottoscrive le modifiche di stato; restituisce una funzione di annullamento |
| `setReadOnly(value)` | Abilita/disabilita la modalità sola lettura |
| `getReadOnly()` | Ottiene lo stato corrente di sola lettura |
| `setNotesEnabled(value)` | Abilita/disabilita le note per dente |
| `getNotesEnabled()` | Ottiene lo stato corrente delle note |
| `exportFhir(options?)` | Esporta l'odontogramma come Bundle HL7 FHIR R4 (download JSON). Riferimento `{ subject }` opzionale; altrimenti viene incorporato un Paziente segnaposto |
| `exportImage(format)` | Scarica l'odontogramma come immagine — `"png"` o `"jpg"` |
| `exportSvg()` | Scarica l'odontogramma come SVG scalabile (vettoriale) |
| `importFhirBundle(input)` | Importa un Bundle FHIR R4 (oggetto o stringa JSON) prodotto da questo modulo |
| `setImportFormat(format)` | Imposta il parser per la prossima importazione file — `"status"` o `"fhir"` |
| `startIntroTour()` | Avvia il tour introduttivo interattivo in 12 passi |

### 💾 Formato di esportazione/importazione dello stato
L'esportazione crea un file JSON (versione `1.4`) contenente:

**Campi globali:**
- `wisdomVisible` - denti del giudizio visibili
- `showBase` - livello osseo visibile
- `occlusalVisible` - vista occlusale attiva
- `showHealthyPulp` - polpa sana visibile
- `edentulous` - modalità edentulo attiva

**Campi per dente (32 denti):**
- `toothSelection` - tipo base del dente
- `crownMaterial` - materiale della corona/abutment
- `bridgeUnit` - tipo di connettore del ponte
- `endo` - stato endodontico
- `mods` - array di modifiche (infiammazione, parodontale)
- `caries` - superfici con carie attiva
- `fillingMaterial` - materiale dell'otturazione
- `fillingSurfaces` - superfici otturate
- `pulpInflam` - flag infiammazione pulpare
- `endoResection` - flag apicectomia
- `fissureSealing` - flag sigillante per solchi
- `contactMesial` - perdita del punto di contatto mesiale
- `contactDistal` - perdita del punto di contatto distale
- `bruxismWear` - usura occlusale da bruxismo
- `bruxismNeckWear` - usura cervicale da bruxismo
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - posizioni delle fratture
- `extractionWound` - ferita post-estrazione
- `extractionPlan` - estrazione pianificata
- `parapulpalPin` - flag perno parapulpale
- `bridgePillar` - dente pilastro del ponte
- `mobility` - grado di mobilità (none/m1/m2/m3)
- `crownNeeded` - indicatore corona necessaria
- `crownReplace` - indicatore sostituzione corona necessaria
- `missingClosed` - spazio chiuso dopo estrazione
- `customStates` - stati personalizzati del plugin (oggetto, indicizzato per ID plugin)
- `note` - nota testuale per dente (stringa, opzionale — presente solo se non vuota)

### 📁 Struttura delle cartelle
- `src/App.tsx` - interfaccia della shell, controlli della barra superiore, selettore lingua/numerazione/modalità scura/tema/plugin
- `src/odontogram.ts` - motore di stratificazione SVG, gestione dello stato dentale, interazioni touch, overlay plugin, collegamento UI
- `src/plugin.ts` - tipo `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, priorità z-index `LAYER_Z`
- `src/theme.ts` - tipo `OdontogramThemeConfig` e utilità `applyThemeConfig()`
- `src/status_extras.ts` - 34 template di restauro predefiniti (ponti, protesi, costruzioni su barra)
- `src/i18n/` - traduzioni (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) e hook i18n
- `src/utils/numbering.ts` - conversione della numerazione FDI, Universal, Palmer
- `src/__tests__/` - suite di test Vitest (202 test in 16 file)
- `src/assets/teeth-svgs/` - template SVG dentali (6 file: incisivi, canini, premolari, molari + viste occlusali)
- `src/assets/icon-svgs/` - SVG delle icone della barra degli strumenti (5 file)

### ⚙️ Stack tecnologico
- React 18 + Vite + TypeScript
- Tailwind CSS per lo stile dell'interfaccia
- Stratificazione SVG tramite manipolazione del DOM (stato non-React per le prestazioni)
- Sistema i18n personalizzato leggero
- Vitest + Testing Library per i test automatizzati
- TypeDoc per la documentazione API
- Alias di percorso Vite: `@` mappato su `./src`

### 📝 Note
- I template SVG vengono caricati da `src/assets/teeth-svgs` e `src/assets/icon-svgs`, pertanto l'hosting statico deve servire la cartella pubblica.
- Il motore dell'odontogramma utilizza il proprio stato interno (non lo stato React) per prestazioni e semplicità.
- I denti decidui dispongono di un set ridotto di materiali disponibili (nessuna otturazione in amalgama, nessun trattamento endodontico con perni).
- I denti con impianto dispongono di un diverso set di opzioni per corona/abutment rispetto ai denti naturali.

### 📖 Come citare

Se utilizzi questo modulo nel tuo lavoro, per favore citalo.

**Questa versione (v1.10.0):**
> Dul, Z. (2026). *React Odontogram Modul* (v1.10.0). Zenodo. https://doi.org/10.5281/zenodo.21156788

**Tutte le versioni (DOI concettuale):** https://doi.org/10.5281/zenodo.21156787

I metadati di citazione leggibili dalla macchina si trovano in [`CITATION.cff`](../CITATION.cff).
