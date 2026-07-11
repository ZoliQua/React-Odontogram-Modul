/**
 * Registry catalog coding data (SP2 Stage 3b). Generic AXES-driven pass that
 * replaces the render's 13 scattered boolean-flag layer toggles + the `mods`
 * set toggle with one order-independent activation pass, byte-identical to
 * today's render (enforced by `src/__tests__/parity.test.ts`).
 */
import { AXES } from "./axes";
import type { FlagCtx } from "./types";

interface Deps {
  setActive: (el: any, on: boolean) => void;
  svgGetById: (root: any, id: string) => any;
  isToothPresent: (sel: string) => boolean;
  isUnderGum: (sel: string) => boolean;
  isExtraction: (sel: string) => boolean;
  fissureAllowedTeeth: Set<number>;
  brokenVariants: Set<string>;
}

/** Compute the render's derived booleans (mirrors applyStateToSvgSingle). */
export function buildFlagCtx(state: any, toothNo: number, d: Deps): FlagCtx {
  const sel = state.toothSelection;
  return {
    isImplant: sel === "implant",
    isMilktooth: sel === "milktooth",
    underGum: d.isUnderGum(sel),
    extraction: d.isExtraction(sel) || (sel === "none" && state.extractionWound),
    isNone: sel === "none",
    toothPresent: d.isToothPresent(sel),
    fissureAllowed: sel === "tooth-base" && d.fissureAllowedTeeth.has(toothNo),
    contactAllowed: sel === "tooth-base" || sel === "milktooth" || d.brokenVariants.has(sel),
    bruxismAllowed: sel === "tooth-base" && state.crownMaterial === "natural",
    extractionPlanAllowed: ["tooth-base","milktooth","implant","tooth-under-gum"].includes(sel),
  };
}

/** Activate the in-scope boolean-flag layers + the mods set layers. Order-independent. */
export function applyFlagLayers(svg: any, state: any, ctx: FlagCtx, d: Deps): void {
  for (const ax of AXES) {
    if (ax.kind === "boolean" && ax.svgLayer) {
      const on = state[ax.field] === true && (ax.appliesWhen ? ax.appliesWhen(ctx, state) : true);
      if (on) d.setActive(d.svgGetById(svg, ax.svgLayer), true);
    } else if (ax.kind === "set" && ax.id === "mods") {
      const mods: Iterable<string> = state.mods ?? [];
      for (const m of mods) {
        const v = ax.values?.find(x => x.id === m);
        const layers = v?.svgLayer == null ? [m] : Array.isArray(v.svgLayer) ? v.svgLayer : [v.svgLayer];
        for (const id of layers) d.setActive(d.svgGetById(svg, id), true);
      }
    }
  }
}
