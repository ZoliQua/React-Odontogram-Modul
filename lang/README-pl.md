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
- 🦷 Podłoże zęba (niezależne od jakiejkolwiek odbudowy): naturalne, radix (pozostałość korzenia), złamane, przygotowane pod koronę
- 👑 Odbudowy według typu × materiału: korona / wkład (inlay) / nakład (onlay) / licówka / most z e.max, złota, gradii, cyrkonu, metalu, metalowo-ceramicznego, teleskopowego lub tymczasowego (nakład dostępny tylko w widoku okluzyjnym) — wybierane z jednego połączonego, niskoklikowego selektora „Fix: Korona – …”; istniejące korony `metal` migrują automatycznie do `metal-ceramic` (metalowo-ceramicznej); implanty korzystają z tego samego modelu typ × materiał, złożonego z warstwą łącznika implantu. Selektor jest zawężany wg rodzaju zęba: implant oferuje tylko koronę/most (plus pięć opcji łącznikowych opisanych poniżej); ząb brakujący/luka oferuje tylko przęsło mostowe (plus protezę ruchomą częściową/całkowitą); podłoże `radix` całkowicie ukrywa kontrolkę odbudowy (na pozostałości korzenia nie można zapisać żadnej odbudowy)
- 🦿 Protetyka ruchoma/na łącznikach na dedykowanej osi `prosthesis` (wpisy „Kivehető:” w połączonym selektorze): śruba gojąca implantu, lokator, lokator z protezą nakładaną, belka, belka z protezą nakładaną; ruchoma proteza częściowa lub całkowita wsparta na zębach
- 🌉 Zęby mostowe renderują zarówno koronę, jak i łącznik siodłowy; nakładka odcinka mostu wielozębowego renderuje jeden ciągły, uwzględniający łuk łącznik przez kolejne zęby mostu (przęsła + filary) oraz przerwy między nimi (górny i dolny łuk używają lustrzanej geometrii siodła, dzięki czemu łącznik pozostaje wyrównany na obu łukach), uwzględniona w eksporcie PNG/JPG/SVG; zastosowanie mostu przez preset Statusów natychmiast przelicza nakładkę na nowo
- 🔍 Dokumentowanie próchnicy na 6 powierzchniach: mezjalnej, dystalnej, policzkowej, językowej, okluzyjnej, podkoronowej
- 🪥 Materiały wypełnień na powierzchnię: amalgamat, kompozyt, GIC, tymczasowe
- 🏥 Jeden połączony selektor „Stan miazgi / endodontyczny” (zgrupowany: żywa miazga vs. leczona/endo): stany endodontyczne (wypełnienie lecznicze, wypełnienie kanałowe, niekompletne wypełnienie kanałowe, wkład z włókna szklanego, wkład metalowy) i diagnoza miazgi wg AAE (`pulpDx`: normalna / odwracalne / nieodwracalne zapalenie miazgi / martwica) wykluczają się wzajemnie — ząb leczony kanałowo (ustawione `endo`) nie może jednocześnie mieć diagnozy żywej miazgi; przy leczeniu `pulpDx` jest normalizowane do wartości `normal`, a symbol chorej miazgi jest ukrywany. Odwracalne zapalenie miazgi renderuje zredukowany symbol miazgi. Opcjonalne 3-poziomowe ustawienie szczegółowości miazgi (`pulpDetailLevel`: proste / AAE / praktyczna łacina) udostępnia 9 praktycznych łacińskich podtypów miazgi (pulpa sana … gangraena pulpae) za pomocą `pulpLatin`; resekcja i wkład parapulpalny pozostają osobnymi wskaźnikami specjalnymi
- 🦴 Diagnoza okołowierzchołkowa (`apicalDx`: objawowe/bezobjawowe zapalenie ozębnej wierzchołkowej, ostry/przewlekły ropień okołowierzchołkowy, osteoskleroza) bezpośrednio determinuje symbol okołowierzchołkowy; kwalifikator podtypu zmiany ziarniniak/torbiel jest pokazywany tylko przy objawowym/bezobjawowym zapaleniu ozębnej wierzchołkowej (zbędny podtyp „ropień” został usunięty — jest już pokryty przez diagnozę okołowierzchołkową)
- 🩹 Połączona karta „Korzeń i przyzębie” (jedna zwijana sekcja dla wyników dotyczących korzenia/okołowierzchołkowych i przyzębia)
- ⚕️ Modyfikacje: zapalenie okołowierzchołkowe (widoczne tylko przy zębach brakujących/w zębodole poekstrakcyjnym; ukryte przy zębach obecnych, gdzie symbol okołowierzchołkowy determinuje wyłącznie `apicalDx`, oraz przy implantach, gdzie pokrywa to `periImplant`), choroba przyzębia, stopnie ruchomości (M1/M2/M3, ukryte przy implantach)
- 🦷🔩 Stan okołowszczepowy (`periImplant`: `none` / `mucositis` / `peri-implantitis-mild` / `peri-implantitis-moderate` / `peri-implantitis-severe`) — klasyfikacja wg World Workshop 2018, pokazywana jako dedykowany selektor przy implantach; zapalenie śluzówki wykorzystuje symbol dziąsła przyzębnego, zapalenie tkanek okołowszczepowych dodaje stopniowaną warstwę `peri-implant-bone-loss` (nieprzezroczystość 0,4/0,7/1,0). Implanty nie renderują już symbolu zmiany okołowierzchołkowej — ich stan zapalny jest teraz wyrażany przez tę oś — a pola wyboru modyfikatorów przyzębnych są ukryte przy implantach (doraźne przeetykietowanie pola wyboru „Zapalenie tkanek okołowszczepowych” zostało wycofane)
- 🏷️ Wskaźniki specjalne: korona wymagana, wymiana korony konieczna, zamknięta luka, plan ekstrakcji, lakowanie bruzd, utrata punktu stycznego
- 👁️ Przełączniki widoku okluzyjnego, zębów mądrości, widoczności kości i miazgi
- 🔢 12 filtrów wyboru (wszystkie, obecne, stałe, mleczne, implanty, brakujące, górne/dolne, przednie/trzonowe)
- 📊 Predefiniowane presety statusu (reset, uzębienie mleczne, uzębienie mieszane, bezzębny)
- 📦 34 predefiniowane szablony uzupełnień (mosty, protezy ruchome, protezy na belce z implantami)
- 💾 Eksport/import statusu w formacie JSON (wersja 2.10; import nadal akceptuje starsze wersje 1.4, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8 i 2.9 i migruje je automatycznie, wraz z niestandardowymi stanami wtyczek i notatkami do zębów)
- 🔗 Eksport HL7 FHIR R4 (kolekcja Bundle z obserwacjami na ząb, kodowanie zębów wg ISO 3950 dla uzębienia stałego, lokalny system kodów — mapowanie SNOMED CT planowane)
- ✚ Interfejs wyboru powierzchni w układzie krzyżowym (B/M/O/D/L) dla próchnicy i wypełnień
- 🧱 Materiały wypełnień na powierzchnię (mieszane wypełnienia, np. policzkowe amalgamat + dystalne kompozyt)
- 🖼️ Eksport obrazu PNG/JPG/SVG wykresu (do pobrania; PNG/JPG rastrowane z wektorowego SVG)
- 🦷 Próchnica/próchnica wtórna jako maszyna stanów per powierzchnia: spróchniała powierzchnia bez wypełnienia jest renderowana jako próchnica pierwotna (nieprzezroczystość warstwowana wg ICDAS); gdy tylko ta powierzchnia ma wypełnienie, jest renderowana zamiast tego jako próchnica wtórna (nawracająca) (warstwa `subcaries-{surface}`, punktowana wg CARS) — obie nigdy nie są aktywne jednocześnie na tej samej powierzchni
- 🎯 Ujednolicona wartość ciężkości na powierzchnię (`cariesSeverity`, 0–6, zastępująca dawne osobne pola głębokości ICDAS i CARS): odczytywana jako głębokość ICDAS na powierzchni pierwotnej, jako nazwany wynik CARS (Zdrowy … Rozległy ubytek) na powierzchni wtórnej, poprzez kontekstowy popup pokazujący tylko skalę odpowiednią dla aktualnego stanu powierzchni
- 🌱 Próchnica korzenia (`rootCaries`: `none` / `active` / `arrested` / `active-cavitated`), uruchamiająca dedykowaną warstwę grafiki próchnicy korzenia z nieprzezroczystością zależną od ciężkości (active 0,5 / arrested 0,7 / active-cavitated pełna nieprzezroczystość)
- 📡 Radiologiczna głębokość próchnicy (`radiographicDepth`: brak / E1 / E2 / D1 / D2 / D3 na powierzchnię), niezależna od wizualnej skali ciężkości ICDAS/CARS, prezentowana jako odznaka i zwrotnie zapisywana we własnej obserwacji FHIR
- 🎚️ Trzy ustawienia szczegółowości próchnicy (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) oraz przełącznik `cariesDepthEnabled`, zwijające każdą skalę do prostszego widoku wyboru bez utraty zapisanej wartości
- 🩹 Wiersz podsumowania próchnicy wtórnej w panelu wypełnień: pod kontrolkami wypełnień wymienia każdy wybrany ząb z próchnicą wtórną i jego powierzchnie (np. „36 (O) ma próchnicę wtórną przy wypełnieniu.”)
- 🪛 Wady wypełnienia na powierzchnię (`fillingDefect`: `none` / `marginal` / `fracture` / `wear`) w bezpośrednich odbudowach, niezależne od próchnicy wtórnej — dokumentowane za pomocą wskaźnika na powierzchnię na karcie Wypełnień (analogicznie do wskaźnika głębokości próchnicy, z listą opcji ułożoną pionowo), renderowane na wykresie oraz pokazywane w etykietce i w podsumowaniu wypełnień całej jamy ustnej z jawną etykietą (np. „36 (O) – Wada wypełnienia: O: brzeżna”), w ten sam sposób, w jaki próchnica wtórna jest opisywana w wierszu Próchnicy; karta Wypełnień pokazuje też notatkę pomocniczą dla każdego wybranego zęba z odnotowaną wadą wypełnienia (np. „36 ma odnotowaną wadę wypełnienia.”), analogicznie do istniejącej notatki pomocniczej dot. próchnicy wtórnej
- 🦷💥 Starcie zęba typowane wg przyczyny klinicznej i lokalizacji (`wearEdge`: `none` / `attrition` / `erosion`, sieczne/okluzyjne; `wearCervical`: `none` / `abrasion` / `abfraction` / `erosion`, szyjkowe) — zastępujące dwie dawne flagi włącz/wyłącz starcia bruksistycznego; dokumentowane za pomocą dwóch list rozwijanych w wierszu starcia, wykorzystuje istniejącą grafikę starcia i jest pokazywane w etykietce oraz w nowej sekcji podsumowania „Starcie” dla całej jamy ustnej
- 🎨 Przebarwienie zęba wg przyczyny (`discoloration`: `none` / `tetracycline` / `fluorosis` / `nonvital` / `extrinsic` / `other`) na zębach stałych i mlecznych — zabarwia widoczną naturalną koronę reprezentatywnym kolorem, gdy ząb nie ma odbudowy i ma naturalne podłoże; pokazywane w etykietce oraz w nowej sekcji podsumowania „Przebarwienie” dla całej jamy ustnej; uzupełnia zestaw stanów powierzchniowych i strukturalnych obok wad wypełnienia i starcia
- ✏️ Zęby przednie (siekacze/kły) etykietują swoją powierzchnię żującą jako „sieczną” w całym interfejsie (selektor, popup, podsumowania); przechowywany klucz powierzchni pozostaje `occlusal`
- 🔤 Notacja powierzchni zależna od pozycji zęba (Ustawienia → Szczegóły zęba → „Notacja powierzchni”, prosta/pełna, domyślnie pełna): w trybie pełnym litera i etykieta powierzchni próchnicy/wypełnienia podążają za anatomią zęba — okluzyjna → I/sieczna na zębach przednich, policzkowa → L/wargowa na zębach przednich, językowa → P/podniebienna na zębach górnych i L/językowa na zębach dolnych (mezjalna/dystalna/podkoronowa są niezmienione); tryb prosty zawsze używa ogólnego zestawu B/M/O/D/L/SC niezależnie od pozycji zęba. Dotyczy podsumowania całej jamy ustnej oraz obu selektorów powierzchni (próchnicy i wady wypełnienia) (litera + podpis); przechowywany klucz powierzchni pozostaje bez zmian
- 🦷↕️ Dokumentowanie ortodontyczne na ząb (`orthoAppliance`: `none` / `bracket` / `band`; `orthoDrift`: `none` / `mesial` / `distal`; `orthoVertical`: `none` / `extrusion` / `intrusion`; `orthoRotation`: wartość logiczna) na obecnym, naturalnym zębie (stałym lub mlecznym) — wykorzystuje uśpioną grafikę ortodontyczną z wersji 2.5.0 (bez nowego SVG); pokazywane na wykresie, w etykietce oraz w nowej sekcji podsumowania „Ortodoncja” dla całej jamy ustnej
- 🪨 Kamień nazębny oraz resorpcja korzenia typowana jako wewnętrzna lub zewnętrzna szyjkowa (`resorptionType`)
- 📏 Głębokość próchnicy na powierzchnię (powierzchowna / zębina / głęboka), lub opcjonalne punktowanie ICDAS II (0–6) za pomocą `enableIcdas`
- 🩹 Przełącznik nieszczelności brzeżnej korony, widoczny tylko przy odbudowie koronowej lub mostowej
- 🧰 Ujednolicony wiersz ikon paska górnego z zakładkowym oknem modalnym Ustawień (Ogólne / Panele / Szczegóły zęba / Próchnica / Miazga / Notatki — numeracja, notatki, widoczność paneli, ICDAS, przełącznik głębokości próchnicy, szczegółowość próchnicy korzenia/radiologicznej, poziom szczegółowości miazgi, poziom szczegółowości starcia/przebarwienia zęba, informacje o zębach)
- 🗂️ Zakładka Ustawienia → „Panele”: niezależne pokazywanie/ukrywanie paneli podsumowania Statusów i Ortodoncji dla całej jamy ustnej
- 🩹 Kontrolka ustawień próchnicy wtórnej (CARS) połączona z zakładką ustawień Próchnicy, umieszczona nad Głębokością radiologiczną (osobna zakładka „Próchnica wtórna” została wycofana)
- 🎚️ Poziom szczegółowości szczegółów zęba (Ustawienia → Szczegóły zęba): ustawienie prosty/złożony dla starcia zęba i dla przebarwienia. Tryb prosty pokazuje przełącznik tak/nie dla każdego wyniku (starcie włączone → atrycja/abrazja, przebarwienie włączone → inne); tryb złożony (domyślny) zachowuje listy rozwijane typu/przyczyny, a zapisana wartość jest zachowywana przy przełączaniu poziomów
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
- 🩺 Zmodernizowana etykietka na ząb i panel podsumowania całej jamy ustnej: oba prezentują pełny zestaw wyników klinicznych (diagnoza miazgi/okołowierzchołkowa + podtyp zmiany, resorpcja korzenia, stan okołowszczepowy, stopniowana próchnica korzenia, kamień nazębny, nieszczelność brzeżna korony, złamanie, utrata punktu stycznego, typowane starcie sieczne/szyjkowe), z dedykowaną sekcją „Diagnozy” w panelu, dedykowaną sekcją „Starcie” oraz ogólnym kwalifikatorem ciężkości próchnicy (powierzchowna/umiarkowana/głęboka)
- ♿ Dostępność klawiaturowa (WCAG): role ARIA listbox/option, wybór Enter/Spacja, nawigacja strzałkami, kontury focus-visible
- 🔒 Tryb tylko do odczytu: wyłączenie wszystkich interakcji do drukowania/raportowania/przeglądania
- ✨ Animacje zaznaczenia: pulsująca przerywana ramka i świecący cień na zaznaczonych zębach (z obsługą prefers-reduced-motion)
- 📝 Notatki do zębów: dwuklik, aby dodać/edytować notatki, ikona notatki obok numeru zęba, etykietka po najechaniu z tekstem notatki, eksport/import JSON
- 🧪 864 testów automatycznych zaliczonych (1 dodatkowy test pominięty) (Vitest) w 94 plikach testowych obejmujących numerację, tłumaczenia, presety, i18n, komponent App, motyw, dotyk, wtyczki, dostępność oraz parytet osi klinicznych/diagnostycznych
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

