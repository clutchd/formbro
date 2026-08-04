import { describe, expect, test } from "bun:test";
import { applyEmbedTelemetrySample } from "./embedTelemetryAggregate";

describe("embed telemetry aggregation", () => {
  test("increments only coarse session counters", () => {
    expect(
      applyEmbedTelemetrySample(
        {
          duration10To29Seconds: 1,
          duration120PlusSeconds: 0,
          duration30To119Seconds: 2,
          durationUnder10Seconds: 1,
          errors: 1,
          sampledViews: 4,
          started: 3,
          submitted: 2,
        },
        {
          duration: "30_to_119_seconds",
          hadError: true,
          started: true,
          submitted: false,
        },
      ),
    ).toEqual({
      duration10To29Seconds: 1,
      duration120PlusSeconds: 0,
      duration30To119Seconds: 3,
      durationUnder10Seconds: 1,
      errors: 2,
      sampledViews: 5,
      started: 4,
      submitted: 2,
    });
  });
});
