import { APP_URL } from "@formbro/shared/brand";
import { describe, expect, test } from "bun:test";
import {
  buildCheckoutReturnUrls,
  buildFormEditorHref,
  buildPublishCheckoutSettingsHref,
  consumePublishCheckoutIntent,
  getPublishCheckoutContext,
  savePublishCheckoutIntent,
} from "./publish-checkout";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

const context = {
  formId: "form-id",
  formSlug: "customer intake",
  workspaceId: "workspace-id",
  workspaceSlug: "acme ops",
};

describe("publish checkout", () => {
  test("carries publish context from the editor into billing settings", () => {
    const href = buildPublishCheckoutSettingsHref(context);
    const url = new URL(href, "https://formbro.com");

    expect(url.pathname).toBe("/dashboard/acme%20ops/settings");
    expect(getPublishCheckoutContext(url.searchParams)).toEqual(context);
  });

  test("returns publish checkout to the exact editor", () => {
    expect(buildFormEditorHref(context)).toBe("/dashboard/acme%20ops/customer%20intake");
    expect(buildCheckoutReturnUrls(context)).toEqual({
      cancelUrl: `${APP_URL}/dashboard/acme%20ops/customer%20intake?checkout=cancelled&intent=publish`,
      successUrl: `${APP_URL}/dashboard/acme%20ops/customer%20intake?checkout=success&intent=publish`,
    });
  });

  test("uses billing settings when no publish context is present", () => {
    expect(buildCheckoutReturnUrls({ workspaceSlug: "acme ops" })).toEqual({
      cancelUrl: `${APP_URL}/dashboard/acme%20ops/settings?checkout=cancelled`,
      successUrl: `${APP_URL}/dashboard/acme%20ops/settings?checkout=success`,
    });
  });

  test("consumes matching publish intent once", () => {
    const storage = memoryStorage();
    savePublishCheckoutIntent(storage, context, 1_000);

    expect(consumePublishCheckoutIntent(storage, context, 1_500)).toEqual(context);
    expect(consumePublishCheckoutIntent(storage, context, 1_500)).toBeNull();
  });

  test("rejects stale and mismatched publish intent", () => {
    const storage = memoryStorage();
    savePublishCheckoutIntent(storage, context, 1_000);

    expect(
      consumePublishCheckoutIntent(storage, { ...context, formId: "other-form" }, 1_500),
    ).toBeNull();

    savePublishCheckoutIntent(storage, context, 1_000);
    expect(consumePublishCheckoutIntent(storage, context, 3_601_001)).toBeNull();
  });

  test("ignores incomplete or unrelated settings query parameters", () => {
    expect(
      getPublishCheckoutContext(new URLSearchParams("intent=publish&formId=form-id")),
    ).toBeNull();
    expect(
      getPublishCheckoutContext(
        new URLSearchParams(
          "intent=other&formId=form-id&formSlug=form&workspaceId=workspace-id&workspaceSlug=workspace",
        ),
      ),
    ).toBeNull();
  });
});