**🦷 Panel edycji zęba** (dla wybranego zęba/zębów, pogrupowany w zwijane karty):
- **Wiersz podstawowy:** wybór zęba (typ podstawowy z wariantami złamanej korony) i podłoże zęba (naturalne/radix/złamane/crownprep)
- **Wiersz odbudowy:** połączona lista rozwijana odbudowy „Fix: …” / „Kivehető: …” (stałe opcje `restorationType`×`restorationMaterial` plus opcje łącznikowe/ruchome `prosthesis`, zawężane wg rodzaju zęba); pole wyboru nieszczelności brzeżnej korony (tylko korona/most); pola wyboru lokalizacji złamanej korony; przełączniki korona wymagana / wymiana korony konieczna
- **Wiersz starcia i przebarwienia:** lista rozwijana typu starcia siecznego/okluzyjnego, lista rozwijana typu starcia szyjkowego, lista rozwijana przyczyny przebarwienia (każda zamienia się na prosty przełącznik tak/nie w trybie Ustawienia → Szczegóły zęba → tryb prosty)
- **Karta Ortodoncja:** aparat, przemieszczenie mezjalne/dystalne, ruch pionowy (ekstruzja/intruzja), przełącznik rotacji — pokazywana przy obecnym, naturalnym zębie
- **Karta Próchnica:** lista rozwijana trybu głębokości próchnicy, pole wyboru próchnicy podkoronowej, lista rozwijana ciężkości próchnicy korzenia oraz selektor powierzchni próchnicy B/M/O/D/L z kontekstowym popupem ICDAS-głębokość/CARS i odznaką głębokości radiologicznej
- **Karta Wypełnienia:** lista rozwijana materiału wypełnienia, selektor wypełnień na powierzchnię (z materiałem na powierzchnię), wskaźnik wady wypełnienia na powierzchnię (brzeżna/złamanie/starcie), notatki pomocnicze dot. próchnicy wtórnej i wady wypełnienia
- **Karta Korzeń i przyzębie:** połączony selektor „Stan miazgi / endodontyczny”, selektor diagnozy okołowierzchołkowej, selektor podtypu zmiany okołowierzchołkowej (tylko objawowe/bezobjawowe zapalenie ozębnej wierzchołkowej), selektor typu resorpcji korzenia, selektor stopnia ruchomości, selektor stanu okołowszczepowego (tylko implanty)
- **Wskaźniki specjalne:** plan ekstrakcji/rana, luka zamknięta, lakowanie bruzd, utrata punktu stycznego, kamień nazębny, wkład parapulpalny, resekcja endodontyczna, filar mostu

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

