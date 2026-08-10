# 🦷 React Advanced Odontogram

[![Download](https://img.shields.io/badge/Download-React--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-2.3.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![npm](https://img.shields.io/npm/v/react-advanced-odontogram?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/react-advanced-odontogram)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Langues :**  🇬🇧 [English](README-en.md) | 🇪🇸 [Español](README-es.md) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇦 [العربية](README-ar.md) | 🇨🇳 [简体中文](README-zh.md) | 🇫🇷 [Français](README-fr.md)

---

## 🇫🇷 Français

### 📋 Aperçu général
Ce projet est un éditeur d'odontogramme dentaire interactif basé sur un navigateur Web, conçu pour une saisie rapide du schéma dentaire avec une interface claire. Il génère des modèles de dents SVG superposés pour représenter les restaurations, les caries, le statut endodontique, la mobilité et d'autres détails cliniques, tout en offrant la sélection multiple, des filtres de sélection et des préréglages d'état prédéfinis.

---
![Aperçu du module odontogramme en français](screenshot_en_odontogram.png)

🔗 **URL de démonstration :** https://react-odontogram-modul.vercel.app/

---

### 📦 Utilisation comme paquet npm

L'odontogramme est fourni sous forme de bibliothèque de composants React autonome sur npm :
[`react-advanced-odontogram`](https://www.npmjs.com/package/react-advanced-odontogram).

#### Prérequis
- **React 18 ou 19** (déclaré comme dépendance de pair).
- Un **bundler** prenant en charge le champ `exports` et ESM : Vite, webpack 5, Next.js, Rollup, esbuild, Parcel. Le paquet est **ESM uniquement**.
- Node **≥ 18** pour les outils de développement.

#### Installation

```bash
npm install react-advanced-odontogram react react-dom
```

#### Utilisation de base

Rendrez `OdontogramShell` et importez la feuille de style **une seule fois** n'importe où dans votre application :

```tsx
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export function Chart() {
  return (
    <OdontogramShell
      language="fr"          // hu | en | de | es | it | sk | pl | ru | pt-br | ar | zh | fr
      numberingSystem="FDI"  // FDI | Universal | Palmer
      darkMode={false}
    />
  );
}
```

#### Props du composant

`OdontogramShell` est un composant contrôlé. Les props les plus courantes sont :

| Prop | Type | Par défaut | Description |
|------|------|---------|-------------|
| `language` | `Language` | `"hu"` | Langue de l'interface (`hu`/`en`/`de`/`es`/`it`/`sk`/`pl`/`ru`/`pt-br`/`ar`/`zh`/`fr`). |
| `numberingSystem` | `"FDI" \| "Universal" \| "Palmer"` | `"FDI"` | Système de numérotation dentaire. |
| `darkMode` | `boolean` | `false` | Activation du mode sombre. |
| `readOnly` | `boolean` | `false` | Désactive toute modification (lecture seule). |
| `themeConfig` | `OdontogramThemeConfig` | — | Surcharge des variables CSS du thème (`--odon-*`). |
| `plugins` | `OdontogramPlugin[]` | — | Enregistrement de plugins personnalisés d'état / calques. |
| `enableNotes` | `boolean` | `false` | Active les notes par dent. |
| `enableIcdas` | `boolean` | `false` | Active le système d'évaluation des caries ICDAS II. |
| `onLanguageChange` / `onNumberingChange` / `onDarkModeChange` | `(value) => void` | — | Déclenché lorsque l'utilisateur modifie un paramètre dans l'UI. |

#### API publique (exports nommés)

`OdontogramShell` est à la fois l'exportation par défaut et une exportation nommée. L'API d'état impératif, le composant `PerioChart` autonome, la visite guidée et tous les types publics sont exportés depuis le même point d'entrée :

```ts
import {
  OdontogramShell,           // également l'export par défaut
  PerioChart,                // composant de bilan parodontal autonome
  getOdontogramSummary,
  getToothStateSummary,
  onStateChange,             // s'abonner aux changements d'état
  exportFhir,                // bundle HL7 FHIR R4
  exportSvg, exportImage,    // exportation vectorielle / image du schéma
  setImportFormat,
  setReadOnly, getReadOnly,
  clearSelection,
  registerPlugins, setPluginState, getPluginState,
  startIntroTour,            // lancer la visite guidée
} from "react-advanced-odontogram";
```

#### Utilisation avec Next.js (App Router)

Le composant est côté client uniquement (lit le DOM au montage) :

```tsx
"use client";
import { OdontogramShell } from "react-advanced-odontogram";
import "react-advanced-odontogram/style.css";

export default function OdontogramClient() {
  return <OdontogramShell language="fr" numberingSystem="FDI" />;
}
```

---

### ✨ Fonctionnalités clés
- 🖱️ Sélection rapide et multi-sélection (CMD/CTRL + clic)
- 🦷 Types de dents : permanente, temporaire (lactéale), implant, sous-gingivale, absente
- 👑 Restaurations par type × matériau : couronne / inlay / onlay / facette / pont en e.max, or, gradia, zircone, métal, céramo-métallique, téléscope ou temporaire
- 🔍 Détection de caries sur 6 surfaces : mésiale, distale, vestibulaire, linguale, occlusale, sous-coronaire
- 🪥 Matériaux d'obturation par surface : amalgame, composite, CVI, temporaire
- 🏥 Diagnostic pulpaire et traitements endodontiques complets
- 🩺 Module parodontal complet avec bilan graphique et classification 2017
- 🔗 Exportation/Importation HL7 FHIR R4 et JSON
- 🖼️ Exportation d'images PNG / JPG / SVG et rapport PDF
- 🔢 Numérotation FDI / Universelle / Palmer
- 🌐 Interface disponible en 12 langues dont le Français (FR)
