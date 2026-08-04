import { EMBED_TELEMETRY_SAMPLE_RATE, type EmbedTelemetryPayload } from "@formbro/core/embed";

export { EMBED_TELEMETRY_SAMPLE_RATE };

export function shouldSampleEmbedTelemetry(random: () => number = Math.random) {
  return random() < EMBED_TELEMETRY_SAMPLE_RATE;
}

function durationBucket(elapsedMs: number): EmbedTelemetryPayload["duration"] {
  if (elapsedMs < 10_000) return "under_10_seconds";
  if (elapsedMs < 30_000) return "10_to_29_seconds";
  if (elapsedMs < 120_000) return "30_to_119_seconds";
  return "120_plus_seconds";
}

export function createEmbedTelemetryPayload({
  elapsedMs,
  hadError,
  publicId,
  revision,
  started,
  submitted,
}: {
  elapsedMs: number;
  hadError: boolean;
  publicId: string;
  revision: string;
  started: boolean;
  submitted: boolean;
}): EmbedTelemetryPayload {
  return {
    duration: durationBucket(elapsedMs),
    hadError,
    protocolVersion: 1,
    publicId,
    revision,
    started,
    submitted,
  };
}
