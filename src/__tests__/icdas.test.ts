import { describe, it, expect } from "vitest";
import { icdasTier, threeLevelToIcdas, icdasToThreeLevel } from "../odontogram";

describe("ICDAS mapping helpers", () => {
  it("icdasTier groups 1-2/3-4/5-6", () => {
    expect([1,2].map(icdasTier)).toEqual([1,1]);
    expect([3,4].map(icdasTier)).toEqual([2,2]);
    expect([5,6].map(icdasTier)).toEqual([3,3]);
  });
  it("threeLevelToIcdas maps to representative codes", () => {
    expect(threeLevelToIcdas("surface")).toBe(2);
    expect(threeLevelToIcdas("dentin")).toBe(4);
    expect(threeLevelToIcdas("deep")).toBe(6);
    expect(threeLevelToIcdas("nonsense")).toBe(2);
  });
  it("icdasToThreeLevel is the inverse grouping", () => {
    expect([1,2].map(icdasToThreeLevel)).toEqual(["surface","surface"]);
    expect([3,4].map(icdasToThreeLevel)).toEqual(["dentin","dentin"]);
    expect([5,6].map(icdasToThreeLevel)).toEqual(["deep","deep"]);
  });
});
