import { APP_URL } from "@formbro/shared/brand";

const MAX_REFERRAL_FORM_NAME_LENGTH = 80;
const MAX_REFERRAL_FORM_SLUG_LENGTH = 128;

type FormAcquisitionInput = {
  formName?: string;
  formSlug: string;
  medium: "branding" | "success";
  workspaceSlug?: string;
};

export type FormAcquisitionContext = {
  formName?: string;
  formSlug: string;
};

function normalizedValue(value: string | undefined, maxLength: number) {
  const normalized = value?.trim();
  if (!normalized || normalized.length > maxLength) return undefined;
  return normalized;
}

export function buildFormAcquisitionUrl({
  formName,
  formSlug,
  medium,
  workspaceSlug,
}: FormAcquisitionInput) {
  const url = new URL("/", APP_URL);
  url.searchParams.set("ref_form", formSlug);
  if (formName) {
    url.searchParams.set("ref_name", formName);
  }
  url.searchParams.set("utm_campaign", formSlug);
  url.searchParams.set("utm_content", workspaceSlug ?? "unknown");
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_source", "form");
  url.searchParams.set("utm_term", medium === "success" ? "create_form" : "footer");
  return url.toString();
}

export function parseFormAcquisitionContext({
  formName,
  formSlug,
  source,
}: {
  formName?: string;
  formSlug?: string;
  source?: string;
}): FormAcquisitionContext | null {
  if (source !== "form") return null;

  const normalizedSlug = normalizedValue(formSlug, MAX_REFERRAL_FORM_SLUG_LENGTH);
  if (!normalizedSlug) return null;

  return {
    formName: normalizedValue(formName, MAX_REFERRAL_FORM_NAME_LENGTH),
    formSlug: normalizedSlug,
  };
}
