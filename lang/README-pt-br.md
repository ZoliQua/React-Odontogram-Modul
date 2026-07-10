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

## 🇧🇷 Português (Brasil)

### 📋 Visão geral
Este projeto é um editor de odontograma interativo, executado no navegador, que agiliza o registro dentário com uma interface limpa. Ele renderiza modelos de dentes em SVG por camadas para representar restaurações, cáries, estado endodôntico, mobilidade e outros detalhes clínicos, oferecendo seleção múltipla, filtros de seleção e predefinições de estado prontas para uso.

---
<img width="1728" height="922" alt="react-odontogram-modul-portuguese-preview" src="https://github.com/user-attachments/assets/0d6e076e-a840-408c-93cc-974e0767aaaf" />

🔗 **URL de teste:** https://react-odontogram-modul.vercel.app/

---

### ✨ Principais recursos
- 🖱️ Seleção rápida e seleção múltipla (CMD/CTRL + clique)
- 🦷 Tipos de dente: permanente, decíduo (de leite), implante, subgengival, ausente
- 👑 Materiais de coroa: natural (coroa total), fraturada, preparada para coroa, resto radicular, e.max, zircônia, metalocerâmica, provisória, telescópica
- 🔩 Pilares sobre implante: cicatrizador, locator, locator com prótese, barra, barra com prótese
- 🌉 Elementos de ponte: zircônia, metal, provisório, removível, barra, barra com prótese
- 🔍 Registro de cárie em 6 faces: mesial, distal, vestibular, lingual, oclusal, subcoroa
- 🪥 Materiais de restauração por face: amálgama, resina composta, ionômero de vidro (GIC), provisória
- 🏥 Estados endodônticos: obturação medicamentosa, obturação de canal, obturação de canal incompleta, pino de fibra de vidro, pino metálico, apicectomia, pino parapulpar
- ⚕️ Modificações: inflamação periapical (interna/externa), doença periodontal, graus de mobilidade (M1/M2/M3)
- 🏷️ Indicadores especiais: coroa necessária, substituição de coroa necessária, espaço fechado, extração planejada, desgaste por bruxismo/desgaste cervical, selante de fissura, perda de ponto de contato
- 👁️ Alternância de visibilidade da vista oclusal, dos sisos, do osso e da polpa
- 🔢 12 filtros de seleção (todos, presentes, permanentes, decíduos, implantes, ausentes, superiores/inferiores, anteriores/molares)
- 📊 Predefinições de estado prontas (redefinir, dentição decídua, dentição mista, edêntulo)
- 📦 34 modelos de restauração predefinidos (pontes, próteses removíveis, próteses sobre barra com implantes)
- 💾 Exportação/importação de estado em JSON (versão 1.3, com estados personalizados de plugins e anotações por dente)
- 🔗 Exportação HL7 FHIR R4 (Bundle de coleção com Observations por dente, codificação de dente ISO 3950, codificações híbridas locais+SNOMED)
- ✚ Interface de seleção de faces em cruz/mais (B/M/O/D/L) para cáries e restaurações
- 🧱 Materiais de restauração por face (restaurações mistas, por exemplo amálgama vestibular + resina distal)
- 🖼️ Exportação da imagem do odontograma em PNG/JPG/SVG (para download; PNG/JPG rasterizados a partir do SVG vetorial)
- 🦷 Cárie secundária (recorrente), derivada automaticamente quando a cárie se sobrepõe a uma restauração
- 🪨 Cálculo, reabsorção radicular e lesões periapicais tipificadas (granuloma / cisto / abscesso)
- 📏 Profundidade da cárie por face (superficial / dentina / profunda) ou pontuação ICDAS II opcional (0–6) via `enableIcdas`
- 🧰 Barra superior unificada com menu de Configurações (numeração, anotações, ICDAS, informações do dente)
- 📋 Painel de informações do dente: resumo textual ao vivo de todo o odontograma (contagens de dentes, listas de presentes/ausentes, cáries incl. secundárias, restaurações, tratamentos de canal, próteses, implantes, estado periodontal), exibido por padrão e alternável em Configurações
- 🗂️ Menu de Exportação consolidado (Estado JSON / FHIR / PNG / JPG)
- 📥 Menu de Importação com importação FHIR (reimporta Bundles exportados)
- ⏳ Sobreposição de progresso durante a exportação de imagens
- 🎓 Tour interativo de introdução em 12 etapas
- 🔢 Três sistemas de numeração (FDI, Universal, Palmer)
- 🌐 Internacionalização (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) com seletor de idioma (190+ chaves de tradução por idioma)
- 🌗 Suporte a modo escuro com botão de alternância (autônomo ou controlado pelo app pai)
- 🎨 Configuração de tema personalizada (prop `themeConfig`) com propriedades CSS personalizadas (`--odon-*`)
- 📱 UX de toque em dispositivos móveis: popover de toque para ampliar, menu de contexto por pressão longa, pinça para ampliar, alvos de toque de 44px (WCAG), navegação por alternância de arcada
- 🔌 Sistema de plugins SVG personalizados: injete sobreposições visuais, estado personalizado por dente, suporte a exportação/importação em JSON
- ⚠️ Avisos de validação de estado para combinações incompatíveis de estados do dente
- 🏷️ Dica de estado automática nos blocos de dente (mostra todos os estados ativos)
- ♿ Acessibilidade por teclado (WCAG): papéis ARIA listbox/option, seleção com Enter/Espaço, navegação com setas, contornos focus-visible
- 🔒 Modo somente leitura: desativa todas as interações para casos de impressão/laudo/visualização
- ✨ Animações de seleção: borda tracejada pulsante e sombra brilhante nos dentes selecionados (com suporte a prefers-reduced-motion)
- 📝 Anotações por dente: clique duplo para adicionar/editar anotações, ícone de anotação ao lado do número do dente, dica ao passar o mouse com o texto da anotação, exportação/importação em JSON
- 🧪 202 testes automatizados (Vitest) em 16 arquivos de teste cobrindo numeração, traduções, predefinições, i18n, componente App, tema, toque, plugins e acessibilidade
- 📖 Documentação de API em TypeDoc com comentários JSDoc em todos os exports públicos (`npm run docs`)

