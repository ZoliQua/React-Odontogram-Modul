import { describe, it, expect } from "vitest";
import { validValues, validSurfaces } from "../validate";

const EXPECT: Record<string, string[]> = {
  toothSelection: ["none","tooth-base","milktooth","implant","tooth-under-gum","no-tooth-after-extraction"],
  endo: ["none","endo-medical-filling","endo-filling","endo-filling-incomplete","endo-glass-pin","endo-metal-pin"],
  fillingMaterial: ["none","amalgam","composite","gic","temporary"],
  bridgeUnit: ["none","removable","zircon","metal","temporary","bar","bar-prosthesis"],
  mobility: ["none","m1","m2","m3"],
  crownMaterial: ["natural","broken","crownprep","radix","emax","zircon","metal","temporary","telescope","healing-abutment","locator","locator-prosthesis","bar","bar-prosthesis"],
  mods: ["inflammation","parodontal","mobility"],
  periapicalType: ["none","granuloma","cyst","abscess"],
  caries: ["caries-subcrown","caries-buccal","caries-lingual","caries-mesial","caries-distal","caries-occlusal"],
};

describe("registry validation vocabulary equals today's VALID_* sets", () => {
  for (const [axis, expected] of Object.entries(EXPECT)) {
    it(`validValues("${axis}")`, () => expect(validValues(axis)).toEqual(new Set(expected)));
  }
  it("validSurfaces()", () => expect(validSurfaces()).toEqual(new Set(["buccal","lingual","mesial","distal","occlusal"])));
});
