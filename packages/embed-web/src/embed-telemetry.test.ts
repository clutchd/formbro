import { describe, expect, test } from "bun:test";
import {
  createEmbedTelemetryPayload,
  EMBED_TELEMETRY_SAMPLE_RATE,
  shouldSampleEmbedTelemetry,
} from "./embed-telemetry";

describe("embed telemetry client", () => {
  test("uses bounded random sampling with no persistent identifier", () => {
    expect(shouldSampleEmbedTelemetry(() => 0)).toBe(true);
    expect(shouldSampleEmbedTelemetry(() => EMBED_TELEMETRY_SAMPLE_RATE)).toBe(false);
  });

  test("coarsens elapsed time and emits only lifecycle outcomes", () => {
    expect(
      createEmbedTelemetryPayload({
        elapsedMs: 42_000,
        hadError: false,
        publicId: "jobs",
        revision: "revision-a",
        started: true,
        submitted: true,
      }),
    ).toEqual({
      duration: "30_to_119_seconds",
      hadError: false,
      protocolVersion: 1,
      publicId: "jobs",
      revision: "revision-a",
      started: true,
      submitted: true,
    });
  });
});
