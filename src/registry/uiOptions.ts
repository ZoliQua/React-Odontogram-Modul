import { AXES } from "./axes";
import type { UiOptCtx } from "./types";

/** Ordered {value, labelKey} option list for an axis (curated UI metadata). */
export function optionsFor(axisId: string, ctx: UiOptCtx = {}): { value: string; labelKey: string }[] {
  const ax = AXES.find(a => a.id === axisId);
  return (ax?.uiOptions ?? []).filter(o => (o.when ? o.when(ctx) : true)).map(o => ({ value: o.value, labelKey: o.labelKey }));
}
