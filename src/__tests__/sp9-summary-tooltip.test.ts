import { describe, it, expect, beforeEach } from "vitest";
import { getToothStateSummary, __setToothStateForTest, setPulpDetailLevel } from "../odontogram";
import { setI18nLanguage, t } from "../i18n/useI18n";

beforeEach(() => { setI18nLanguage("en"); });

describe("SP9: tooltip surfaces the clinical axes", () => {
  it("shows pulpDx, apicalDx (+lesion), resorption, periImplant", () => {
    __setToothStateForTest(36, { toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis", apicalDx: "asymptomatic-apical-periodontitis", periapicalType: "granuloma", resorptionType: "internal" });
    const s = getToothStateSummary(36);
    expect(s).toContain(t("pulpDx.irreversiblePulpitis"));
    expect(s.join(" · ")).toContain(t("apicalDx.asymptomaticApicalPeriodontitis"));
    expect(s.join(" · ")).toContain(t("periapical.type.granuloma"));
    expect(s).toContain(t("resorption.type.internal"));
  });
  it("shows periImplant on an implant", () => {
    __setToothStateForTest(14, { toothSelection: "implant", periImplant: "peri-implantitis-moderate" });
    expect(getToothStateSummary(14)).toContain(t("periImplant.periImplantitisModerate"));
  });
  it("FIX 3: does not show periImplant on a non-implant tooth (stray value)", () => {
    __setToothStateForTest(15, { toothSelection: "tooth-base", periImplant: "peri-implantitis-moderate" });
    expect(getToothStateSummary(15)).not.toContain(t("periImplant.periImplantitisModerate"));
  });
  it("pulp label follows detail level (latin)", () => {
    setPulpDetailLevel("latin");
    __setToothStateForTest(37, { toothSelection: "tooth-base", pulpLatin: "gangraena-pulpae", pulpDx: "necrosis" });
    expect(getToothStateSummary(37)).toContain(t("pulpLatin.gangraenaPulpae"));
    setPulpDetailLevel("aae");
  });
  it("FIX 2: latin mode + pulpLatin unset falls back to the Latin representative, not the AAE label", () => {
    setPulpDetailLevel("latin");
    __setToothStateForTest(38, { toothSelection: "tooth-base", pulpDx: "irreversible-pulpitis", pulpLatin: "none" });
    const s = getToothStateSummary(38);
    // PULP_DX_TO_LATIN["irreversible-pulpitis"] === "pulpitis-acuta-serosa"
    expect(s).toContain(t("pulpLatin.pulpitisAcutaSerosa"));
    expect(s).not.toContain(t("pulpDx.irreversiblePulpitis"));
    setPulpDetailLevel("aae");
  });
  it("caries line gets a coarse severity qualifier", () => {
    __setToothStateForTest(16, { toothSelection: "tooth-base", caries: ["caries-occlusal"], cariesSeverity: { occlusal: 6 } });
    expect(getToothStateSummary(16).join(" · ")).toContain(t("summary.severity.deep"));
  });
  it("rootCaries shows its value, not just a generic label", () => {
    __setToothStateForTest(46, { toothSelection: "tooth-base", rootCaries: "arrested" });
    expect(getToothStateSummary(46).join(" · ")).toContain(t("rootCaries.arrested"));
  });
  it("surfaces calculus, crownLeakage, fracture, contact, bruxism presence", () => {
    __setToothStateForTest(26, { toothSelection: "tooth-base", calculus: true, crownLeakage: true, brokenDistal: true, contactMesial: true, bruxismWear: true });
    const j = getToothStateSummary(26).join(" · ");
    expect(j).toContain(t("calculus.label"));
    expect(j).toContain(t("crownLeakage.label"));
    expect(j).toContain(t("summary.fracture"));
    expect(j).toContain(t("tooth.contact.mesialMissing"));
    expect(j).toContain(t("tooth.bruxism.edgeWear"));
  });
});