### 📦 Módulos
- 🦷 Grade do odontograma e interface dos blocos de dente
- 🎛️ Painel de controles e de estado
- 🎨 Motor de camadas SVG e modelos
- 🔢 Numeração de dentes e mapeamento de rótulos (FDI/Universal/Palmer)
- 🌐 Localização (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- 💾 Exportação/importação de estado
- 📋 Extras de estado: modelos de restauração predefinidos
- 🎨 Configuração de tema: paleta de cores personalizável via propriedades CSS `--odon-*`
- 📱 Interações de toque em dispositivos móveis (toque para ampliar, pressão longa, pinça para ampliar, alternância de arcada)
- 🔌 Sistema de plugins SVG personalizados
- ⚠️ Sistema de validação de estado e de dicas
- ♿ Acessibilidade por teclado e suporte a ARIA
- 🔒 Modo somente leitura
- ✨ Animações de seleção
- 📝 Sistema de anotações por dente
- 🧪 Suíte de testes automatizados (Vitest + Testing Library)

### 🛠️ Controles da interface

**🔝 Barra superior:**
- Seletor de idioma (menu suspenso HU/EN/DE/ES/IT/SK/PL/RU/PT-BR)
- Botão de alternância do modo escuro (ícone de sol/lua, alterna entre tema claro e escuro)
- Seletor do sistema de numeração (menu suspenso FDI/Universal/Palmer)
- Botões Exportar estado / Importar estado

**📊 Cabeçalho do odontograma:**
- Alternância da vista oclusal
- Alternância da visibilidade dos sisos
- Alternância da visibilidade do osso
- Alternância da visibilidade da polpa
- Botão de limpar seleção

**🔍 Filtros de seleção:**
- Selecionar Todos / Todos Presentes / Permanentes / Decíduos / Implantes / Todos Ausentes
- Selecionar Superiores / 6 Anteriores Superiores / Molares Superiores
- Selecionar Inferiores / 6 Anteriores Inferiores / Molares Inferiores

**📋 Predefinições de estado:**
- Redefinir Tudo (redefinir boca)
- Dentição Decídua
- Dentição Mista
- Alternância Edêntulo

**📦 Menu de extras de estado:**
- Pontes de zircônia superiores/inferiores (12-22, 13-23, 16-26, arcada completa)
- Pontes metálicas superiores/inferiores (12-22, 13-23, 16-26, arcada completa)
- Próteses removíveis parciais superiores/inferiores
- Próteses removíveis totais superiores/inferiores
- Próteses sobre barra com implantes superiores/inferiores

### 🦷 Tipos e estados do dente

**Seleção do dente (tipo base):**
| Valor | Descrição |
|---|---|
| `none` | Dente ausente |
| `tooth-base` | Dente permanente |
| `milktooth` | Dente decíduo (de leite) |
| `implant` | Implante dentário |
| `tooth-under-gum` | Dente subgengival (não irrompido) |

**Variantes de dente fraturado:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**Materiais de coroa (dentes permanentes):**
`radix`, `natural` (coroa total, padrão), `broken`, `crownprep` (preparada para coroa), `emax`, `zircon`, `metal`, `temporary`, `telescope`

**Materiais de coroa (implantes):**
`natural` (nenhum), `healing-abutment`, `zircon`, `metal`, `temporary`, `locator`, `locator-prosthesis`, `bar`, `bar-prosthesis`

**Elementos de ponte:**
`none`, `removable`, `zircon`, `metal`, `temporary`, `bar`, `bar-prosthesis`

**Opções endodônticas (dentes permanentes):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opções endodônticas (dentes decíduos):**
`none`, `endo-medical-filling`

**Materiais de restauração (dentes permanentes):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiais de restauração (dentes decíduos):**
`composite`, `gic`, `temporary`

**Faces de restauração/cárie:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (apenas cárie)

**Modificações:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Tipo de lesão periapical** (qualifica `inflammation`):
`none`, `granuloma`, `cyst`, `abscess`

**Profundidade da cárie** (por face): `superficial` / `dentin` / `deep`, ou códigos ICDAS II opcionais `0–6` quando `enableIcdas` está definido

**Indicadores especiais:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `bruxismWear`, `bruxismNeckWear`, `pulpInflam`, `endoResection`, `rootResorption`, `calculus`, `parapulpalPin`

### 🖼️ Sistema de modelos SVG

**Modelos de dente** (em `src/assets/teeth-svgs/`):
| Modelo | Dentes que o utilizam |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (incisivos) |
| `13.svg` | 13, 23, 33, 43 (caninos) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (pré-molares) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (molares) |

Os modelos são girados 180 graus para a arcada inferior e espelhados horizontalmente para o lado esquerdo.

**SVGs de ícones** (em `src/assets/icon-svgs/`):
`icon_8.svg` (sisos), `icon_gum.svg` (osso), `icon_no_selection.svg` (limpar), `icon_occl.svg` (vista oclusal), `icon_pulp.svg` (polpa)

### 🔢 Sistemas de numeração

**FDI (ISO 3950):** Dentes permanentes 11-18, 21-28, 31-38, 41-48. Dentes decíduos 51-55, 61-65, 71-75, 81-85.

**Universal (EUA):** Dentes permanentes numerados de 1 a 32. Dentes decíduos com letras de A a T.

**Palmer (Zsigmondy-Palmer):** Formato quadrante + posição (por exemplo, UR-1, LL-5). Os dentes decíduos usam letras de A a E por quadrante.

### 🚀 Uso
Desenvolvimento:
```bash
npm install
npm run dev
```
Build:
```bash
npm run build
```
Pré-visualização:
```bash
npm run preview
```

### 🔗 Integração
O componente pode ser incorporado em qualquer app React.
Exemplo:
```tsx
import App from "./App";

export default function Host(){
  return (
    <App
      language="pt-br"
      onLanguageChange={(lang) => console.log(lang)}
      numberingSystem="FDI"
      onNumberingChange={(system) => console.log(system)}
      darkMode={false}
      onDarkModeChange={(dark) => console.log(dark)}
    />
  );
}
```

**Integração do modo escuro:**
- **Modo autônomo:** Omita a prop `darkMode`. O componente gerencia seu próprio estado de tema pelo botão de alternância da barra superior e adiciona/remove a classe `.dark` no `<html>`.
- **Modo controlado:** Passe `darkMode` e `onDarkModeChange`. O app pai controla o tema. O botão de alternância continua aparecendo, mas chama `onDarkModeChange` em vez de gerenciar o estado interno. O app pai é responsável por adicionar/remover a classe `.dark` no `<html>`.

**Tema personalizado:**
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

**Integração de plugin:**
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

// Define o estado do plugin para um dente:
setPluginState(11, "implant-brand", "Straumann");
```

### 🧪 Testes
```bash
npm run test           # Executa todos os 202 testes
npm run test:watch     # Modo watch
npm run test:coverage  # Relatório de cobertura
```

### 📖 Documentação da API
```bash
npm run docs           # Gera a documentação TypeDoc em docs/
```

### 📡 API pública

**Props do componente:**

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `language` | `string` | `'hu'` | Idioma da interface (hu/en/de/es/it/sk/pl/ru/pt-br) |
| `onLanguageChange` | `(lang) => void` | — | Callback quando o idioma muda |
| `numberingSystem` | `string` | `'FDI'` | Sistema de numeração (FDI/Universal/Palmer) |
| `onNumberingChange` | `(system) => void` | — | Callback quando a numeração muda |
| `darkMode` | `boolean` | `undefined` | Estado do modo escuro. Omita para o modo autônomo. |
| `onDarkModeChange` | `(dark) => void` | — | Callback quando o modo escuro é alternado. Obrigatório para o modo controlado. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | Sobrescritas de cor personalizadas via propriedades CSS personalizadas (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | `undefined` | Plugins SVG personalizados para sobreposições visuais e estado personalizado por dente. |
| `readOnly` | `boolean` | `undefined` | Desativa todas as interações (clique, toque, teclado). Útil para visualizações de impressão/laudo. |
| `enableNotes` | `boolean` | `undefined` | Ativa anotações por dente. Clique duplo em um dente para adicionar/editar anotações. |

**Funções exportadas para controle externo:**

| Função | Descrição |
|---|---|
| `initOdontogram()` | Inicializa o motor e renderiza todos os dentes |
| `destroyOdontogram()` | Limpa o motor e remove os ouvintes de eventos |
| `setNumberingSystem(system)` | Alterna entre FDI, Universal, Palmer |
| `clearSelection()` | Desmarca todos os dentes |
| `setOcclusalVisible(on)` | Ativa/desativa a vista oclusal |
| `setWisdomVisible(on)` | Mostra/oculta os sisos |
| `setShowBase(on)` | Mostra/oculta a camada do osso |
| `setHealthyPulpVisible(on)` | Mostra/oculta a polpa saudável |
| `registerPlugins(plugins)` | Registra plugins SVG personalizados |
| `setPluginState(toothNo, pluginId, value)` | Define o estado personalizado de um plugin para um dente |
| `getPluginState(toothNo, pluginId)` | Obtém o estado personalizado de um plugin para um dente |
| `getToothStateSummary(toothNo)` | Obtém o resumo localizado de todos os estados ativos |
| `getOdontogramSummary()` | Obtém um resumo textual estruturado e localizado de todo o odontograma (contagens, seções) |
| `onStateChange(callback)` | Assina as mudanças de estado; retorna uma função para cancelar a assinatura |
| `setReadOnly(value)` | Ativa/desativa o modo somente leitura |
| `getReadOnly()` | Obtém o estado atual de somente leitura |
| `setNotesEnabled(value)` | Ativa/desativa as anotações por dente |
| `getNotesEnabled()` | Obtém o estado atual de ativação das anotações |
| `exportFhir(options?)` | Exporta o odontograma como um Bundle de coleção HL7 FHIR R4 (download em JSON). Referência `{ subject }` opcional; caso contrário, um Patient de espaço reservado é incorporado |
| `exportImage(format)` | Baixa o odontograma como imagem, `"png"` ou `"jpg"` |
| `exportSvg()` | Baixa o odontograma como SVG escalável (vetorial) |
| `importFhirBundle(input)` | Importa um Bundle FHIR R4 (objeto ou string JSON) produzido por este módulo |
| `setImportFormat(format)` | Define o parser da próxima importação de arquivo, `"status"` ou `"fhir"` |
| `startIntroTour()` | Inicia o tour interativo de introdução em 12 etapas |

### 💾 Formato de exportação/importação de estado
A exportação cria um arquivo JSON (versão `1.3`) contendo:

**Campos globais:**
- `wisdomVisible` - sisos visíveis
- `showBase` - camada do osso visível
- `occlusalVisible` - vista oclusal ativa
- `showHealthyPulp` - polpa saudável visível
- `edentulous` - modo edêntulo ativo

**Campos por dente (32 dentes):**
- `toothSelection` - tipo base do dente
- `crownMaterial` - material da coroa/pilar
- `bridgeUnit` - tipo de conector de ponte
- `endo` - estado endodôntico
- `mods` - array de modificações (inflammation, parodontal)
- `caries` - faces com cárie ativa
- `fillingMaterial` - material de restauração
- `fillingSurfaces` - faces restauradas
- `pulpInflam` - marcador de inflamação pulpar
- `endoResection` - marcador de apicectomia
- `fissureSealing` - marcador de selante de fissura
- `contactMesial` - perda de ponto de contato mesial
- `contactDistal` - perda de ponto de contato distal
- `bruxismWear` - desgaste oclusal por bruxismo
- `bruxismNeckWear` - desgaste cervical por bruxismo
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - locais de fratura
- `extractionWound` - ferida pós-extração
- `extractionPlan` - extração planejada
- `parapulpalPin` - marcador de pino parapulpar
- `bridgePillar` - dente pilar de ponte
- `mobility` - grau de mobilidade (none/m1/m2/m3)
- `crownNeeded` - indicador de coroa necessária
- `crownReplace` - indicador de substituição de coroa necessária
- `missingClosed` - espaço fechado após a extração
- `customStates` - estados personalizados de plugins (objeto, indexado por ID do plugin)
- `note` - anotação de texto por dente (string, opcional, presente apenas quando não vazia)

### 📁 Estrutura de pastas
- `src/App.tsx` - interface do shell, controles da barra superior, seletor de idioma/numeração/modo escuro/tema/plugin
- `src/odontogram.ts` - motor de camadas SVG, gerenciamento de estado do dente, interações de toque, sobreposições de plugins, ligação da interface
- `src/plugin.ts` - tipo `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, prioridades de z-index `LAYER_Z`
- `src/theme.ts` - tipo `OdontogramThemeConfig` e utilitário `applyThemeConfig()`
- `src/status_extras.ts` - 34 modelos de restauração predefinidos (pontes, próteses, construções sobre barra)
- `src/i18n/` - traduções (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR) e hook de i18n
- `src/utils/numbering.ts` - conversão de numeração FDI, Universal, Palmer
- `src/__tests__/` - suíte de testes Vitest (202 testes em 16 arquivos)
- `src/assets/teeth-svgs/` - modelos de dente em SVG (6 arquivos: incisivos, caninos, pré-molares, molares + vistas oclusais)
- `src/assets/icon-svgs/` - SVGs dos ícones da barra de ferramentas (5 arquivos)

### ⚙️ Stack de tecnologia
- React 18 + Vite + TypeScript
- Tailwind CSS para a estilização da interface
- Camadas SVG via manipulação do DOM (estado fora do React para desempenho)
- Sistema de i18n personalizado e leve
- Vitest + Testing Library para testes automatizados
- TypeDoc para a documentação da API
- Alias de caminho do Vite: `@` mapeado para `./src`

### 📝 Observações
- Os modelos SVG são carregados de `src/assets/teeth-svgs` e `src/assets/icon-svgs`, portanto a hospedagem estática precisa servir a pasta pública.
- O motor do odontograma usa o próprio estado interno (não o estado do React) para desempenho e simplicidade.
- Os dentes decíduos têm um conjunto reduzido de materiais disponíveis (sem restaurações de amálgama, sem endodontia com pinos).
- Os dentes com implante têm um conjunto de opções de coroa/pilar diferente dos dentes naturais.

### 📖 Como citar

Se você usar este módulo em seu trabalho, cite-o.

**Esta versão (v1.10.0):**
> Dul, Z. (2026). *React Odontogram Modul* (v1.10.0). Zenodo. https://doi.org/10.5281/zenodo.21156788

**Todas as versões (DOI do conceito):** https://doi.org/10.5281/zenodo.21156787

Os metadados de citação legíveis por máquina estão em [`CITATION.cff`](../CITATION.cff).