**Podłoże zęba (zęby stałe):**
`natural` (domyślne), `radix` (pozostałość korzenia), `broken`, `crownprep` (przygotowany pod koronę)

**Typ odbudowy (zęby stałe):**
`none`, `crown`, `inlay`, `onlay` (tylko widok okluzyjny), `veneer`, `bridge`

**Materiał odbudowy (zęby stałe):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (istniejące korony `metal` migrują tutaj), `telescope`, `temporary`

**Opcje odbudowy są zawężane wg rodzaju zęba** (`restorationOptions()` w `src/registry/restorations.ts`): implant oferuje tylko typy odbudowy `crown`/`bridge` (złożone z warstwą łącznika implantu) plus pięć poniższych wpisów łącznikowych `prosthesis`; ząb brakujący/luka oferuje tylko przęsło `bridge` plus dwa wpisy protez ruchomych `prosthesis`; podłoże `radix` całkowicie ukrywa kontrolkę odbudowy. Dawne płaskie pola `crownMaterial`/`bridgeUnit` (wartości łączników implantu/mostu sprzed v1.14) zostały wycofane z aktywnego modelu — są akceptowane wyłącznie jako tylko-do-odczytu ścieżka migracji dla starych danych.

**Protetyka ruchoma** (`prosthesis`; niezależna oś ruchoma/łącznikowa, prezentowana jako wpisy „Kivehető:” w połączonej liście rozwijanej odbudowy):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (łączniki implantu, z protezą nakładaną lub bez), `removable-partial`, `removable-full` (protezy wsparte na zębach przy zębie brakującym/luce). Ząb ma albo stałą odbudowę, albo protezę ruchomą, nigdy jedno i drugie jednocześnie — ustawienie jednej opcji czyści drugą.

