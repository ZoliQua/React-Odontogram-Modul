// SP5 Task 1: caries fields foundation — additive registry scaffolding only
// (no render/UI wiring yet; see later SP5 tasks). Mirrors
// diagnosis-axes.test.ts's shape for the new `rootCaries` enum axis, and
// fhir-import.test.ts's cariesDepths round-trip for the new `secondaryCaries`/
// `radiographicDepth` per-surface scalar-map fields (handled exactly like
// `cariesDepths` — special-cased outside AXES/FIELD_MAPPINGS, with their own
// independent FHIR finding codes).
import { describe, it, expect } from "vitest";
import { VALID_ROOT_CARIES, VALID_CARS, VALID_RADIOGRAPHIC_DEPTH } from "../../odontogram";
import { AXES } from "../axes";
import { FIELD_MAPPINGS } from "../../fhir/fieldMappings";
import { buildFhirBundle } from "../../fhir/toFhir";
import { parseFhirBundle } from "../../fhir/fromFhir";

describe("SP5 Task 1: caries fields VALID_* sets", () => {
  it("VALID_ROOT_CARIES has none/active/arrested/active-cavitated", () => {
    expect(VALID_ROOT_CARIES).toEqual(new Set(["none", "active", "arrested", "active-cavitated"]));
  });

  it("VALID_CARS has the 7 CARS scores (0..6)", () => {
    expect(VALID_CARS).toEqual(new Set([0, 1, 2, 3, 4, 5, 6]));
  });

  it("VALID_RADIOGRAPHIC_DEPTH has none/E1/E2/D1/D2/D3", () => {
    expect(VALID_RADIOGRAPHIC_DEPTH).toEqual(new Set(["none", "E1", "E2", "D1", "D2", "D3"]));
  });
});

describe("SP5 Task 1: registry catalog stays 1:1 after adding rootCaries", () => {
  it("AXES.length === FIELD_MAPPINGS.length", () => {
    expect(AXES.length).toBe(FIELD_MAPPINGS.length);
  });

  it("rootCaries has a matching FIELD_MAPPINGS row (finding code, kind, valueGroup, skipValue)", () => {
    const ax = AXES.find(a => a.field === "rootCaries");
    const m = FIELD_MAPPINGS.find(f => f.field === "rootCaries");
    expect(ax).toBeTruthy();
    expect(m).toBeTruthy();
    expect(ax!.finding.local).toBe(m!.findingCode);
    expect(ax!.finding.display).toBe(m!.findingDisplay);
    expect(ax!.kind).toBe(m!.kind);
    expect(ax!.valueGroup).toBe((m as { valueGroup?: string }).valueGroup);
    expect(ax!.skipValue).toBe((m as { skipValue?: string }).skipValue);
  });

  it("rootCaries applies only to a present tooth and carries the caries-root svgLayer", () => {
    const ax = AXES.find(a => a.id === "rootCaries");
    expect(ax?.svgLayer).toBe("caries-root");
    expect(ax?.appliesWhen?.({ toothPresent: true } as never, {} as never)).toBe(true);
    expect(ax?.appliesWhen?.({ toothPresent: false } as never, {} as never)).toBe(false);
  });

  it("secondaryCaries/radiographicDepth have NO AXES/FIELD_MAPPINGS row (special-cased like cariesDepths)", () => {
    expect(AXES.find(a => a.field === "secondaryCaries")).toBeUndefined();
    expect(AXES.find(a => a.field === "radiographicDepth")).toBeUndefined();
    expect(FIELD_MAPPINGS.find(m => m.field === "secondaryCaries")).toBeUndefined();
    expect(FIELD_MAPPINGS.find(m => m.field === "radiographicDepth")).toBeUndefined();
  });
});

describe("SP5 Task 1: FHIR round-trip", () => {
  it("rootCaries survives export -> import losslessly (registered axis)", () => {
    const payload = { version: "2.2", teeth: { "16": { rootCaries: "active-cavitated" } } };
    const bundle = buildFhirBundle(payload as never);
    const codes = (bundle.entry ?? []).map((e) => (e.resource as { code?: { coding?: Array<{ code?: string }> } } | undefined)?.code?.coding?.[0]?.code);
    expect(codes).toContain("root-caries");
    const out = parseFhirBundle(bundle);
    expect(out.teeth["16"].rootCaries).toBe("active-cavitated");
  });

  it("rootCaries is omitted from the bundle when 'none' (skipValue) and does not round-trip a stray value", () => {
    const bundle = buildFhirBundle({ version: "2.2", teeth: { "21": { rootCaries: "none" } } } as never);
    const codes = (bundle.entry ?? []).map((e) => (e.resource as { code?: { coding?: Array<{ code?: string }> } } | undefined)?.code?.coding?.[0]?.code);
    expect(codes).not.toContain("root-caries");
    expect(parseFhirBundle(bundle).teeth["21"]?.rootCaries).toBeUndefined();
  });

  it("secondaryCaries (CARS per-surface map) round-trips through a cariesDepths-style Observation", () => {
    const payload = { version: "2.2", teeth: { "37": { secondaryCaries: { mesial: 4, occlusal: 0 } } } };
    const bundle = buildFhirBundle(payload as never);
    const obs = (bundle.entry ?? []).map((e) => e.resource as { code?: { coding?: Array<{ code?: string }> }; component?: Array<{ code?: { coding?: Array<{ code?: string }> }; valueInteger?: number }> } | undefined)
      .find((o) => o?.code?.coding?.[0]?.code === "secondary-caries");
    expect(obs).toBeDefined();
    const bySurface = Object.fromEntries((obs?.component ?? []).map((c) => [c.code?.coding?.[0]?.code, c.valueInteger]));
    expect(bySurface).toEqual({ mesial: 4, occlusal: 0 });

    const out = parseFhirBundle(bundle);
    expect(out.teeth["37"].secondaryCaries).toEqual({ mesial: 4, occlusal: 0 });
  });

  it("radiographicDepth (per-surface enum map) round-trips through its own Observation", () => {
    const payload = { version: "2.2", teeth: { "26": { radiographicDepth: { distal: "D2", buccal: "E1" } } } };
    const bundle = buildFhirBundle(payload as never);
    const obs = (bundle.entry ?? []).map((e) => e.resource as { code?: { coding?: Array<{ code?: string }> }; component?: Array<{ code?: { coding?: Array<{ code?: string }> }; valueCodeableConcept?: { coding?: Array<{ code?: string }> } }> } | undefined)
      .find((o) => o?.code?.coding?.[0]?.code === "radiographic-caries-depth");
    expect(obs).toBeDefined();
    const bySurface = Object.fromEntries((obs?.component ?? []).map((c) => [c.code?.coding?.[0]?.code, c.valueCodeableConcept?.coding?.[0]?.code]));
    expect(bySurface).toEqual({ distal: "D2", buccal: "E1" });

    const out = parseFhirBundle(bundle);
    expect(out.teeth["26"].radiographicDepth).toEqual({ distal: "D2", buccal: "E1" });
  });

  it("empty/absent secondaryCaries and radiographicDepth emit nothing", () => {
    const bundle = buildFhirBundle({ version: "2.2", teeth: { "11": { secondaryCaries: {}, radiographicDepth: {} } } } as never);
    const codes = (bundle.entry ?? []).map((e) => (e.resource as { code?: { coding?: Array<{ code?: string }> } } | undefined)?.code?.coding?.[0]?.code);
    expect(codes).not.toContain("secondary-caries");
    expect(codes).not.toContain("radiographic-caries-depth");
  });
});
