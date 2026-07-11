import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { __renderActiveLayers } from "../odontogram";

// Use Node's own URL (not the jsdom-provided global URL, which mis-resolves
// relative `file:` URLs against `window.location` under the jsdom test
// environment) so this always resolves relative to this test file on disk.
// (Same workaround as src/__tests__/svg-assets.test.ts.)
function svgText(name: string): string {
  return readFileSync(fileURLToPath(new NodeURL(`../assets/teeth-svgs/${name}.svg`, import.meta.url)), "utf8");
}

describe("__renderActiveLayers seam", () => {
  it("a default tooth-base state shows base anatomy but no clinical layers", () => {
    const ids = __renderActiveLayers(svgText("11"), 11, { toothSelection: "tooth-base" }).map(l => l.id);
    expect(ids).toContain("tooth-base");
    expect(ids).not.toContain("metal-crown");
    expect(ids).not.toContain("caries-occlusal");
  });

  it("crownMaterial=metal activates the metal-crown layer", () => {
    const ids = __renderActiveLayers(svgText("11"), 11, { toothSelection: "tooth-base", crownMaterial: "metal" }).map(l => l.id);
    expect(ids).toContain("metal-crown");
  });
});
