import { APP_URL } from "@formbro/shared/brand";

const PUBLISH_CHECKOUT_STORAGE_KEY = "formbro.publish-checkout.v1";
const PUBLISH_CHECKOUT_TTL_MS = 60 * 60 * 1_000;

type SearchParamsReader = {
  get(name: string): string | null;
};

type StorageLike = {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
};

export type PublishCheckoutContext = {
  formId: string;
  formSlug: string;
  workspaceId: string;
  workspaceSlug: string;
};

type StoredPublishCheckoutIntent = PublishCheckoutContext & {
  createdAt: number;
  version: 1;
};

function hasPublishCheckoutContext(
  value: Partial<PublishCheckoutContext>,
): value is PublishCheckoutContext {
  return Boolean(value.formId && value.formSlug && value.workspaceId && value.workspaceSlug);
}

function editorPath(context: Pick<PublishCheckoutContext, "formSlug" | "workspaceSlug">) {
  return `/dashboard/${encodeURIComponent(context.workspaceSlug)}/${encodeURIComponent(context.formSlug)}`;
}

function settingsPath(workspaceSlug: string) {
  return `/dashboard/${encodeURIComponent(workspaceSlug)}/settings`;
}

function checkoutReturnUrl(path: string, checkout: "cancelled" | "success", publish: boolean) {
  const url = new URL(path, APP_URL);
  url.searchParams.set("checkout", checkout);
  if (publish) {
    url.searchParams.set("intent", "publish");
  }
  return url.toString();
}

export function buildPublishCheckoutSettingsHref(context: PublishCheckoutContext) {
  const search = new URLSearchParams({
    formId: context.formId,
    formSlug: context.formSlug,
    intent: "publish",
    workspaceId: context.workspaceId,
    workspaceSlug: context.workspaceSlug,
  });
  return `${settingsPath(context.workspaceSlug)}?${search.toString()}`;
}

export function buildFormEditorHref(
  context: Pick<PublishCheckoutContext, "formSlug" | "workspaceSlug">,
) {
  return editorPath(context);
}

export function getPublishCheckoutContext(
  searchParams: SearchParamsReader,
): PublishCheckoutContext | null {
  if (searchParams.get("intent") !== "publish") return null;

  const context = {
    formId: searchParams.get("formId") ?? "",
    formSlug: searchParams.get("formSlug") ?? "",
    workspaceId: searchParams.get("workspaceId") ?? "",
    workspaceSlug: searchParams.get("workspaceSlug") ?? "",
  };
  return hasPublishCheckoutContext(context) ? context : null;
}

export function buildCheckoutReturnUrls(
  context: { workspaceSlug: string } & Partial<PublishCheckoutContext>,
) {
  const publish = hasPublishCheckoutContext(context);
  const path = publish ? editorPath(context) : settingsPath(context.workspaceSlug);
  return {
    cancelUrl: checkoutReturnUrl(path, "cancelled", publish),
    successUrl: checkoutReturnUrl(path, "success", publish),
  };
}

export function savePublishCheckoutIntent(
  storage: StorageLike,
  context: PublishCheckoutContext,
  now = Date.now(),
) {
  const intent: StoredPublishCheckoutIntent = {
    ...context,
    createdAt: now,
    version: 1,
  };

  try {
    storage.setItem(PUBLISH_CHECKOUT_STORAGE_KEY, JSON.stringify(intent));
    return true;
  } catch {
    return false;
  }
}

export function clearPublishCheckoutIntent(storage: StorageLike) {
  try {
    storage.removeItem(PUBLISH_CHECKOUT_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in locked-down browser contexts.
  }
}

export function consumePublishCheckoutIntent(
  storage: StorageLike,
  expected: PublishCheckoutContext,
  now = Date.now(),
) {
  let serialized: string | null;
  try {
    serialized = storage.getItem(PUBLISH_CHECKOUT_STORAGE_KEY);
    storage.removeItem(PUBLISH_CHECKOUT_STORAGE_KEY);
  } catch {
    return null;
  }

  if (!serialized) return null;

  try {
    const intent = JSON.parse(serialized) as Partial<StoredPublishCheckoutIntent>;
    const matches =
      intent.version === 1 &&
      intent.formId === expected.formId &&
      intent.formSlug === expected.formSlug &&
      intent.workspaceId === expected.workspaceId &&
      intent.workspaceSlug === expected.workspaceSlug;
    const isFresh =
      typeof intent.createdAt === "number" &&
      intent.createdAt <= now &&
      now - intent.createdAt <= PUBLISH_CHECKOUT_TTL_MS;

    return matches && isFresh ? expected : null;
  } catch {
    return null;
  }
}
