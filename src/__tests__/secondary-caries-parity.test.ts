// SP5 Task 3: secondary/recurrent caries is now a STORED, SCORED axis. It used
// to be DERIVED at render/summary time from `caries ∩ fillingSurfaceMaterials`
// (a caries surface that also carried a filling activated `subcaries-{surface}`
// instead of `caries-{surface}`). It is now driven by an explicit per-surface
// CARS 0..6 score in `secondaryCaries`, with the score encoded as the subcaries
// layer's opacity: `opacity = 0.30 + (score-1)/5 * 0.70`.
//
// Byte-compat boundary: a MIGRATED `caries ∩ filling` surface (no stored score)
// must still activate the SAME `subcaries-{surface}` LAYER; the only intended
// new fingerprint attribute is the opacity (canonical migrated score 3 → 0.58).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { __renderActiveLayers, __setToothStateForTest, __getToothStateForTest, getOdontogramSummary } from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

const testFileUrl = import.meta.url;
const readSvg = (name: string) => readFileSync(fileURLToPath(new URL(`../assets/teeth-svgs/${name}.svg`, testFileUrl)), "utf8");

const occlSvg = readSvg("16_occl");
const render = (state: Record<string, unknown>) => __renderActiveLayers(occlSvg, 16, state);
const find = (layers: { id: string; opacity: string; cls: string }[], id: string) => layers.find(l => l.id === id);

describe("SP5 Task 3: stored secondaryCaries CARS score + opacity render", () => {
  it("score > 0 activates subcaries-{surface} (NOT the primary caries-{surface} layer)", () => {
    const layers = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], secondaryCaries: { occlusal: 3 } });
    expect(find(layers, "subcaries-occlusal")).toBeTruthy();
    // primary + secondary are mutually exclusive per surface
    expect(find(layers, "caries-occlusal")).toBeUndefined();
  });

  it("opacity formula: score 6 -> 1, score 3 -> 0.58, score 1 -> 0.3", () => {
    const at = (score: number) => find(render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], secondaryCaries: { occlusal: score } }), "subcaries-occlusal")?.opacity;
    expect(at(6)).toBe("1");
    expect(at(5)).toBe("0.86");
    expect(at(4)).toBe("0.72");
    expect(at(3)).toBe("0.58");
    expect(at(2)).toBe("0.44");
    expect(at(1)).toBe("0.3");
  });

  it("score 0 (or absent) -> primary caries-{surface} layer, NO subcaries", () => {
    const zero = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], secondaryCaries: { occlusal: 0 } });
    expect(find(zero, "subcaries-occlusal")).toBeUndefined();
    expect(find(zero, "caries-occlusal")).toBeTruthy();
    // default primary depth opacity path still applies (tier 1 -> 0.45)
    expect(find(zero, "caries-occlusal")?.opacity).toBe("0.45");

    const absent = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"] });
    expect(find(absent, "subcaries-occlusal")).toBeUndefined();
    expect(find(absent, "caries-occlusal")).toBeTruthy();
  });

  it("the subcaries opacity is the CARS score, INDEPENDENT of the primary cariesDepths (ICDAS) path", () => {
    // A surface with BOTH a caries-depth (ICDAS 6 -> tier 3) and a secondary
    // score: the subcaries layer's opacity reflects the CARS score, not depth.
    const layers = render({ toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesDepths: { occlusal: 6 }, secondaryCaries: { occlusal: 3 } });
    const sub = find(layers, "subcaries-occlusal");
    expect(sub?.opacity).toBe("0.58"); // CARS 3, not the tier-3 depth "1"
    expect(sub?.cls).toBe("");         // no caries-deep on the secondary path
  });

  it("BYTE-COMPAT: a migrated caries∩filling surface still activates subcaries-{surface} (layer preserved), at score-3 opacity, cls empty", () => {
    // No stored secondaryCaries -> migration promotes the old intersection to 3.
    const layers = render({
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingMaterial: "amalgam",
      fillingSurfaces: ["occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
    });
    const sub = find(layers, "subcaries-occlusal");
    expect(sub).toBeTruthy();          // SAME layer id as the pre-rewrite derivation
    expect(sub?.opacity).toBe("0.58"); // ONLY new fingerprint attribute (score 3)
    expect(sub?.cls).toBe("");
    expect(find(layers, "caries-occlusal")).toBeUndefined();
  });

  it("migration: caries∩filling with NO stored score sets secondaryCaries[surface] = 3", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
    });
    const s = __getToothStateForTest(16) as Any;
    expect(s.secondaryCaries.get("occlusal")).toBe(3);
  });

  it("migration: a STORED secondaryCaries score WINS over the default 3", () => {
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal"],
      fillingSurfaceMaterials: { occlusal: "amalgam" },
      secondaryCaries: { occlusal: 5 },
    });
    const s = __getToothStateForTest(16) as Any;
    expect(s.secondaryCaries.get("occlusal")).toBe(5);
  });

  it("migration: a caries surface with NO filling is NOT promoted to secondary", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", caries: ["caries-occlusal"] });
    const s = __getToothStateForTest(16) as Any;
    expect(s.secondaryCaries.get("occlusal")).toBeUndefined();
  });

  it("summary: reads the stored secondaryCaries score (not the caries∩filling re-derivation)", () => {
    setI18nLanguage("en");
    // Two caries surfaces, only one carries a stored secondary score; NO filling,
    // so the OLD caries∩filling derivation would have marked NEITHER as secondary.
    __setToothStateForTest(16, {
      toothSelection: "tooth-base",
      caries: ["caries-occlusal", "caries-mesial"],
      secondaryCaries: { occlusal: 4 },
    });
    const summary = getOdontogramSummary();
    const caries = summary.sections.find(sec => sec.key === "caries");
    const item = caries?.items.find(i => i.includes("16")) ?? "";
    // occlusal -> secondary (tagged with the "secondary" suffix), mesial -> primary
    expect(item).toContain(t("toothInfo.secondary", "en"));
    expect(item).toContain("O");
    expect(item).toContain("M");
  });
});

// Local loose type for reading back test state (Sets/Maps -> arrays/objects).
type Any = { secondaryCaries: Map<string, number> };
