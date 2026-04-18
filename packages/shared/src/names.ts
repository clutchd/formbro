export function split(name?: string) {
  const names = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  return {
    firstName: names[0],
    lastName: names.length > 1 ? names.slice(1).join(" ") : undefined,
  };
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}
