import { APP_URL } from "@formbro/shared/brand";

type ClipboardWriter = {
  writeText(value: string): Promise<void>;
};

export function getPublicFormShareUrl(formSlug: string) {
  return `${APP_URL}/f/${encodeURIComponent(formSlug)}`;
}

export async function copyPublicFormShareUrl(
  shareUrl: string,
  clipboard: ClipboardWriter | undefined = navigator.clipboard,
) {
  if (!clipboard) {
    throw new Error("Clipboard access is unavailable.");
  }
  await clipboard.writeText(shareUrl);
}
