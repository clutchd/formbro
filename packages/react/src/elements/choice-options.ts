export const DEFAULT_CHOICE_OPTIONS = ["Option 1", "Option 2", "Option 3"] as const;

export function getChoiceOptions(options: readonly string[] | undefined): string[] {
  const uniqueOptions = new Set<string>();

  for (const option of options ?? []) {
    const trimmed = option.trim();
    if (trimmed) uniqueOptions.add(trimmed);
  }

  return uniqueOptions.size > 0 ? [...uniqueOptions] : [...DEFAULT_CHOICE_OPTIONS];
}
