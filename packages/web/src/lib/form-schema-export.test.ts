import { FORMBRO_SCHEMA_VERSION } from "@formbro/core/schema/version";
import { describe, expect, it } from "bun:test";
import { getFormSchemaExportFilename, serializeFormSchemaExport } from "./form-schema-export";

describe("form schema export", () => {
  it("serializes readable, versioned FormBro JSON", () => {
    const json = serializeFormSchemaExport({
      id: "service_report",
      version: FORMBRO_SCHEMA_VERSION,
      name: "Service report",
      elements: [],
    });

    expect(json.endsWith("\n")).toBe(true);
    expect(JSON.parse(json)).toEqual({
      id: "service_report",
      version: FORMBRO_SCHEMA_VERSION,
      name: "Service report",
      elements: [],
    });
  });

  it("builds a safe, recognizable filename", () => {
    expect(getFormSchemaExportFilename("Service report / 2026")).toBe(
      "Service-report-2026.formbro.json",
    );
  });
});
