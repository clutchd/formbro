export function formbroApiUrl() {
  return process.env.FORMBRO_API_URL ?? "http://localhost:3000";
}

export function formbroTelemetryUrl() {
  return process.env.FORMBRO_TELEMETRY_URL?.trim() || undefined;
}
