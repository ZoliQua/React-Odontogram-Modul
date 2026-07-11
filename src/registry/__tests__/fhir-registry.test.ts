import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { payloadCases } from "../../__tests__/parity/matrix";
import { buildFhirBundleFromRegistry } from "../fhir";

const here = import.meta.url;
const golden = JSON.parse(readFileSync(fileURLToPath(new URL("../../__tests__/parity/fhir-golden.json", here)), "utf8"));

describe("registry-driven toFhir matches the pre-rewrite engine", () => {
  it("equals the frozen FHIR golden", () => {
    payloadCases().forEach((p, i) =>
      expect(buildFhirBundleFromRegistry(p.payload), p.name).toEqual(golden[i].bundle));
  });
  it("matches frozen snapshots for note / customStates / custom subject (branches outside the matrix)", () => {
    const noteP = { teeth: { "11": { note: "chipped mesial" } } };
    const customP = { teeth: { "11": { customStates: { pluginA: "x", pluginB: 3, pluginC: true } } } };
    const subjP = { teeth: { "11": { crownMaterial: "metal" } } };
    const opts = { subject: "Patient/xyz" };
    expect(buildFhirBundleFromRegistry(noteP as any)).toMatchInlineSnapshot(`
      {
        "entry": [
          {
            "fullUrl": "urn:uuid:odontogram-subject",
            "resource": {
              "id": "odontogram-subject",
              "resourceType": "Patient",
            },
          },
          {
            "resource": {
              "bodySite": {
                "coding": [
                  {
                    "code": "11",
                    "system": "urn:iso:std:iso:3950",
                  },
                ],
                "text": "Tooth 11",
              },
              "category": [
                {
                  "coding": [
                    {
                      "code": "exam",
                      "display": "Exam",
                      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    },
                  ],
                },
              ],
              "code": {
                "coding": [
                  {
                    "code": "tooth-note",
                    "display": "Tooth note",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Tooth note",
              },
              "note": [
                {
                  "text": "chipped mesial",
                },
              ],
              "resourceType": "Observation",
              "status": "final",
              "subject": {
                "reference": "urn:uuid:odontogram-subject",
              },
            },
          },
        ],
        "resourceType": "Bundle",
        "type": "collection",
      }
    `);
    expect(buildFhirBundleFromRegistry(customP as any)).toMatchInlineSnapshot(`
      {
        "entry": [
          {
            "fullUrl": "urn:uuid:odontogram-subject",
            "resource": {
              "id": "odontogram-subject",
              "resourceType": "Patient",
            },
          },
          {
            "resource": {
              "bodySite": {
                "coding": [
                  {
                    "code": "11",
                    "system": "urn:iso:std:iso:3950",
                  },
                ],
                "text": "Tooth 11",
              },
              "category": [
                {
                  "coding": [
                    {
                      "code": "exam",
                      "display": "Exam",
                      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    },
                  ],
                },
              ],
              "code": {
                "coding": [
                  {
                    "code": "custom-state:pluginA",
                    "display": "Custom state: pluginA",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Custom state: pluginA",
              },
              "resourceType": "Observation",
              "status": "final",
              "subject": {
                "reference": "urn:uuid:odontogram-subject",
              },
              "valueString": "x",
            },
          },
          {
            "resource": {
              "bodySite": {
                "coding": [
                  {
                    "code": "11",
                    "system": "urn:iso:std:iso:3950",
                  },
                ],
                "text": "Tooth 11",
              },
              "category": [
                {
                  "coding": [
                    {
                      "code": "exam",
                      "display": "Exam",
                      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    },
                  ],
                },
              ],
              "code": {
                "coding": [
                  {
                    "code": "custom-state:pluginB",
                    "display": "Custom state: pluginB",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Custom state: pluginB",
              },
              "resourceType": "Observation",
              "status": "final",
              "subject": {
                "reference": "urn:uuid:odontogram-subject",
              },
              "valueQuantity": {
                "value": 3,
              },
            },
          },
          {
            "resource": {
              "bodySite": {
                "coding": [
                  {
                    "code": "11",
                    "system": "urn:iso:std:iso:3950",
                  },
                ],
                "text": "Tooth 11",
              },
              "category": [
                {
                  "coding": [
                    {
                      "code": "exam",
                      "display": "Exam",
                      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    },
                  ],
                },
              ],
              "code": {
                "coding": [
                  {
                    "code": "custom-state:pluginC",
                    "display": "Custom state: pluginC",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Custom state: pluginC",
              },
              "resourceType": "Observation",
              "status": "final",
              "subject": {
                "reference": "urn:uuid:odontogram-subject",
              },
              "valueBoolean": true,
            },
          },
        ],
        "resourceType": "Bundle",
        "type": "collection",
      }
    `);
    expect(buildFhirBundleFromRegistry(subjP as any, opts)).toMatchInlineSnapshot(`
      {
        "entry": [
          {
            "resource": {
              "bodySite": {
                "coding": [
                  {
                    "code": "11",
                    "system": "urn:iso:std:iso:3950",
                  },
                ],
                "text": "Tooth 11",
              },
              "category": [
                {
                  "coding": [
                    {
                      "code": "exam",
                      "display": "Exam",
                      "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    },
                  ],
                },
              ],
              "code": {
                "coding": [
                  {
                    "code": "crown-material",
                    "display": "Crown material",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Crown material",
              },
              "resourceType": "Observation",
              "status": "final",
              "subject": {
                "reference": "Patient/xyz",
              },
              "valueCodeableConcept": {
                "coding": [
                  {
                    "code": "metal",
                    "display": "Metal-ceramic crown",
                    "system": "https://github.com/ZoliQua/React-Odontogram-Modul/fhir/CodeSystem/odontogram",
                  },
                ],
                "text": "Metal-ceramic crown",
              },
            },
          },
        ],
        "resourceType": "Bundle",
        "type": "collection",
      }
    `);
  });
});
