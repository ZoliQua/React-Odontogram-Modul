export type RestorationType = "none" | "crown" | "inlay" | "onlay" | "veneer" | "bridge";
export type RestorationMaterial =
  | "none" | "emax" | "gold" | "gradia" | "zircon" | "metal" | "metal-ceramic" | "telescope" | "temporary";
export type ToothView = "front" | "occlusal";

// Single source of truth: which materials each restoration type supports, and view gating.
export const RESTORATION_MATRIX: Record<Exclude<RestorationType, "none">,
  { materials: RestorationMaterial[]; occlusalOnly?: boolean }> = {
  crown:  { materials: ["emax","gold","gradia","zircon","metal","metal-ceramic","telescope","temporary"] },
  bridge: { materials: ["emax","gold","gradia","zircon","metal","metal-ceramic","telescope","temporary"] },
  inlay:  { materials: ["emax","gold","gradia","zircon","temporary"] },
  onlay:  { materials: ["emax","gold","gradia","zircon","temporary"], occlusalOnly: true },
  veneer: { materials: ["emax","gold","gradia","zircon","temporary"] },
};

const LABEL_KEY = {
  type: (t: RestorationType) => `restoration.type.${t}`,
  material: (m: RestorationMaterial) => `restoration.material.${m === "metal-ceramic" ? "metalCeramic" : m}`,
};

export function isValidRestoration(type: RestorationType, material: RestorationMaterial, view: ToothView): boolean {
  if (type === "none") return material === "none";
  const spec = RESTORATION_MATRIX[type];
  if (!spec) return false;
  if (spec.occlusalOnly && view !== "occlusal") return false;
  return spec.materials.includes(material);
}

export function composeRestorationLayers(type: RestorationType, material: RestorationMaterial, view: ToothView): string[] {
  if (type === "none" || material === "none") return [];
  if (!isValidRestoration(type, material, view)) return [];
  if (type === "bridge") return [`${material}-bridge-connector`];
  if (type === "crown" && material === "telescope")
    return ["telescope-crown", "telescope-crown-inside", "telescope-crown-outside"];
  return [`${material}-${type}`];
}

// Every valid (type,material) combo layer id, for the render clear-set.
export function allRestorationLayers(): string[] {
  const out = new Set<string>();
  for (const type of Object.keys(RESTORATION_MATRIX) as (keyof typeof RESTORATION_MATRIX)[])
    for (const material of RESTORATION_MATRIX[type].materials)
      for (const view of ["front","occlusal"] as ToothView[])
        composeRestorationLayers(type, material, view).forEach(id => out.add(id));
  return [...out];
}

export interface RestorationOption {
  restorationType: RestorationType; restorationMaterial: RestorationMaterial;
  labelKey: string; // for "none"; combos carry typeLabelKey+materialLabelKey instead
  typeLabelKey?: string; materialLabelKey?: string; prefixKey?: string;
}

export function restorationOptions(view: ToothView, _ctx: Record<string, unknown>): RestorationOption[] {
  const opts: RestorationOption[] = [
    { restorationType: "none", restorationMaterial: "none", labelKey: "restoration.none" },
  ];
  for (const type of Object.keys(RESTORATION_MATRIX) as (keyof typeof RESTORATION_MATRIX)[]) {
    const spec = RESTORATION_MATRIX[type];
    if (spec.occlusalOnly && view !== "occlusal") continue;
    for (const material of spec.materials) {
      opts.push({
        restorationType: type, restorationMaterial: material,
        labelKey: "", prefixKey: "restoration.prefix.fixed",
        typeLabelKey: LABEL_KEY.type(type), materialLabelKey: LABEL_KEY.material(material),
      });
    }
  }
  return opts;
}
