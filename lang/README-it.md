# 🦷 React Odontogram Modul

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-1.30.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
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
- 🦷 Substrato dentale (ortogonale a qualsiasi restauro): naturale, radix (residuo radicolare), fratturato, preparato per corona
- 👑 Restauri per tipo × materiale: corona / inlay / onlay / faccetta / ponte in e.max, oro, gradia, zirconio, metallo, metalloceramica, telescopico o provvisorio (l'onlay è disponibile solo in vista occlusale) — scelti da un unico selettore combinato a basso numero di clic "Fix: Corona – …"; le corone `metal` esistenti migrano a `metal-ceramic` (PFM, metalloceramica); gli impianti utilizzano lo stesso modello tipo × materiale, composto con un livello connettore per impianto. Il selettore è delimitato in base al tipo di dente: un impianto offre solo corona/ponte (più le sue cinque opzioni di attacco, di seguito); un dente mancante/spazio offre solo un elemento intermedio di ponte (più protesi parziale/totale rimovibile); un substrato `radix` nasconde interamente il controllo del restauro (nessun restauro può essere assegnato a un residuo radicolare)
- 🦿 Protesi rimovibili/su attacco sull'asse dedicato `prosthesis` (voci "Kivehető:" nel selettore combinato): abutment di guarigione dell'impianto, locator, locator con overdenture, barra, barra con overdenture; protesi parziale o totale rimovibile supportata dai denti
- 🌉 I denti di ponte visualizzano sia la cappa della corona sia il connettore a sella; un overlay del tratto di ponte multi-dente disegna un unico connettore continuo, sensibile all'arcata, attraverso i denti di ponte consecutivi (elementi intermedi + pilastri) e gli spazi tra i denti (arcata superiore e inferiore usano una geometria a sella speculare, mantenendo il connettore allineato su entrambe le arcate), incluso nell'esportazione PNG/JPG/SVG; l'applicazione di un ponte tramite un preset di Stati ricalcola immediatamente l'overlay
- 🔍 Registrazione delle carie su 6 superfici: mesiale, distale, buccale, linguale, occlusale, sottocoronale
- 🪥 Materiali di otturazione per superficie: amalgama, composito, vetroionomero (GIC), provvisorio
- 🏥 Un unico selettore combinato "Stato polpa / endodonzia" (raggruppato: polpa vitale vs. trattata/endodonzia): gli stati endodontici (otturazione medicinale, otturazione canalare, otturazione canalare incompleta, perno in fibra di vetro, perno metallico) e la diagnosi pulpare AAE (`pulpDx`: normale / pulpite reversibile / irreversibile / necrosi) si escludono a vicenda — un dente trattato endodonticamente (`endo` impostato) non può avere anche una diagnosi di polpa vitale; al momento del trattamento, `pulpDx` viene normalizzato a `normal` e il glifo di polpa malata viene soppresso. La pulpite reversibile visualizza un glifo di polpa ridotto. Un'impostazione opzionale a 3 livelli di dettaglio pulpare (`pulpDetailLevel`: simple / AAE / latino pratico) mostra 9 sottotipi in latino pratico (pulpa sana … gangraena pulpae) tramite `pulpLatin`; la resezione e il perno parapulpale restano indicatori speciali separati
- 🦴 La diagnosi apicale (`apicalDx`: parodontite apicale sintomatica/asintomatica, ascesso apicale acuto/cronico, osteite condensante) determina direttamente il glifo periapicale; un qualificatore di sottotipo di lesione granuloma/cisti viene mostrato solo in presenza di parodontite apicale sintomatica/asintomatica (il sottotipo ridondante "ascesso" è stato rimosso — è già coperto dalla diagnosi apicale)
- 🩹 Scheda unificata "Radice e parodonto" (un'unica sezione a comparsa per i reperti radicolari/periapicali e parodontali)
- ⚕️ Modifiche: infiammazione periapicale (mostrata solo sui denti mancanti/con alveolo post-estrattivo; nascosta sui denti presenti, dove è solo `apicalDx` a determinare il glifo periapicale, e sugli impianti, dove se ne occupa `periImplant`), malattia parodontale, gradi di mobilità (M1/M2/M3, nascosti sugli impianti)
- 🦷🔩 Stato peri-implantare (`periImplant`: none / mucositis / peri-implantitis-mild / -moderate / -severe) — stadiazione del World Workshop 2018, mostrata come selettore dedicato sugli impianti; la mucosite riutilizza il glifo gengivale parodontale, la perimplantite aggiunge un livello graduato `peri-implant-bone-loss` (opacità 0,4/0,7/1,0). Gli impianti non visualizzano più il glifo della lesione periapicale — la loro infiammazione viene invece espressa tramite questo asse — e le caselle di spunta dei modificatori parodontali sono nascoste sugli impianti (la rietichettatura ad hoc della casella "Perimplantite" è stata ritirata)
- 🏷️ Indicatori speciali: corona necessaria, sostituzione corona necessaria, spazio chiuso dopo estrazione, estrazione pianificata, sigillatura dei solchi, perdita del punto di contatto
- 👁️ Vista occlusale, denti del giudizio, attivazione/disattivazione visibilità di osso e polpa
- 🔢 12 filtri di selezione (tutti, presenti, permanenti, decidui, impianti, mancanti, superiori/inferiori, frontali/molari)
- 📊 Preset di stato predefiniti (ripristino, dentizione primaria, dentizione mista, edentulo)
- 📦 34 template di restauro predefiniti (ponti, protesi rimovibili, protesi su barra con impianti)
- 💾 Esportazione/importazione dello stato in JSON (versione 2.10; le importazioni continuano ad accettare le versioni legacy 1.4, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8 e 2.9 e vengono migrate automaticamente, con stati personalizzati dei plugin e note per dente)
- 🔗 Esportazione HL7 FHIR R4 (Bundle di raccolta di Observation per dente, codifica dentale ISO 3950 per la dentizione permanente, sistema di codici locale — mappatura SNOMED CT pianificata)
- ✚ Interfaccia di selezione superfici a croce (B/M/O/D/L) per carie e otturazioni
- 🧱 Materiali di restauro per superficie (otturazioni miste, es. buccale amalgama + distale composito)
- 🖼️ Esportazione immagine PNG/JPG/SVG dell'odontogramma (scaricabile; PNG/JPG rasterizzato da SVG vettoriale)
- 🦷 Carie/carie secondaria è una macchina a stati per superficie: una superficie cariata senza otturazione viene visualizzata come carie primaria (opacità a livelli ICDAS); non appena quella superficie ha un'otturazione, viene visualizzata invece come carie secondaria (ricorrente) (livello `subcaries-{surface}`, punteggio CARS) — le due non sono mai attive contemporaneamente sulla stessa superficie
- 🎯 Gravità unificata per superficie (`cariesSeverity`, 0–6, sostituisce i precedenti campi separati di profondità ICDAS e CARS): letta come profondità ICDAS su una superficie primaria, come punteggio CARS con nome (Sano … Cavità estesa) su una ricorrente, tramite un popup contestuale che mostra solo la scala pertinente allo stato attuale della superficie
- 🌱 Carie radicolare (`rootCaries`: none / active / arrested / active-cavitated), che attiva il livello grafico dedicato alla carie radicolare con un'opacità determinata dalla gravità (active 0,5 / arrested 0,7 / active-cavitated opacità piena)
- 📡 Profondità radiografica della carie (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 per superficie), indipendente dalla scala di gravità visiva ICDAS/CARS, mostrata come badge e sincronizzata tramite una propria Observation FHIR
- 🎚️ Tre impostazioni di granularità della carie (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) più un interruttore `cariesDepthEnabled`, che riducono ciascuna scala a una selezione più semplice senza perdere il valore memorizzato
- 🩹 Riga di riepilogo delle carie secondarie nel pannello otturazioni: elenca, sotto i controlli delle otturazioni, ogni dente selezionato con carie secondaria e le relative superfici (es. "36 (O) ha carie secondaria sulla sua otturazione.")
- 🪛 Difetti di otturazione per superficie (`fillingDefect`: none / marginal / fracture / wear) sui restauri diretti, indipendenti dalla carie secondaria — inseriti tramite un indicatore per superficie sulla scheda Otturazioni (speculare all'indicatore di profondità carie, con il suo elenco di opzioni disposto verticalmente), visualizzati sull'odontogramma e mostrati nel tooltip e nel riepilogo otturazioni dell'intera bocca con un'etichetta esplicita (es. "36 (O) – Difetto di otturazione: O: marginal"), allo stesso modo in cui la carie secondaria viene etichettata sulla riga Carie; la scheda Otturazioni mostra anche una nota di suggerimento per ogni dente selezionato con un difetto di otturazione registrato (es. "36 ha un difetto di otturazione registrato."), analogamente alla nota di suggerimento esistente per la carie secondaria
- 🦷💥 Usura dentale tipizzata per causa clinica e localizzazione (`wearEdge`: none / attrition / erosion, incisale/occlusale; `wearCervical`: none / abrasion / abfraction / erosion, cervicale) — sostituisce i due flag on/off di usura da bruxismo; inserita tramite due menu a tendina sulla riga usura, riutilizza la grafica esistente e viene mostrata nel tooltip e in una nuova sezione di riepilogo "Usura" per l'intera bocca
- 🎨 Discromia dentale per causa (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) su denti permanenti e decidui — colora la corona naturale visualizzata con un colore rappresentativo quando il dente non ha restauro e ha substrato naturale; mostrata nel tooltip e in una nuova sezione di riepilogo "Discromia" per l'intera bocca; completa l'insieme delle condizioni di superficie e strutturali insieme ai difetti di otturazione e all'usura
- ✏️ I denti anteriori (incisivi/canini) etichettano la loro superficie occlusale come "incisale" in tutta l'interfaccia (selettore, popup, riepiloghi); la chiave di superficie memorizzata resta `occlusal`
- 🔤 Notazione delle superfici sensibile alla posizione (Impostazioni → Dettagli dentali → "Notazione superfici", simple/full, predefinito full): in modalità full la lettera e l'etichetta della superficie di carie/otturazione seguono l'anatomia del dente — occlusale → I/incisale sui denti anteriori, buccale → L/labiale sui denti anteriori, linguale → P/palatale sui denti superiori e L/linguale sui denti inferiori (mesiale/distale/sottocoronale non sono interessati); la modalità simple usa sempre l'insieme generico B/M/O/D/L/SC indipendentemente dalla posizione del dente. Si applica al riepilogo dell'intera bocca e a entrambi i selettori di superficie per carie e difetti di otturazione (lettera + didascalia); la chiave di superficie memorizzata non è interessata
- 🦷↕️ Registrazione ortodontica per dente (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: booleano) su un dente naturale presente (permanente o deciduo) — riutilizza la grafica ortodontica dormiente della v2.5.0 (nessun nuovo SVG); mostrata sull'odontogramma, nel tooltip e in una nuova sezione di riepilogo "Ortodonzia" per l'intera bocca
- 🪨 Tartaro, e riassorbimento radicolare tipizzato come interno o cervicale esterno (`resorptionType`)
- 📏 Profondità della carie per superficie (superficiale / dentina / profonda), o punteggio ICDAS II opzionale (0–6) tramite `enableIcdas`
- 🩹 Interruttore di microinfiltrazione marginale della corona, visibile solo con restauro a corona o ponte
- 🧰 Barra superiore di icone unificata con una finestra modale Impostazioni a schede (Generale / Pannelli / Dettagli dentali / Carie / Polpa / Note — numerazione, note, visibilità pannelli, ICDAS, interruttore profondità carie, granularità carie radicolare/radiografica, livello di dettaglio pulpare, livello di dettaglio usura/discromia dentale, informazioni dentali)
- 🗂️ Impostazioni → scheda "Pannelli": mostra/nasconde in modo indipendente i pannelli di riepilogo Stati e Ortodonzia per l'intera bocca
- 🩹 Il controllo delle impostazioni di carie secondaria (CARS) è stato unito alla scheda Impostazioni Carie, posizionato sopra Profondità radiografica (la scheda separata "Carie secondaria" è stata ritirata)
- 🎚️ Livello di dettaglio dei dettagli dentali (Impostazioni → Dettagli dentali): un'impostazione simple/complex per l'usura dentale e per la discromia. La modalità simple mostra un interruttore sì/no per ciascun reperto (usura attiva → attrition/abrasion, discromia attiva → other); la modalità complex (predefinita) mantiene i menu a tendina di tipo/causa, e il valore memorizzato viene conservato passando da un livello all'altro
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
- 🩺 Tooltip per dente e pannello di riepilogo per l'intera bocca modernizzati: entrambi mostrano l'intero set di reperti clinici (diagnosi pulpare/apicale + sottotipo di lesione, riassorbimento radicolare, stato peri-implantare, carie radicolare graduata, tartaro, microinfiltrazione marginale della corona, frattura, perdita di contatto, usura tipizzata del bordo/cervicale), con una sezione dedicata "Diagnosi" nel pannello, una sezione dedicata "Usura", e un qualificatore grossolano di gravità della carie (superficiale/moderata/profonda)
- ♿ Accessibilità da tastiera (WCAG): ruoli ARIA listbox/option, selezione con Invio/Spazio, navigazione con tasti freccia, contorni focus-visible
- 🔒 Modalità sola lettura: disabilita tutte le interazioni per casi d'uso di stampa/report/visualizzazione
- ✨ Animazioni di selezione: bordo tratteggiato pulsante e ombra luminosa sui denti selezionati (con supporto prefers-reduced-motion)
- 📝 Note per dente: doppio clic per aggiungere/modificare note, icona nota accanto al numero del dente, tooltip al passaggio del cursore con il testo della nota, esportazione/importazione JSON
- 🧪 864 test automatizzati superati (1 test aggiuntivo saltato) (Vitest) in 94 file di test che coprono numerazione, traduzioni, preset, i18n, componente App, tema, touch, plugin, accessibilità e parità degli assi clinici/diagnosi
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
- Ponti in metallo superiori/inferiori (12-22, 13-23, 16-26, arcata completa)
- Protesi parziali rimovibili superiori/inferiori
- Protesi totali rimovibili superiori/inferiori
- Protesi su barra superiori/inferiori con impianti

**🦷 Pannello editor dente** (per il dente/i denti selezionati, raggruppato in schede a comparsa):
- **Riga base:** selezione del dente (tipo base incl. varianti di corona fratturata) e substrato dentale (natural/radix/broken/crownprep)
- **Riga restauro:** il menu a tendina combinato di restauro "Fix: …" / "Kivehető: …" (opzioni fisse `restorationType`×`restorationMaterial` più le opzioni di attacco/rimovibili `prosthesis`, filtrate in base al tipo di dente); casella di spunta microinfiltrazione marginale della corona (solo corona/ponte); caselle di spunta per la localizzazione della corona fratturata; interruttori corona necessaria / sostituzione corona necessaria
- **Riga usura e discromia:** menu a tendina tipo di usura incisale/occlusale, menu a tendina tipo di usura cervicale, menu a tendina causa di discromia (ciascuno si trasforma in un semplice interruttore sì/no in Impostazioni → Dettagli dentali → modalità simple)
- **Scheda Ortodonzia:** apparecchio, deriva mesiale/distale, movimento verticale (estrusione/intrusione), interruttore rotazione — mostrata su un dente naturale presente
- **Scheda Carie:** menu a tendina modalità profondità carie, casella di spunta carie sottocoronale, menu a tendina gravità carie radicolare, e il selettore di carie per superficie B/M/O/D/L con un popup contestuale profondità ICDAS/CARS e un badge di profondità radiografica
- **Scheda Otturazioni:** menu a tendina materiale otturazione, selettore otturazione per superficie (con materiale per superficie), indicatore di difetto di otturazione per superficie (marginal/fracture/wear), note di suggerimento per carie secondaria e difetto di otturazione
- **Scheda Radice e parodonto:** selettore combinato "Stato polpa / endodonzia", selettore diagnosi apicale, selettore sottotipo di lesione periapicale (solo parodontite apicale sintomatica/asintomatica), selettore tipo di riassorbimento radicolare, selettore grado di mobilità, selettore stato peri-implantare (solo impianti)
- **Indicatori speciali:** piano/ferita di estrazione, spazio chiuso, sigillatura dei solchi, perdita del punto di contatto, tartaro, perno parapulpale, resezione endodontica, pilastro di ponte

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

**Substrato dentale (denti permanenti):**
`natural` (predefinito), `radix` (residuo radicolare), `broken`, `crownprep` (preparato per corona)

**Tipo di restauro (denti permanenti):**
`none`, `crown`, `inlay`, `onlay` (solo vista occlusale), `veneer`, `bridge`

**Materiale del restauro (denti permanenti):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (le corone `metal` esistenti migrano qui), `telescope`, `temporary`

**Le opzioni di restauro sono filtrate in base al tipo di dente** (`restorationOptions()` in `src/registry/restorations.ts`): un impianto offre solo i tipi di restauro `crown`/`bridge` (composti con un livello connettore per impianto) più le cinque voci di attacco `prosthesis` di seguito; un dente mancante/spazio offre solo un elemento intermedio `bridge` più le due voci di protesi rimovibile `prosthesis`; un substrato `radix` nasconde interamente il controllo del restauro. I vecchi campi piatti `crownMaterial`/`bridgeUnit` (valori di attacco impianto/ponte precedenti alla v1.14) sono stati ritirati dal modello attivo — vengono accettati solo come percorso di migrazione in sola lettura per i vecchi payload.

**Protesi** (`prosthesis`; asse ortogonale rimovibile/attacco, mostrato come voci "Kivehető:" nel menu a tendina di restauro combinato):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (attacchi implantari, con o senza overdenture), `removable-partial`, `removable-full` (protesi supportate dai denti su un dente mancante/spazio). Un dente ha o un restauro fisso o una protesi, mai entrambi — impostarne uno cancella l'altro.

**Microinfiltrazione marginale della corona** (`crownLeakage`; booleano): mostrata solo quando `restorationType` è `crown` o `bridge`; attiva il livello grafico `crown-leakage`.

**Opzioni endodontiche (denti permanenti):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opzioni endodontiche (denti decidui):**
`none`, `endo-medical-filling`

`endo` e `pulpDx` vengono presentati tramite un unico `<select>` combinato "Stato polpa / endodonzia" (raggruppato: polpa vitale vs. trattata/endodonzia) e si escludono a vicenda — scegliendo un'opzione trattata (`endo != none`) `pulpDx` viene reimpostato a `normal`, e scegliendo una diagnosi pulpare `endo` viene reimpostato a `none`.

**Materiali di otturazione (denti permanenti):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiali di otturazione (denti decidui):**
`composite`, `gic`, `temporary`

**Superfici di otturazione/carie:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (solo carie)

**Modifiche:**
`inflammation` (periapicale), `parodontal` (parodontale), `mobility` (M1/M2/M3)

**Tipo di lesione periapicale** (`periapicalType`; qualifica il glifo periapicale, mostrato solo in presenza di parodontite apicale sintomatica/asintomatica):
`none`, `granuloma`, `cyst` — opzioni disponibili nel selettore; il vecchio valore `abscess` è ancora accettato/memorizzato ma non più offerto nel selettore, poiché duplica la diagnosi apicale. In importazione viene eliminato: incorporato in `apicalDx` quando il dente presenta il modificatore di infiammazione, altrimenti azzerato a `none`

**Diagnosi pulpare** (terminologia AAE; `pulpDx`):
`normal`, `reversible-pulpitis` (visualizza un glifo di polpa ridotto), `irreversible-pulpitis`, `necrosis` — si esclude reciprocamente con `endo`; normalizzata a `normal` su un dente trattato endodonticamente

**Diagnosi pulpare, latino pratico** (`pulpLatin`; mostrata dal selettore di pulpa solo quando `pulpDetailLevel` è `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Livello di dettaglio pulpare** (`pulpDetailLevel`, impostazione globale): `simple`, `aae` (predefinito), `latin` — controlla il vocabolario offerto dal selettore di pulpa

**Diagnosi apicale** (`apicalDx`; determina il glifo periapicale):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Tipo di riassorbimento radicolare** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Stato peri-implantare** (`periImplant`; solo impianti, stadiazione del World Workshop 2018): `mucositis` riutilizza il glifo gengivale parodontale; `peri-implantitis-*` aggiunge il livello `peri-implant-bone-loss` con un'opacità scalata in base alla gravità (mild 0,4 / moderate 0,7 / severe 1,0). Gli impianti non visualizzano più il glifo della lesione periapicale (la loro infiammazione viene invece espressa tramite questo asse), e le caselle di spunta `mods` di infiammazione/parodontale sono nascoste sugli impianti:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Gravità della carie** (`cariesSeverity`; campo unificato per superficie, `0`–`6`): su una superficie senza otturazione viene letta come scala di profondità ICDAS (`superficial` / `dentin` / `deep`, oppure i codici ICDAS II grezzi `0–6` quando `enableIcdas` è attivo) e visualizza il livello primario `caries-{surface}`; su una superficie con otturazione viene letta come punteggio CARS con nome (`0` sano … `6` cavità estesa) e visualizza invece il livello `subcaries-{surface}` (carie ricorrente) — una superficie non è mai contemporaneamente primaria e ricorrente

**Carie radicolare** (`rootCaries`; attiva il livello grafico `caries-root` su un dente presente, con opacità determinata dalla gravità — `active` 0,5 / `arrested` 0,7 / `active-cavitated` opacità piena):
`none`, `active`, `arrested`, `active-cavitated`

**Profondità radiografica della carie** (`radiographicDepth`; per superficie, indipendente dalla scala visiva ICDAS/CARS `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Impostazioni di granularità della carie** (globali): `secondaryCariesMode` (`simple`/`standard`/`full`, predefinito `standard`), `rootCariesMode` (`simple`/`severity`, predefinito `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, predefinito `off`), `cariesDepthEnabled` (booleano, predefinito `true`) — ciascuna riduce la propria scala a una selezione più semplice senza alterare il valore memorizzato

**Indicatori speciali:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Usura dentale** (`wearEdge`, `wearCervical`; tipo clinico per localizzazione, condizionato a dente-base + nessun restauro + substrato naturale; attiva i livelli esistenti `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Discromia** (`discoloration`; causa per dente, condizionata a un dente-base naturale o dente deciduo + nessun restauro + substrato naturale; colora il riempimento della corona naturale visualizzata — nessun nuovo SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Difetto di otturazione** (`fillingDefect`; per superficie, reperto su restauro diretto indipendente dalla carie ricorrente — condizionato alle superfici presenti in `fillingSurfaceMaterials`; attiva il livello grafico `defect-{surface}`):
`none`, `marginal`, `fracture`, `wear`

**Ortodonzia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; per dente, condizionata a un dente naturale presente — permanente o deciduo):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (glifo freccia su), `intrusion` (glifo freccia giù) — `orthoRotation`: booleano

**Impostazioni di dettaglio/notazione dentale** (impostazioni globali di sessione, Impostazioni → Dettagli dentali): `wearDetailLevel` e `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, predefinito `complex` — la modalità simple mostra un interruttore sì/no invece del menu a tendina completo di tipo/causa, senza modificare il valore memorizzato) e `surfaceNotation` (`simple`/`full`, predefinito `full` — controlla se le lettere/etichette di superficie di carie/otturazione sono sensibili alla posizione; vedi "Notazione delle superfici sensibile alla posizione" sopra)

### ⚙️ Impostazioni
Si apre dall'icona a ingranaggio nella barra superiore; un `dialog` ARIA con focus intrappolato e layout a schede (Esc/clic sullo sfondo per chiudere, tasti freccia per cambiare scheda). Tutte le impostazioni sono stato dell'interfaccia a livello di sessione, salvo diversa indicazione — nessuna di esse modifica i dati per dente o il payload di esportazione.

- **Generale:** sistema di numerazione (FDI/Universal/Palmer), lingua, tema chiaro/scuro, visibilità del pannello informazioni dentali
- **Pannelli:** mostra/nasconde in modo indipendente la scheda Stati per l'intera bocca e la scheda Ortodonzia (entrambe visibili per impostazione predefinita)
- **Dettagli dentali:** livello di dettaglio dell'usura e livello di dettaglio della discromia (simple/complex, ciascuno predefinito complex), notazione delle superfici (simple/full, predefinito full)
- **Carie:** interruttore punteggio ICDAS II (`enableIcdas`), interruttore profondità carie (`cariesDepthEnabled`), granularità carie radicolare (`rootCariesMode`: simple/severity), granularità secondaria/CARS (`secondaryCariesMode`: simple/standard/full), granularità profondità radiografica (`radiographicDepthMode`: off/threeLevel/detailed) — la precedente scheda separata "Carie secondaria" è stata unita a questa, con il controllo CARS posizionato direttamente sopra la profondità radiografica
- **Polpa:** livello di dettaglio pulpare (`pulpDetailLevel`: simple/AAE/latino pratico, predefinito AAE) — controlla quale vocabolario offre il selettore "Stato polpa / endodonzia"; modificarlo aggiorna in tempo reale il riepilogo dell'intera bocca e ogni tooltip aperto
- **Note:** abilita/disabilita le note per dente (`enableNotes`)

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
      language="en"
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
npm run test           # Esegui tutti gli 864 test (1 test aggiuntivo saltato)
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
| `setPulpDetailLevel(level)` | Imposta il vocabolario del selettore di pulpa — `"simple"`, `"aae"` o `"latin"` |
| `getPulpDetailLevel()` | Ottiene il livello di dettaglio pulpare corrente |
| `exportFhir(options?)` | Esporta l'odontogramma come Bundle HL7 FHIR R4 (download JSON). Riferimento `{ subject }` opzionale; altrimenti viene incorporato un Paziente segnaposto |
| `exportImage(format)` | Scarica l'odontogramma come immagine — `"png"` o `"jpg"` |
| `exportSvg()` | Scarica l'odontogramma come SVG scalabile (vettoriale) |
| `importFhirBundle(input)` | Importa un Bundle FHIR R4 (oggetto o stringa JSON) prodotto da questo modulo |
| `setImportFormat(format)` | Imposta il parser per la prossima importazione file — `"status"` o `"fhir"` |
| `startIntroTour()` | Avvia il tour introduttivo interattivo in 12 passi |

### 💾 Formato di esportazione/importazione dello stato
L'esportazione crea un file JSON (versione `2.10`; le importazioni accettano anche le versioni legacy `1.4`, `2.0`, `2.1`, `2.2`, `2.3`, `2.4`, `2.5`, `2.6`, `2.7`, `2.8` e `2.9` e vengono migrate automaticamente) contenente:

**Campi globali:**
- `wisdomVisible` - denti del giudizio visibili
- `showBase` - livello osseo visibile
- `occlusalVisible` - vista occlusale attiva
- `showHealthyPulp` - polpa sana visibile
- `edentulous` - modalità edentulo attiva

**Campi per dente (32 denti):**
- `toothSelection` - tipo base del dente
- `toothSubstrate` - substrato dentale (natural/radix/broken/crownprep), ortogonale a qualsiasi restauro
- `restorationType` - tipo di restauro (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - materiale del restauro (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), abbinato a `restorationType`
- `prosthesis` - asse rimovibile/attacco (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), si esclude reciprocamente con un `restorationType` fisso di crown/bridge
- `crownLeakage` - flag di microinfiltrazione marginale della corona, significativo solo quando `restorationType` è crown o bridge
- `endo` - stato endodontico; si esclude reciprocamente con `pulpDx` (presentati insieme tramite un unico selettore combinato "Stato polpa / endodonzia" — trattare un dente normalizza `pulpDx` a `normal`)
- `mods` - array di modifiche (inflammation, parodontal); `inflammation` è stato ritirato dall'interfaccia sui denti presenti (lì è `apicalDx` a determinare il glifo) ma si applica ancora ai denti mancanti/con alveolo post-estrattivo
- `caries` - superfici con carie attiva
- `cariesActiveDepth` - il valore di profondità ICDAS predisposto dal selettore di profondità carie quando viene applicata una nuova superficie (non è un valore memorizzato per superficie; vedi `cariesSeverity` per il campo memorizzato per superficie)
- `rootCaries` - gravità della carie radicolare (none/active/arrested/active-cavitated)
- `cariesSeverity` - gravità unificata per superficie (0-6): profondità ICDAS su una superficie primaria (senza otturazione), punteggio CARS su una superficie ricorrente (con otturazione)
- `radiographicDepth` - profondità radiografica della carie per superficie (none/E1/E2/D1/D2/D3), indipendente dalla scala visiva ICDAS/CARS
- `fillingMaterial` - materiale dell'otturazione
- `fillingSurfaces` - superfici otturate
- `fillingSurfaceMaterials` - materiale dell'otturazione per superficie (otturazioni miste, es. buccale amalgama + distale composito)
- `fillingDefect` - difetto di otturazione per superficie (none/marginal/fracture/wear), condizionato alla presenza di una superficie otturata, indipendente dalla carie ricorrente
- `pulpDx` - diagnosi pulpare AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); reversible-pulpitis visualizza un glifo ridotto
- `pulpLatin` - sottotipo pulpare in latino pratico (mostrato dal selettore di pulpa solo quando `pulpDetailLevel` è `latin`)
- `apicalDx` - diagnosi apicale che determina il glifo periapicale
- `periapicalType` - sottotipo di lesione periapicale (none/granuloma/cyst), mostrato solo in presenza di parodontite apicale sintomatica/asintomatica; il vecchio valore `abscess` è ancora accettato in importazione
- `resorptionType` - tipo di riassorbimento radicolare (none/internal/external-cervical)
- `periImplant` - stato peri-implantare solo per impianti (none/mucositis/peri-implantitis-mild/-moderate/-severe), stadiazione del World Workshop 2018
- `endoResection` - flag apicectomia
- `fissureSealing` - flag sigillante per solchi
- `calculus` - flag tartaro
- `contactMesial` - perdita del punto di contatto mesiale
- `contactDistal` - perdita del punto di contatto distale
- `wearEdge` - tipo di usura incisale/occlusale (none/attrition/erosion)
- `wearCervical` - tipo di usura cervicale (none/abrasion/abfraction/erosion)
- `discoloration` - causa di discromia per dente (none/tetracycline/fluorosis/nonvital/extrinsic/other), colora il riempimento della corona naturale su un dente-base naturale/dente deciduo senza restauro
- `orthoAppliance` - apparecchio ortodontico (none/bracket/band)
- `orthoDrift` - deriva ortodontica (none/mesial/distal)
- `orthoVertical` - movimento verticale ortodontico (none/extrusion/intrusion)
- `orthoRotation` - flag di rotazione ortodontica
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
- `src/registry/` - registro dichiarativo degli assi clinici: mappature dei campi FHIR, attivazione di clear-set SVG/flag booleani, matrice tipo×materiale del restauro, elenchi di opzioni UI (unica fonte di verità che genera esportazione/importazione, FHIR e interfaccia dei selettori)
- `src/fhir/` - esportazione/importazione HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, sistemi di codici, mappature dei campi, primitive
- `src/bridgeOverlay.ts` - overlay connettore del tratto di ponte multi-dente (geometria a sella sensibile all'arcata)
- `src/SettingsModal.tsx` - finestra di dialogo Impostazioni a schede (Generale/Pannelli/Dettagli dentali/Carie/Polpa/Note)
- `src/__tests__/` + `src/registry/__tests__/` - suite di test Vitest (864 test superati, 1 saltato, in 94 file)
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
