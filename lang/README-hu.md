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

## 🇭🇺 Magyar

### 📋 Áttekintés
Ez a projekt egy interaktív, böngészőben futó odontogram szerkesztő, amely a fogazati státuszrögzítést áttekinthető kezelőfelülettel támogatja. A rendszer rétegzett SVG fogsablonok segítségével jeleníti meg a pótlásokat, szuvasodásokat, endodonciai állapotokat, mobilitást és egyéb klinikai jellemzőket, miközben többfogos kiválasztást, kiválasztási szűrőket és előre definiált státusz mintákat is biztosít.

---
<img width="1725" height="913" alt="react-odontogram-modul-hungarian-preview" src="https://github.com/user-attachments/assets/ce7af57c-dc5a-4745-b861-4b85854dbd2e" />

🔗 **Test URL:** https://react-odontogram-modul.vercel.app/

---

### ✨ Főbb funkciók
- 🖱️ Gyors fogkijelölés és többfogos kiválasztás (CMD/CTRL + kattintás)
- 🦷 Fogtípusok: maradó, tejfog, implantátum, ínyalatti, hiányzó
- 🦷 Fogszubsztrátum (bármely pótlástól függetlenül): természetes, radix (gyökércsonk), törött, koronára előkészített
- 👑 Pótlások típus × anyag szerint: korona / inlay / onlay / héj (veneer) / híd e.max, arany, gradia, cirkon, fém, fémkerámia, teleszkópos vagy ideiglenes anyagból (az onlay csak okkluzális nézetben érhető el) — egyetlen kombinált, kevés kattintást igénylő „Fix: Korona – …” választóból kiválasztva; a korábbi `metal` koronák automatikusan `metal-ceramic` (fémkerámia) típusra migrálódnak; az implantátumok ugyanazt a típus × anyag modellt használják, kiegészítve egy implantátum-csatlakozó réteggel. A választó a fog típusától függően szűkül: implantátum esetén csak korona/híd választható (plusz az alábbi öt csatlakozási lehetőség), hiányzó/foghiány fog esetén csak híd-pontik (plusz kivehető részleges/teljes fogsor), `radix` szubsztrátum esetén a pótlás-választó teljesen elrejtve (gyökércsonkra nem rögzíthető pótlás)
- 🦿 Kivehető/csatlakozós protetika a dedikált `prosthesis` tengelyen (a kombinált választó „Kivehető:” bejegyzései): implantátum gyógyuló csavarja, lokátor, lokátor protézissel (overdenture), bár, bár protézissel; fogtámasztékú kivehető részleges vagy teljes fogsor
- 🌉 A hídtag fogak megjelenítik mind a koronát, mind a nyeregpántos (saddle) csatlakozót; egy több fogra kiterjedő híd-overlay egyetlen folytonos, ívhez igazodó csatlakozót jelenít meg az egymást követő hídtagokon (pontikok + pillérek) és a köztük lévő fogközi réseken keresztül (a felső és alsó fogsor tükrözött nyereg-geometriát használ, így a csatlakozó mindkét fogsoron illeszkedik), és a PNG/JPG/SVG exportban is szerepel; a híd Státusz mintán keresztüli alkalmazása azonnal újraszámítja az overlay-t
- 🔍 Szuvasodás rögzítése 6 felületen: meziális, disztális, bukkális, linguális, okkluzális, korona alatti
- 🪥 Tömőanyagok felületenként: amalgám, kompozit, GIC, ideiglenes
- 🏥 Egyetlen összevont "Pulpa / Endo státusz" választó (csoportosítva: vitális pulpa vs. kezelt/endo): az endodonciai állapotok (gyógyszeres tömés, gyökértömés, nem teljes gyökértömés, üvegszálas csap, fémcsap) és az AAE pulpa diagnózis (`pulpDx`: normal / reverzibilis / irreverzibilis pulpitis / necrosis) kölcsönösen kizárják egymást — egy gyökérkezelt fogon (`endo` beállítva) nem szerepelhet egyidejűleg vitális pulpa diagnózis; kezelés esetén a `pulpDx` automatikusan `normal`-ra áll vissza, és a beteg pulpa jelölés eltűnik. A reverzibilis pulpitis csökkentett méretű pulpa jelölést jelenít meg. Az opcionális, 3 szintű pulpa részletezettségi beállítás (`pulpDetailLevel`: simple / AAE / gyakorlati latin) 9 gyakorlati latin pulpa altípust jelenít meg (pulpa sana … gangraena pulpae) a `pulpLatin` mezőn keresztül; a rezekció és a parapulpális csap továbbra is külön speciális jelzőként szerepel
- 🦴 Apikális diagnózis (`apicalDx`: tünetekkel járó/tünetmentes apikális periodontitis, akut/krónikus apikális tályog, condensing osteitis) közvetlenül meghatározza a periapikális jelölést; a granuloma/ciszta lézió-altípus minősítő csak tünetekkel járó/tünetmentes apikális periodontitis esetén jelenik meg (a redundáns "tályog" altípus törölve lett — ezt már az apikális diagnózis lefedi)
- 🩹 Összevont "Gyökér és fogágy" kártya (egyetlen összecsukható szekció a gyökér-/periapikális és parodontális leletekhez)
- ⚕️ Módosítók: periapikális gyulladás (csak hiányzó/extrakciós alveolus fogakon jelenik meg; meglévő fogakon rejtett, ahol az `apicalDx` önmagában határozza meg a periapikális jelölést, és implantátumokon, ahol a `periImplant` fedi le), parodontális betegség, mobilitási fokok (M1/M2/M3, implantátumokon rejtett)
- 🦷🔩 Peri-implantáris státusz (`periImplant`: `none` / `mucositis` / `peri-implantitis-mild` / `peri-implantitis-moderate` / `peri-implantitis-severe`) — 2018-as World Workshop staging, dedikált választóként jelenik meg implantátumokon; a mucositis újrahasznosítja a parodontális íny jelölést, a peri-implantitis egy fokozatos `peri-implant-bone-loss` réteget ad hozzá (átlátszóság 0,4/0,7/1,0). Az implantátumok többé nem jelenítik meg a periapikális lézió jelölést — a gyulladásukat ehelyett ez a tengely fejezi ki —, és a parodontális módosító jelölőnégyzetek rejtve vannak implantátumokon (az ad-hoc "Peri-implantitis" jelölőnégyzet-átcímkézés megszűnt)
- 🏷️ Speciális jelzők: korona szükséges, koronacsere szükséges, zárt foghiány, fogeltávolítási terv, barázdazárás, kontaktpont veszteség
- 👁️ Okkluzális nézet, bölcsességfog, csont és pulpa láthatóság kapcsolók
- 🔢 12 kiválasztási szűrő (összes, jelenlévő, maradó, tej, implantátum, hiányzó, felső/alsó, front/molárisok)
- 📊 Előre definiált státusz minták (alaphelyzet, tejfogazat, vegyes fogazat, fogatlan)
- 📦 34 előre definiált restaurációs sablon (hidak, kivehető protézisek, bár protézisek implantátumokkal)
- 💾 Állapot export/import JSON formátumban (2.10 verzió; az importálás továbbra is elfogadja a korábbi 1.4, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8 és 2.9 verziót, és automatikusan migrálja, plugin egyedi állapotokkal és fogankénti megjegyzésekkel)
- 🔗 HL7 FHIR R4 export (collection Bundle fogankénti Observation-ökkel, ISO 3950 fogkódolás a maradó fogazatra, lokális kódrendszer — SNOMED CT megfeleltetés tervezett)
- ✚ Kereszt/plusz felület-választó UI (B/M/O/D/L) szuvasodáshoz és tömésekhez
- 🧱 Felületenkénti tömőanyagok (vegyes tömések, pl. bukkális amalgám + disztális kompozit)
- 🖼️ PNG/JPG/SVG képexport az odontogramról (letölthető; a PNG/JPG vektoros SVG-ből raszterizált)
- 🦷 A caries/subcaries felületenkénti állapotgép: egy tömés nélküli szuvas felület elsődleges caries-ként jelenik meg (ICDAS-szintezett átlátszósággal); amint a felületen tömés is van, helyette szekunder (visszatérő) caries-ként jelenik meg (`subcaries-{surface}` réteg, CARS-pontszámmal) — a kettő soha nem lehet egyszerre aktív ugyanazon a felületen
- 🎯 Egységesített, felületenkénti súlyossági érték (`cariesSeverity`, 0–6, amely felváltja a korábbi külön ICDAS-mélység és CARS mezőket): elsődleges felületen ICDAS mélységként, szekunder felületen elnevezett CARS pontszámként (Ép … Kiterjedt üreg) olvasandó, egy kontextusfüggő felugró ablakon keresztül, amely mindig csak a felület aktuális állapotához tartozó skálát mutatja
- 🌱 Gyökér szuvasodás (`rootCaries`: none / active / arrested / active-cavitated), amely bekapcsolja a dedikált gyökér-szuvasodás grafikai réteget, a súlyosságtól függő átlátszósággal (active 0,5 / arrested 0,7 / active-cavitated teljes átlátszóság)
- 📡 Radiológiai szuvasodás mélység (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 felületenként), független a vizuális ICDAS/CARS súlyossági skálától, jelvényként (badge) jelenik meg, és saját FHIR Observation-jén keresztül is vissza-visszatölthető (round-trip)
- 🎚️ Három szuvasodás-részletezettségi beállítás (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`), valamint egy `cariesDepthEnabled` kapcsoló, amelyek mindegyike egyszerűbb választó nézetre egyszerűsíti a saját skáláját a tárolt érték elvesztése nélkül
- 🩹 Subcaries-összegző sor a tömés panelen: a tömés vezérlők alatt felsorolja a kijelölt fogak közül azokat, amelyeken szekunder caries van, a felületeikkel együtt (pl. "36 (O) tömése mellett subcaries van beállítva.")
- 🪛 Felületenkénti tömésdefektus (`fillingDefect`: none / marginal / fracture / wear) közvetlen restaurációkon, függetlenül a szekunder caries-tól — a Tömések kártyán egy felületenkénti jelzővel rögzíthető (a caries-mélység jelzőt tükrözve, opciólistája függőlegesen egymás alatt), megjelenik a diagramon, valamint a tooltipben és a teljes szájüreg tömés-összegzésben explicit felirattal (pl. "36 (O) – Tömésdefektus: O: marginális"), ugyanúgy, ahogy a szekunder caries is fel van tüntetve a Caries soron; a Tömések kártya emellett egy figyelmeztető megjegyzést is mutat minden olyan kijelölt fogra, amelyen tömésdefektus van rögzítve (pl. "36-on tömésdefektus van rögzítve."), a meglévő subcaries figyelmeztető megjegyzéssel párhuzamosan
- 🦷💥 Fogkopás klinikai ok és hely szerint típusolva (`wearEdge`: none / attrition / erosion, metszőéli/rágófelszíni; `wearCervical`: none / abrasion / abfraction / erosion, cervikális) — felváltja a korábbi két be/ki bruxizmus-kopás jelzőt; két legördülő menüvel rögzíthető a kopás sorban, az eddigi kopás-grafikát használja, és megjelenik a tooltipben, valamint egy új, teljes szájüregre vonatkozó "Kopás" összegző szekcióban
- 🎨 Fogelszíneződés ok szerint (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) maradó és tejfogakon — a megjelenő természetes koronát egy jellemző színnel árnyalja, ha a fogon nincs pótlás és a szubsztrátuma természetes; megjelenik a tooltipben és egy új, teljes szájüregre vonatkozó "Elszíneződés" összegző szekcióban; a tömésdefektusok és a kopás mellett kiegészíti a felszíni és strukturális állapotok körét
- ✏️ A frontfogak (metszőfogak/szemfogak) a teljes felületen "metszőéli"-ként ("incisal") jelölik a rágófelszínüket (választó, felugró ablak, összegzések); a tárolt felület-kulcs továbbra is `occlusal` marad
- 🔤 Pozíciófüggő felület-jelölés (Beállítások → Fogadatok → "Felület-jelölés", egyszerű/teljes, alapértelmezett: teljes): teljes módban a caries/tömés felület betűjele és felirata a fog anatómiáját követi — okkluzális → I/metszőéli a frontfogakon, bukkális → L/labiális a frontfogakon, linguális → P/palatinális a felső fogakon és L/linguális az alsó fogakon (a meziális/disztális/korona alatti felületeket ez nem érinti); egyszerű mód mindig az általános B/M/O/D/L/SC jelölést használja, a fog pozíciójától függetlenül. A teljes szájüreg összegzésre, valamint mind a caries, mind a tömésdefektus felület-választóra vonatkozik (betű + felirat); a tárolt felület-kulcsot ez nem érinti
- 🦷↕️ Fogankénti ortodonciai rögzítés (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: logikai) egy meglévő természetes fogon (maradó vagy tejfog) — az alvó v2.5.0-s ortodonciai grafikát használja fel (nincs új SVG); megjelenik a diagramon, a tooltipben, és egy új, teljes szájüregre vonatkozó "Ortodoncia" összegző szekcióban
- 🪨 Fogkő, valamint belső vagy külső cervikális típusú gyökérreszorpció (`resorptionType`)
- 📏 Felületenkénti szuvasodás mélysége (felületes / dentin / mély), vagy opcionális ICDAS II pontozás (0–6) az `enableIcdas` proppal
- 🩹 Korona szegélyi rés (leakage) kapcsoló, csak korona vagy híd pótlás esetén jelenik meg
- 🧰 Egységes ikon-fejléc sor lapozott (tabos) Beállítások ablakkal (Általános / Panelek / Fogadatok / Caries / Pulpa / Jegyzetek — számozás, jegyzetek, panel-láthatóság, ICDAS, szuvasodás-mélység kapcsoló, gyökér-/radiológiai szuvasodás részletezettség, pulpa részletezettségi szint, fogkopás/elszíneződés részletezettségi szint, fogadatok)
- 🗂️ Beállítások → "Panelek" fül: a teljes szájüreg Státusz és Ortodoncia összegző panelek egymástól függetlenül elrejthetők/megjeleníthetők
- 🩹 A szekunder caries (CARS) beállítások a Caries beállítási fülbe kerültek, a Radiológiai mélység fölé pozicionálva (a korábban különálló "Szekunder caries" fül megszűnt)
- 🎚️ Fogadatok részletezettségi szint (Beállítások → Fogadatok): egy egyszerű/összetett beállítás a fogkopásra és az elszíneződésre. Egyszerű mód igen/nem kapcsolót mutat leletenként (kopás be → attrition/abrasion, elszíneződés be → other); az összetett mód (alapértelmezett) megtartja a típus/ok legördülő menüket, és a tárolt érték megmarad a szintek közti váltáskor
- 📋 Fogadatok panel: élő szöveges összegzés a teljes státuszról (fogszámok, meglévő/hiányzó listák, szuvasodás beleértve a szekundert, tömések, gyökérkezelések, fogpótlások, implantátumok, parodontális státusz) — alaphelyzetben látszik, a Beállításokban kapcsolható
- 🗂️ Egységes Export legördülő menü (Státusz JSON / FHIR / PNG / JPG)
- 📥 Import legördülő menü FHIR importtal (visszatölti az exportált Bundle-öket)
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
- 🩺 Modernizált fogankénti tooltip és teljes szájüreg összegző panel: mindkettő megjeleníti a klinikai leletek teljes körét (pulpa/apikális diagnózis + lézió altípus, gyökérreszorpció, peri-implantáris státusz, fokozatos gyökér szuvasodás, fogkő, korona szegélyi rés, törés, kontaktpont veszteség, típusolt metszőéli/rágófelszíni és cervikális kopás), a panelben egy dedikált "Diagnózisok" szekcióval, egy dedikált "Kopás" szekcióval, valamint egy durva caries-súlyossági minősítővel (felületes/közepes/mély)
- ♿ Billentyűzet akadálymentesítés (WCAG): ARIA listbox/option szerepkörök, Enter/Space kijelölés, nyílbillentyűs navigáció, focus-visible körvonalak
- 🔒 Csak olvasható mód: összes interakció letiltása nyomtatási/jelentés/megtekintési nézetekhez
- ✨ Kijelölési animációk: pulzáló szaggatott keret és ragyogó árnyék a kijelölt fogakon (prefers-reduced-motion támogatással)
- 📝 Fogankénti megjegyzések: dupla kattintás megjegyzés hozzáadásához/szerkesztéséhez, megjegyzés ikon a fogszám mellett, hover tooltip a megjegyzés szövegével, JSON export/import
- 🧪 864 automatizált teszt (1 további teszt kihagyva) (Vitest) 94 tesztfájlban: számozás, fordítások, presetek, i18n, App komponens, téma, érintés, pluginek, akadálymentesítés és klinikai tengelyek/diagnózisok paritása lefedésére
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

**🦷 Fog szerkesztő panel** (a kijelölt fog(ak)hoz, összecsukható kártyákba csoportosítva):
- **Alap sor:** fog kiválasztás (alaptípus, beleértve a törött-korona változatokat) és fogszubsztrátum (natural/radix/broken/crownprep)
- **Pótlás sor:** a kombinált "Fix: …" / "Kivehető: …" pótlás legördülő menü (`restorationType`×`restorationMaterial` fix opciók, plusz a `prosthesis` csatlakozós/kivehető opciók, a fog típusa szerint szűrve); korona szegélyi rés jelölőnégyzet (csak korona/híd); törött-korona hely jelölőnégyzetek; korona szükséges / koronacsere szükséges kapcsolók
- **Kopás és elszíneződés sor:** metszőéli/rágófelszíni kopás típus legördülő menü, cervikális kopás típus legördülő menü, elszíneződés ok legördülő menü (mindegyik egyszerű igen/nem kapcsolóra vált a Beállítások → Fogadatok → egyszerű mód alatt)
- **Ortodoncia kártya:** készülék, meziális/disztális elmozdulás, vertikális mozgás (extrúzió/intrúzió), rotáció kapcsoló — egy meglévő természetes fogon jelenik meg
- **Caries kártya:** caries-mélység mód legördülő menü, korona alatti caries jelölőnégyzet, gyökér-caries súlyosság legördülő menü, valamint a B/M/O/D/L felületenkénti caries választó egy kontextusfüggő ICDAS-mélység/CARS felugró ablakkal és egy radiológiai-mélység jelvénnyel
- **Tömések kártya:** tömőanyag legördülő menü, felületenkénti tömés választó (felületenkénti anyaggal), felületenkénti tömésdefektus jelző (marginális/törés/kopás), subcaries és tömésdefektus figyelmeztető megjegyzések
- **Gyökér és fogágy kártya:** összevont "Pulpa / Endo státusz" választó, apikális diagnózis választó, periapikális lézió altípus választó (csak tünetekkel járó/tünetmentes apikális periodontitis esetén), gyökérreszorpció típus választó, mobilitási fok választó, peri-implantáris státusz választó (csak implantátumokon)
- **Speciális jelzők:** fogeltávolítási terv/seb, zárt foghiány, barázdazárás, kontaktpont veszteség, fogkő, parapulpális csap, endo rezekció, hídpillér

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

**A pótlási opciókat a fog típusa szűkíti** (`restorationOptions()`, `src/registry/restorations.ts`): egy implantátum csak `crown`/`bridge` pótlás típusokat kínál (kiegészítve egy implantátum-csatlakozó réteggel), plusz az alábbi öt `prosthesis` csatlakozási bejegyzést; egy hiányzó/foghiány fog csak `bridge` pontikot kínál, plusz a két kivehető fogsor `prosthesis` bejegyzést; egy `radix` szubsztrátum teljesen elrejti a pótlás-vezérlőt. A korábbi lapos `crownMaterial`/`bridgeUnit` mezők (a v1.14 előtti implantátum/híd csatlakozási értékek) megszűntek az élő modellből — csak írásvédett migrációs útként fogadja el a régi payloadokat.

**Protetika** (`prosthesis`; független kivehető/csatlakozós tengely, a kombinált pótlás legördülő menüben "Kivehető:" bejegyzésekként jelenik meg):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (implantátum csatlakozók, overdenture-rel vagy anélkül), `removable-partial`, `removable-full` (fogtámasztékú fogsorok egy hiányzó/foghiány fogon). Egy fognak vagy fix pótlása, vagy protetikája van, sosem mindkettő — az egyik beállítása törli a másikat.

**Korona szegélyi rés** (`crownLeakage`; logikai): csak akkor jelenik meg, ha a `restorationType` értéke `crown` vagy `bridge`; aktiválja a `crown-leakage` grafikai réteget.

**Endodonciai lehetőségek (maradó fogak):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Endodonciai lehetőségek (tejfogak):**
`none`, `endo-medical-filling`

Az `endo` és a `pulpDx` egyetlen összevont "Pulpa / Endo státusz" `<select>` mezőn keresztül érhető el (csoportosítva: vitális pulpa vs. kezelt/endo), és kölcsönösen kizárják egymást — egy kezelt (`endo != none`) opció kiválasztása a `pulpDx` értékét `normal`-ra állítja vissza, egy pulpa diagnózis kiválasztása pedig az `endo` értékét `none`-ra állítja vissza.

**Tömőanyagok (maradó fogak):**
`amalgam`, `composite`, `gic`, `temporary`

**Tömőanyagok (tejfogak):**
`composite`, `gic`, `temporary`

**Tömés/szuvasodás felületek:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (csak szuvasodáshoz)

**Módosítók:**
`inflammation` (periapikális), `parodontal` (parodontális), `mobility` (M1/M2/M3)

**Periapikális lézió típusa** (`periapicalType`; a periapikális jelölést minősíti, csak tünetekkel járó/tünetmentes apikális periodontitis esetén jelenik meg):
`none`, `granuloma`, `cyst` — rögzíthető opciók; a korábbi `abscess` érték továbbra is elfogadott/tárolt, de a választóban már nem kínált fel, mivel duplikálja az apikális diagnózist. Importáláskor eldobásra kerül: ha a fogon szerepel a gyulladás módosító, beleolvad az `apicalDx`-be, egyébként `none`-ra törlődik

**Pulpa diagnózis** (AAE terminológia; `pulpDx`):
`normal`, `reversible-pulpitis` (csökkentett méretű pulpa jelölést jelenít meg), `irreversible-pulpitis`, `necrosis` — kölcsönösen kizárja az `endo`-t; gyökérkezelt fogon `normal`-ra normalizálódik

**Pulpa diagnózis, gyakorlati latin** (`pulpLatin`; a pulpa választó csak akkor jeleníti meg, ha a `pulpDetailLevel` értéke `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Pulpa részletezettségi szint** (`pulpDetailLevel`, globális beállítás): `simple`, `aae` (alapértelmezett), `latin` — meghatározza, hogy a választó milyen pulpa terminológiát kínál

**Apikális diagnózis** (`apicalDx`; a periapikális jelölést határozza meg):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Gyökérreszorpció típusa** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Peri-implantáris státusz** (`periImplant`; csak implantátumokon, 2018-as World Workshop staging): a `mucositis` újrahasznosítja a parodontális íny jelölést; a `peri-implantitis-*` hozzáadja a `peri-implant-bone-loss` réteget, súlyosság szerint skálázott átlátszósággal (enyhe 0,4 / közepes 0,7 / súlyos 1,0). Az implantátumok többé nem jelenítik meg a periapikális lézió jelölést (a gyulladásukat ehelyett ez a tengely fejezi ki), és a `mods` gyulladás/parodontális jelölőnégyzetek rejtve vannak implantátumokon:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Caries súlyosság** (`cariesSeverity`; egységesített, felületenkénti mező, `0`–`6`): tömés nélküli felületen az ICDAS caries-mélység skálaként olvasandó (`superficial` / `dentin` / `deep`, vagy a nyers ICDAS II kódok `0–6`, ha az `enableIcdas` be van kapcsolva), és az elsődleges `caries-{surface}` réteget jeleníti meg; tömött felületen elnevezett CARS pontszámként olvasandó (`0` ép … `6` kiterjedt üreg), és helyette a `subcaries-{surface}` (szekunder caries) réteget jeleníti meg — egy felület soha nem elsődleges és szekunder egyszerre

**Gyökér szuvasodás** (`rootCaries`; bekapcsolja a `caries-root` grafikai réteget egy meglévő fogon, a súlyosságtól függő átlátszósággal — `active` 0,5 / `arrested` 0,7 / `active-cavitated` teljes átlátszóság):
`none`, `active`, `arrested`, `active-cavitated`

**Radiológiai szuvasodás mélység** (`radiographicDepth`; felületenként, független a vizuális ICDAS/CARS `cariesSeverity` skálától):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Szuvasodás-részletezettségi beállítások** (globális): `secondaryCariesMode` (`simple`/`standard`/`full`, alapértelmezett `standard`), `rootCariesMode` (`simple`/`severity`, alapértelmezett `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, alapértelmezett `off`), `cariesDepthEnabled` (logikai, alapértelmezett `true`) — mindegyik egyszerűbb választó nézetre egyszerűsíti a saját skáláját a tárolt érték módosítása nélkül

**Speciális jelzők:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Fogkopás** (`wearEdge`, `wearCervical`; hely szerinti klinikai típus, feltétele: tooth-base + nincs pótlás + természetes szubsztrátum; a meglévő `tooth-bruxism-wear`/`tooth-bruxism-neck-wear` rétegeket rendereli):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Elszíneződés** (`discoloration`; fogankénti ok, feltétele: természetes tooth-base vagy tejfog + nincs pótlás + természetes szubsztrátum; a megjelenő természetes korona kitöltését árnyalja — nincs új SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Tömésdefektus** (`fillingDefect`; felületenként, közvetlen restauráció lelet, függetlenül a szekunder caries-tól — feltétele, hogy a felület szerepeljen a `fillingSurfaceMaterials`-ban; a `defect-{surface}` grafikai réteget rendereli):
`none`, `marginal`, `fracture`, `wear`

**Ortodoncia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; fogankénti, feltétele egy meglévő természetes fog — maradó vagy tej):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (felfelé mutató nyíl jelölés), `intrusion` (lefelé mutató nyíl jelölés) — `orthoRotation`: logikai

**Fogadatok / jelölés beállítások** (globális munkamenet-beállítások, Beállítások → Fogadatok): `wearDetailLevel` és `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, alapértelmezett `complex` — egyszerű mód igen/nem kapcsolót mutat a teljes típus/ok legördülő menü helyett, a tárolt érték módosítása nélkül), valamint `surfaceNotation` (`simple`/`full`, alapértelmezett `full` — meghatározza, hogy a caries/tömés felület betűjelek/feliratok pozíciófüggőek-e; lásd a fenti "Pozíciófüggő felület-jelölés" részt)

### ⚙️ Beállítások
A fejléc fogaskerék ikonjával nyitható; egy focus-trapped, ARIA `dialog` lapozott (tabos) elrendezéssel (Esc/háttérre kattintás a bezáráshoz, nyílbillentyűk a fülek közti váltáshoz). Minden beállítás csak munkamenet-szintű UI állapot, hacsak másképp nincs jelezve — egyik sem módosítja a fogankénti adatokat vagy az export payloadot.

- **Általános:** számozási rendszer (FDI/Universal/Palmer), nyelv, sötét/világos téma, fogadatok panel láthatósága
- **Panelek:** a teljes szájüreg Státusz kártya és az Ortodoncia kártya egymástól függetlenül elrejthető/megjeleníthető (mindkettő alapértelmezésben látható)
- **Fogadatok:** kopás részletezettségi szint és elszíneződés részletezettségi szint (egyszerű/összetett, mindkettő alapértelmezetten összetett), felület-jelölés (egyszerű/teljes, alapértelmezett: teljes)
- **Caries:** ICDAS II pontozás kapcsoló (`enableIcdas`), caries-mélység kapcsoló (`cariesDepthEnabled`), gyökér-caries részletezettség (`rootCariesMode`: simple/severity), szekunder/CARS részletezettség (`secondaryCariesMode`: simple/standard/full), radiológiai-mélység részletezettség (`radiographicDepthMode`: off/threeLevel/detailed) — a korábban különálló "Szekunder caries" fül ebbe olvadt bele, a CARS vezérlő közvetlenül a radiológiai mélység fölé kerülve
- **Pulpa:** pulpa részletezettségi szint (`pulpDetailLevel`: simple/AAE/gyakorlati latin, alapértelmezett AAE) — meghatározza, hogy a "Pulpa / Endo státusz" választó milyen terminológiát kínál; módosításakor a teljes szájüreg összegzés és minden nyitott tooltip azonnal frissül
- **Jegyzetek:** fogankénti megjegyzések be/kikapcsolása (`enableNotes`)

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
npm run test           # Összes 864 teszt futtatása (1 további teszt kihagyva)
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
Az export egy JSON fájlt hoz létre (`2.10` verziójú; az importálás továbbra is elfogadja a korábbi `1.4`, `2.0`, `2.1`, `2.2`, `2.3`, `2.4`, `2.5`, `2.6`, `2.7`, `2.8` és `2.9` verziókat, és automatikusan migrálja őket), amely tartalmazza:

**Globális mezők:**
- `wisdomVisible` - bölcsességfogak láthatók
- `showBase` - csont réteg látható
- `occlusalVisible` - okkluzális nézet aktív
- `showHealthyPulp` - egészséges pulpa látható
- `edentulous` - fogatlan mód aktív

**Fogankénti mezők (32 fog):**
- `toothSelection` - alap fog típusa
- `toothSubstrate` - fogszubsztrátum (natural/radix/broken/crownprep), bármely pótlástól függetlenül
- `restorationType` - pótlás típusa (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - pótlás anyaga (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), a `restorationType`-hoz párosítva
- `prosthesis` - kivehető/csatlakozós tengely (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), kölcsönösen kizárja a fix korona/híd `restorationType`-ot
- `crownLeakage` - korona szegélyi rés jelző, csak akkor releváns, ha a `restorationType` korona vagy híd
- `endo` - endodonciai állapot; kölcsönösen kizárja a `pulpDx`-et (egyetlen összevont "Pulpa / Endo státusz" választón keresztül érhetők el együtt — egy fog kezelése a `pulpDx`-et `normal`-ra normalizálja)
- `mods` - módosítók tömbje (inflammation, parodontal); az `inflammation` megszűnt a felületen meglévő fogaknál (ott az `apicalDx` határozza meg a jelölést), de továbbra is érvényes hiányzó/extrakciós alveolus fogaknál
- `caries` - aktív szuvasodási felületek
- `cariesActiveDepth` - a caries-mélység választó által ideiglenesen tárolt ICDAS-mélység érték új felület alkalmazásakor (nem felületenkénti tárolt érték; a felületenkénti mezőhöz lásd a `cariesSeverity`-t)
- `rootCaries` - gyökér szuvasodás súlyossága (none/active/arrested/active-cavitated)
- `cariesSeverity` - egységesített, felületenkénti súlyossági érték (0-6): ICDAS mélység egy elsődleges (tömés nélküli) felületen, CARS pontszám egy szekunder (tömött) felületen
- `radiographicDepth` - felületenkénti radiológiai szuvasodás mélység (none/E1/E2/D1/D2/D3), független a vizuális ICDAS/CARS skálától
- `fillingMaterial` - tömőanyag
- `fillingSurfaces` - tömött felületek
- `fillingSurfaceMaterials` - felületenkénti tömőanyag (vegyes tömések, pl. bukkális amalgám + disztális kompozit)
- `fillingDefect` - felületenkénti tömésdefektus (none/marginal/fracture/wear), feltétele egy tömött felület, függetlenül a szekunder caries-tól
- `pulpDx` - AAE pulpa diagnózis (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); a reversible-pulpitis csökkentett méretű jelölést jelenít meg
- `pulpLatin` - gyakorlati latin pulpa altípus (a pulpa választó csak akkor jeleníti meg, ha a `pulpDetailLevel` értéke `latin`)
- `apicalDx` - apikális diagnózis, amely meghatározza a periapikális jelölést
- `periapicalType` - periapikális lézió altípus (none/granuloma/cyst), csak tünetekkel járó/tünetmentes apikális periodontitis esetén jelenik meg; a korábbi `abscess` érték importáláskor még elfogadott
- `resorptionType` - gyökérreszorpció típusa (none/internal/external-cervical)
- `periImplant` - csak implantátumon értelmezett peri-implantáris státusz (none/mucositis/peri-implantitis-mild/-moderate/-severe), 2018-as World Workshop staging
- `endoResection` - rezekció jelzője
- `fissureSealing` - barázdazárás jelzője
- `calculus` - fogkő jelzője
- `contactMesial` - meziális kontaktpont veszteség
- `contactDistal` - disztális kontaktpont veszteség
- `wearEdge` - metszőéli/rágófelszíni kopás típusa (none/attrition/erosion)
- `wearCervical` - cervikális kopás típusa (none/abrasion/abfraction/erosion)
- `discoloration` - fogankénti elszíneződés oka (none/tetracycline/fluorosis/nonvital/extrinsic/other), a természetes koronát árnyalja egy pótlás nélküli, természetes szubsztrátumú tooth-base/tejfogon
- `orthoAppliance` - ortodonciai készülék (none/bracket/band)
- `orthoDrift` - ortodonciai elmozdulás (none/mesial/distal)
- `orthoVertical` - ortodonciai vertikális mozgás (none/extrusion/intrusion)
- `orthoRotation` - ortodonciai rotáció jelző
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
- `src/registry/` - deklaratív klinikai-tengely registry: FHIR mezőmegfeleltetések, SVG-törlési-halmaz/logikai-jelző aktiválás, pótlás típus×anyag mátrix, UI opciólisták (egyetlen forrás, amely generálja az export/import, FHIR és a választó UI-t)
- `src/fhir/` - HL7 FHIR R4 export/import: `toFhir.ts`/`fromFhir.ts`, kódrendszerek, mezőmegfeleltetések, primitívek
- `src/bridgeOverlay.ts` - több fogra kiterjedő híd-csatlakozó overlay (ívhez igazodó nyereg-geometria)
- `src/SettingsModal.tsx` - lapozott (tabos) Beállítások ablak (Általános/Panelek/Fogadatok/Caries/Pulpa/Jegyzetek)
- `src/__tests__/` + `src/registry/__tests__/` - Vitest tesztcsomag (864 teszt sikeres, 1 kihagyva, 94 fájlban)
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
