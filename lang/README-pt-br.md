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
- 🦷 Substrato dentário (ortogonal a qualquer restauração): natural, resto radicular (radix), fraturado, preparado para coroa
- 👑 Restaurações por tipo × material: coroa / inlay / onlay / faceta / ponte em e.max, ouro, gradia, zircônia, metal, metalocerâmica, telescópica ou provisória (o onlay está disponível apenas em vista oclusal) — selecionadas em um único seletor combinado de poucos cliques "Fix: Coroa – …"; coroas `metal` legadas migram automaticamente para `metal-ceramic` (metalocerâmica); implantes usam o mesmo modelo tipo × material, composto com uma camada de conector de implante. O seletor é filtrado pelo tipo de dente: um implante oferece apenas coroa/ponte (além das cinco opções de fixação, abaixo); um dente ausente/espaço oferece apenas um pôntico de ponte (além de prótese parcial/total removível); um substrato `radix` oculta totalmente o controle de restauração (nenhuma restauração pode ser registrada em um resto radicular)
- 🦿 Prótese removível/de encaixe no eixo dedicado `prosthesis` (entradas "Kivehető:" no seletor combinado): cicatrizador do implante, locator, locator com sobredentadura, barra, barra com sobredentadura; prótese parcial ou total removível suportada por dentes
- 🌉 Os dentes de ponte renderizam tanto a capa da coroa quanto o conector do vão (saddle); um overlay de vão de ponte multi-dente renderiza um conector único e contínuo, sensível ao arco, ao longo de dentes de ponte consecutivos (pônticos + pilares) e dos espaços entre eles (as arcadas superior e inferior usam geometria de vão espelhada, mantendo o conector alinhado em ambas as arcadas), incluído na exportação PNG/JPG/SVG; aplicar uma ponte por uma predefinição de Estados recalcula o overlay imediatamente
- 🔍 Registro de cárie em 6 faces: mesial, distal, vestibular, lingual, oclusal, subcoroa
- 🪥 Materiais de restauração por face: amálgama, resina composta, ionômero de vidro (GIC), provisória
- 🏥 Um seletor unificado de "Estado pulpar/endodôntico" (agrupado: polpa vital vs. tratada/endo): os estados endodônticos (obturação medicamentosa, obturação de canal, obturação de canal incompleta, pino de fibra de vidro, pino metálico) e o diagnóstico pulpar AAE (`pulpDx`: normal / pulpite reversível / irreversível / necrose) são mutuamente exclusivos — um dente tratado endodonticamente (`endo` definido) não pode também ter um diagnóstico de polpa vital; ao tratar, `pulpDx` é normalizado para `normal` e o glifo de polpa doente é suprimido. A pulpite reversível renderiza um glifo de polpa reduzido. Um ajuste opcional de 3 níveis de detalhe pulpar (`pulpDetailLevel`: simple / AAE / latim prático) exibe 9 subtipos em latim prático (pulpa sana … gangraena pulpae) via `pulpLatin`; a resecção e o pino parapulpar continuam sendo indicadores especiais separados
- 🦴 O diagnóstico apical (`apicalDx`: periodontite apical sintomática/assintomática, abscesso apical agudo/crônico, osteíte condensante) determina diretamente o glifo periapical; um qualificador de subtipo de lesão granuloma/cisto é exibido apenas sob periodontite apical sintomática/assintomática (o subtipo redundante "abscesso" foi removido — já é coberto pelo diagnóstico apical)
- 🩹 Cartão unificado "Raiz e periodonto" (uma única seção recolhível para achados radiculares/periapicais e periodontais)
- ⚕️ Modificações: inflamação periapical (exibida apenas em dentes ausentes/alvéolo de extração; oculta em dentes presentes, onde apenas `apicalDx` determina o glifo periapical, e em implantes, onde `periImplant` cobre isso), doença periodontal, graus de mobilidade (M1/M2/M3, ocultos em implantes)
- 🦷🔩 Estado peri-implantar (`periImplant`: `none` / `mucositis` / `peri-implantitis-mild` / `peri-implantitis-moderate` / `peri-implantitis-severe`) — estadiamento do World Workshop de 2018, exibido como um seletor dedicado em implantes; a mucosite reutiliza o glifo gengival periodontal, a peri-implantite adiciona uma camada gradual `peri-implant-bone-loss` (opacidade 0,4/0,7/1,0). Os implantes não renderizam mais o glifo de lesão periapical — sua inflamação passa a ser expressa por esse eixo — e as caixas de seleção de modificadores periodontais ficam ocultas em implantes (a rotulagem improvisada da caixa "Peri-implantite" foi aposentada)
- 🏷️ Indicadores especiais: coroa necessária, substituição de coroa necessária, espaço fechado, extração planejada, selante de fissura, perda de ponto de contato
- 👁️ Alternância de visibilidade da vista oclusal, dos sisos, do osso e da polpa
- 🔢 12 filtros de seleção (todos, presentes, permanentes, decíduos, implantes, ausentes, superiores/inferiores, anteriores/molares)
- 📊 Predefinições de estado prontas (redefinir, dentição decídua, dentição mista, edêntulo)
- 📦 34 modelos de restauração predefinidos (pontes, próteses removíveis, próteses sobre barra com implantes)
- 💾 Exportação/importação de estado em JSON (versão 2.10; as importações continuam aceitando as versões legadas 1.4, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8 e 2.9 e são migradas automaticamente, com estados personalizados de plugins e anotações por dente)
- 🔗 Exportação HL7 FHIR R4 (Bundle de coleção com Observations por dente, codificação de dente ISO 3950 para dentição permanente, sistema de códigos local — mapeamento SNOMED CT planejado)
- ✚ Interface de seleção de faces em cruz/mais (B/M/O/D/L) para cáries e restaurações
- 🧱 Materiais de restauração por face (restaurações mistas, por exemplo amálgama vestibular + resina distal)
- 🖼️ Exportação da imagem do odontograma em PNG/JPG/SVG (para download; PNG/JPG rasterizados a partir do SVG vetorial)
- 🦷 Cárie/subcárie como uma máquina de estados por face: uma face cariada sem restauração é renderizada como cárie primária (opacidade em níveis ICDAS); assim que essa face tem uma restauração, ela é renderizada como cárie secundária (recorrente) (camada `subcaries-{surface}`, pontuada por CARS) — as duas nunca ficam ativas ao mesmo tempo na mesma face
- 🎯 Gravidade unificada por face (`cariesSeverity`, 0–6, substituindo os antigos campos separados de profundidade ICDAS e CARS): lida como profundidade ICDAS em uma face primária, como pontuação CARS nomeada (Hígido … Cavidade extensa) em uma recorrente, por meio de um popup contextual que mostra apenas a escala relevante para o estado atual da face
- 🌱 Cárie radicular (`rootCaries`: none / active / arrested / active-cavitated), que ativa a camada de ilustração dedicada de cárie radicular com opacidade determinada pela gravidade (active 0,5 / arrested 0,7 / active-cavitated opacidade total)
- 📡 Profundidade radiográfica da cárie (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 por face), independente da escala visual de gravidade ICDAS/CARS, exibida como um emblema e sincronizada por meio de sua própria Observation FHIR
- 🎚️ Três configurações de granularidade de cárie (`secondaryCariesMode`, `rootCariesMode`, `radiographicDepthMode`) além de um alternador `cariesDepthEnabled`, que reduzem cada escala a uma visão de seletor mais simples sem perder o valor armazenado
- 🩹 Linha de resumo de subcárie no painel de restaurações: lista, abaixo dos controles de restauração, qualquer dente selecionado com cárie secundária e suas faces (ex.: "36 (O) tem subcárie na restauração.")
- 🪛 Defeitos de restauração por face (`fillingDefect`: none / marginal / fracture / wear) em restaurações diretas, independentes da cárie secundária — registrados por meio de um indicador por face no cartão de Restaurações (espelhando o indicador de profundidade de cárie, com sua lista de opções empilhada verticalmente), renderizados no odontograma e exibidos na dica (tooltip) e no resumo de restaurações de boca inteira com um rótulo explícito (ex.: "36 (O) – Defeito de restauração: O: marginal"), da mesma forma que a cárie secundária é rotulada na linha de Cárie; o cartão de Restaurações também exibe uma nota de dica para qualquer dente selecionado com um defeito de restauração registrado (ex.: "O dente 36 tem um defeito de restauração registrado."), em paralelo à nota de dica de subcárie já existente
- 🦷💥 Desgaste dentário tipificado por causa clínica e localização (`wearEdge`: none / attrition / erosion, incisal/oclusal; `wearCervical`: none / abrasion / abfraction / erosion, cervical) — substituindo os dois alternadores liga/desliga de desgaste por bruxismo; registrado por meio de dois menus suspensos na linha de desgaste, reaproveita a ilustração de desgaste já existente e é exibido na dica e em uma nova seção de resumo de boca inteira "Desgaste"
- 🎨 Descoloração dentária por causa (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) em dentes permanentes e decíduos — tinge a coroa natural exibida com uma cor representativa quando o dente não tem restauração e tem substrato natural; exibida na dica e em uma nova seção de resumo de boca inteira "Descoloração"; completa o conjunto de condições de superfície e estruturais junto com os defeitos de restauração e o desgaste
- ✏️ Os dentes anteriores (incisivos/caninos) rotulam sua face oclusal como "incisal" em toda a interface (seletor, popup, resumos); a chave de face armazenada permanece `occlusal`
- 🔤 Notação de face sensível à posição (Configurações → Detalhes do dente → "Notação de face", simples/completa, padrão completa): no modo completo, a letra e o rótulo da face de cárie/restauração seguem a anatomia do dente — oclusal → I/incisal em dentes anteriores, vestibular → L/labial em dentes anteriores, lingual → P/palatina em dentes superiores e L/lingual em dentes inferiores (mesial/distal/subcoroa não são afetadas); o modo simples sempre usa o conjunto genérico B/M/O/D/L/SC, independentemente da posição do dente. Aplica-se ao resumo de boca inteira e aos seletores de face de cárie e de defeito de restauração (letra + legenda); a chave de face armazenada não é afetada
- 🦷↕️ Registro ortodôntico por dente (`orthoAppliance`: none / bracket / band; `orthoDrift`: none / mesial / distal; `orthoVertical`: none / extrusion / intrusion; `orthoRotation`: booleano) em um dente natural presente (permanente ou decíduo) — reaproveita a ilustração ortodôntica dormente da v2.5.0 (nenhum SVG novo); exibido no odontograma, na dica e em uma nova seção de resumo de boca inteira "Ortodontia"
- 🪨 Cálculo, e reabsorção radicular tipificada como interna ou cervical externa (`resorptionType`)
- 📏 Profundidade da cárie por face (superficial / dentina / profunda), ou pontuação ICDAS II opcional (0–6) via `enableIcdas`
- 🩹 Alternador de infiltração marginal de coroa, exibido apenas para restauração de coroa ou ponte
- 🧰 Barra superior unificada de ícones com um modal de Configurações por abas (Geral / Painéis / Detalhes do dente / Cárie / Polpa / Notas — numeração, anotações, visibilidade de painéis, ICDAS, alternador de profundidade de cárie, granularidade de cárie radicular/radiográfica, nível de detalhe pulpar, nível de detalhe de desgaste/descoloração dentária, informações do dente)
- 🗂️ Aba Configurações → "Painéis": exibe/oculta de forma independente os painéis de resumo de boca inteira de Estados e Ortodontia
- 🩹 Configurações de cárie secundária (CARS) unificadas na aba de configurações de Cárie, posicionadas acima da Profundidade radiográfica (a aba separada "Cárie secundária" foi aposentada)
- 🎚️ Nível de detalhe dos detalhes do dente (Configurações → Detalhes do dente): um ajuste simples/complexo para o desgaste dentário e para a descoloração. O modo simples exibe um alternador sim/não por achado (desgaste ligado → attrition/abrasion, descoloração ligada → other); o modo complexo (padrão) mantém os menus suspensos de tipo/causa, e o valor armazenado é preservado ao alternar entre os níveis
- 📋 Painel de informações do dente: resumo textual ao vivo de todo o odontograma (contagens de dentes, listas de presentes/ausentes, cáries incl. secundárias, restaurações, tratamentos de canal, próteses, implantes, estado periodontal) — exibido por padrão, alternável em Configurações
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
- 🩺 Dica por dente e painel de resumo de boca inteira modernizados: ambos exibem o conjunto completo de achados clínicos (diagnóstico pulpar/apical + subtipo de lesão, reabsorção radicular, estado peri-implantar, cárie radicular graduada, cálculo, infiltração marginal de coroa, fratura, perda de contato, desgaste de borda/cervical tipificado), com uma seção dedicada "Diagnósticos" no painel, uma seção dedicada "Desgaste", e um qualificador de gravidade de cárie simplificado (superficial/moderada/profunda)
- ♿ Acessibilidade por teclado (WCAG): papéis ARIA listbox/option, seleção com Enter/Espaço, navegação com setas, contornos focus-visible
- 🔒 Modo somente leitura: desativa todas as interações para casos de impressão/laudo/visualização
- ✨ Animações de seleção: borda tracejada pulsante e sombra brilhante nos dentes selecionados (com suporte a prefers-reduced-motion)
- 📝 Anotações por dente: clique duplo para adicionar/editar anotações, ícone de anotação ao lado do número do dente, dica ao passar o mouse com o texto da anotação, exportação/importação em JSON
- 🧪 864 testes automatizados aprovados (1 teste adicional ignorado) (Vitest) em 94 arquivos de teste cobrindo numeração, traduções, predefinições, i18n, componente App, tema, toque, plugins, acessibilidade e paridade dos eixos clínicos/diagnósticos
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

