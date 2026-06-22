import { t } from "./i18n/useI18n";

export interface TourStep { selector: string; titleKey: string; textKey: string; }

export const TOUR_STEPS: TourStep[] = [
  { selector: "#toothGrid, .tooth-grid", titleKey: "intro.step1.title", textKey: "intro.step1.text" },
  { selector: "#cariesSection", titleKey: "intro.step2.title", textKey: "intro.step2.text" },
  { selector: "#pulpInflam", titleKey: "intro.step3.title", textKey: "intro.step3.text" },
  { selector: "#toothSelect", titleKey: "intro.step4.title", textKey: "intro.step4.text" },
  { selector: "#fillingSection", titleKey: "intro.step5.title", textKey: "intro.step5.text" },
  { selector: "#crownSelect", titleKey: "intro.step6.title", textKey: "intro.step6.text" },
  { selector: "#toothGrid, .tooth-grid", titleKey: "intro.step7.title", textKey: "intro.step7.text" },
  { selector: "#btnSelectUpper", titleKey: "intro.step8.title", textKey: "intro.step8.text" },
  { selector: ".topbar-actions", titleKey: "intro.step9.title", textKey: "intro.step9.text" },
  { selector: "#btnExportMenu", titleKey: "intro.step10.title", textKey: "intro.step10.text" },
  { selector: "#btnImportMenu", titleKey: "intro.step11.title", textKey: "intro.step11.text" },
  { selector: ".topbar-actions", titleKey: "intro.step12.title", textKey: "intro.step12.text" },
];

export function clampStep(i: number): number {
  return Math.max(0, Math.min(TOUR_STEPS.length - 1, i));
}

let tourEls: HTMLElement[] = [];
let tourIndex = 0;
let keyHandler: ((e: KeyboardEvent) => void) | null = null;

function cleanup(){
  for(const el of tourEls) el.remove();
  tourEls = [];
  if(keyHandler){ document.removeEventListener("keydown", keyHandler); keyHandler = null; }
}

function makeEl(tag: string, cls: string, text?: string): HTMLElement {
  const n = document.createElement(tag);
  n.className = cls;
  if(text !== undefined) n.textContent = text;
  return n;
}

function render(){
  cleanup();
  const step = TOUR_STEPS[tourIndex];
  const target = document.querySelector(step.selector) as HTMLElement | null;

  const backdrop = makeEl("div", "odon-tour-backdrop");
  document.body.appendChild(backdrop);
  tourEls.push(backdrop);

  const card = makeEl("div", "odon-tour-card");
  const title = makeEl("div", "odon-tour-title", t(step.titleKey));
  const text = makeEl("div", "odon-tour-text", t(step.textKey));
  const counter = makeEl("div", "odon-tour-counter", `${tourIndex + 1} / ${TOUR_STEPS.length}`);
  const actions = makeEl("div", "odon-tour-actions");
  const skip = makeEl("button", "odon-tour-btn odon-tour-skip", t("intro.skip"));
  const back = makeEl("button", "odon-tour-btn", t("intro.back"));
  const next = makeEl("button", "odon-tour-btn odon-tour-next", tourIndex === TOUR_STEPS.length - 1 ? t("intro.finish") : t("intro.next"));
  skip.onclick = cleanup;
  back.onclick = () => { tourIndex = clampStep(tourIndex - 1); render(); };
  next.onclick = () => { if(tourIndex === TOUR_STEPS.length - 1){ cleanup(); } else { tourIndex = clampStep(tourIndex + 1); render(); } };
  (back as HTMLButtonElement).disabled = tourIndex === 0;
  actions.append(skip, back, next);
  card.append(counter, title, text, actions);
  document.body.appendChild(card);
  tourEls.push(card);

  if(target){
    target.scrollIntoView({ block: "center", inline: "center" });
    const r = target.getBoundingClientRect();
    const hl = makeEl("div", "odon-tour-highlight");
    hl.style.left = `${r.left - 6}px`;
    hl.style.top = `${r.top - 6}px`;
    hl.style.width = `${r.width + 12}px`;
    hl.style.height = `${r.height + 12}px`;
    document.body.appendChild(hl);
    tourEls.push(hl);
    // position card near target, clamped to viewport
    const top = Math.min(r.bottom + 12, window.innerHeight - 220);
    const left = Math.min(Math.max(8, r.left), window.innerWidth - 320);
    card.style.top = `${Math.max(8, top)}px`;
    card.style.left = `${left}px`;
  }else{
    card.classList.add("odon-tour-card-center");
  }
}

/** Start the 12-step interactive intro tour. */
export function startIntroTour(){
  tourIndex = 0;
  keyHandler = (e: KeyboardEvent) => {
    if(e.key === "Escape") cleanup();
    else if(e.key === "ArrowRight"){ tourIndex = clampStep(tourIndex + 1); render(); }
    else if(e.key === "ArrowLeft"){ tourIndex = clampStep(tourIndex - 1); render(); }
  };
  document.addEventListener("keydown", keyHandler);
  render();
}
