import type { Metadata } from "next";
import { APP_NAME, APP_URL } from "@formbro/shared/brand";

export function getOpenGraphImageUrl(
  images: NonNullable<NonNullable<Metadata["openGraph"]>["images"]>,
) {
  const image = Array.isArray(images) ? images[0] : images;
  if (image == null) return undefined;
  if (typeof image === "string") return image;
  if (image instanceof URL) return image.href;
  return String(image.url);
}

export function getFormMetadata({
  formSlug,
  formName,
  workspaceName,
  baseUrl = APP_URL,
}: {
  formSlug: string;
  formName?: string | null;
  workspaceName?: string | null;
  baseUrl?: string;
}): Metadata {
  const url = `${baseUrl}/f/${formSlug}`;
  const title = formName ? `${formName} - ${workspaceName ?? "FormBro"}` : "Form not found";
  const description = formName
    ? "Made with Formbro.  Keep your forms simple, bro."
    : "This form doesn't exist or is no longer available.";
  const ogImage = {
    url: `${baseUrl}/og.jpg`,
    width: 1200,
    height: 630,
    alt: APP_NAME,
  };

  return {
    title,
    description,
    openGraph: {
      siteName: APP_NAME,
      title,
      description,
      url,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: false,
      follow: formName != null,
    },
  };
}