**🦷 Painel de edição do dente** (para o(s) dente(s) selecionado(s), agrupado em cartões recolhíveis):
- **Linha base:** seleção do dente (tipo base incl. variantes de coroa fraturada) e substrato dentário (natural/radix/fraturado/crownprep)
- **Linha de restauração:** o menu suspenso combinado de restauração "Fix: …" / "Kivehető: …" (opções fixas `restorationType`×`restorationMaterial` mais as opções de fixação/removível de `prosthesis`, filtradas pelo tipo de dente); caixa de seleção de infiltração marginal de coroa (apenas coroa/ponte); caixas de seleção de localização de coroa fraturada; alternadores de coroa necessária / substituição de coroa necessária
- **Linha de desgaste e descoloração:** menu suspenso de tipo de desgaste incisal/oclusal, menu suspenso de tipo de desgaste cervical, menu suspenso de causa de descoloração (cada um alterna para um toggle simples sim/não em Configurações → Detalhes do dente → modo simples)
- **Cartão de Ortodontia:** aparelho, desvio mesial/distal, movimento vertical (extrusão/intrusão), alternador de rotação — exibido em um dente natural presente
- **Cartão de Cárie:** menu suspenso de modo de profundidade de cárie, caixa de seleção de cárie subcoroa, menu suspenso de gravidade de cárie radicular, e o seletor de cárie por face B/M/O/D/L com um popup contextual de profundidade ICDAS/CARS e um emblema de profundidade radiográfica
- **Cartão de Restaurações:** menu suspenso de material de restauração, seletor de restauração por face (com material por face), indicador de defeito de restauração por face (marginal/fratura/desgaste), notas de dica de subcárie e de defeito de restauração
- **Cartão de Raiz e periodonto:** seletor unificado de "Estado pulpar/endodôntico", seletor de diagnóstico apical, seletor de subtipo de lesão periapical (apenas periodontite apical sintomática/assintomática), seletor de tipo de reabsorção radicular, seletor de grau de mobilidade, seletor de estado peri-implantar (apenas implantes)
- **Indicadores especiais:** plano/ferida de extração, espaço fechado, selamento de fissura, perda de ponto de contato, cálculo, pino parapulpar, resecção endodôntica, pilar de ponte

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

