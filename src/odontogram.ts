// @ts-nocheck
import { STATUS_EXTRAS } from "./status_extras";
/* Tooth SVG Test UI (v2) - vanilla JS */

const TEMPLATES = {
  11: "/svgs/11.svg",
  13: "/svgs/13.svg",
  14: "/svgs/14.svg",
  16: "/svgs/16.svg",
};
const TEMPLATES_OCCL = {
  14: "/svgs/14_occl.svg",
  16: "/svgs/16_occl.svg",
};

// Tooth mapping in details:
// 11: 11,12 -> no rotate, no mirror; 21,22 -> no rotate, mirror Y
//     31,32 -> rotate 180; 41,42 -> rotate 180 + mirror Y
// 13: 13 -> no rotate; 23 -> mirror Y; 33 -> rotate 180; 43 -> rotate 180 + mirror Y
// 14: 14,15 -> no rotate; 24,25 -> mirror Y; 34,35 -> rotate 180; 44,45 -> rotate 180 + mirror Y
// 16: 16,17,18 -> no rotate; 26,27,28 -> mirror Y; 36,37,38 -> rotate 180; 46,47,48 -> rotate 180 + mirror Y
const TOOTH_TEMPLATE = new Map([
  // 11 template
  [11, {tpl:11, rot:0, mirror:false}], [12,{tpl:11,rot:0,mirror:false}],
  [21,{tpl:11,rot:0,mirror:true}], [22,{tpl:11,rot:0,mirror:true}],
  [31, {tpl:11, rot:180, mirror:false}], [32,{tpl:11,rot:180,mirror:false}],
  [41,{tpl:11,rot:180,mirror:true}], [42,{tpl:11,rot:180,mirror:true}],
  // 13 template
  [13,{tpl:13,rot:0,mirror:false}],
  [23,{tpl:13,rot:0,mirror:true}],
  [33,{tpl:13,rot:180,mirror:false}],
  [43,{tpl:13,rot:180,mirror:true}],
  // 14 template
  [14,{tpl:14,rot:0,mirror:false}],[15,{tpl:14,rot:0,mirror:false}],
  [24,{tpl:14,rot:0,mirror:true}],[25,{tpl:14,rot:0,mirror:true}],
  [34,{tpl:14,rot:180,mirror:false}],[35,{tpl:14,rot:180,mirror:false}],
  [44,{tpl:14,rot:180,mirror:true}],[45,{tpl:14,rot:180,mirror:true}],
  // 16 template
  [16,{tpl:16,rot:0,mirror:false}],[17,{tpl:16,rot:0,mirror:false}],[18,{tpl:16,rot:0,mirror:false}],
  [26,{tpl:16,rot:0,mirror:true}],[27,{tpl:16,rot:0,mirror:true}],[28,{tpl:16,rot:0,mirror:true}],
  [36,{tpl:16,rot:180,mirror:false}],[37,{tpl:16,rot:180,mirror:false}],[38,{tpl:16,rot:180,mirror:false}],
  [46,{tpl:16,rot:180,mirror:true}],[47,{tpl:16,rot:180,mirror:true}],[48,{tpl:16,rot:180,mirror:true}],
]);

const ALL_TEETH = [
  18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28,
  48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38
];

const GROUPS = {
  variants: [
    "tooth-broken-inicisal",
    "tooth-broken-distal-inicisal",
    "tooth-broken-distal",
    "tooth-broken-mesial-distal-inicisal",
    "tooth-broken-mesial-distal",
    "tooth-broken-mesial-inicisal",
    "tooth-broken-mesial",
    "tooth-crownprep",
    "tooth-under-gum",
    "no-tooth-after-extraction",
  ],
  mods: ["inflammation", "parodontal", "mobility"],
  endo: ["endo-medical-filling", "endo-filling", "endo-glass-pin", "endo-metal-pin", "endo-resection"],
  caries: ["caries-subcrown","caries-buccal","caries-lingual","caries-mesial","caries-distal","caries-occlusal"],
  fillingSurfaces: ["buccal","lingual","mesial","distal","occlusal"],
  crownMaterial: ["zircon","metal","temporary","telescope","emax"],
};

const MILKTOOTH_BLOCKED = new Set([16,17,18,26,27,28,36,37,38,46,47,48]);
const FISSURE_ALLOWED = new Set([16,17,26,27,36,37,46,47]);
const BROKEN_VARIANTS = new Set([
  "tooth-broken-inicisal",
  "tooth-broken-distal-inicisal",
  "tooth-broken-distal",
  "tooth-broken-mesial-inicisal",
  "tooth-broken-mesial",
]);
const PRIMARY_MILK = new Set([11,12,13,14,15,21,22,23,24,25,31,32,33,34,35,41,42,43,44,45]);
const MIXED_PERMANENT = new Set([11,12,16,21,22,26,31,32,36,41,42,46]);
const MIXED_MILK = new Set([13,14,15,23,24,25,33,34,35,43,44,45]);
const MIXED_NONE = new Set([17,18,27,28,37,38,47,48]);

function defaultState(){
  return {
    toothSelection: "tooth-base", // none | tooth-base | milktooth | implant | variants
    pulpInflam: false,
    endoResection: false,
    mods: new Set(),
    endo: "none", // none | endo-medical-filling | endo-filling | endo-glass-pin | endo-metal-pin
    caries: new Set(),
    fillingMaterial: "none", // none | amalgam | composite | gic
    fillingSurfaces: new Set(), // buccal/mesial/distal/occlusal
    fissureSealing: false,
    contactMesial: false,
    contactDistal: false,
    bruxismWear: false,
    bruxismNeckWear: false,
    brokenMesial: false,
    brokenIncisal: false,
    brokenDistal: false,
    extractionWound: false,
    extractionPlan: false,
    bridgePillar: false,
    bridgeUnit: "none", // none | removable | zircon | metal | temporary
    mobility: "none", // none | m1 | m2 | m3
    crownMaterial: "natural",   // natural | broken | emax | zircon | metal | temporary | telescope
  };
}

// ---- DOM helpers ----
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