**Nieszczelność brzeżna korony** (`crownLeakage`; wartość logiczna): pokazywana tylko gdy `restorationType` to `crown` lub `bridge`; aktywuje warstwę grafiki `crown-leakage`.

**Opcje endodontyczne (zęby stałe):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opcje endodontyczne (zęby mleczne):**
`none`, `endo-medical-filling`

`endo` i `pulpDx` są prezentowane przez jeden połączony `<select>` „Stan miazgi / endodontyczny” (zgrupowany: żywa miazga vs. leczona/endo) i wykluczają się wzajemnie — wybór opcji leczonej (`endo != none`) resetuje `pulpDx` do `normal`, a wybór diagnozy miazgi resetuje `endo` do `none`.

**Materiały wypełnień (zęby stałe):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiały wypełnień (zęby mleczne):**
`composite`, `gic`, `temporary`

**Powierzchnie wypełnienia/próchnicy:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (tylko próchnica)

**Modyfikacje:**
`inflammation` (okołowierzchołkowe), `parodontal` (przyzębia), `mobility` (M1/M2/M3)

**Typ zmiany okołowierzchołkowej** (`periapicalType`; kwalifikuje symbol okołowierzchołkowy, pokazywany tylko przy objawowym/bezobjawowym zapaleniu ozębnej wierzchołkowej):
`none`, `granuloma`, `cyst` — opcje dostępne do wyboru; dawna wartość `abscess` jest nadal akceptowana/przechowywana, ale nie jest już oferowana w selektorze, ponieważ dubluje diagnozę okołowierzchołkową. Przy imporcie jest usuwana: włączana do `apicalDx`, gdy ząb ma modyfikator zapalenia, w przeciwnym razie czyszczona do `none`

