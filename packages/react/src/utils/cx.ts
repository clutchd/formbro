type ClassValue = false | null | string | undefined;

export function cx(...values: ClassValue[]) {
  return values.filter(Boolean).join(" ");
}
