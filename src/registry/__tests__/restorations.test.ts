import { describe, it, expect } from "vitest";
import { RESTORATION_MATRIX, composeRestorationLayers, isValidRestoration, restorationOptions } from "../restorations";

describe("restoration matrix", () => {
  it("composes {material}-{type} with bridge/telescope/onlay special cases", () => {
    expect(composeRestorationLayers("crown", "gold", "front")).toEqual(["gold-crown"]);
    expect(composeRestorationLayers("inlay", "emax", "front")).toEqual(["emax-inlay"]);
    expect(composeRestorationLayers("bridge", "metal-ceramic", "front")).toEqual(["metal-ceramic-bridge-connector"]);
    expect(composeRestorationLayers("crown", "telescope", "front"))
      .toEqual(["telescope-crown", "telescope-crown-inside", "telescope-crown-outside"]);
    expect(composeRestorationLayers("onlay", "gold", "occlusal")).toEqual(["gold-onlay"]);
    expect(composeRestorationLayers("none", "none", "front")).toEqual([]);
  });
  it("validity follows the artwork matrix (onlay occlusal-only; metal crown/bridge-only; onlay materials incl. zircon)", () => {
    expect(isValidRestoration("onlay", "gold", "front")).toBe(false);
    expect(isValidRestoration("onlay", "gold", "occlusal")).toBe(true);
    expect(isValidRestoration("inlay", "metal", "front")).toBe(false);
    expect(isValidRestoration("crown", "metal", "front")).toBe(true);
    expect(isValidRestoration("onlay", "zircon", "occlusal")).toBe(true);
    expect(isValidRestoration("veneer", "zircon", "front")).toBe(true);
  });
  it("options list is view-filtered and prefixed", () => {
    const front = restorationOptions("front", {});
    expect(front.some(o => o.restorationType === "onlay")).toBe(false);
    expect(front[0]).toEqual({ restorationType: "none", restorationMaterial: "none", labelKey: "restoration.none" });
    const occl = restorationOptions("occlusal", {});
    expect(occl.some(o => o.restorationType === "onlay")).toBe(true);
  });
});