**Substrato dentário (dentes permanentes):**
`natural` (padrão), `radix` (resto radicular), `broken`, `crownprep` (preparada para coroa)

**Tipo de restauração (dentes permanentes):**
`none`, `crown`, `inlay`, `onlay` (apenas vista oclusal), `veneer`, `bridge`

**Material da restauração (dentes permanentes):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (coroas `metal` legadas migram para cá), `telescope`, `temporary`

**As opções de restauração são filtradas pelo tipo de dente** (`restorationOptions()` em `src/registry/restorations.ts`): um implante oferece apenas os tipos de restauração `crown`/`bridge` (compostos com uma camada de conector de implante) mais as cinco entradas de fixação `prosthesis` abaixo; um dente ausente/espaço oferece apenas um pôntico `bridge` mais as duas entradas de prótese removível `prosthesis`; um substrato `radix` oculta totalmente o controle de restauração. Os antigos campos planos `crownMaterial`/`bridgeUnit` (valores de fixação de implante/ponte anteriores à v1.14) foram aposentados do modelo ativo — são aceitos apenas como caminho de migração somente leitura para payloads antigos.

**Prosthesis** (`prosthesis`; eixo ortogonal removível/de fixação, exibido como entradas "Kivehető:" no menu suspenso de restauração combinado):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (fixações de implante, com ou sem sobredentadura), `removable-partial`, `removable-full` (próteses suportadas por dentes em um dente ausente/espaço). Um dente tem ou uma restauração fixa ou uma prótese, nunca ambas — definir uma limpa a outra.