**Diagnoza miazgi** (terminologia AAE; `pulpDx`):
`normal`, `reversible-pulpitis` (renderuje zredukowany symbol miazgi), `irreversible-pulpitis`, `necrosis` — wyklucza się wzajemnie z `endo`; normalizowana do `normal` przy zębie leczonym kanałowo

**Diagnoza miazgi, praktyczna łacina** (`pulpLatin`; selektor miazgi pokazuje ją tylko wtedy, gdy `pulpDetailLevel` ma wartość `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Poziom szczegółowości miazgi** (`pulpDetailLevel`, ustawienie globalne): `simple`, `aae` (domyślne), `latin` — kontroluje słownictwo oferowane przez selektor miazgi

**Diagnoza okołowierzchołkowa** (`apicalDx`; determinuje symbol okołowierzchołkowy):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Typ resorpcji korzenia** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Stan okołowszczepowy** (`periImplant`; tylko przy implantach, klasyfikacja World Workshop 2018): `mucositis` wykorzystuje symbol dziąsła przyzębnego; `peri-implantitis-*` dodaje warstwę `peri-implant-bone-loss` przy nieprzezroczystości skalowanej wg ciężkości (łagodne 0,4 / umiarkowane 0,7 / ciężkie 1,0). Implanty nie renderują już symbolu zmiany okołowierzchołkowej (ich stan zapalny jest teraz wyrażany za pomocą tej osi), a pola wyboru `mods` zapalenie/przyzębie są ukryte przy implantach:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Ciężkość próchnicy** (`cariesSeverity`; ujednolicone pole na powierzchnię, `0`–`6`): na powierzchni bez wypełnienia jest odczytywana jako skala głębokości ICDAS (`superficial` / `dentin` / `deep`, lub surowe kody ICDAS II `0–6` przy włączonym `enableIcdas`) i renderuje warstwę pierwotną `caries-{surface}`; na powierzchni z wypełnieniem jest odczytywana jako nazwany wynik CARS (`0` zdrowa … `6` rozległy ubytek) i renderuje zamiast tego warstwę `subcaries-{surface}` (próchnica wtórna) — powierzchnia nigdy nie jest jednocześnie pierwotna i wtórna

**Próchnica korzenia** (`rootCaries`; uruchamia warstwę grafiki `caries-root` na obecnym zębie, z nieprzezroczystością zależną od ciężkości — `active` 0,5 / `arrested` 0,7 / `active-cavitated` pełna nieprzezroczystość):
`none`, `active`, `arrested`, `active-cavitated`

**Radiologiczna głębokość próchnicy** (`radiographicDepth`; na powierzchnię, niezależna od wizualnej skali ICDAS/CARS `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Ustawienia szczegółowości próchnicy** (globalne): `secondaryCariesMode` (`simple`/`standard`/`full`, domyślnie `standard`), `rootCariesMode` (`simple`/`severity`, domyślnie `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, domyślnie `off`), `cariesDepthEnabled` (wartość logiczna, domyślnie `true`) — każde z nich zwija odpowiednią skalę do prostszego widoku wyboru bez zmiany zapisanej wartości

**Wskaźniki specjalne:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Starcie zęba** (`wearEdge`, `wearCervical`; typ kliniczny wg lokalizacji, uwarunkowane obecnością zęba podstawowego + brakiem odbudowy + naturalnym podłożem; renderuje istniejące warstwy `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Przebarwienie** (`discoloration`; przyczyna na ząb, uwarunkowane naturalnym zębem stałym lub mlecznym + brakiem odbudowy + naturalnym podłożem; zabarwia wypełnienie widocznej naturalnej korony — bez nowego SVG):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Wada wypełnienia** (`fillingDefect`; na powierzchnię, wynik dotyczący bezpośredniej odbudowy, niezależny od próchnicy wtórnej — uwarunkowany obecnością powierzchni w `fillingSurfaceMaterials`; renderuje warstwę grafiki `defect-{surface}`):
`none`, `marginal`, `fracture`, `wear`

**Ortodoncja** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; na ząb, uwarunkowane obecnym, naturalnym zębem — stałym lub mlecznym):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (symbol strzałki w górę), `intrusion` (symbol strzałki w dół) — `orthoRotation`: wartość logiczna

**Ustawienia szczegółów / notacji zęba** (globalne ustawienia sesji, Ustawienia → Szczegóły zęba): `wearDetailLevel` i `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, domyślnie `complex` — tryb prosty pokazuje przełącznik tak/nie zamiast pełnej listy rozwijanej typu/przyczyny, bez zmiany zapisanej wartości) oraz `surfaceNotation` (`simple`/`full`, domyślnie `full` — kontroluje, czy litery/etykiety powierzchni próchnicy/wypełnienia są zależne od pozycji zęba; zob. „Notacja powierzchni zależna od pozycji zęba” powyżej)

### ⚙️ Ustawienia
Otwierane za pomocą ikony trybika na pasku górnym; okno dialogowe ARIA `dialog` z pułapką fokusu i układem zakładkowym (Esc/klik w tło zamyka, strzałki przełączają zakładki). Wszystkie ustawienia są wyłącznie stanem interfejsu na poziomie sesji, chyba że zaznaczono inaczej — żadne z nich nie zmienia danych na ząb ani struktury eksportu.

- **Ogólne:** system numeracji (FDI/Universal/Palmer), język, motyw jasny/ciemny, widoczność panelu informacji o zębach
- **Panele:** niezależne pokazywanie/ukrywanie karty podsumowania Statusów oraz karty Ortodoncji dla całej jamy ustnej (obie domyślnie widoczne)
- **Szczegóły zęba:** poziom szczegółowości starcia i poziom szczegółowości przebarwienia (prosty/złożony, oba domyślnie złożone), notacja powierzchni (prosta/pełna, domyślnie pełna)
- **Próchnica:** przełącznik punktowania ICDAS II (`enableIcdas`), przełącznik głębokości próchnicy (`cariesDepthEnabled`), szczegółowość próchnicy korzenia (`rootCariesMode`: simple/severity), szczegółowość wtórna/CARS (`secondaryCariesMode`: simple/standard/full), szczegółowość głębokości radiologicznej (`radiographicDepthMode`: off/threeLevel/detailed) — dawna osobna zakładka „Próchnica wtórna” została połączona z tą zakładką, a kontrolka CARS umieszczona bezpośrednio nad głębokością radiologiczną
- **Miazga:** poziom szczegółowości miazgi (`pulpDetailLevel`: simple/AAE/practical-Latin, domyślnie AAE) — kontroluje, jakie słownictwo oferuje selektor „Stan miazgi / endodontyczny”; zmiana na żywo odświeża podsumowanie całej jamy ustnej oraz każdą otwartą etykietkę
- **Notatki:** włącz/wyłącz notatki do zębów (`enableNotes`)

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
npm run test           # Uruchom wszystkie 864 testów (1 dodatkowy test pominięty)
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
| `setPulpDetailLevel(level)` | Ustaw słownictwo selektora miazgi — `"simple"`, `"aae"` lub `"latin"` |
| `getPulpDetailLevel()` | Pobierz bieżący poziom szczegółowości miazgi |
| `exportFhir(options?)` | Eksportuj wykres jako kolekcję HL7 FHIR R4 Bundle (pobieranie JSON). Opcjonalne odwołanie `{ subject }`; w przeciwnym razie osadzany jest zastępczy pacjent |
| `exportImage(format)` | Pobierz wykres jako obraz — `"png"` lub `"jpg"` |
| `exportSvg()` | Pobierz wykres jako skalowalny SVG (wektorowy) |
| `importFhirBundle(input)` | Zaimportuj pakiet FHIR R4 Bundle (obiekt lub ciąg JSON) wygenerowany przez ten moduł |
| `setImportFormat(format)` | Ustaw parser dla następnego importu pliku — `"status"` lub `"fhir"` |
| `startIntroTour()` | Uruchom 12-krokowy interaktywny samouczek wprowadzający |

### 💾 Format eksportu/importu statusu
Eksport tworzy plik JSON (wersja `2.10`; import akceptuje też starsze wersje `1.4`, `2.0`, `2.1`, `2.2`, `2.3`, `2.4`, `2.5`, `2.6`, `2.7`, `2.8` i `2.9` i migruje je automatycznie) zawierający:

**Pola globalne:**
- `wisdomVisible` - widoczność zębów mądrości
- `showBase` - widoczność warstwy kości
- `occlusalVisible` - aktywny widok okluzyjny
- `showHealthyPulp` - widoczność zdrowej miazgi
- `edentulous` - aktywny tryb bezzębności

**Pola na ząb (32 zęby):**
- `toothSelection` - podstawowy typ zęba
- `toothSubstrate` - podłoże zęba (naturalne/radix/złamane/crownprep), niezależne od jakiejkolwiek odbudowy
- `restorationType` - typ odbudowy (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - materiał odbudowy (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), powiązany z `restorationType`
- `prosthesis` - oś ruchoma/łącznikowa (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), wykluczająca się wzajemnie ze stałym `restorationType` korona/most
- `crownLeakage` - flaga nieszczelności brzeżnej korony, istotna tylko gdy `restorationType` to korona lub most
- `endo` - stan endodontyczny; wyklucza się wzajemnie z `pulpDx` (prezentowane razem za pomocą jednego połączonego selektora „Stan miazgi / endodontyczny” — leczenie zęba normalizuje `pulpDx` do `normal`)
- `mods` - tablica modyfikacji (zapalenie, przyzębie); `inflammation` zostało wycofane z interfejsu przy zębach obecnych (tam symbol determinuje `apicalDx`), ale nadal dotyczy zębów brakujących/w zębodole poekstrakcyjnym
- `caries` - aktywne powierzchnie z próchnicą
- `cariesActiveDepth` - wartość głębokości ICDAS przygotowywana przez selektor głębokości próchnicy przy zastosowaniu nowej powierzchni (nie jest wartością przechowywaną na powierzchnię; zob. `cariesSeverity` dla przechowywanego pola na powierzchnię)
- `rootCaries` - stopień zaawansowania próchnicy korzenia (none/active/arrested/active-cavitated)
- `cariesSeverity` - ujednolicona ciężkość na powierzchnię (0-6): głębokość ICDAS na powierzchni pierwotnej (bez wypełnienia), wynik CARS na powierzchni wtórnej (z wypełnieniem)
- `radiographicDepth` - radiologiczna głębokość próchnicy na powierzchnię (none/E1/E2/D1/D2/D3), niezależna od wizualnej skali ICDAS/CARS
- `fillingMaterial` - materiał wypełnienia
- `fillingSurfaces` - powierzchnie wypełnione
- `fillingSurfaceMaterials` - materiał wypełnienia na powierzchnię (mieszane wypełnienia, np. policzkowe amalgamat + dystalne kompozyt)
- `fillingDefect` - wada wypełnienia na powierzchnię (none/marginal/fracture/wear), uwarunkowana wypełnioną powierzchnią, niezależna od próchnicy wtórnej
- `pulpDx` - diagnoza miazgi wg AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); odwracalne zapalenie miazgi renderuje zredukowany symbol
- `pulpLatin` - praktyczny łaciński podtyp miazgi (pokazywany przez selektor miazgi tylko gdy `pulpDetailLevel` ma wartość `latin`)
- `apicalDx` - diagnoza okołowierzchołkowa determinująca symbol okołowierzchołkowy
- `periapicalType` - podtyp zmiany okołowierzchołkowej (none/granuloma/cyst), pokazywany tylko przy objawowym/bezobjawowym zapaleniu ozębnej wierzchołkowej; dawna wartość `abscess` nadal akceptowana przy imporcie
- `resorptionType` - typ resorpcji korzenia (none/internal/external-cervical)
- `periImplant` - stan okołowszczepowy tylko dla implantów (none/mucositis/peri-implantitis-mild/-moderate/-severe), klasyfikacja World Workshop 2018
- `endoResection` - flaga apikoektomii
- `fissureSealing` - flaga lakowania bruzd
- `calculus` - flaga kamienia nazębnego
- `contactMesial` - utrata punktu stycznego mezjalnego
- `contactDistal` - utrata punktu stycznego dystalnego
- `wearEdge` - typ starcia siecznego/okluzyjnego (none/attrition/erosion)
- `wearCervical` - typ starcia szyjkowego (none/abrasion/abfraction/erosion)
- `discoloration` - przyczyna przebarwienia na ząb (none/tetracycline/fluorosis/nonvital/extrinsic/other), zabarwia wypełnienie naturalnej korony przy naturalnym zębie stałym/mlecznym bez odbudowy
- `orthoAppliance` - aparat ortodontyczny (none/bracket/band)
- `orthoDrift` - przemieszczenie ortodontyczne (none/mesial/distal)
- `orthoVertical` - pionowy ruch ortodontyczny (none/extrusion/intrusion)
- `orthoRotation` - flaga rotacji ortodontycznej
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
- `src/registry/` - deklaratywny rejestr osi klinicznych: mapowania pól FHIR, aktywacja zestawu czyszczenia SVG/flag logicznych, macierz typ×materiał odbudowy, listy opcji interfejsu (jedno źródło prawdy generujące eksport/import, FHIR i interfejs selektorów)
- `src/fhir/` - eksport/import HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, systemy kodów, mapowania pól, prymitywy
- `src/bridgeOverlay.ts` - nakładka łącznika odcinka mostu wielozębowego (geometria siodła uwzględniająca łuk)
- `src/SettingsModal.tsx` - zakładkowe okno dialogowe Ustawień (Ogólne/Panele/Szczegóły zęba/Próchnica/Miazga/Notatki)
- `src/__tests__/` + `src/registry/__tests__/` - zestaw testów Vitest (864 testów zaliczonych, 1 pominięty, w 94 plikach)
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