function el(tag, attrs={}, children=[]){
  const n=document.createElement(tag);
  for(const [k,v] of Object.entries(attrs)){
    if(k==="class") n.className=v;
    else if(k==="html") n.innerHTML=v;
    else if(k.startsWith("on") && typeof v==="function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k,v);
  }
  for(const c of children) n.appendChild(c);
  return n;
}

function setActive(node, on){
  if(!node) return;
  node.setAttribute("data-active", on ? "1":"0");
}

function stripDisplayNoneToDataActive(root){
  // Convert inline style display:none -> data-active=0, and remove display property from style.
  const nodes = $$("[id]", root);
  for(const n of nodes){
    const style = n.getAttribute("style");
    if(style && /display\s*:\s*none/i.test(style)){
      n.setAttribute("data-active","0");
      // remove display: none; (and possible surrounding semicolons/spaces)
      const newStyle = style
        .replace(/display\s*:\s*none\s*;?/ig, "")
        .replace(/;;+/g,";")
        .trim();
      if(newStyle) n.setAttribute("style", newStyle);
      else n.removeAttribute("style");
    }
  }
}

function ensureDataActiveForSwitchables(root){
  // Every element that is inside these switchable groups and has an id should get data-active (default 0 if missing)
  const switchableGroups = ["mods","tooth-variants","endos","surfaces","restorations"];
  for(const gId of switchableGroups){
    const g = root.getElementById ? root.getElementById(gId) : $("#"+gId, root);
    if(!g) continue;
    for(const n of $$("[id]", g)){
      if(!n.hasAttribute("data-active")) n.setAttribute("data-active","0");
    }
  }
  // Tooth base + pulps should also be consistent
  for(const id of ["tooth-base","tooth-healthy-pulp","tooth-inflam-pulp","milktooth-base","milktooth-beauty","milktooth-healthy-pulp","milktooth-inflam-pulp","tooth-bruxism-wear","tooth-bruxism-neck-wear"]){
    const n = $("#"+id, root);
    if(n && !n.hasAttribute("data-active")) n.setAttribute("data-active","0");
  }
}

function rotate180(svgRoot){
  // rotate around center using a wrapper group
  const vb = svgRoot.getAttribute("viewBox") || "0 0 32 64";
  const parts = vb.trim().split(/\s+/).map(Number);
  const cx = parts[0] + parts[2]/2;
  const cy = parts[1] + parts[3]/2;
  // wrap existing content into a new group
  const g = document.createElementNS("http://www.w3.org/2000/svg","g");
  while(svgRoot.firstChild){
    g.appendChild(svgRoot.firstChild);
  }
  g.setAttribute("transform", `rotate(180 ${cx} ${cy})`);
  svgRoot.appendChild(g);
}

function mirrorVertical(svgRoot){
  // mirror vertically (left-right) around center using a wrapper group
  const vb = svgRoot.getAttribute("viewBox") || "0 0 32 64";
  const parts = vb.trim().split(/\s+/).map(Number);
  const cx = parts[0] + parts[2]/2;
  const g = document.createElementNS("http://www.w3.org/2000/svg","g");
  while(svgRoot.firstChild){
    g.appendChild(svgRoot.firstChild);
  }
  g.setAttribute("transform", `scale(-1 1) translate(${-2*cx} 0)`);
  svgRoot.appendChild(g);
}

function svgGetById(root, id){
  return root.getElementById ? root.getElementById(id) : $("#"+id, root);
}

function setManyActive(root, ids, on){
  for(const id of ids){
    setActive(svgGetById(root,id), on);
  }
}

function clearAllInGroup(root, ids){
  setManyActive(root, ids, false);
}

// ---- App state ----
const toothState = new Map(); // toothNo -> state
const toothSvgRoot = new Map(); // toothNo -> [svg elements]
const toothTile = new Map(); // toothNo -> [tile elements]
const toothLabelUpper = new Map(); // toothNo -> label element
const toothLabelLower = new Map(); // toothNo -> label element
let activeTooth = null;
let selectedTeeth = new Set();
let edentulous = false;
let wisdomVisible = true;
let showBase = true;
let occlusalVisible = true;
let showHealthyPulp = true;
let suppressEdentulousSync = false;

// ---- UI builders ----
function buildRadios(container, name, options, onChange){
  container.innerHTML = "";
  for(const opt of options){
    const id = `${name}-${opt.value}`;
    const label = el("label", {}, [
      el("input", { type:"radio", name, id, value:opt.value }),
      el("span", { html: opt.label })
    ]);
    label.querySelector("input").addEventListener("change", (e)=>onChange(e.target.value));
    container.appendChild(label);
  }
}

function buildChecks(container, items, onToggle){
  container.innerHTML = "";
  for(const it of items){
    const id = `chk-${it.value}`;
    const labelId = `lbl-${it.value}`;
    const label = el("label", {}, [
      el("input", { type:"checkbox", id, value:it.value }),
      el("span", { id: labelId, html: it.label })
    ]);
    const input = label.querySelector("input");
    input.addEventListener("change", (e)=>onToggle(it.value, e.target.checked));
    if(container.id === "cariesChecks" && it.value === "caries-subcrown"){
      setDisabled(input, true);
    }
    container.appendChild(label);
  }
}

function buildSelect(selectEl, options, onChange){
  selectEl.innerHTML = "";
  for(const opt of options){
    const o = el("option", { value: opt.value, html: opt.label });
    selectEl.appendChild(o);
  }
  selectEl.addEventListener("change", (e)=>onChange(e.target.value));
}

async function loadInlineIcon(button){
  if(!button) return;
  const src = button.dataset.iconSrc;
  if(!src) return;
  try{
    const res = await fetch(src, { cache: "no-store" });
    if(!res.ok) return;
    const txt = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(txt, "image/svg+xml");
    const svg = doc.documentElement;
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.classList.add("icon-svg");
    button.innerHTML = "";
    button.appendChild(svg);
  }catch(_e){
    // ignore icon load failures
  }
}

function syncIconXLine(button){
  if(!button || !button.dataset.xline) return;
  const pressed = button.getAttribute("aria-pressed") === "true";
  const line = button.querySelector("#x-line");
  if(line) line.style.display = pressed ? "none" : "";
}

function updateWarnings(state){
  const w = $("#warnings");
  if(!w) return;
  w.innerHTML = "";
}

function getControlLabel(control){
  if(!control) return null;
  const wrapped = control.closest ? control.closest("label") : null;
  if(wrapped) return wrapped;
  if(control.id){
    return document.querySelector(`label[for="${control.id}"]`);
  }
  return null;
}

function syncControlLabelVisibility(control){
  const label = getControlLabel(control);
  if(!label) return;
  label.style.display = control.disabled ? "none" : "";
}

function setDisabled(control, disabled){
  if(!control) return;
  control.disabled = !!disabled;
  syncControlLabelVisibility(control);
}

function setToggleButton(btn, on){
  if(!btn) return;
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  syncIconXLine(btn);
}

function isToothPresent(sel){
  return sel !== "none" && sel !== "implant";
}

function isUnderGum(sel){
  return sel === "tooth-under-gum";
}

function isExtraction(sel){
  return sel === "no-tooth-after-extraction";
}

function getDisplayedToothNumber(toothNo){
  const s = toothState.get(toothNo);
  if(!s || s.toothSelection !== "milktooth") return toothNo;
  const firstDigit = Math.floor(toothNo / 10);
  const secondDigit = toothNo % 10;
  const mappedFirst = firstDigit === 1 ? 5 : firstDigit === 2 ? 6 : firstDigit === 3 ? 7 : 8;
  return mappedFirst * 10 + secondDigit;
}

function updateToothTileNumber(toothNo){
  const tiles = toothTile.get(toothNo);
  if(!tiles) return;
  const text = String(getDisplayedToothNumber(toothNo));
  const upper = toothLabelUpper.get(toothNo);
  if(upper) upper.textContent = text;
  const lower = toothLabelLower.get(toothNo);
  if(lower) lower.textContent = text;
}

function updateAllToothTileNumbers(){
  for(const toothNo of ALL_TEETH){
    updateToothTileNumber(toothNo);
  }
}

function setSelectOptions(selectEl, options, value){
  if(!selectEl) return;
  selectEl.innerHTML = "";
  for(const opt of options){
    selectEl.appendChild(el("option", { value: opt.value, html: opt.label }));
  }
  if(options.some(o => o.value === value)){
    selectEl.value = value;
  }else{
    selectEl.value = options[0]?.value ?? "";
  }
}

function getEndoOptions(isMilktooth){
  if(isMilktooth){
    return [
      {value:"none", label:"egészséges foggyökér"},
      {value:"endo-medical-filling", label:"gyógyszeres gyökértömés"},
    ];
  }
  return [
    {value:"none", label:"egészséges foggyökér"},
    {value:"endo-medical-filling", label:"gyógyszeres gyökértömés"},
    {value:"endo-filling", label:"gyökértömés"},
    {value:"endo-glass-pin", label:"gyökértömés, üvegszálas csappal"},
    {value:"endo-metal-pin", label:"gyökértömés, fémcsappal"},
  ];
}

function getFillingOptions(isMilktooth){
  if(isMilktooth){
    return [
      {value:"none", label:"nincs tömés"},
      {value:"composite", label:"kompozit tömés"},
      {value:"gic", label:"üvegionomer tömés"},
    ];
  }
  return [
    {value:"none", label:"nincs tömés"},
    {value:"amalgam", label:"amalgám tömés"},
    {value:"composite", label:"kompozit tömés"},
    {value:"gic", label:"üvegionomer tömés"},
  ];
}

function getCrownOptions(isImplant){
  if(isImplant){
    return [
      {value:"natural", label:"nincs"},
      {value:"healing-abutment", label:"gyógyulási csavar"},
      {value:"zircon", label:"cirkon korona"},
      {value:"metal", label:"fémkerámia korona"},
      {value:"temporary", label:"ideiglenes korona"},
      {value:"locator", label:"lokátor"},
      {value:"locator-prosthesis", label:"lokátor + műfog"},
      {value:"bar", label:"stéges implant"},
      {value:"bar-prosthesis", label:"stég + műfog"},
    ];
  }
  return [
    {value:"natural", label:"teljes korona"},
    {value:"broken", label:"törött korona"},
    {value:"emax", label:"préskerámia betét"},
    {value:"zircon", label:"cirkon korona"},
    {value:"metal", label:"fémkerámia korona"},
    {value:"temporary", label:"ideiglenes korona"},
    {value:"telescope", label:"teleszkóp korona"},
  ];
}

function getBrokenCrownVariant(state){
  const m = !!state.brokenMesial;
  const i = !!state.brokenIncisal;
  const d = !!state.brokenDistal;
  if(m && d && i) return "tooth-broken-mesial-distal-inicisal";
  if(m && d) return "tooth-broken-mesial-distal";
  if(d && i) return "tooth-broken-distal-inicisal";
  if(m && i) return "tooth-broken-mesial-inicisal";
  if(d) return "tooth-broken-distal";
  if(m) return "tooth-broken-mesial";
  if(i) return "tooth-broken-inicisal";
  return null;
}

function getBridgeUnitOptions(){
  return [
    {value:"none", label:"nincs"},
    {value:"removable", label:"kivehető fogpótlás"},
    {value:"zircon", label:"cirkon hídtag"},
    {value:"metal", label:"fémkerámia hídtag"},
    {value:"temporary", label:"ideiglenes hídtag"},
    {value:"bar", label:"stég áthidalás"},
    {value:"bar-prosthesis", label:"stég + műfog"},
  ];
}

function getStatusExtras(){
  if(!STATUS_EXTRAS || !Array.isArray(STATUS_EXTRAS.options)) return [];
  return STATUS_EXTRAS.options;
}

function getStatusExtrasMeta(){
  return STATUS_EXTRAS?.arches || null;
}

function getMobilityOptions(){
  return [
    {value:"none", label:"nincs"},
    {value:"m1", label:"1. fokú"},
    {value:"m2", label:"2. fokú"},
    {value:"m3", label:"3. fokú"},
  ];
}

// ---- SVG apply logic ----
function applyStateToSvgSingle(toothNo, svg){
  const state = toothState.get(toothNo);
  if(!state || !svg) return;

  // 0) Start from a clean baseline: turn OFF all switchables, then apply ON flags.
  // (Base stays as in SVG; we don't toggle #base)
  const switchable = ["mods","tooth-variants","endos","surfaces","restorations","tooth"];
  for(const gId of switchable){
    const g = svgGetById(svg, gId);
    if(!g) continue;
    // Keep group itself active; we toggle children by id
    // But for simplicity, if group has data-active, keep at 1 so children can show.
    if(g.hasAttribute("data-active")) g.setAttribute("data-active","1");
  }

  // Turn OFF all known items
  setActive(svgGetById(svg, "tooth-base"), false);
  setActive(svgGetById(svg, "tooth-healthy-pulp"), false);
  setActive(svgGetById(svg, "tooth-inflam-pulp"), false);
  setActive(svgGetById(svg, "tooth-bruxism-wear"), false);
  setActive(svgGetById(svg, "tooth-bruxism-neck-wear"), false);
  setActive(svgGetById(svg, "endo-resection"), false);
  setActive(svgGetById(svg, "milktooth-base"), false);
  setActive(svgGetById(svg, "milktooth-beauty"), false);
  setActive(svgGetById(svg, "milktooth-healthy-pulp"), false);
  setActive(svgGetById(svg, "milktooth-inflam-pulp"), false);
  setActive(svgGetById(svg, "fissure-sealing"), false);
  setActive(svgGetById(svg, "mesial-no-contact-point"), false);
  setActive(svgGetById(svg, "distal-no-contact-point"), false);
  setActive(svgGetById(svg, "no-tooth-after-extraction"), false);
  clearAllInGroup(svg, GROUPS.variants);
  clearAllInGroup(svg, GROUPS.mods);
  clearAllInGroup(svg, GROUPS.endo);
  // Caries: subcrown and surface groups
  // caries-distal etc are groups, buccal/subcrown are paths
  for(const id of ["caries-subcrown","caries-buccal","caries-lingual","caries-distal","caries-mesial","caries-occlusal"]){
    setActive(svgGetById(svg,id), false);
  }
  // Fillings
  for(const mat of ["amalgam","composite","gic"]){
    for(const s of GROUPS.fillingSurfaces){
      setActive(svgGetById(svg, `filling-${mat}-${s}`), false);
    }
  }
  // Restorations
  for(const id of ["implant-base","implant-connector","implant-healing-abutment","implant-locator-screw","implant-bar","prosthesis","prosthesis-implant","prosthesis-implant-crown","prosthesis-implant-gum","telescope","zircon","metal","temporary","emax-crown","zircon-crown","metal-crown","temporary-crown","telescope-crown-inside","telescope-crown-outside","extraction-plan","zircon-bridge-connector","metal-bridge-connector","temporary-bridge-connector","telescope-bridge-connector"]){
    setActive(svgGetById(svg,id), false);
  }

  const hasCrown = state.crownMaterial !== "natural";
  const brokenVariant = state.crownMaterial === "broken" ? getBrokenCrownVariant(state) : null;
  const isImplant = state.toothSelection === "implant";
  const isMilktooth = state.toothSelection === "milktooth";
  const underGum = isUnderGum(state.toothSelection);
  const extraction = isExtraction(state.toothSelection) || (state.toothSelection === "none" && state.extractionWound);
  const hasRemovable = state.toothSelection === "none" && state.bridgeUnit === "removable";
  const isNone = state.toothSelection === "none";
  const hasRestoration = hasCrown || hasRemovable;
  const fissureAllowed = state.toothSelection === "tooth-base" && FISSURE_ALLOWED.has(toothNo);
  const contactAllowed = state.toothSelection === "tooth-base" || state.toothSelection === "milktooth" || BROKEN_VARIANTS.has(state.toothSelection);
  const bruxismAllowed = state.toothSelection === "tooth-base" && state.crownMaterial === "natural";
  const extractionPlanAllowed = ["tooth-base","milktooth","implant","tooth-crownprep","tooth-under-gum"].includes(state.toothSelection);

  // base visibility toggle
  setActive(svgGetById(svg, "base"), showBase);

  // 1) Tooth selection
  setActive(svgGetById(svg, "implant"), isImplant);
  setActive(svgGetById(svg, "milktooth"), isMilktooth);

  if(isImplant){
    setActive(svgGetById(svg, "implant-base"), true);
  }else if(isMilktooth){
    setActive(svgGetById(svg, "milktooth-base"), true);
    setActive(svgGetById(svg, "milktooth-beauty"), true);
    if(state.pulpInflam){
      setActive(svgGetById(svg, "milktooth-inflam-pulp"), true);
    }else if(showHealthyPulp){
      setActive(svgGetById(svg, "milktooth-healthy-pulp"), true);
    }
  }else if(isToothPresent(state.toothSelection)){
    if(state.toothSelection === "tooth-base"){
      setActive(svgGetById(svg, "tooth-base"), true);
    }else{
      setActive(svgGetById(svg, state.toothSelection), true);
    }
    if(!underGum && !extraction){
      // Pulpa: show when tooth is present
      if(state.pulpInflam){
        setActive(svgGetById(svg, "tooth-inflam-pulp"), true);
      }else if(showHealthyPulp){
        setActive(svgGetById(svg, "tooth-healthy-pulp"), true);
      }
    }
  }
  if(brokenVariant && state.toothSelection === "tooth-base"){
    setActive(svgGetById(svg, "tooth-base"), false);
    setActive(svgGetById(svg, brokenVariant), true);
  }
  if(state.toothSelection === "none" && state.extractionWound){
    setActive(svgGetById(svg, "no-tooth-after-extraction"), true);
  }

  // 2) Mods
  for(const id of state.mods){
    setActive(svgGetById(svg, id), true);
  }
  if(state.mobility !== "none" && state.toothSelection !== "none" && !extraction){
    setActive(svgGetById(svg, "mobility"), true);
  }
  if(state.extractionPlan && extractionPlanAllowed){
    setActive(svgGetById(svg, "extraction-plan"), true);
  }

  // 3) Endo exclusivity (only if tooth present)
  if(isToothPresent(state.toothSelection) && !underGum && !extraction){
    if(state.endo === "endo-medical-filling"){
      setActive(svgGetById(svg, "endo-medical-filling"), true);
    } else if(state.endo === "endo-filling"){
      setActive(svgGetById(svg, "endo-filling"), true);
    } else if(state.endo === "endo-glass-pin"){
      setActive(svgGetById(svg, "endo-filling"), true);
      setActive(svgGetById(svg, "endo-glass-pin"), true);
    } else if(state.endo === "endo-metal-pin"){
      setActive(svgGetById(svg, "endo-filling"), true);
      setActive(svgGetById(svg, "endo-metal-pin"), true);
    }
  }
  if(state.endoResection && isToothPresent(state.toothSelection) && !underGum && !extraction){
    setActive(svgGetById(svg, "endo-resection"), true);
  }

  // 4) Removable prosthesis
  if(hasRemovable){
    setActive(svgGetById(svg, "prosthesis"), true);
    setActive(svgGetById(svg, "prosthesis-crown"), true);
    setActive(svgGetById(svg, "prosthesis-connector"), true);
  }

  // crown materials (zircon/metal/temporary/telescope)
  if(isImplant){
    if(state.crownMaterial === "healing-abutment"){
      setActive(svgGetById(svg, "implant-healing-abutment"), true);
    } else if(["zircon","metal","temporary"].includes(state.crownMaterial)){
      setActive(svgGetById(svg, "implant-connector"), true);
    } else if(state.crownMaterial === "locator"){
      setActive(svgGetById(svg, "restorations"), true);
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-connector"), true);
      setActive(svgGetById(svg, "implant-locator-screw"), true);
    } else if(state.crownMaterial === "locator-prosthesis"){
      setActive(svgGetById(svg, "restorations"), true);
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-connector"), true);
      setActive(svgGetById(svg, "implant-locator-screw"), true);
      setActive(svgGetById(svg, "prosthesis-implant"), true);
      setActive(svgGetById(svg, "prosthesis-implant-crown"), true);
      setActive(svgGetById(svg, "prosthesis-implant-gum"), true);
    } else if(state.crownMaterial === "bar"){
      setActive(svgGetById(svg, "restorations"), true);
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-connector"), true);
      setActive(svgGetById(svg, "implant-locator-screw"), true);
      setActive(svgGetById(svg, "implant-bar"), true);
    } else if(state.crownMaterial === "bar-prosthesis"){
      setActive(svgGetById(svg, "restorations"), true);
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-connector"), true);
      setActive(svgGetById(svg, "implant-locator-screw"), true);
      setActive(svgGetById(svg, "implant-bar"), true);
      setActive(svgGetById(svg, "prosthesis-implant"), true);
      setActive(svgGetById(svg, "prosthesis-implant-crown"), true);
      setActive(svgGetById(svg, "prosthesis-implant-gum"), true);
    }
  }
  if(isNone){
    setActive(svgGetById(svg, "restorations"), true);
    if(state.bridgeUnit === "zircon"){
      setActive(svgGetById(svg, "zircon"), true);
      setActive(svgGetById(svg, "zircon-crown"), true);
      setActive(svgGetById(svg, "zircon-bridge-connector"), true);
    } else if(state.bridgeUnit === "metal"){
      setActive(svgGetById(svg, "metal"), true);
      setActive(svgGetById(svg, "metal-crown"), true);
      setActive(svgGetById(svg, "metal-bridge-connector"), true);
    } else if(state.bridgeUnit === "temporary"){
      setActive(svgGetById(svg, "temporary"), true);
      setActive(svgGetById(svg, "temporary-crown"), true);
      setActive(svgGetById(svg, "temporary-bridge-connector"), true);
    } else if(state.bridgeUnit === "bar"){
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-bar"), true);
    } else if(state.bridgeUnit === "bar-prosthesis"){
      setActive(svgGetById(svg, "implant"), true);
      setActive(svgGetById(svg, "implant-bar"), true);
      setActive(svgGetById(svg, "prosthesis-implant"), true);
      setActive(svgGetById(svg, "prosthesis-implant-crown"), true);
      setActive(svgGetById(svg, "prosthesis-implant-gum"), true);
    }
  }
  if(hasCrown && !["healing-abutment","locator","locator-prosthesis","bar","bar-prosthesis"].includes(state.crownMaterial)){
    if(state.crownMaterial !== "broken"){
      if(["zircon","metal","temporary","telescope"].includes(state.crownMaterial)){
        setActive(svgGetById(svg, state.crownMaterial), true);
      }
    }
    if(state.crownMaterial === "emax"){
      setActive(svgGetById(svg, "emax-crown"), true);
    } else if(state.crownMaterial === "zircon"){
      setActive(svgGetById(svg, "zircon-crown"), true);
    } else if(state.crownMaterial === "metal"){
      setActive(svgGetById(svg, "metal-crown"), true);
    } else if(state.crownMaterial === "temporary"){
      setActive(svgGetById(svg, "temporary-crown"), true);
    } else if(state.crownMaterial === "telescope"){
      setActive(svgGetById(svg, "telescope-crown"), true);
      setActive(svgGetById(svg, "telescope-crown-inside"), true);
      setActive(svgGetById(svg, "telescope-crown-outside"), true);
    } else if(state.crownMaterial === "broken"){
      if(brokenVariant) setActive(svgGetById(svg, brokenVariant), true);
    }
  }
  if(state.bridgePillar){
    if(state.crownMaterial === "zircon"){
      setActive(svgGetById(svg, "zircon"), true);
      setActive(svgGetById(svg, "zircon-bridge-connector"), true);
    } else if(state.crownMaterial === "metal"){
      setActive(svgGetById(svg, "metal"), true);
      setActive(svgGetById(svg, "metal-bridge-connector"), true);
    } else if(state.crownMaterial === "temporary"){
      setActive(svgGetById(svg, "temporary"), true);
      setActive(svgGetById(svg, "temporary-bridge-connector"), true);
    } else if(state.crownMaterial === "telescope"){
      setActive(svgGetById(svg, "telescope"), true);
      setActive(svgGetById(svg, "telescope-bridge-connector"), true);
    }
  }

  // 5) Surfaces
  if(!isImplant && !underGum && !extraction && state.toothSelection !== "none"){
    // Caries: if any restoration active => disable surface caries (except subcrown allowed)
    for(const id of state.caries){
      if(id === "caries-subcrown"){
        if(hasCrown){
          setActive(svgGetById(svg, "caries-subcrown"), true);
        }
        continue;
      }
      if(hasRestoration || hasCrown) continue;
      // map surface ids to svg ids: buccal is path; others are groups
      setActive(svgGetById(svg, id), true);
    }

    // Fillings: any material with surfaces
    if(state.fillingMaterial !== "none" && !hasCrown){
      for(const s of state.fillingSurfaces){
        setActive(svgGetById(svg, `filling-${state.fillingMaterial}-${s}`), true);
      }
    }

    // 6) Caries vs Filling same surface: if filling ON on surface, caries OFF on that surface
    // (Prefer filling)
    if(state.fillingMaterial !== "none" && !hasRestoration && !hasCrown){
      for(const s of state.fillingSurfaces){
        const cariesId = `caries-${s}`;
        setActive(svgGetById(svg, cariesId), false);
      }
    }
  }

  if(fissureAllowed && state.fissureSealing){
    setActive(svgGetById(svg, "fissure-sealing"), true);
  }

  if(contactAllowed){
    if(state.contactMesial) setActive(svgGetById(svg, "mesial-no-contact-point"), true);
    if(state.contactDistal) setActive(svgGetById(svg, "distal-no-contact-point"), true);
  }

  if(bruxismAllowed && state.bruxismWear){
    setActive(svgGetById(svg, "tooth-bruxism-wear"), true);
  }
  if(bruxismAllowed && state.bruxismNeckWear){
    setActive(svgGetById(svg, "tooth-bruxism-neck-wear"), true);
  }

  // Ensure inflammation sits directly before endo-resection when resection is active.
  const inflammation = svgGetById(svg, "inflammation");
  const endoResection = svgGetById(svg, "endo-resection");
  if(inflammation && endoResection){
    const parent = inflammation.parentElement;
    if(parent){
      if(!inflammation.dataset.originalIndex){
        inflammation.dataset.originalIndex = String(Array.from(parent.children).indexOf(inflammation));
      }
      if(state.endoResection){
        if(endoResection.parentElement === parent){
          parent.insertBefore(inflammation, endoResection);
        }
      }else{
        const idx = Number(inflammation.dataset.originalIndex);
        if(Number.isFinite(idx) && idx >= 0){
          const ref = parent.children[idx] || null;
          parent.insertBefore(inflammation, ref);
        }
      }
    }
  }

  updateWarnings(state);
}

function applyStateToSvg(toothNo){
  const roots = toothSvgRoot.get(toothNo);
  if(!roots) return;
  for(const svg of roots){
    applyStateToSvgSingle(toothNo, svg);
  }
}

// ---- Control sync ----
function syncControlsFromState(state){
  $("#pulpInflam").checked = !!state.pulpInflam;
  $("#endoResection").checked = !!state.endoResection;
  $("#fissureSealing").checked = !!state.fissureSealing;
  $("#contactMesial").checked = !!state.contactMesial;
  $("#contactDistal").checked = !!state.contactDistal;
  $("#bruxismWear").checked = !!state.bruxismWear;
  $("#bruxismNeckWear").checked = !!state.bruxismNeckWear;
  $("#brokenMesial").checked = !!state.brokenMesial;
  $("#brokenIncisal").checked = !!state.brokenIncisal;
  $("#brokenDistal").checked = !!state.brokenDistal;
  $("#extractionWound").checked = !!state.extractionWound;
  $("#extractionPlan").checked = !!state.extractionPlan;
  $("#bridgePillar").checked = !!state.bridgePillar;
  $("#bridgeUnitSelect").value = state.bridgeUnit;

  const isMilktooth = state.toothSelection === "milktooth";
  const isImplant = state.toothSelection === "implant";
  const underGum = isUnderGum(state.toothSelection);
  const extraction = isExtraction(state.toothSelection) || (state.toothSelection === "none" && state.extractionWound);

  // tooth selection
  $("#toothSelect").value = state.toothSelection;
  setSelectOptions($("#crownSelect"), getCrownOptions(isImplant), state.crownMaterial);
  if($("#crownSelect").value !== state.crownMaterial){
    state.crownMaterial = $("#crownSelect").value;
  }
  if(isMilktooth || underGum || extraction){
    state.crownMaterial = "natural";
    $("#crownSelect").value = "natural";
  }
  setSelectOptions($("#bridgeUnitSelect"), getBridgeUnitOptions(), state.bridgeUnit);
  if($("#bridgeUnitSelect").value !== state.bridgeUnit){
    state.bridgeUnit = $("#bridgeUnitSelect").value;
  }
  setSelectOptions($("#endoSelect"), getEndoOptions(isMilktooth), state.endo);
  if($("#endoSelect").value !== state.endo){
    state.endo = $("#endoSelect").value;
  }
  setSelectOptions($("#fillingSelect"), getFillingOptions(isMilktooth), state.fillingMaterial);
  if($("#fillingSelect").value !== state.fillingMaterial){
    state.fillingMaterial = $("#fillingSelect").value;
  }
  setSelectOptions($("#mobilitySelect"), getMobilityOptions(), state.mobility);
  if($("#mobilitySelect").value !== state.mobility){
    state.mobility = $("#mobilitySelect").value;
  }
  // mods
  $$("#modsChecks input[type=checkbox]").forEach(c => c.checked = state.mods.has(c.value));

  // caries
  $$("#cariesChecks input[type=checkbox]").forEach(c => c.checked = state.caries.has(c.value));

  // filling surfaces
  $$("#fillingSurfaceChecks input[type=checkbox]").forEach(c => c.checked = state.fillingSurfaces.has(c.value));

  // disable logic in UI
  const hasCrown = state.crownMaterial !== "natural";
  const hasRemovable = state.toothSelection === "none" && state.bridgeUnit === "removable";
  const hasRestoration = hasCrown || hasRemovable;
  $$("#cariesChecks input[type=checkbox]").forEach(c => {
    if(c.value === "caries-subcrown") setDisabled(c, !hasCrown);
    else setDisabled(c, hasRestoration || hasCrown);
  });
  const showFillingSurfaces = state.fillingMaterial !== "none" && !hasCrown;
  $("#fillingSurfaceChecks").classList.toggle("hidden", !showFillingSurfaces);

  // endo only if tooth present
  const endoDisabled = !isToothPresent(state.toothSelection) || underGum || extraction;
  setDisabled($("#endoSelect"), endoDisabled);
  setDisabled($("#pulpInflam"), endoDisabled);
  setDisabled($("#endoResection"), endoDisabled);
  const mobilityDisabled = state.toothSelection === "none" || extraction;
  setDisabled($("#mobilitySelect"), mobilityDisabled);

  const hiddenSelected = selectedTeeth.size > 0 && Array.from(selectedTeeth).some(t => {
    const sel = toothState.get(t)?.toothSelection;
    return sel === "implant" || sel === "none" || sel === "tooth-under-gum" || sel === "no-tooth-after-extraction";
  });
  const hideByBase = state.toothSelection === "implant" || state.toothSelection === "none" || underGum || extraction || hiddenSelected;
  const noneSelected = selectedTeeth.size > 0 && Array.from(selectedTeeth).some(t => toothState.get(t)?.toothSelection === "none");
  const implantSelected = selectedTeeth.size > 0 && Array.from(selectedTeeth).some(t => toothState.get(t)?.toothSelection === "implant");
  const hideByNone = state.toothSelection === "none" || noneSelected;
  $("#cariesSection").classList.toggle("hidden", hideByBase);
  $("#endoSection").classList.toggle("hidden", hideByBase);
  const hideFillingsByCrown = state.toothSelection === "tooth-base" && hasCrown;
  $("#fillingSection").classList.toggle("hidden", hideByBase || hideFillingsByCrown);
  const hideCrownRow = hideByNone || isMilktooth || underGum || extraction;
  $("#crownRow").classList.toggle("hidden", hideCrownRow);
  $("#brokenCrownRow").classList.toggle("hidden", state.crownMaterial !== "broken" || hideCrownRow);
  $("#extractionRow").classList.toggle("hidden", state.toothSelection !== "none");
  $("#inflammationSection").classList.toggle("hidden", hideByNone);
  const selectedList = selectedTeeth.size > 0 ? Array.from(selectedTeeth) : (activeTooth ? [activeTooth] : []);
  const contactAllowed = selectedList.length > 0 && selectedList.every(t => {
    const s = toothState.get(t);
    const allowedBase = s && (s.toothSelection === "tooth-base" || s.toothSelection === "milktooth" || BROKEN_VARIANTS.has(s.toothSelection));
    if(!allowedBase) return false;
    if(s.toothSelection === "tooth-base" && s.crownMaterial !== "natural") return false;
    return true;
  });
  const bruxismAllowed = selectedList.length > 0 && selectedList.every(t => {
    const s = toothState.get(t);
    return s && s.toothSelection === "tooth-base" && s.crownMaterial === "natural";
  });
  const fissureAllowed = selectedList.length > 0 && selectedList.every(t => {
    const s = toothState.get(t);
    return s && s.toothSelection === "tooth-base" && FISSURE_ALLOWED.has(t);
  });
  $("#contactPointRow").classList.toggle("hidden", !contactAllowed);
  $("#bruxismRow").classList.toggle("hidden", !bruxismAllowed);
  $("#fissureSealingRow").classList.toggle("hidden", !fissureAllowed);
  const extractionPlanAllowed = selectedList.length > 0 && selectedList.every(t => {
    const s = toothState.get(t);
    return s && ["tooth-base","milktooth","implant","tooth-crownprep","tooth-under-gum"].includes(s.toothSelection);
  });
  $("#extractionPlanRow").classList.toggle("hidden", !extractionPlanAllowed);
  $("#bridgeUnitRow").classList.toggle("hidden", state.toothSelection !== "none");
  const crownRowHidden = $("#crownRow").classList.contains("hidden");
  const bridgePillarAllowed = !crownRowHidden && (state.crownMaterial === "zircon" || state.crownMaterial === "metal" || state.crownMaterial === "temporary" || state.crownMaterial === "telescope");
  $("#bridgePillarRow").classList.toggle("hidden", !bridgePillarAllowed);

  const extractionPlanRow = $("#extractionPlanRow");
  const brokenCrownRow = $("#brokenCrownRow");
  const bruxismRow = $("#bruxismRow");
  const crownActionsRow = $("#crownActionsRow");
  if(extractionPlanRow && brokenCrownRow && bruxismRow && crownActionsRow){
    const brokenMode = state.crownMaterial === "broken" && !crownRowHidden;
    if(brokenMode){
      if(extractionPlanRow.parentElement !== brokenCrownRow){
        brokenCrownRow.appendChild(extractionPlanRow);
      }
      crownActionsRow.classList.add("hidden");
    }else if(!bruxismRow.classList.contains("hidden")){
      if(extractionPlanRow.parentElement !== bruxismRow){
        bruxismRow.appendChild(extractionPlanRow);
      }
      crownActionsRow.classList.add("hidden");
    }else{
      if(extractionPlanRow.parentElement !== crownActionsRow){
        crownActionsRow.appendChild(extractionPlanRow);
      }
      crownActionsRow.classList.toggle("hidden", !extractionPlanAllowed);
    }
    extractionPlanRow.classList.toggle("hidden", !extractionPlanAllowed);
  }
  const periImplant = state.toothSelection === "implant" || implantSelected;
  const parodontLabel = $("#lbl-parodontal");
  if(parodontLabel){
    parodontLabel.textContent = periImplant ? "Periimplantitis" : "parodontális gyulladás";
  }

  const milkOption = $("#toothSelect").querySelector('option[value="milktooth"]');
  if(milkOption){
    const anyBlocked = selectedTeeth.size > 0
      ? Array.from(selectedTeeth).some(t => MILKTOOTH_BLOCKED.has(t))
      : (activeTooth ? MILKTOOTH_BLOCKED.has(activeTooth) : false);
    milkOption.disabled = anyBlocked;
  }

  const inflammationLabel = $("#lbl-inflammation");
  if(inflammationLabel){
    inflammationLabel.textContent = extraction ? "fogágygyulladás" : "periapikális gyulladás";
  }
  $("#mobilityRow").classList.toggle("hidden", underGum || extraction);
  const parodontalInput = $("#chk-parodontal");
  if(parodontalInput){
    setDisabled(parodontalInput, extraction);
  }
  if(extraction){
    const inflammationInput = $("#chk-inflammation");
    if(inflammationInput) setDisabled(inflammationInput, false);
  }
}

// ---- Event handlers ----
function applyAndSync(toothNo){
  applyStateToSvg(toothNo);
  updateToothTileNumber(toothNo);
  if(toothNo === activeTooth){
    syncControlsFromState(toothState.get(toothNo));
  }
  if(edentulous && !suppressEdentulousSync){
    setEdentulous(false);
  }
  updateSelectionFilterButtons();
}

function applyToSelected(fn){
  if(selectedTeeth.size === 0) return;
  for(const toothNo of selectedTeeth){
    const s = toothState.get(toothNo);
    if(!s) continue;
    fn(s, toothNo);
    applyStateToSvg(toothNo);
    updateToothTileNumber(toothNo);
  }
  if(activeTooth && selectedTeeth.has(activeTooth)){
    syncControlsFromState(toothState.get(activeTooth));
  }
  if(edentulous && !suppressEdentulousSync){
    setEdentulous(false);
  }
  updateSelectionFilterButtons();
}

function updateActiveLabel(){
  const label = $("#activeToothLabel");
  if(!label) return;
  if(selectedTeeth.size === 0){
    label.textContent = "—";
  }else if(selectedTeeth.size === 1){
    const toothNo = activeTooth ?? Array.from(selectedTeeth)[0];
    label.textContent = String(getDisplayedToothNumber(toothNo));
  }else{
    label.textContent = `${selectedTeeth.size} fog`;
  }
}

function updateSelectionFilterButtons(){
  let hasPresent = false;
  let hasMissing = false;
  let hasPermanent = false;
  let hasMilk = false;
  let hasImplant = false;
  for(const toothNo of ALL_TEETH){
    const sel = toothState.get(toothNo)?.toothSelection;
    if(sel === "none"){
      hasMissing = true;
    }else{
      hasPresent = true;
    }
    if(sel === "tooth-base") hasPermanent = true;
    if(sel === "milktooth") hasMilk = true;
    if(sel === "implant") hasImplant = true;
  }
  $("#btnSelectAllPresent")?.classList.toggle("is-hidden", !hasPresent);
  $("#btnSelectAllMissing")?.classList.toggle("is-hidden", !hasMissing);
  $("#btnSelectPermanent")?.classList.toggle("is-hidden", !hasPermanent);
  $("#btnSelectMilk")?.classList.toggle("is-hidden", !hasMilk);
  $("#btnSelectImplants")?.classList.toggle("is-hidden", !hasImplant);
}

function setControlsEnabled(enabled){
  $$(".panel-body input, .panel-body select").forEach(el => {
    if(el.id === "statusExtraSelect") return;
    setDisabled(el, !enabled);
  });
}

function updateSelectionUI(){
  $$(".tooth-tile").forEach(t => {
    const toothNo = Number(t.dataset.tooth);
    t.classList.toggle("active", selectedTeeth.has(toothNo));
  });
  updateSelectionFilterButtons();
  updateActiveLabel();
  if(activeTooth && selectedTeeth.has(activeTooth)){
    setControlsEnabled(true);
    syncControlsFromState(toothState.get(activeTooth));
  }else{
    syncControlsFromState(defaultState());
    setControlsEnabled(false);
  }
}

function onToothClick(toothNo, evt){
  const multi = evt.metaKey || evt.ctrlKey;
  if(multi){
    if(selectedTeeth.has(toothNo)){
      selectedTeeth.delete(toothNo);
    }else{
      selectedTeeth.add(toothNo);
      activeTooth = toothNo;
    }
  }else{
    selectedTeeth = new Set([toothNo]);
    activeTooth = toothNo;
  }
  if(activeTooth && !selectedTeeth.has(activeTooth)){
    activeTooth = selectedTeeth.values().next().value ?? null;
  }
  updateSelectionUI();
}

function updateToothTileVisibility(){
  const hiddenSet = new Set([18,28,38,48]);
  for(const toothNo of ALL_TEETH){
    const tiles = toothTile.get(toothNo);
    if(!tiles) continue;
    const hide = !wisdomVisible && hiddenSet.has(toothNo);
    for(const tile of tiles){
      tile.classList.toggle("wisdom-hidden", hide);
    }
  }
  selectedTeeth = new Set([...selectedTeeth].filter(t => {
    const tiles = toothTile.get(t);
    if(!tiles || tiles.length === 0) return true;
    return !tiles.every(tile => tile.classList.contains("wisdom-hidden"));
  }));
  if(activeTooth && !selectedTeeth.has(activeTooth)){
    activeTooth = selectedTeeth.values().next().value ?? null;
  }
  updateSelectionUI();
}

function setEdentulous(on){
  edentulous = on;
  setToggleButton($("#btnEdentulous"), edentulous);
  if(edentulous){
    suppressEdentulousSync = true;
    for(const toothNo of ALL_TEETH){
      const s = defaultState();
      s.toothSelection = "none";
      toothState.set(toothNo, s);
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    suppressEdentulousSync = false;
    if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
  }
}

function setWisdomVisible(on){
  wisdomVisible = !!on;
  setToggleButton($("#btnWisdomVisible"), wisdomVisible);
  updateToothTileVisibility();
}

function setShowBase(on){
  showBase = on;
  setToggleButton($("#btnBoneVisible"), showBase);
  for(const toothNo of ALL_TEETH){
    applyStateToSvg(toothNo);
    updateToothTileNumber(toothNo);
  }
}

function setOcclusalVisible(on){
  occlusalVisible = !!on;
  setToggleButton($("#btnOcclView"), occlusalVisible);
  $$(".tooth-tile.occl-view").forEach(tile => {
    tile.classList.toggle("occl-hidden", !occlusalVisible);
  });
}

function setHealthyPulpVisible(on){
  showHealthyPulp = !!on;
  setToggleButton($("#btnPulpVisible"), showHealthyPulp);
  for(const toothNo of ALL_TEETH){
    applyStateToSvg(toothNo);
    updateToothTileNumber(toothNo);
  }
}

function applyStatusExtra(option){
  if(!option) return;
  const meta = getStatusExtrasMeta();
  const archTeeth = (arch)=> meta?.[arch] || [];
  const archWisdom = (arch)=> meta?.wisdom?.[arch] || [];

  const applyChanges = (teeth, fn)=>{
    for(const toothNo of teeth){
      const s = toothState.get(toothNo) ?? defaultState();
      const next = fn(s, toothNo) || s;
      toothState.set(toothNo, next);
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    if(activeTooth){
      syncControlsFromState(toothState.get(activeTooth));
    }
    updateSelectionFilterButtons();
  };

  const setBridgeCrown = (s, material)=>{
    s.crownMaterial = material;
    s.bridgePillar = true;
    s.brokenMesial = false;
    s.brokenIncisal = false;
    s.brokenDistal = false;
  };

  if(option.type === "span"){
    applyChanges(option.teeth || [], (s)=>{
      if(s.toothSelection === "tooth-base"){
        setBridgeCrown(s, option.material);
      }else if(s.toothSelection === "none"){
        s.bridgeUnit = option.material;
      }
    });
    return;
  }

  if(option.type === "arch-bridge"){
    const teeth = archTeeth(option.arch);
    const wisdom = new Set(archWisdom(option.arch));
    const present = teeth.filter(t => toothState.get(t)?.toothSelection === "tooth-base");
    if(present.length >= 2){
      const first = present[0];
      const last = present[present.length - 1];
      const startIdx = teeth.indexOf(first);
      const endIdx = teeth.indexOf(last);
      const between = startIdx < endIdx ? teeth.slice(startIdx + 1, endIdx) : [];
      applyChanges(teeth, (s, t)=>{
        if(wisdom.has(t)) return;
        if(s.toothSelection === "tooth-base"){
          setBridgeCrown(s, option.material);
        }else if(s.toothSelection === "none" && between.includes(t)){
          s.bridgeUnit = option.missingMaterial || option.material;
        }
      });
    }else{
      applyChanges(teeth, (s, t)=>{
        if(wisdom.has(t)) return;
        if(s.toothSelection === "tooth-base"){
          setBridgeCrown(s, option.material);
        }
      });
    }
    return;
  }

  if(option.type === "partial-removable"){
    const teeth = archTeeth(option.arch);
    const wisdom = new Set(archWisdom(option.arch));
    applyChanges(teeth, (s, t)=>{
      if(wisdom.has(t)) return;
      if(s.toothSelection === "none"){
        s.bridgeUnit = "removable";
      }
    });
    return;
  }

  if(option.type === "full-removable"){
    const teeth = archTeeth(option.arch);
    const wisdom = new Set(archWisdom(option.arch));
    applyChanges(teeth, (_s, t)=>{
      const next = defaultState();
      next.toothSelection = "none";
      next.bridgeUnit = wisdom.has(t) ? "none" : "removable";
      return next;
    });
    return;
  }

  if(option.type === "bar-denture"){
    const implantTeeth = option.implants || [];
    const missingTeeth = option.missing || [];
    const archTeeth = option.arch ? (getStatusExtrasMeta()?.[option.arch] || []) : [];
    const sevenEight = archTeeth.filter(t => [7,8].includes(t % 10));
    applyChanges(implantTeeth, (_s, t)=>{
      const next = defaultState();
      next.toothSelection = "implant";
      next.crownMaterial = "bar-prosthesis";
      return next;
    });
    applyChanges(missingTeeth, (_s, t)=>{
      const next = defaultState();
      next.toothSelection = "none";
      next.bridgeUnit = "bar-prosthesis";
      return next;
    });
    applyChanges(sevenEight, (_s, t)=>{
      const next = defaultState();
      next.toothSelection = "none";
      next.bridgeUnit = "none";
      return next;
    });
  }
}

// ---- Load and build grid ----
let initialized = false;

async function loadSvg(url){
  const res = await fetch(url, { cache: "no-store" });
  if(!res.ok) throw new Error(`SVG fetch failed: ${url}`);
  const txt = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(txt, "image/svg+xml");
  const svg = doc.documentElement;
  // Normalize ids/attrs
  stripDisplayNoneToDataActive(svg);
  ensureDataActiveForSwitchables(svg);
  return svg;
}

async function buildGrid(){
  const grid = $("#toothGrid");
  grid.innerHTML = "";

  // preload SVG templates once
  const tplCache = new Map();
  for(const tplNo of [11,13,14,16]){
    const svg = await loadSvg(TEMPLATES[tplNo]);
    tplCache.set(tplNo, svg);
  }
  const occlCache = new Map();
  for(const tplNo of [14,16]){
    const svg = await loadSvg(TEMPLATES_OCCL[tplNo]);
    occlCache.set(tplNo, svg);
  }

  function addTile({toothNo, tplNo, rot, mirror, view, clickable}){
    const tpl = view === "occl" ? occlCache.get(tplNo) : tplCache.get(tplNo);
    if(!tpl) return;
    const svg = tpl.cloneNode(true);
    if(rot === 180) rotate180(svg);
    if(mirror) mirrorVertical(svg);

    const tileClasses = [
      "tooth-tile",
      `tpl-${tplNo}`,
      toothNo >= 31 ? "lower-row" : "upper-row",
      view === "occl" ? "occl-view" : "side-view"
    ];
    if(!clickable) tileClasses.push("placeholder");

    const tile = el("div", { class: tileClasses.join(" "), "data-tooth": String(toothNo) }, [
      el("div", { class:"tooth-svg" })
    ]);
    $(".tooth-svg", tile).appendChild(svg);

    if(clickable){
      tile.addEventListener("click", (e)=>onToothClick(toothNo, e));
    }else{
      tile.removeAttribute("data-tooth");
    }

    grid.appendChild(tile);

    if(!toothSvgRoot.has(toothNo)) toothSvgRoot.set(toothNo, []);
    toothSvgRoot.get(toothNo).push(svg);
    if(!toothTile.has(toothNo)) toothTile.set(toothNo, []);
    toothTile.get(toothNo).push(tile);

    if(!toothState.has(toothNo)) toothState.set(toothNo, defaultState());
    applyStateToSvg(toothNo);
  }

  function addRowSide(rowTeeth){
    for(const toothNo of rowTeeth){
      const map = TOOTH_TEMPLATE.get(toothNo);
      const tplNo = map ? map.tpl : 16;
      addTile({ toothNo, tplNo, rot: map?.rot ?? 0, mirror: map?.mirror ?? false, view: "side", clickable: true });
    }
  }

  function occlTemplateForTooth(toothNo){
    if([14,15,24,25,34,35,44,45].includes(toothNo)) return 14;
    if([16,17,18,26,27,28,36,37,38,46,47,48].includes(toothNo)) return 16;
    return null;
  }

  function addPlaceholderTile(){
    const tile = el("div", { class:"tooth-tile occl-view placeholder" }, [
      el("div", { class:"tooth-svg" })
    ]);
    grid.appendChild(tile);
  }

  function addRowOccl(rowTeeth, placeholders){
    for(const toothNo of rowTeeth){
      const map = TOOTH_TEMPLATE.get(toothNo);
      const tplNo = occlTemplateForTooth(toothNo);
      if(placeholders.has(toothNo) || !tplNo || !map){
        addPlaceholderTile();
        continue;
      }
      addTile({ toothNo, tplNo, rot: map.rot, mirror: map.mirror, view: "occl", clickable: true });
    }
  }

  function addLabelRow(rowTeeth, targetMap){
    const row = el("div", { class:"tooth-label-row" });
    for(const toothNo of rowTeeth){
      const cell = el("div", { class:"tooth-label-cell", html: String(toothNo) });
      cell.addEventListener("click", (e)=>onToothClick(toothNo, e));
      row.appendChild(cell);
      targetMap.set(toothNo, cell);
    }
    grid.appendChild(row);
  }

  const upperSide = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
  const lowerSide = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
  const upperOcclPlaceholders = new Set([13,12,11,21,22,23]);
  const lowerOcclPlaceholders = new Set([43,42,41,31,32,33]);

  addLabelRow(upperSide, toothLabelUpper);
  addRowSide(upperSide);
  addRowOccl(upperSide, upperOcclPlaceholders);
  addRowOccl(lowerSide, lowerOcclPlaceholders);
  addRowSide(lowerSide);
  addLabelRow(lowerSide, toothLabelLower);

  // default active tooth
  selectedTeeth = new Set([11]);
  activeTooth = 11;
  updateSelectionUI();
  updateToothTileVisibility();
  setOcclusalVisible(occlusalVisible);
  setHealthyPulpVisible(showHealthyPulp);
}

// ---- Controls wiring ----
function wireControls(){
  const iconButtons = ["btnOcclView","btnWisdomVisible","btnBoneVisible","btnPulpVisible"];
  iconButtons.forEach((id)=>{
    const btn = $(`#${id}`);
    if(btn) loadInlineIcon(btn).then(()=>syncIconXLine(btn));
  });

  // Fog alap dropdown
  buildSelect($("#toothSelect"), [
    {value:"none", label:"foghiány"},
    {value:"tooth-base", label:"maradó fog"},
    {value:"milktooth", label:"tejfog"},
    {value:"implant", label:"implantátum"},
    {value:"tooth-crownprep", label:"előkészített fog koronához"},
    {value:"tooth-under-gum", label:"íny alatti fog"},
  ], (value)=>{
    applyToSelected((s, toothNo)=>{
      if(value === "milktooth" && MILKTOOTH_BLOCKED.has(toothNo)){
        return;
      }
      const next = defaultState();
      next.toothSelection = value;
      if(!["tooth-base","milktooth","implant","tooth-crownprep","tooth-under-gum"].includes(value)){
        next.extractionPlan = false;
      }
      if(value !== "none"){
        next.extractionWound = false;
        next.bridgeUnit = "none";
      }
      if(value === "implant" || value === "none"){
        next.caries.clear();
        next.endo = "none";
        next.pulpInflam = false;
        next.fillingMaterial = "none";
        next.fillingSurfaces.clear();
      }
      toothState.set(toothNo, next);
    });
    if(value !== "none") setEdentulous(false);
  });

  // Koronai rész dropdown
  buildSelect($("#crownSelect"), getCrownOptions(false), (value)=>{
    applyToSelected((s)=>{
      s.crownMaterial = value;
      if(value !== "broken"){
        s.brokenMesial = false;
        s.brokenIncisal = false;
        s.brokenDistal = false;
      }
      if(!["zircon","metal","temporary","telescope"].includes(value)){
        s.bridgePillar = false;
      }
    });
    setEdentulous(false);
  });

  // Foggyökér dropdown
  buildSelect($("#endoSelect"), getEndoOptions(false), (value)=>{
    applyToSelected((s)=>{
      s.endo = value;
    });
  });

  // Pulpitis
  $("#pulpInflam").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.pulpInflam = e.target.checked;
    });
  });

  // Resection
  $("#endoResection").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.endoResection = e.target.checked;
    });
  });

  // Bridge unit (foghiány)
  buildSelect($("#bridgeUnitSelect"), getBridgeUnitOptions(), (value)=>{
    applyToSelected((s)=>{
      s.bridgeUnit = value;
    });
  });

  // Extraction wound
  $("#extractionWound").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.extractionWound = e.target.checked;
    });
  });

  // Extraction plan
  $("#extractionPlan").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.extractionPlan = e.target.checked;
    });
  });

  // Mobilitás
  buildSelect($("#mobilitySelect"), getMobilityOptions(), (value)=>{
    applyToSelected((s)=>{
      s.mobility = value;
    });
  });

  // Gyulladások
  buildChecks($("#modsChecks"), [
    {value:"parodontal", label:"parodontális gyulladás"},
    {value:"inflammation", label:"periapikális gyulladás"},
  ], (id, on)=>{
    applyToSelected((s)=>{
      if(on) s.mods.add(id); else s.mods.delete(id);
    });
  });

  // Caries checks (order)
  buildChecks($("#cariesChecks"), [
    {value:"caries-mesial", label:"mesial"},
    {value:"caries-distal", label:"distal"},
    {value:"caries-buccal", label:"buccal"},
    {value:"caries-lingual", label:"lingual/palatinal"},
    {value:"caries-occlusal", label:"occlusal"},
    {value:"caries-subcrown", label:"subcrown"},
  ], (id, on)=>{
    applyToSelected((s)=>{
      if(on) s.caries.add(id); else s.caries.delete(id);
    });
  });

  // Filling material dropdown
  buildSelect($("#fillingSelect"), getFillingOptions(false), (mat)=>{
    applyToSelected((s)=>{
      s.fillingMaterial = mat;
    });
  });

  // Filling surface checks
  const fillingLabels = {
    buccal: "buccal",
    lingual: "lingual/palatinal",
    mesial: "mesial",
    distal: "distal",
    occlusal: "occlusal",
  };
  buildChecks($("#fillingSurfaceChecks"), GROUPS.fillingSurfaces.map(s=>({value:s,label:fillingLabels[s] || s})), (surf,on)=>{
    applyToSelected((s)=>{
      if(on) s.fillingSurfaces.add(surf); else s.fillingSurfaces.delete(surf);
    });
  });

  // Fissure sealing
  $("#fissureSealing").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.fissureSealing = e.target.checked;
    });
  });

  // Contact point missing
  $("#contactMesial").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.contactMesial = e.target.checked;
    });
  });
  $("#contactDistal").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.contactDistal = e.target.checked;
    });
  });

  // Bruxism wear
  $("#bruxismWear").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.bruxismWear = e.target.checked;
    });
  });

  // Bruxism neck wear
  $("#bruxismNeckWear").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.bruxismNeckWear = e.target.checked;
    });
  });

  // Bridge pillar
  $("#bridgePillar").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.bridgePillar = e.target.checked;
    });
  });

  // Broken crown parts
  $("#brokenMesial").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.brokenMesial = e.target.checked;
    });
  });
  $("#brokenIncisal").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.brokenIncisal = e.target.checked;
    });
  });
  $("#brokenDistal").addEventListener("change", (e)=>{
    applyToSelected((s)=>{
      s.brokenDistal = e.target.checked;
    });
  });

  // Reset buttons
  $("#btnResetTooth").addEventListener("click", ()=>{
    if(selectedTeeth.size === 0) return;
    setEdentulous(false);
    for(const toothNo of selectedTeeth){
      toothState.set(toothNo, defaultState());
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    if(activeTooth){
      setControlsEnabled(true);
      syncControlsFromState(toothState.get(activeTooth));
    }
  });

  $("#btnResetAll").addEventListener("click", ()=>{
    setEdentulous(false);
    for(const toothNo of ALL_TEETH){
      toothState.set(toothNo, defaultState());
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    if(activeTooth){
      setControlsEnabled(true);
      syncControlsFromState(toothState.get(activeTooth));
    }
  });

  $("#btnPrimaryDentition").addEventListener("click", ()=>{
    setEdentulous(false);
    suppressEdentulousSync = true;
    for(const toothNo of ALL_TEETH){
      const s = defaultState();
      if(PRIMARY_MILK.has(toothNo)){
        s.toothSelection = "milktooth";
      }else{
        s.toothSelection = "none";
      }
      toothState.set(toothNo, s);
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    suppressEdentulousSync = false;
    if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
  });

  $("#btnMixedDentition").addEventListener("click", ()=>{
    setEdentulous(false);
    suppressEdentulousSync = true;
    for(const toothNo of ALL_TEETH){
      const s = defaultState();
      if(MIXED_PERMANENT.has(toothNo)){
        s.toothSelection = "tooth-base";
      }else if(MIXED_MILK.has(toothNo)){
        s.toothSelection = "milktooth";
      }else if(MIXED_NONE.has(toothNo)){
        s.toothSelection = "none";
      }
      toothState.set(toothNo, s);
      applyStateToSvg(toothNo);
      updateToothTileNumber(toothNo);
    }
    suppressEdentulousSync = false;
    if(activeTooth) syncControlsFromState(toothState.get(activeTooth));
  });

  // Status extras
  const statusExtras = getStatusExtras();
  if(statusExtras.length){
    const statusOptions = statusExtras.map((opt)=>({ value: opt.id, label: opt.label }));
    buildSelect($("#statusExtraSelect"), statusOptions, ()=>{});
    setSelectOptions($("#statusExtraSelect"), statusOptions, statusOptions[0]?.value);
    $("#statusExtraApply").addEventListener("click", ()=>{
      const id = $("#statusExtraSelect").value;
      const option = statusExtras.find(o => o.id === id);
      applyStatusExtra(option);
    });
  }

  $("#btnSelectAll").addEventListener("click", ()=>{
    selectedTeeth = new Set(ALL_TEETH);
    activeTooth = ALL_TEETH[0];
    updateToothTileVisibility();
  });
  $("#btnSelectAllPresent").addEventListener("click", ()=>{
    const present = ALL_TEETH.filter(t => toothState.get(t)?.toothSelection !== "none");
    selectedTeeth = new Set(present);
    activeTooth = present[0] ?? null;
    updateToothTileVisibility();
  });
  $("#btnSelectPermanent").addEventListener("click", ()=>{
    const permanent = ALL_TEETH.filter(t => toothState.get(t)?.toothSelection === "tooth-base");
    selectedTeeth = new Set(permanent);
    activeTooth = permanent[0] ?? null;
    updateToothTileVisibility();
  });
  $("#btnSelectMilk").addEventListener("click", ()=>{
    const milk = ALL_TEETH.filter(t => toothState.get(t)?.toothSelection === "milktooth");
    selectedTeeth = new Set(milk);
    activeTooth = milk[0] ?? null;
    updateToothTileVisibility();
  });
  $("#btnSelectImplants").addEventListener("click", ()=>{
    const implants = ALL_TEETH.filter(t => toothState.get(t)?.toothSelection === "implant");
    selectedTeeth = new Set(implants);
    activeTooth = implants[0] ?? null;
    updateToothTileVisibility();
  });
  $("#btnSelectAllMissing").addEventListener("click", ()=>{
    const missing = ALL_TEETH.filter(t => toothState.get(t)?.toothSelection === "none");
    selectedTeeth = new Set(missing);
    activeTooth = missing[0] ?? null;
    updateToothTileVisibility();
  });
  $("#btnSelectUpper").addEventListener("click", ()=>{
    selectedTeeth = new Set(ALL_TEETH.filter(t => t >= 11 && t <= 28));
    activeTooth = 11;
    updateToothTileVisibility();
  });
  $("#btnSelectUpperFront").addEventListener("click", ()=>{
    const front = [13,12,11,21,22,23];
    selectedTeeth = new Set(front);
    activeTooth = front[0];
    updateToothTileVisibility();
  });
  $("#btnSelectUpperMolar").addEventListener("click", ()=>{
    const molars = [16,17,27,28];
    selectedTeeth = new Set(molars);
    activeTooth = molars[0];
    updateToothTileVisibility();
  });
  $("#btnSelectLower").addEventListener("click", ()=>{
    selectedTeeth = new Set(ALL_TEETH.filter(t => t >= 31 && t <= 48));
    activeTooth = 31;
    updateToothTileVisibility();
  });
  $("#btnSelectLowerFront").addEventListener("click", ()=>{
    const front = [43,42,41,31,32,33];
    selectedTeeth = new Set(front);
    activeTooth = front[0];
    updateToothTileVisibility();
  });
  $("#btnSelectLowerMolar").addEventListener("click", ()=>{
    const molars = [36,37,46,47];
    selectedTeeth = new Set(molars);
    activeTooth = molars[0];
    updateToothTileVisibility();
  });
  $("#btnSelectNone").addEventListener("click", ()=>{
    selectedTeeth = new Set();
    activeTooth = null;
    updateSelectionUI();
  });
  $("#btnSelectNoneChart").addEventListener("click", ()=>{
    selectedTeeth = new Set();
    activeTooth = null;
    updateSelectionUI();
  });

  $("#btnEdentulous").addEventListener("click", ()=>{
    setEdentulous(!edentulous);
  });
  $("#btnWisdomVisible").addEventListener("click", ()=>{
    setWisdomVisible(!wisdomVisible);
  });
  $("#btnOcclView").addEventListener("click", ()=>{
    setOcclusalVisible(!occlusalVisible);
  });
  $("#btnBoneVisible").addEventListener("click", ()=>{
    setShowBase(!showBase);
  });
  $("#btnPulpVisible").addEventListener("click", ()=>{
    setHealthyPulpVisible(!showHealthyPulp);
  });

  const statusCard = $("#statusCard");
  const statusToggle = $("#btnToggleStatusCard");
  if(statusCard && statusToggle){
    statusToggle.addEventListener("click", ()=>{
      const collapsed = statusCard.classList.toggle("collapsed");
      statusToggle.setAttribute("title", collapsed ? "Státuszok kinyitása" : "Státuszok összecsukása");
      statusToggle.setAttribute("aria-label", collapsed ? "Státuszok kinyitása" : "Státuszok összecsukása");
      const icon = $(".toggle-icon", statusToggle);
      if(icon) icon.textContent = collapsed ? "+" : "−";
    });
  }

  const controlsToggle = $("#btnToggleControlsCard");
  const controlsActions = $("#controlsActions");
  if(controlsToggle && controlsActions){
    controlsToggle.addEventListener("click", ()=>{
      const collapsed = controlsActions.classList.toggle("hidden");
      controlsToggle.setAttribute("title", collapsed ? "Vezérlők kinyitása" : "Vezérlők összecsukása");
      controlsToggle.setAttribute("aria-label", collapsed ? "Vezérlők kinyitása" : "Vezérlők összecsukása");
      const icon = $(".toggle-icon", controlsToggle);
      if(icon) icon.textContent = collapsed ? "+" : "−";
    });
  }

  const toggleCards = [
    { card: "#cariesSection", btn: "#btnToggleCariesCard", label: "Fogszuvasodás" },
    { card: "#fillingSection", btn: "#btnToggleFillingCard", label: "Tömések és Konzerválás" },
    { card: "#endoSection", btn: "#btnToggleEndoCard", label: "Foggyökér" },
    { card: "#inflammationSection", btn: "#btnToggleInflammationCard", label: "Fogágy és Gyulladások" },
  ];
  toggleCards.forEach(({card, btn, label})=>{
    const cardEl = $(card);
    const btnEl = $(btn);
    if(!cardEl || !btnEl) return;
    btnEl.addEventListener("click", ()=>{
      const collapsed = cardEl.classList.toggle("collapsed");
      btnEl.setAttribute("title", collapsed ? `${label} kinyitása` : `${label} összecsukása`);
      btnEl.setAttribute("aria-label", collapsed ? `${label} kinyitása` : `${label} összecsukása`);
      const icon = $(".toggle-icon", btnEl);
      if(icon) icon.textContent = collapsed ? "+" : "−";
    });
  });
}

export async function initOdontogram(){
  if(initialized) return;
  initialized = true;
  wireControls();
  await buildGrid();
  // ensure controls match initial active tooth
  syncControlsFromState(toothState.get(activeTooth));
}