**Infiltração marginal de coroa** (`crownLeakage`; booleano): exibida apenas quando `restorationType` é `crown` ou `bridge`; ativa a camada de ilustração `crown-leakage`.

**Opções endodônticas (dentes permanentes):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**Opções endodônticas (dentes decíduos):**
`none`, `endo-medical-filling`

`endo` e `pulpDx` são exibidos por meio de um único `<select>` unificado de "Estado pulpar/endodôntico" (agrupado: polpa vital vs. tratada/endo) e são mutuamente exclusivos — escolher uma opção tratada (`endo != none`) redefine `pulpDx` para `normal` e escolher um diagnóstico pulpar redefine `endo` para `none`.

**Materiais de restauração (dentes permanentes):**
`amalgam`, `composite`, `gic`, `temporary`

**Materiais de restauração (dentes decíduos):**
`composite`, `gic`, `temporary`

**Faces de restauração/cárie:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (apenas cárie)

**Modificações:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**Tipo de lesão periapical** (`periapicalType`; qualifica o glifo periapical, exibido apenas sob periodontite apical sintomática/assintomática):
`none`, `granuloma`, `cyst` — opções de registro; o valor legado `abscess` ainda é aceito/armazenado, mas não é mais oferecido no seletor, já que duplica o diagnóstico apical. Na importação ele é descartado: incorporado a `apicalDx` quando o dente carrega o modificador de inflamação, caso contrário é limpo para `none`

