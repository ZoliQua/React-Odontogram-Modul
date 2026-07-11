// SP8 Task 5: UI wiring for the peri-implant axis (Tasks 1-4 already provide
// the `periImplant` axis, getPeriImplantOptions(), render, and hydrate/
// migration). This task adds the `#periImplantSelect` control (implants
// only) to SP7's "Root and periodontium" card's perio block, hides the
// parodontal/inflammation mod checkboxes for an implant (composing with
// SP7's syncInflammationModVisibility), and drops the old ad-hoc
// parodontal->"Peri-implantitis" relabel.
//
// Like sp7-card-merge.test.ts, there is no full-DOM initOdontogram() mount
// harness for the tooth panel: the JSX-structure assertion renders <App/>
// with odontogram.ts mocked out, and the visibility/value-write behavior
// exercises the real, exported test-only seams
// (__syncPeriImplantVisibilityForTest / __applyPeriImplantSelectionForTest)
// against hand-built DOM fragments — mirroring the
// __syncInflammationModVisibilityForTest / __applyRestorationSelectionForTest
// pattern, since those private handlers close over module-internal
// selectedTeeth/toothState state that isn't reachable from a test.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import App from "../App";
import {
  __syncPeriImplantVisibilityForTest,
  __applyPeriImplantSelectionForTest,
  VALID_PERI_IMPLANT,
} from "../odontogram";

vi.mock("../odontogram", async () => {
  const actual = await vi.importActual<typeof import("../odontogram")>("../odontogram");
  return {
    initOdontogram: vi.fn().mockResolvedValue(undefined),
    destroyOdontogram: vi.fn(),
    setNumberingSystem: vi.fn(),
    clearSelection: vi.fn(),
    setOcclusalVisible: vi.fn(),
    setWisdomVisible: vi.fn(),
    setShowBase: vi.fn(),
    setHealthyPulpVisible: vi.fn(),
    registerPlugins: vi.fn(),
    setPluginState: vi.fn(),
    getPluginState: vi.fn(),
    getToothStateSummary: vi.fn().mockReturnValue([]),
    setReadOnly: vi.fn(),
    getReadOnly: vi.fn().mockReturnValue(false),
    setNotesEnabled: vi.fn(),
    getNotesEnabled: vi.fn().mockReturnValue(false),
    setIcdasEnabled: vi.fn(),
    getIcdasEnabled: vi.fn().mockReturnValue(false),
    setPulpDetailLevel: vi.fn(),
    getPulpDetailLevel: vi.fn().mockReturnValue("aae"),
    setSecondaryCariesMode: vi.fn(),
    getSecondaryCariesMode: vi.fn().mockReturnValue("standard"),
    setRootCariesMode: vi.fn(),
    getRootCariesMode: vi.fn().mockReturnValue("simple"),
    setRadiographicDepthMode: vi.fn(),
    getRadiographicDepthMode: vi.fn().mockReturnValue("off"),
    setCariesDepthEnabled: vi.fn(),
    getCariesDepthEnabled: vi.fn().mockReturnValue(true),
    setWearDetailLevel: vi.fn(),
    getWearDetailLevel: vi.fn().mockReturnValue("complex"),
    setDiscolorationDetailLevel: vi.fn(),
    getDiscolorationDetailLevel: vi.fn().mockReturnValue("complex"),
    setSurfaceNotation: vi.fn(),
    getSurfaceNotation: vi.fn().mockReturnValue("full"),
    getOdontogramSummary: vi.fn().mockReturnValue({
      overview: "", permanentList: null, missingList: null,
      sections: [], implants: null, periodontalTitle: "", periodontalText: "",
    }),
    onStateChange: vi.fn().mockReturnValue(() => {}),
    exportFhir: vi.fn(),
    exportImage: vi.fn(),
    exportSvg: vi.fn(),
    setImportFormat: vi.fn(),
    // Real exports under test — not part of the imperative DOM/SVG wiring.
    __syncPeriImplantVisibilityForTest: actual.__syncPeriImplantVisibilityForTest,
    __applyPeriImplantSelectionForTest: actual.__applyPeriImplantSelectionForTest,
    VALID_PERI_IMPLANT: actual.VALID_PERI_IMPLANT,
  };
});

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  document.documentElement.classList.remove("dark");
});

describe("SP8 Task 5: peri-implant UI", () => {
  it("#periImplantSelect exists in the perio block", () => {
    render(createElement(App));
    expect(document.querySelector("#rpPerioBlock #periImplantRow #periImplantSelect")).toBeTruthy();
  });

  it("shown for an implant, hidden for a natural tooth", () => {
    document.body.innerHTML = "";
    const row = document.createElement("div");
    row.id = "periImplantRow";
    row.className = "row hidden";
    document.body.appendChild(row);

    __syncPeriImplantVisibilityForTest(row, null, "implant");
    expect(row.classList.contains("hidden")).toBe(false);

    __syncPeriImplantVisibilityForTest(row, null, "tooth-base");
    expect(row.classList.contains("hidden")).toBe(true);
  });

  it("mods checkboxes hidden for an implant", () => {
    // Mirrors the DOM shape buildChecks() produces for #modsChecks: a <label>
    // wrapping the checkbox input and its text span (see sp7-card-merge.test.ts).
    document.body.innerHTML = "";
    const container = document.createElement("div");
    container.id = "modsChecks";
    const build = (value: string, text: string) => {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = value;
      const span = document.createElement("span");
      span.textContent = text;
      label.appendChild(input);
      label.appendChild(span);
      container.appendChild(label);
      return label;
    };
    const parodontalLabel = build("parodontal", "Parodontal");
    const inflammationLabel = build("inflammation", "Inflammation");
    document.body.appendChild(container);

    __syncPeriImplantVisibilityForTest(null, container, "implant");
    expect(parodontalLabel.classList.contains("hidden")).toBe(true);
    expect(inflammationLabel.classList.contains("hidden")).toBe(true);

    __syncPeriImplantVisibilityForTest(null, container, "tooth-base");
    expect(parodontalLabel.classList.contains("hidden")).toBe(false);
    expect(inflammationLabel.classList.contains("hidden")).toBe(false);
  });

  it("selecting a value writes state.periImplant", () => {
    document.body.innerHTML = "";
    const sel = document.createElement("select");
    sel.id = "periImplantSelect";
    for(const v of VALID_PERI_IMPLANT){
      const o = document.createElement("option");
      o.value = v;
      sel.appendChild(o);
    }
    document.body.appendChild(sel);

    const state: Record<string, unknown> = { periImplant: "none" };
    sel.addEventListener("change", () => {
      __applyPeriImplantSelectionForTest(state, sel.value);
    });

    expect(VALID_PERI_IMPLANT.has("peri-implantitis-moderate")).toBe(true);
    sel.value = "peri-implantitis-moderate";
    sel.dispatchEvent(new Event("change", { bubbles: true }));

    expect(state.periImplant).toBe("peri-implantitis-moderate");
  });
});
