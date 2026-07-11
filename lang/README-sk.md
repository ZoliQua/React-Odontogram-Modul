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

## 🇸🇰 Slovenčina

### 📋 Prehľad
Tento projekt je interaktívny, prehliadačovo orientovaný editor odontogramu, ktorý umožňuje rýchle zaznamenávanie zubného statusu s prehľadným rozhraním. Vykresľuje vrstvené SVG šablóny zubov na reprezentáciu reštaurácií, kazu, endodontického stavu, mobility a ďalších klinických detailov, pričom poskytuje viacnásobný výber, filtre výberu a preddefinované stavové predvoľby.

---
<img width="1728" height="922" alt="react-odontogram-modul-english-preview" src="https://github.com/user-attachments/assets/0d6e076e-a840-408c-93cc-974e0767aaaf" />

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### ✨ Kľúčové funkcie
- 🖱️ Rýchly výber a viacnásobný výber (CMD/CTRL + klik)
- 🦷 Typy zubov: trvalý, mliečny, implantát, subgingiválny, chýbajúci
- 🦷 Substrát zuba (nezávislý od akejkoľvek náhrady): prirodzený, radix (zvyšok koreňa), zlomený, preparovaný na korunku
- 👑 Náhrady podľa typu × materiálu: korunka / inlay / onlay / fazeta / mostík z e.max, zlata, gradie, zirkónu, kovu, kovovo-keramického materiálu, teleskopu alebo dočasného materiálu (onlay je dostupný len v okluzálnom zobrazení) — vyberané z jedného kombinovaného výberu s nízkym počtom klikov „Fix: Korunka – …"; staršie korunky `metal` sa automaticky migrujú na `metal-ceramic` (kovovo-keramickú); implantáty používajú rovnaký model typ × materiál, doplnený o vrstvu konektora implantátu. Výber je obmedzený podľa druhu zuba: implantát ponúka iba korunku/mostík (plus svojich päť možností upevnenia, pozri nižšie); chýbajúci/medzerový zub ponúka iba článok mostíka (plus snímateľnú čiastočnú/celkovú protézu); substrát `radix` úplne skrýva ovládací prvok náhrady (na zvyšku koreňa nemožno zaznamenať žiadnu náhradu)
- 🦿 Snímateľná/náustavcová protetika na vyhradenej osi `prosthesis` (položky „Kivehető:" v kombinovanom výbere): hojivý abutment implantátu, lokátor, lokátor s protézou (overdenture), steg, steg s protézou; zubami podopretá snímateľná čiastočná alebo celková náhrada
- 🌉 Zuby mostíka vykresľujú súčasne korunkový uzáver aj sedlový konektor; prekrytie viaczubového mostíkového úseku vykresľuje jeden súvislý, oblúku prispôsobený konektor cez po sebe idúce zuby mostíka (články + piliere) a medzizubné medzery medzi nimi (horný a dolný oblúk používajú zrkadlenú geometriu sedla, čím zostáva konektor zarovnaný na oboch oblúkoch), zahrnuté v exporte PNG/JPG/SVG; aplikovanie mostíka cez predvoľbu stavov okamžite prepočíta prekrytie
- 🔍 Zaznamenávanie kazu na 6 plochách: meziálne, distálne, bukálne, linguálne, oklúzne, subkoronálne
- 🪥 Materiály výplní na každú plochu: amalgám, kompozit, GIC, dočasný
- 🏥 Jeden zlúčený výber „Stav drene / endo" (zoskupený: vitálna dreň vs. liečená/endo): endodontické stavy (liečivá výplň, koreňová výplň, nekompletná koreňová výplň, sklený kolík, kovový kolík) a AAE diagnóza drene (`pulpDx`: normálna / reverzibilná / ireverzibilná pulpitída / nekróza) sa navzájom vylučujú — zub s ošetreným koreňovým kanálikom (nastavené `endo`) nemôže mať zároveň diagnózu vitálnej drene; pri ošetrení sa `pulpDx` normalizuje na `normal` a glyf chorej drene sa potlačí. Reverzibilná pulpitída sa zobrazuje ako zmenšený glyf drene. Voliteľné 3-úrovňové nastavenie podrobnosti drene (`pulpDetailLevel`: simple / AAE / praktická latinčina) cez `pulpLatin` sprístupňuje 9 praktických latinských podtypov drene (pulpa sana … gangraena pulpae); resekcia a parapulpálny kolík zostávajú samostatnými špeciálnymi indikátormi
- 🦴 Apikálna diagnóza (`apicalDx`: symptomatická/asymptomatická apikálna parodontitída, akútny/chronický apikálny absces, kondenzujúca osteitída) priamo určuje periapikálny glyf; kvalifikátor podtypu lézie granulóm/cysta sa zobrazuje iba pri symptomatickej/asymptomatickej apikálnej parodontitíde (redundantný podtyp „absces" bol odstránený — je už pokrytý apikálnou diagnózou)
- 🩹 Zlúčená karta „Koreň a parodont" (jedna zbaliteľná sekcia pre nálezy koreňa/periapikálnej oblasti a parodontu)
- ⚕️ Modifikácie: periapikálny zápal (zobrazený iba na chýbajúcich zuboch/zuboch s extrakčnou ranou; skrytý na prítomných zuboch, kde periapikálny glyf priamo určuje `apicalDx`, a na implantátoch, kde ho pokrýva `periImplant`), parodontálne ochorenie, stupne mobility (M1/M2/M3, skryté na implantátoch)
- 🦷🔩 Stav peri-implantátu (`periImplant`: `none` / `mucositis` / `peri-implantitis-mild` / `peri-implantitis-moderate` / `peri-implantitis-severe`) — stagingovanie podľa 2018 World Workshop, zobrazené ako vyhradený výber na implantátoch; mukozitída opätovne používa parodontálny glyf ďasna, peri-implantitída pridáva odstupňovanú vrstvu `peri-implant-bone-loss` (priehľadnosť 0,4/0,7/1,0). Implantáty už nezobrazujú glyf periapikálnej lézie — ich zápal sa namiesto toho vyjadruje touto osou — a modifikátorové zaškrtávacie políčka parodontu sú na implantátoch skryté (provizórne premenovanie zaškrtávacieho políčka „Peri-implantitída" bolo zrušené)
- 🏷️ Špeciálne indikátory: potrebná korunka, potrebná výmena korunky, uzavretá medzera po strate zuba, plán extrakcie, zapečatenie fisúr, strata kontaktného bodu
- 👁️ Oklúzny pohľad, zuby múdrosti, prepínače viditeľnosti kosti a drene
- 🔢 12 filtrov výberu (všetky, prítomné, trvalé, mliečne, implantáty, chýbajúce, horné/dolné, predné/moláre)
- 📊 Preddefinované stavové predvoľby (obnoviť, mliečny chrup, zmiešaný chrup, bezzubý)
- 📦 34 preddefinovaných šablón reštaurácií (mostíky, snímateľné protézy, stegové protézy s implantátmi)
- 💾 Export/import stavu v JSON (verzia 2.10; import stále akceptuje staršie verzie 1.4, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8 a 2.9 a automaticky ich migruje, s vlastnými stavmi pluginov a poznámkami ku každému zubu)
- 🔗 Export HL7 FHIR R4 (kolekcia Bundle s Observations pre každý zub, kódovanie zubov ISO 3950 pre trvalý chrup, lokálny systém kódov — mapovanie SNOMED CT plánované)
- ✚ Krížový výber plôch (B/M/O/D/L) pre kaz a výplne
- 🧱 Materiály reštaurácie pre každú plochu (zmiešané výplne, napr. bukálny amalgám + distálny kompozit)
- 🖼️ Export obrázka odontogramu vo formáte PNG/JPG/SVG (na stiahnutie; PNG/JPG rastrovaný z vektorového SVG)
- 🦷 Kaz/sekundárny kaz ako stavový automat na každú plochu: kazivá plocha bez výplne sa zobrazuje ako primárny kaz (priehľadnosť odstupňovaná podľa ICDAS); hneď ako má táto plocha výplň, zobrazuje sa namiesto toho ako sekundárny (rekurentný) kaz (vrstva `subcaries-{surface}`, so skóre CARS) — obidva nikdy nie sú aktívne súčasne na tej istej ploche
- 🎯 Zjednotená závažnosť na plochu (`cariesSeverity`, 0–6, nahrádza pôvodné oddelené polia hĺbky ICDAS a CARS): na primárnej ploche sa číta ako hĺbka ICDAS, na rekurentnej ako pomenované skóre CARS (Zdravý … Rozsiahla kavita), prostredníctvom kontextového popupu, ktorý zobrazuje iba škálu relevantnú pre aktuálny stav plochy
- 🌱 Kaz koreňa (`rootCaries`: none / active / arrested / active-cavitated), aktivujúci vyhradenú vrstvu ilustrácie kazu koreňa s priehľadnosťou závislou od závažnosti (active 0,5 / arrested 0,7 / active-cavitated plná priehľadnosť)
- 📡 Rádiografická hĺbka kazu (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 na plochu), nezávislá od vizuálnej škály závažnosti ICDAS/CARS, zobrazená ako odznak a obojsmerne prenášaná cez vlastný FHIR Observation
- 🎚️ Tri nastavenia podrobnosti kazu (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) a prepínač `cariesDepthEnabled`, ktoré zbaľujú každú škálu do jednoduchšieho výberu bez straty uloženej hodnoty
- 🩹 Súhrnný riadok sekundárneho kazu v paneli výplní: pod ovládacími prvkami výplní vypíše každý vybraný zub so sekundárnym kazom a jeho plochy (napr. „36 (O) má pri výplni nastavený sekundárny kaz.")
- 🪛 Poruchy výplne na každú plochu (`fillingDefect`: none / marginal / fracture / wear) na priamych reštauráciách, nezávislé od sekundárneho kazu — zaznamenávané cez indikátor pre každú plochu na karte Výplne (podľa vzoru indikátora hĺbky kazu, so zvislo usporiadaným zoznamom možností), zobrazené na odontograme a v tooltipe aj v súhrne výplní za celé ústa s explicitným popiskom (napr. „36 (O) – Porucha výplne: O: okrajová"), rovnakým spôsobom, akým je označený sekundárny kaz v riadku Kaz; karta Výplne tiež zobrazuje upozorňujúcu poznámku pre každý vybraný zub so zaznamenanou poruchou výplne (napr. „36 má zaznamenanú poruchu výplne."), paralelne s existujúcou poznámkou o sekundárnom kaze
- 🦷💥 Opotrebenie zuba typizované podľa klinickej príčiny a miesta (`wearEdge`: none / attrition / erosion, incizálne/oklúzne; `wearCervical`: none / abrasion / abfraction / erosion, cervikálne) — nahrádza dva staré prepínače opotrebenia zap/vyp z bruxizmu; zaznamenávané cez dva rozbaľovacie zoznamy v riadku opotrebenia, opätovne používa existujúcu ilustráciu opotrebenia a zobrazuje sa v tooltipe a novej sekcii súhrnu „Opotrebenie" za celé ústa
- 🎨 Zafarbenie zuba podľa príčiny (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) na trvalých aj mliečnych zuboch — zafarbí zobrazenú prirodzenú korunku reprezentatívnou farbou, keď zub nemá náhradu a má prirodzený substrát; zobrazené v tooltipe a novej sekcii súhrnu „Zafarbenie" za celé ústa; dopĺňa sadu povrchových a štrukturálnych nálezov popri poruchách výplne a opotrebení
- ✏️ Predné zuby (rezáky/špičáky) označujú svoju hryzaciu plochu v celom rozhraní ako „incizálnu" (výber, popup, súhrny); uložený kľúč plochy zostáva `occlusal`
- 🔤 Notácia plôch citlivá na polohu zuba (Nastavenia → Detaily zuba → „Notácia plôch", simple/full, predvolené full): v režime full sa písmeno a popisok plochy kazu/výplne riadia zubnou anatómiou — okluzálna → I/incizálna na predných zuboch, bukálna → L/labiálna na predných zuboch, linguálna → P/palatinálna na horných zuboch a L/linguálna na dolných zuboch (meziálna/distálna/subkoronálna nie sú ovplyvnené); v režime simple sa vždy používa všeobecná sada B/M/O/D/L/SC bez ohľadu na polohu zuba. Platí pre súhrn za celé ústa aj pre oba výbery plôch — kazu a poruchy výplne (písmeno + popisok); uložený kľúč plochy nie je ovplyvnený
- 🦷↕️ Ortodontické zaznamenávanie na každý zub (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: boolean) na prítomnom prirodzenom zube (trvalom alebo mliečnom) — opätovne používa nevyužitú ilustráciu ortodoncie z v2.5.0 (žiadne nové SVG); zobrazené na odontograme, v tooltipe a novej sekcii súhrnu „Ortodoncia" za celé ústa
- 🪨 Zubný kameň a resorpcia koreňa typizovaná ako interná alebo externá cervikálna (`resorptionType`)
- 📏 Hĺbka kazu na každú plochu (povrchový / dentín / hlboký), alebo voliteľné skórovanie ICDAS II (0–6) cez `enableIcdas`
- 🩹 Prepínač okrajovej netesnosti korunky, zobrazený len pri korunkovej alebo mostíkovej náhrade
- 🧰 Zjednotená lišta ikon v hornej časti so záložkovým modálnym oknom Nastavenia (Všeobecné / Panely / Detaily zuba / Kaz / Dreň / Poznámky — číslovanie, poznámky, viditeľnosť panelov, ICDAS, prepínač hĺbky kazu, podrobnosť kazu koreňa/rádiografického kazu, úroveň podrobnosti drene, úroveň podrobnosti opotrebenia/zafarbenia zuba, informácie o zuboch)
- 🗂️ Nastavenia → záložka „Panely": nezávisle zobraziť/skryť panely súhrnu za celé ústa Stavy a Ortodoncia
- 🩹 Nastavenia sekundárneho kazu (CARS) zlúčené do záložky Nastavení Kaz, umiestnené nad Rádiografickou hĺbkou (samostatná záložka „Sekundárny kaz" bola zrušená)
- 🎚️ Úroveň podrobnosti detailov zuba (Nastavenia → Detaily zuba): nastavenie simple/complex pre opotrebenie zuba a pre zafarbenie. Jednoduchý režim zobrazuje prepínač áno/nie pre každý nález (opotrebenie zapnuté → attrition/abrasion, zafarbenie zapnuté → other); zložitý režim (predvolený) zachováva rozbaľovacie zoznamy typu/príčiny, pričom uložená hodnota sa pri prepínaní úrovní zachováva
- 📋 Panel informácií o zuboch: živý textový súhrn celého odontogramu (počty zubov, zoznamy prítomných/chýbajúcich, kaz vrátane sekundárneho, výplne, koreňové kanáliky, protetika, implantáty, stav parodontu) — zobrazený predvolene, prepínateľný v Nastaveniach
- 🗂️ Konsolidovaný rozbaľovací zoznam Exportu (Stav JSON / FHIR / PNG / JPG)
- 📥 Rozbaľovací zoznam Importu s importom FHIR (spätne načítava exportované Bundles)
- ⏳ Prekrytie priebehom počas exportu obrázka
- 🎓 12-krokový interaktívny úvodný sprievodca
- 🔢 Tri systémy číslovania (FDI, Universal, Palmer)
- 🌐 I18n (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) s prepínačom jazyka (190+ prekladových kľúčov na jazyk)
- 🌗 Podpora tmavého režimu s prepínacím tlačidlom (samostatný alebo riadený nadradenou aplikáciou)
- 🎨 Vlastná konfigurácia témy (prop `themeConfig`) s CSS vlastnými vlastnosťami (`--odon-*`)
- 📱 Mobilné dotykové UX: vyskakovacie okno pre priblíženie kliknutím, kontextová ponuka dlhým stlačením, priblíženie štipnutím, WCAG 44px dotykové ciele, navigácia prepínania oblúka
- 🔌 Vlastný SVG systém pluginov: vkladanie vizuálnych prekrytí, vlastný stav pre každý zub, podpora exportu/importu JSON
- ⚠️ Varovania validácie stavu pre nekompatibilné kombinácie zubných stavov
- 🏷️ Automatický tooltip stavu na dlaždiciach zubov (zobrazuje všetky aktívne stavy)
- 🩺 Modernizovaný tooltip pre každý zub a panel súhrnu za celé ústa: obidva zobrazujú kompletnú sadu klinických nálezov (diagnóza drene/apikálna + podtyp lézie, resorpcia koreňa, stav peri-implantátu, odstupňovaný kaz koreňa, zubný kameň, okrajová netesnosť korunky, zlomenina, strata kontaktu, typizované okrajové/cervikálne opotrebenie), s vyhradenou sekciou „Diagnózy" v paneli, vyhradenou sekciou „Opotrebenie" a hrubým kvalifikátorom závažnosti kazu (povrchový/stredný/hlboký)
- ♿ Klávesnicová prístupnosť (WCAG): ARIA role listbox/option, výber klávesmi Enter/Medzera, navigácia šípkami, obrysy focus-visible
- 🔒 Režim iba na čítanie: zakázanie všetkých interakcií pre prípady tlače/správ/prezerania
- ✨ Animácie výberu: pulzujúci prerušovaný okraj a žiariaci tieň na vybraných zuboch (s podporou prefers-reduced-motion)
- 📝 Poznámky ku každému zubu: dvojklik pre pridanie/úpravu poznámok, ikona poznámky vedľa čísla zuba, tooltip pri najetí s textom poznámky, export/import JSON
- 🧪 864 prebiehajúcich automatizovaných testov (1 ďalší test preskočený) (Vitest) v 94 testovacích súboroch pokrývajúcich číslovanie, preklady, predvoľby, i18n, komponent App, tému, dotyk, pluginy, prístupnosť a paritu klinických osí/diagnóz
- 📖 Dokumentácia API TypeDoc s komentármi JSDoc pre všetky verejné exporty (`npm run docs`)

### 📦 Moduly
- 🦷 Mriežka odontogramu a rozhranie dlaždíc zubov
- 🎛️ Ovládacie prvky a stavový panel
- 🎨 SVG vrstevnací modul a šablóny
- 🔢 Číslovanie zubov a mapovanie popiskov (FDI/Universal/Palmer)
- 🌐 Lokalizácia (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- 💾 Export/import stavu
- 📋 Doplnky stavu: preddefinované šablóny reštaurácií
- 🎨 Konfigurácia témy: prispôsobiteľná farebná paleta cez CSS vlastnosti `--odon-*`
- 📱 Mobilné dotykové interakcie (priblíženie kliknutím, dlhé stlačenie, priblíženie štipnutím, prepínanie oblúka)
- 🔌 Vlastný SVG systém pluginov
- ⚠️ Systém validácie stavu a tooltipov
- ♿ Klávesnicová prístupnosť a podpora ARIA
- 🔒 Režim iba na čítanie
- ✨ Animácie výberu
- 📝 Systém poznámok ku každému zubu
- 🧪 Automatizovaná testovacia sada (Vitest + Testing Library)

### 🛠️ Ovládacie prvky rozhrania

**🔝 Horná lišta:**
- Prepínač jazyka (rozbaľovací zoznam HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- Prepínacie tlačidlo tmavého režimu (ikona slnka/mesiaca, prepína medzi svetlou a tmavou témou)
- Prepínač systému číslovania (rozbaľovací zoznam FDI/Universal/Palmer)
- Tlačidlá Exportovať stav / Importovať stav

**📊 Hlavička grafu:**
- Prepínač oklúzneho pohľadu
- Prepínač viditeľnosti zubov múdrosti
- Prepínač viditeľnosti kosti
- Prepínač viditeľnosti drene
- Tlačidlo zrušiť výber

**🔍 Filtre výberu:**
- Vybrať všetky / Všetky prítomné / Trvalé / Mliečne / Implantáty / Všetky chýbajúce
- Vybrať horné / Horné 6 predných / Horné moláre
- Vybrať dolné / Dolné 6 predných / Dolné moláre

**📋 Stavové predvoľby:**
- Obnoviť všetko (obnoviť ústa)
- Mliečny chrup
- Zmiešaný chrup
- Prepínač bezzubého

**📦 Rozbaľovací zoznam doplnkov stavu:**
- Horné/dolné zirkónové mostíky (12-22, 13-23, 16-26, celý oblúk)
- Horné/dolné kovové mostíky (12-22, 13-23, 16-26, celý oblúk)
- Horné/dolné čiastočné snímateľné protézy
- Horné/dolné celkové snímateľné protézy
- Horné/dolné stegové protézy s implantátmi

**🦷 Panel editora zuba** (pre vybraný zub/zuby, zoskupené do zbaliteľných kariet):
- **Základný riadok:** výber zuba (základný typ vrátane variantov zlomenej korunky) a substrát zuba (natural/radix/broken/crownprep)
- **Riadok náhrady:** kombinovaný rozbaľovací zoznam náhrady „Fix: …" / „Kivehető: …" (pevné možnosti `restorationType`×`restorationMaterial` plus možnosti upevnenia/snímateľné z osi `prosthesis`, obmedzené podľa druhu zuba); zaškrtávacie políčko okrajovej netesnosti korunky (len korunka/mostík); zaškrtávacie políčka miesta zlomenej korunky; prepínače potrebná korunka / potrebná výmena korunky
- **Riadok opotrebenia a zafarbenia:** rozbaľovací zoznam typu incizálneho/oklúzneho opotrebenia, rozbaľovací zoznam typu cervikálneho opotrebenia, rozbaľovací zoznam príčiny zafarbenia (každý sa v Nastaveniach → Detaily zuba → jednoduchom režime prepína na jednoduchý prepínač áno/nie)
- **Karta Ortodoncia:** pomôcka, meziálny/distálny drift, vertikálny pohyb (extrúzia/intrúzia), prepínač rotácie — zobrazená na prítomnom prirodzenom zube
- **Karta Kaz:** rozbaľovací zoznam režimu hĺbky kazu, zaškrtávacie políčko subkoronálneho kazu, rozbaľovací zoznam závažnosti kazu koreňa a výber plôch kazu B/M/O/D/L s kontextovým popupom hĺbky ICDAS/CARS a odznakom rádiografickej hĺbky
- **Karta Výplne:** rozbaľovací zoznam materiálu výplne, výber výplní na každú plochu (s materiálom pre každú plochu), indikátor poruchy výplne pre každú plochu (marginal/fracture/wear), upozorňujúce poznámky o sekundárnom kaze a poruche výplne
- **Karta Koreň a parodont:** zlúčený výber „Stav drene / endo", výber apikálnej diagnózy, výber podtypu periapikálnej lézie (iba symptomatická/asymptomatická apikálna parodontitída), výber typu resorpcie koreňa, výber stupňa mobility, výber stavu peri-implantátu (iba implantáty)
- **Špeciálne indikátory:** plán extrakcie/rana, uzavretá medzera, zapečatenie fisúr, strata kontaktného bodu, zubný kameň, parapulpálny kolík, endo resekcia, pilier mostíka

### 🦷 Typy a stavy zubov

**Výber zuba (základný typ):**
| Hodnota | Popis |
|---|---|
| `none` | Chýbajúci zub |
| `tooth-base` | Trvalý zub |
| `milktooth` | Mliečny (dočasný) zub |
| `implant` | Dentálny implantát |
| `tooth-under-gum` | Subgingiválny (nevyrastený) zub |

**Varianty zlomeného zuba:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Substrát zuba (trvalé zuby):**
`natural` (predvolené), `radix` (zvyšok koreňa), `broken`, `crownprep` (preparovaná na korunku)

**Typ náhrady (trvalé zuby):**
`none`, `crown`, `inlay`, `onlay` (len okluzálne zobrazenie), `veneer`, `bridge`

**Materiál náhrady (trvalé zuby):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (staršie korunky `metal` sa migrujú sem), `telescope`, `temporary`

**Možnosti náhrady sú obmedzené podľa druhu zuba** (`restorationOptions()` v `src/registry/restorations.ts`): implantát ponúka iba typy náhrady `crown`/`bridge` (doplnené o vrstvu konektora implantátu) plus päť nižšie uvedených položiek upevnenia `prosthesis`; chýbajúci/medzerový zub ponúka iba článok `bridge` plus dve položky snímateľnej protézy `prosthesis`; substrát `radix` úplne skrýva ovládací prvok náhrady. Staršie ploché polia `crownMaterial`/`bridgeUnit` (hodnoty upevnenia implantátu/mostíka spred v1.14) sú z aktívneho modelu zrušené — akceptované sú už iba ako migračná cesta na čítanie pre staré dáta.

**Prosthesis** (`prosthesis`; nezávislá os snímateľnej protetiky/upevnenia, zobrazovaná ako položky „Kivehető:" v kombinovanom rozbaľovacom zozname náhrady):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (upevnenia implantátu, s protézou alebo bez nej), `removable-partial`, `removable-full` (zubami podopreté protézy na chýbajúcom/medzerovom zube). Zub má buď pevnú náhradu, alebo protetiku, nikdy oboje — nastavenie jednej vynuluje druhú.

**Okrajová netesnosť korunky** (`crownLeakage`; boolean): zobrazená iba keď je `restorationType` typu `crown` alebo `bridge`; aktivuje vrstvu ilustrácie `crown-leakage`.

**Endodontické možnosti (trvalé zuby):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodontické možnosti (mliečne zuby):**
`none`, `endo-medical-filling`

Polia `endo` a `pulpDx` sa zobrazujú cez jeden zlúčený výber „Stav drene / endo" (`<select>`, zoskupený: vitálna dreň vs. liečená/endo) a navzájom sa vylučujú — výber ošetreného stavu (`endo != none`) vynuluje `pulpDx` na `normal` a výber diagnózy drene vynuluje `endo` na `none`.

**Materiály výplní (trvalé zuby):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiály výplní (mliečne zuby):**
`composite`, `gic`, `temporary`

**Plochy výplní/kazu:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (iba kaz)

**Modifikácie:**
`inflammation` (periapikálny), `parodontal` (parodontálny), `mobility` (M1/M2/M3)

**Typ periapikálnej lézie** (`periapicalType`; upresňuje periapikálny glyf, zobrazený iba pri symptomatickej/asymptomatickej apikálnej parodontitíde):
`none`, `granuloma`, `cyst` — možnosti na zaznamenávanie; staršia hodnota `abscess` sa stále akceptuje/ukladá, ale vo výbere sa už neponúka, keďže duplikuje apikálnu diagnózu. Pri importe sa zahodí: zahrnutá do `apicalDx`, ak zub má nastavený modifikátor zápalu, inak vynulovaná na `none`

**Diagnóza drene** (terminológia AAE; `pulpDx`):
`normal`, `reversible-pulpitis` (zobrazuje zmenšený glyf drene), `irreversible-pulpitis`, `necrosis` — navzájom sa vylučuje s `endo`; na zube s ošetreným koreňovým kanálikom sa normalizuje na `normal`

**Diagnóza drene, praktická latinčina** (`pulpLatin`; výber drene ju zobrazuje iba keď je `pulpDetailLevel` nastavené na `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Úroveň podrobnosti drene** (`pulpDetailLevel`, globálne nastavenie): `simple`, `aae` (predvolené), `latin` — určuje, aký slovník drene výber ponúka

**Apikálna diagnóza** (`apicalDx`; určuje periapikálny glyf):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Typ resorpcie koreňa** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Stav peri-implantátu** (`periImplant`; iba implantáty, stagingovanie podľa 2018 World Workshop): `mucositis` opätovne používa parodontálny glyf ďasna; `peri-implantitis-*` pridáva vrstvu `peri-implant-bone-loss` s priehľadnosťou odstupňovanou podľa závažnosti (mierna 0,4 / stredná 0,7 / ťažká 1,0). Implantáty už nezobrazujú glyf periapikálnej lézie (ich zápal sa namiesto toho vyjadruje touto osou) a zaškrtávacie políčka `mods` zápal/parodont sú na implantátoch skryté:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Závažnosť kazu** (`cariesSeverity`; zjednotené pole na plochu, `0`–`6`): na ploche bez výplne sa číta ako škála hĺbky ICDAS (`superficial` / `dentin` / `deep`, alebo surové kódy ICDAS II `0–6`, keď je zapnuté `enableIcdas`) a zobrazuje primárnu vrstvu `caries-{surface}`; na ploche s výplňou sa číta ako pomenované skóre CARS (`0` zdravý … `6` rozsiahla kavita) a namiesto toho zobrazuje vrstvu `subcaries-{surface}` (sekundárny kaz) — plocha nikdy nie je primárna a rekurentná zároveň

**Kaz koreňa** (`rootCaries`; aktivuje vrstvu ilustrácie `caries-root` na prítomnom zube, s priehľadnosťou závislou od závažnosti — `active` 0,5 / `arrested` 0,7 / `active-cavitated` plná priehľadnosť):
`none`, `active`, `arrested`, `active-cavitated`

**Rádiografická hĺbka kazu** (`radiographicDepth`; na plochu, nezávislá od vizuálnej škály ICDAS/CARS `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Nastavenia podrobnosti kazu** (globálne): `secondaryCariesMode` (`simple`/`standard`/`full`, predvolené `standard`), `rootCariesMode` (`simple`/`severity`, predvolené `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, predvolené `off`), `cariesDepthEnabled` (boolean, predvolené `true`) — každé zbaľuje svoju škálu do jednoduchšieho výberu bez zmeny uloženej hodnoty

**Špeciálne indikátory:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Opotrebenie zuba** (`wearEdge`, `wearCervical`; klinický typ na každé miesto, obmedzené na tooth-base + bez náhrady + prirodzený substrát; vykresľujú existujúce vrstvy `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Zafarbenie** (`discoloration`; príčina na každý zub, obmedzené na prirodzený tooth-base alebo mliečny zub + bez náhrady + prirodzený substrát; zafarbuje výplň zobrazenej prirodzenej korunky — žiadne nové SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Porucha výplne** (`fillingDefect`; na každú plochu, nález priamej reštaurácie nezávislý od sekundárneho kazu — obmedzený na plochy prítomné v `fillingSurfaceMaterials`; vykresľuje vrstvu ilustrácie `defect-{surface}`):
`none`, `marginal`, `fracture`, `wear`

**Ortodoncia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; na každý zub, obmedzené na prítomný prirodzený zub — trvalý alebo mliečny):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (glyf šípky nahor), `intrusion` (glyf šípky nadol) — `orthoRotation`: boolean

**Nastavenia detailov zuba / notácie** (globálne nastavenia relácie, Nastavenia → Detaily zuba): `wearDetailLevel` a `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, predvolené `complex` — jednoduchý režim zobrazuje prepínač áno/nie namiesto plného rozbaľovacieho zoznamu typu/príčiny, bez zmeny uloženej hodnoty) a `surfaceNotation` (`simple`/`full`, predvolené `full` — určuje, či sú písmená/popisky plôch kazu/výplne citlivé na polohu zuba; pozri „Notácia plôch citlivá na polohu zuba" vyššie)

### ⚙️ Nastavenia
Otvárané cez ikonu ozubeného kolieska na hornej lište; dialóg s uzamknutým fokusom, ARIA `dialog` so záložkovým rozložením (Esc/klik mimo okna na zatvorenie, šípky na prepínanie záložiek). Všetky nastavenia sú iba stav rozhrania na úrovni relácie, pokiaľ nie je uvedené inak — žiadne z nich nemenia dáta jednotlivých zubov ani exportný payload.

- **Všeobecné:** systém číslovania (FDI/Universal/Palmer), jazyk, tmavá/svetlá téma, viditeľnosť panela informácií o zuboch
- **Panely:** nezávisle zobraziť/skryť kartu súhrnu za celé ústa Stavy a kartu Ortodoncia (obe predvolene viditeľné)
- **Detaily zuba:** úroveň podrobnosti opotrebenia a úroveň podrobnosti zafarbenia (simple/complex, obe predvolene complex), notácia plôch (simple/full, predvolené full)
- **Kaz:** prepínač skórovania ICDAS II (`enableIcdas`), prepínač hĺbky kazu (`cariesDepthEnabled`), podrobnosť kazu koreňa (`rootCariesMode`: simple/severity), podrobnosť sekundárneho kazu/CARS (`secondaryCariesMode`: simple/standard/full), podrobnosť rádiografickej hĺbky (`radiographicDepthMode`: off/threeLevel/detailed) — bývalá samostatná záložka „Sekundárny kaz" je zlúčená do tejto, pričom ovládací prvok CARS je umiestnený priamo nad rádiografickou hĺbkou
- **Dreň:** úroveň podrobnosti drene (`pulpDetailLevel`: simple/AAE/praktická latinčina, predvolené AAE) — určuje, aký slovník ponúka výber „Stav drene / endo"; zmena okamžite obnoví súhrn za celé ústa a každý otvorený tooltip
- **Poznámky:** povoliť/zakázať poznámky ku každému zubu (`enableNotes`)

### 🖼️ Systém SVG šablón

**Šablóny zubov** (v `src/assets/teeth-svgs/`):
| Šablóna | Zuby, ktoré ju používajú |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (rezáky) |
| `13.svg` | 13, 23, 33, 43 (špičáky) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (premoláre) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (moláre) |

Šablóny sú pre dolnú čeľusť otočené o 180 stupňov a pre ľavú stranu horizontálne zrkadlové.

**Ikony SVG** (v `src/assets/icon-svgs/`):
`icon_8.svg` (múdrosť), `icon_gum.svg` (kosť), `icon_no_selection.svg` (zrušiť), `icon_occl.svg` (oklúzny pohľad), `icon_pulp.svg` (dreň)

### 🔢 Systémy číslovania

**FDI (ISO 3950):** Trvalé zuby 11-18, 21-28, 31-38, 41-48. Mliečne zuby 51-55, 61-65, 71-75, 81-85.

**Universal (USA):** Trvalé zuby číslované 1-32. Mliečne zuby označené písmenami A-T.

**Palmer (Zsigmondy-Palmer):** Formát kvadrant + pozícia (napr. UR-1, LL-5). Mliečne zuby používajú písmená A-E na kvadrant.

### 🚀 Použitie
Vývoj:
```bash
npm install
npm run dev
```
Zostavenie:
```bash
npm run build
```
Náhľad:
```bash
npm run preview
```

### 🔗 Integrácia
Komponent je možné vložiť do ľubovoľnej React aplikácie.
Príklad:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="sk"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Integrácia tmavého režimu:**
- **Samostatný režim:** Vynechajte prop `darkMode` — komponent spravuje vlastný stav témy cez prepínacie tlačidlo v hornej lište a pridáva/odstraňuje triedu `.dark` na `<html>`.
- **Riadený režim:** Odovzdajte `darkMode` a `onDarkModeChange` — nadradená aplikácia riadi tému. Prepínacie tlačidlo sa stále zobrazuje, ale volá `onDarkModeChange` namiesto správy interného stavu. Nadradená aplikácia je zodpovedná za pridávanie/odstraňovanie triedy `.dark` na `<html>`.

**Vlastná téma:**
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

**Integrácia pluginu:**
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

### 🧪 Testovanie
```bash
npm run test           # Spustiť všetkých 864 testov (1 ďalší test preskočený)
npm run test:watch     # Sledovací režim
npm run test:coverage  # Správa pokrytia
```

### 📖 Dokumentácia API
```bash
npm run docs           # Generovať dokumentáciu TypeDoc v docs/
```

### 📡 Verejné API

**Props komponentu:**

| Prop | Typ | Predvolené | Popis |
|---|---|---|---|
| `language` | `string` | `'hu'` | Jazyk rozhrania (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Spätné volanie pri zmene jazyka |
| `numberingSystem` | `string` | `'FDI'` | Systém číslovania (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Spätné volanie pri zmene číslovania |
| `darkMode` | `boolean` | `undefined` | Stav tmavého režimu. Vynechajte pre samostatný režim. |
| `onDarkModeChange` | `(dark) => void` | — | Spätné volanie pri prepnutí tmavého režimu. Vyžadované pre riadený režim. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Vlastné prepísanie farieb cez CSS vlastné vlastnosti (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Vlastné SVG pluginy pre vizuálne prekrytia a vlastný stav každého zuba. |
| `readOnly` | `boolean` | `undefined` | Zakázanie všetkých interakcií (klik, dotyk, klávesnica). Užitočné pre zobrazenia tlače/správ. |
| `enableNotes` | `boolean` | `undefined` | Povolenie poznámok ku každému zubu. Dvojklik na zub pre pridanie/úpravu poznámok. |

**Exportované funkcie pre externú kontrolu:**

| Funkcia | Popis |
|---|---|
| `initOdontogram()` | Inicializovať modul a vykresliť všetky zuby |
| `destroyOdontogram()` | Vyčistiť modul a odstrániť poslucháčov udalostí |
| `setNumberingSystem(system)` | Prepínanie medzi FDI, Universal, Palmer |
| `clearSelection()` | Zrušiť výber všetkých zubov |
| `setOcclusalVisible(on)` | Prepínanie oklúzneho pohľadu zap/vyp |
| `setWisdomVisible(on)` | Zobraziť/skryť zuby múdrosti |
| `setShowBase(on)` | Zobraziť/skryť vrstvu kosti |
| `setHealthyPulpVisible(on)` | Zobraziť/skryť zdravú dreň |
| `registerPlugins(plugins)` | Registrovať vlastné SVG pluginy |
| `setPluginState(toothNo, pluginId, value)` | Nastaviť vlastný stav pluginu pre zub |
| `getPluginState(toothNo, pluginId)` | Získať vlastný stav pluginu pre zub |
| `getToothStateSummary(toothNo)` | Získať lokalizovaný súhrn všetkých aktívnych stavov |
| `getOdontogramSummary()` | Získať štruktúrovaný, lokalizovaný textový súhrn celého odontogramu (počty, sekcie) |
| `onStateChange(callback)` | Prihlásiť sa na odber zmien stavu; vracia funkciu na odhlásenie |
| `setReadOnly(value)` | Povolenie/zakázanie režimu iba na čítanie |
| `getReadOnly()` | Získať aktuálny stav iba na čítanie |
| `setNotesEnabled(value)` | Povolenie/zakázanie poznámok ku každému zubu |
| `getNotesEnabled()` | Získať aktuálny stav povolenosti poznámok |
| `setPulpDetailLevel(level)` | Nastaviť slovník výberu drene — `"simple"`, `"aae"` alebo `"latin"` |
| `getPulpDetailLevel()` | Získať aktuálnu úroveň podrobnosti drene |
| `exportFhir(options?)` | Export odontogramu ako kolekcia HL7 FHIR R4 Bundle (stiahnutie JSON). Voliteľná referencia `{ subject }`; inak je vložený zástupný Patient |
| `exportImage(format)` | Stiahnuť odontogram ako obrázok — `"png"` alebo `"jpg"` |
| `exportSvg()` | Stiahnuť odontogram ako škálovateľný SVG (vektor) |
| `importFhirBundle(input)` | Importovať FHIR R4 Bundle (objekt alebo reťazec JSON) produkovaný týmto modulom |
| `setImportFormat(format)` | Nastaviť analyzátor pre nasledujúci import súboru — `"status"` alebo `"fhir"` |
| `startIntroTour()` | Spustiť 12-krokový interaktívny úvodný sprievodca |

### 💾 Formát exportu/importu stavu
Export vytvorí súbor JSON (verzia `2.10`; import tiež akceptuje staršie verzie `1.4`, `2.0`, `2.1`, `2.2`, `2.3`, `2.4`, `2.5`, `2.6`, `2.7`, `2.8` a `2.9` a automaticky ich migruje) obsahujúci:

**Globálne polia:**
- `wisdomVisible` - zuby múdrosti viditeľné
- `showBase` - vrstva kosti viditeľná
- `occlusalVisible` - oklúzny pohľad aktívny
- `showHealthyPulp` - zdravá dreň viditeľná
- `edentulous` - bezzubý režim aktívny

**Polia pre každý zub (32 zubov):**
- `toothSelection` - základný typ zuba
- `toothSubstrate` - substrát zuba (natural/radix/broken/crownprep), nezávislý od akejkoľvek náhrady
- `restorationType` - typ náhrady (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - materiál náhrady (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), spárovaný s `restorationType`
- `prosthesis` - os snímateľnej protetiky/upevnenia (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), navzájom sa vylučuje s pevným `restorationType` typu korunka/mostík
- `crownLeakage` - príznak okrajovej netesnosti korunky, zmysluplný iba keď je `restorationType` typu korunka alebo mostík
- `endo` - endodontický stav; navzájom sa vylučuje s `pulpDx` (zobrazované spoločne cez jeden zlúčený výber „Stav drene / endo" — ošetrenie zuba normalizuje `pulpDx` na `normal`)
- `mods` - pole modifikácií (zápal, parodontálny); `inflammation` je z rozhrania na prítomných zuboch zrušený (periapikálny glyf tam určuje `apicalDx`), ale stále sa vzťahuje na chýbajúce zuby/zuby s extrakčnou ranou
- `caries` - aktívne plochy kazu
- `cariesActiveDepth` - hodnota hĺbky ICDAS pripravená výberom hĺbky kazu pri aplikovaní novej plochy (nie je uložená hodnota pre každú plochu; pozri `cariesSeverity` pre uložené pole pre každú plochu)
- `rootCaries` - závažnosť kazu koreňa (none/active/arrested/active-cavitated)
- `cariesSeverity` - zjednotená závažnosť na každú plochu (0-6): hĺbka ICDAS na primárnej (bez výplne) ploche, skóre CARS na rekurentnej (s výplňou) ploche
- `radiographicDepth` - rádiografická hĺbka kazu na každú plochu (none/E1/E2/D1/D2/D3), nezávislá od vizuálnej škály ICDAS/CARS
- `fillingMaterial` - materiál výplne
- `fillingSurfaces` - plombované plochy
- `fillingSurfaceMaterials` - materiál výplne pre každú plochu (zmiešané výplne, napr. bukálny amalgám + distálny kompozit)
- `fillingDefect` - porucha výplne pre každú plochu (none/marginal/fracture/wear), obmedzená na plombované plochy, nezávislá od sekundárneho kazu
- `pulpDx` - AAE diagnóza drene (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); reversible-pulpitis zobrazuje zmenšený glyf
- `pulpLatin` - praktický latinský podtyp drene (zobrazený vo výbere drene iba keď je `pulpDetailLevel` nastavené na `latin`)
- `apicalDx` - apikálna diagnóza určujúca periapikálny glyf
- `periapicalType` - podtyp periapikálnej lézie (none/granuloma/cyst), zobrazený iba pri symptomatickej/asymptomatickej apikálnej parodontitíde; staršia hodnota `abscess` je pri importe stále akceptovaná
- `resorptionType` - typ resorpcie koreňa (none/internal/external-cervical)
- `periImplant` - stav peri-implantátu iba pre implantáty (none/mucositis/peri-implantitis-mild/-moderate/-severe), stagingovanie podľa 2018 World Workshop
- `endoResection` - príznak apikektómie
- `fissureSealing` - príznak zapečatenia fisúr
- `calculus` - príznak zubného kameňa
- `contactMesial` - strata meziálneho kontaktného bodu
- `contactDistal` - strata distálneho kontaktného bodu
- `wearEdge` - typ incizálneho/oklúzneho opotrebenia (none/attrition/erosion)
- `wearCervical` - typ cervikálneho opotrebenia (none/abrasion/abfraction/erosion)
- `discoloration` - príčina zafarbenia zuba (none/tetracycline/fluorosis/nonvital/extrinsic/other), zafarbuje výplň prirodzenej korunky na prirodzenom tooth-base/mliečnom zube bez náhrady
- `orthoAppliance` - ortodontická pomôcka (none/bracket/band)
- `orthoDrift` - ortodontický drift (none/mesial/distal)
- `orthoVertical` - ortodontický vertikálny pohyb (none/extrusion/intrusion)
- `orthoRotation` - príznak ortodontickej rotácie
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - miesta zlomenín
- `extractionWound` - poextrakčná rana
- `extractionPlan` - plánovaná extrakcia
- `parapulpalPin` - príznak parapulpálneho kolíka
- `bridgePillar` - pilierový zub mostíka
- `mobility` - stupeň mobility (none/m1/m2/m3)
- `crownNeeded` - indikátor potreby korunky
- `crownReplace` - indikátor potreby výmeny korunky
- `missingClosed` - uzavretá medzera po extrakcii
- `customStates` - vlastné stavy pluginov (objekt, kľúčovaný ID pluginu)
- `note` - textová poznámka ku každému zubu (reťazec, voliteľný — prítomný iba keď nie je prázdny)

### 📁 Štruktúra priečinkov
- `src/App.tsx` - rozhranie shellu, ovládacie prvky hornej lišty, prepínač jazyka/číslovania/tmavého režimu/témy/pluginu
- `src/odontogram.ts` - SVG vrstevnací modul, správa stavu zubov, dotykové interakcie, prekrytia pluginov, zapojenie rozhrania
- `src/plugin.ts` - typ `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, priority z-indexu `LAYER_Z`
- `src/theme.ts` - typ `OdontogramThemeConfig` a pomocná funkcia `applyThemeConfig()`
- `src/status_extras.ts` - 34 preddefinovaných šablón reštaurácií (mostíky, protézy, stegové konštrukcie)
- `src/i18n/` - preklady (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) a i18n hook
- `src/utils/numbering.ts` - konverzia číslovania FDI, Universal, Palmer
- `src/registry/` - deklaratívny register klinických osí: mapovania polí FHIR, aktivácia SVG-clear-set/boolean príznakov, matica typ×materiál náhrady, zoznamy možností rozhrania (jediný zdroj pravdy generujúci export/import, FHIR aj rozhranie výberov)
- `src/fhir/` - export/import HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, systémy kódov, mapovania polí, primitíva
- `src/bridgeOverlay.ts` - prekrytie konektora viaczubového mostíkového úseku (geometria sedla prispôsobená oblúku)
- `src/SettingsModal.tsx` - záložkový dialóg Nastavenia (Všeobecné/Panely/Detaily zuba/Kaz/Dreň/Poznámky)
- `src/__tests__/` + `src/registry/__tests__/` - testovacia sada Vitest (864 prebiehajúcich testov, 1 preskočený, v 94 súboroch)
- `src/assets/teeth-svgs/` - SVG šablóny zubov (6 súborov: rezáky, špičáky, premoláre, moláre + oklúzne pohľady)
- `src/assets/icon-svgs/` - SVG ikony panela nástrojov (5 súborov)

### ⚙️ Technologický zásobník
- React 18 + Vite + TypeScript
- Tailwind CSS pre štýlovanie rozhrania
- Vrstvenie SVG cez manipuláciu DOM (nie React stav pre výkon)
- Ľahký vlastný systém i18n
- Vitest + Testing Library pre automatizované testy
- TypeDoc pre dokumentáciu API
- Vite alias cesty: `@` mapovaný na `./src`

### 📝 Poznámky
- SVG šablóny sa načítavajú z `src/assets/teeth-svgs` a `src/assets/icon-svgs`, takže statický hosting musí poskytovať priečinok public.
- Modul odontogramu používa vlastný interný stav (nie React stav) pre výkon a jednoduchosť.
- Mliečne zuby majú obmedzenú sadu dostupných materiálov (žiadne amalgámové výplne, žiadne endodontické kolíky).
- Implantátové zuby majú inú sadu možností korunky/abutmentu ako prirodzené zuby.

### 📖 Ako citovať

Ak tento modul použijete vo svojej práci, prosím, citujte ho.

**Táto verzia (v1.10.0):**
> Dul, Z. (2026). *React Odontogram Modul* (v1.10.0). Zenodo. https://doi.org/10.5281/zenodo.21156788

**Všetky verzie (konceptové DOI):** https://doi.org/10.5281/zenodo.21156787

Strojovo čitateľné citačné metadáta sú v súbore [`CITATION.cff`](../CITATION.cff).