**Diagnóstico pulpar** (terminologia AAE; `pulpDx`):
`normal`, `reversible-pulpitis` (renderiza um glifo de polpa reduzido), `irreversible-pulpitis`, `necrosis` — mutuamente exclusivo com `endo`; normalizado para `normal` em um dente tratado endodonticamente

**Diagnóstico pulpar, latim prático** (`pulpLatin`; exibido pelo seletor de polpa apenas quando `pulpDetailLevel` é `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**Nível de detalhe pulpar** (`pulpDetailLevel`, ajuste global): `simple`, `aae` (padrão), `latin` — controla o vocabulário oferecido pelo seletor de polpa

**Diagnóstico apical** (`apicalDx`; determina o glifo periapical):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**Tipo de reabsorção radicular** (`resorptionType`):
`none`, `internal`, `external-cervical`

**Estado peri-implantar** (`periImplant`; apenas implante, estadiamento do World Workshop de 2018): `mucositis` reutiliza o glifo gengival periodontal; `peri-implantitis-*` adiciona a camada `peri-implant-bone-loss` com opacidade proporcional à gravidade (leve 0,4 / moderada 0,7 / severa 1,0). Os implantes não renderizam mais o glifo de lesão periapical (sua inflamação é expressa por esse eixo em vez disso), e as caixas de seleção de modificadores `mods` de inflamação/periodontal ficam ocultas em implantes:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**Gravidade da cárie** (`cariesSeverity`; campo unificado por face, `0`–`6`): em uma face sem restauração, é lida como a escala de profundidade ICDAS (`superficial` / `dentin` / `deep`, ou os códigos ICDAS II brutos `0–6` quando `enableIcdas` está ativado) e renderiza a camada primária `caries-{surface}`; em uma face com restauração, é lida como uma pontuação CARS nomeada (`0` sã … `6` cavidade extensa) e renderiza em vez disso a camada `subcaries-{surface}` (cárie secundária) — uma face nunca é primária e recorrente ao mesmo tempo

**Cárie radicular** (`rootCaries`; ativa a camada de ilustração `caries-root` em um dente presente, com opacidade determinada pela gravidade — `active` 0,5 / `arrested` 0,7 / `active-cavitated` opacidade total):
`none`, `active`, `arrested`, `active-cavitated`

**Profundidade radiográfica da cárie** (`radiographicDepth`; por face, independente da escala visual ICDAS/CARS `cariesSeverity`):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**Configurações de granularidade de cárie** (globais): `secondaryCariesMode` (`simple`/`standard`/`full`, padrão `standard`), `rootCariesMode` (`simple`/`severity`, padrão `simple`), `radiographicDepthMode` (`off`/`threeLevel`/`detailed`, padrão `off`), `cariesDepthEnabled` (booleano, padrão `true`) — cada um reduz sua escala a uma visão de seletor mais simples sem alterar o valor armazenado

**Indicadores especiais:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**Desgaste dentário** (`wearEdge`, `wearCervical`; tipo clínico por localização, filtrado por dente-base + sem restauração + substrato natural; renderiza as camadas já existentes `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Descoloração** (`discoloration`; causa por dente, filtrada por um dente-base natural ou dente decíduo + sem restauração + substrato natural; tinge o preenchimento da coroa natural exibida — nenhum SVG novo):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**Defeito de restauração** (`fillingDefect`; por face, achado de restauração direta independente da cárie secundária — filtrado às faces presentes em `fillingSurfaceMaterials`; renderiza a camada de ilustração `defect-{surface}`):
`none`, `marginal`, `fracture`, `wear`

**Ortodontia** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`; por dente, filtrado a um dente natural presente — permanente ou decíduo):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (glifo de seta para cima), `intrusion` (glifo de seta para baixo) — `orthoRotation`: booleano

**Configurações de detalhe/notação do dente** (configurações de sessão globais, Configurações → Detalhes do dente): `wearDetailLevel` e `discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`, padrão `complex` — o modo simples exibe um toggle sim/não em vez do menu suspenso completo de tipo/causa, sem alterar o valor armazenado) e `surfaceNotation` (`simple`/`full`, padrão `full` — controla se as letras/rótulos de face de cárie/restauração são sensíveis à posição; ver "Notação de face sensível à posição" acima)

### ⚙️ Configurações
Aberta a partir do ícone de engrenagem na barra superior; um diálogo ARIA `dialog` com captura de foco e layout em abas (Esc/clique fora para fechar, setas para alternar entre abas). Todas as configurações são apenas estado de UI de nível de sessão, salvo indicação em contrário — nenhuma delas altera os dados por dente ou o payload de exportação.

- **Geral:** sistema de numeração (FDI/Universal/Palmer), idioma, tema claro/escuro, visibilidade do painel de informações do dente
- **Painéis:** exibe/oculta de forma independente o cartão de Estados de boca inteira e o cartão de Ortodontia (ambos visíveis por padrão)
- **Detalhes do dente:** nível de detalhe de desgaste e nível de detalhe de descoloração (simples/complexo, ambos padrão complexo), notação de face (simples/completa, padrão completa)
- **Cárie:** alternador de pontuação ICDAS II (`enableIcdas`), alternador de profundidade de cárie (`cariesDepthEnabled`), granularidade de cárie radicular (`rootCariesMode`: simple/severity), granularidade secundária/CARS (`secondaryCariesMode`: simple/standard/full), granularidade de profundidade radiográfica (`radiographicDepthMode`: off/threeLevel/detailed) — a antiga aba separada "Cárie secundária" foi unificada nesta, com o controle CARS posicionado logo acima da profundidade radiográfica
- **Polpa:** nível de detalhe pulpar (`pulpDetailLevel`: simple/AAE/latim prático, padrão AAE) — controla o vocabulário oferecido pelo seletor de "Estado pulpar/endodôntico"; alterá-lo atualiza em tempo real o resumo de boca inteira e todas as dicas abertas
- **Notas:** ativar/desativar anotações por dente (`enableNotes`)

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

**Integração do modo escuro:**
- **Modo autônomo:** Omita a prop `darkMode` — o componente gerencia seu próprio estado de tema pelo botão de alternância da barra superior e adiciona/remove a classe `.dark` no `<html>`.
- **Modo controlado:** Passe `darkMode` e `onDarkModeChange` — o app pai controla o tema. O botão de alternância continua aparecendo, mas chama `onDarkModeChange` em vez de gerenciar o estado interno. O app pai é responsável por adicionar/remover a classe `.dark` no `<html>`.

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
npm run test           # Executa todos os 864 testes (1 teste adicional ignorado)
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
| `setPulpDetailLevel(level)` | Define o vocabulário do seletor de polpa — `"simple"`, `"aae"` ou `"latin"` |
| `getPulpDetailLevel()` | Obtém o nível de detalhe pulpar atual |
| `exportFhir(options?)` | Exporta o odontograma como um Bundle de coleção HL7 FHIR R4 (download em JSON). Referência `{ subject }` opcional; caso contrário, um Patient de espaço reservado é incorporado |
| `exportImage(format)` | Baixa o odontograma como imagem, `"png"` ou `"jpg"` |
| `exportSvg()` | Baixa o odontograma como SVG escalável (vetorial) |
| `importFhirBundle(input)` | Importa um Bundle FHIR R4 (objeto ou string JSON) produzido por este módulo |
| `setImportFormat(format)` | Define o parser da próxima importação de arquivo, `"status"` ou `"fhir"` |
| `startIntroTour()` | Inicia o tour interativo de introdução em 12 etapas |

### 💾 Formato de exportação/importação de estado
A exportação cria um arquivo JSON (versão `2.10`; as importações também aceitam as versões legadas `1.4`, `2.0`, `2.1`, `2.2`, `2.3`, `2.4`, `2.5`, `2.6`, `2.7`, `2.8` e `2.9` e migram automaticamente) contendo:

**Campos globais:**
- `wisdomVisible` - sisos visíveis
- `showBase` - camada do osso visível
- `occlusalVisible` - vista oclusal ativa
- `showHealthyPulp` - polpa saudável visível
- `edentulous` - modo edêntulo ativo

**Campos por dente (32 dentes):**
- `toothSelection` - tipo base do dente
- `toothSubstrate` - substrato dentário (natural/radix/broken/crownprep), ortogonal a qualquer restauração
- `restorationType` - tipo de restauração (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - material da restauração (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary), pareado com `restorationType`
- `prosthesis` - eixo removível/de fixação (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full), mutuamente exclusivo com um `restorationType` fixo de coroa/ponte
- `crownLeakage` - marcador de infiltração marginal de coroa, relevante apenas quando `restorationType` é coroa ou ponte
- `endo` - estado endodôntico; mutuamente exclusivo com `pulpDx` (exibidos juntos por meio de um único seletor unificado de "Estado pulpar/endodôntico" — tratar um dente normaliza `pulpDx` para `normal`)
- `mods` - array de modificações (inflammation, parodontal); `inflammation` foi aposentado da interface em dentes presentes (ali `apicalDx` determina o glifo), mas continua se aplicando a dentes ausentes/alvéolo de extração
- `caries` - faces com cárie ativa
- `cariesActiveDepth` - o valor de profundidade ICDAS temporariamente definido pelo seletor de profundidade de cárie ao aplicar uma nova face (não é um valor armazenado por face; ver `cariesSeverity` para o campo por face armazenado)
- `rootCaries` - gravidade da cárie radicular (none/active/arrested/active-cavitated)
- `cariesSeverity` - gravidade unificada por face (0-6): profundidade ICDAS em uma face primária (sem restauração), pontuação CARS em uma face recorrente (com restauração)
- `radiographicDepth` - profundidade radiográfica da cárie por face (none/E1/E2/D1/D2/D3), independente da escala visual ICDAS/CARS
- `fillingMaterial` - material de restauração
- `fillingSurfaces` - faces restauradas
- `fillingSurfaceMaterials` - material de restauração por face (restaurações mistas, por exemplo amálgama vestibular + resina distal)
- `fillingDefect` - defeito de restauração por face (none/marginal/fracture/wear), filtrado a faces restauradas, independente da cárie secundária
- `pulpDx` - diagnóstico pulpar AAE (normal/reversible-pulpitis/irreversible-pulpitis/necrosis); a pulpite reversível renderiza um glifo reduzido
- `pulpLatin` - subtipo pulpar em latim prático (exibido pelo seletor de polpa apenas quando `pulpDetailLevel` é `latin`)
- `apicalDx` - diagnóstico apical que determina o glifo periapical
- `periapicalType` - subtipo de lesão periapical (none/granuloma/cyst), exibido apenas sob periodontite apical sintomática/assintomática; o valor legado `abscess` ainda é aceito na importação
- `resorptionType` - tipo de reabsorção radicular (none/internal/external-cervical)
- `periImplant` - estado peri-implantar, apenas implante (none/mucositis/peri-implantitis-mild/-moderate/-severe), estadiamento do World Workshop de 2018
- `endoResection` - marcador de apicectomia
- `fissureSealing` - marcador de selante de fissura
- `calculus` - marcador de cálculo
- `contactMesial` - perda de ponto de contato mesial
- `contactDistal` - perda de ponto de contato distal
- `wearEdge` - tipo de desgaste incisal/oclusal (none/attrition/erosion)
- `wearCervical` - tipo de desgaste cervical (none/abrasion/abfraction/erosion)
- `discoloration` - causa de descoloração por dente (none/tetracycline/fluorosis/nonvital/extrinsic/other), tinge o preenchimento da coroa natural em um dente-base natural/decíduo sem restauração
- `orthoAppliance` - aparelho ortodôntico (none/bracket/band)
- `orthoDrift` - desvio ortodôntico (none/mesial/distal)
- `orthoVertical` - movimento vertical ortodôntico (none/extrusion/intrusion)
- `orthoRotation` - marcador de rotação ortodôntica
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
- `src/registry/` - registro declarativo de eixos clínicos: mapeamentos de campos FHIR, ativação de conjunto-de-limpeza-SVG/marcador booleano, matriz tipo×material de restauração, listas de opções da interface (fonte única de verdade que gera exportação/importação, FHIR e a interface dos seletores)
- `src/fhir/` - exportação/importação HL7 FHIR R4: `toFhir.ts`/`fromFhir.ts`, sistemas de códigos, mapeamentos de campos, primitivas
- `src/bridgeOverlay.ts` - overlay de conector de vão de ponte multi-dente (geometria de vão sensível ao arco)
- `src/SettingsModal.tsx` - diálogo de Configurações por abas (Geral/Painéis/Detalhes do dente/Cárie/Polpa/Notas)
- `src/__tests__/` + `src/registry/__tests__/` - suíte de testes Vitest (864 testes aprovados, 1 ignorado, em 94 arquivos)
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
