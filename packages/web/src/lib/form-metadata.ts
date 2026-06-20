import { APP_NAME, APP_URL } from "@formbro/shared/brand";

export function getFormMetadata(
  formName: string,
  formSlug: string,
  workspaceName: string,
  baseUrl: string = APP_URL,
) {
  const url = `${baseUrl}/f/${formSlug}`;
  const description = "Made with Formbro.  Keep your forms simple, bro.";
  const title = `${formName} - ${workspaceName}`;

  return {
    title,
    description,
    openGraph: {
      siteName: APP_NAME,
      title,
      description,
      url,
      image: null,
    },
  };
}
