export function hasString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}
