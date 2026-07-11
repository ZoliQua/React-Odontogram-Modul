// SP4 final-review fixes:
//  - periapicalRowVisible: the lesion-subtype row must stay authorable on a
//    non-present tooth (implant/missing) carrying mods.inflammation (regression
//    where the apicalDx-only gate hid it for implants).
//  - extraction-socket path locked (was untested by apical-parity, which only
//    covers "none"/"implant"): a socket lesion still renders its glyph.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { __renderActiveLayers, periapicalRowVisible } from "../odontogram";

function svgText(name: string): string {
  return readFileSync(fileURLToPath(new NodeURL(`../assets/teeth-svgs/${name}.svg`, import.meta.url)), "utf8");
}
const ids = (toothNo: number, state: Record<string, unknown>): string[] =>
  __renderActiveLayers(svgText(String(toothNo)), toothNo, state).map((l: any) => l.id);

describe("SP4 fix: periapical lesion-subtype row visibility", () => {
  const S = (o: Record<string, unknown>) => ({ apicalDx: "normal", toothSelection: "tooth-base", mods: new Set<string>(), ...o });
  it("present tooth: follows apicalDx", () => {
    expect(periapicalRowVisible(S({ apicalDx: "normal" }))).toBe(false);
    expect(periapicalRowVisible(S({ apicalDx: "chronic-apical-abscess" }))).toBe(true);
  });
  it("implant with mods.inflammation: row SHOWN (regression fix)", () => {
    expect(periapicalRowVisible(S({ toothSelection: "implant", mods: new Set(["inflammation"]) }))).toBe(true);
  });
  it("implant without inflammation: hidden", () => {
    expect(periapicalRowVisible(S({ toothSelection: "implant" }))).toBe(false);
  });
  it("missing tooth with inflammation: shown", () => {
    expect(periapicalRowVisible(S({ toothSelection: "none", mods: new Set(["inflammation"]) }))).toBe(true);
  });
});

describe("SP4: extraction-socket apical lesion renders (locked)", () => {
  it("a socket with apicalDx + periapicalType renders the chosen glyph", () => {
    const a = ids(11, { toothSelection: "no-tooth-after-extraction", apicalDx: "asymptomatic-apical-periodontitis", periapicalType: "granuloma" });
    expect(a).toContain("granuloma");
  });
});
