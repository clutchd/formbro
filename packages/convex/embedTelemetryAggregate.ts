import type { EmbedTelemetryPayload } from "@formbro/core/embed";

export type EmbedTelemetryCounters = {
  duration10To29Seconds: number;
  duration120PlusSeconds: number;
  duration30To119Seconds: number;
  durationUnder10Seconds: number;
  errors: number;
  sampledViews: number;
  started: number;
  submitted: number;
};

export function emptyEmbedTelemetryCounters(): EmbedTelemetryCounters {
  return {
    duration10To29Seconds: 0,
    duration120PlusSeconds: 0,
    duration30To119Seconds: 0,
    durationUnder10Seconds: 0,
    errors: 0,
    sampledViews: 0,
    started: 0,
    submitted: 0,
  };
}

export function applyEmbedTelemetrySample(
  counters: EmbedTelemetryCounters,
  sample: Pick<EmbedTelemetryPayload, "duration" | "hadError" | "started" | "submitted">,
) {
  return {
    ...counters,
    duration10To29Seconds:
      counters.duration10To29Seconds + (sample.duration === "10_to_29_seconds" ? 1 : 0),
    duration120PlusSeconds:
      counters.duration120PlusSeconds + (sample.duration === "120_plus_seconds" ? 1 : 0),
    duration30To119Seconds:
      counters.duration30To119Seconds + (sample.duration === "30_to_119_seconds" ? 1 : 0),
    durationUnder10Seconds:
      counters.durationUnder10Seconds + (sample.duration === "under_10_seconds" ? 1 : 0),
    errors: counters.errors + (sample.hadError ? 1 : 0),
    sampledViews: counters.sampledViews + 1,
    started: counters.started + (sample.started ? 1 : 0),
    submitted: counters.submitted + (sample.submitted ? 1 : 0),
  };
}
