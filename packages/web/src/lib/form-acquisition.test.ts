import { APP_URL } from "@formbro/shared/brand";
import { describe, expect, test } from "bun:test";
import { buildFormAcquisitionUrl, parseFormAcquisitionContext } from "./form-acquisition";

describe("public form acquisition", () => {
  test("builds an encoded, attributable landing URL", () => {
    const url = new URL(
      buildFormAcquisitionUrl({
        formName: "Client & Vendor Intake",
        formSlug: "client/intake",
        medium: "success",
        workspaceSlug: "acme ops",
      }),
    );

    expect(url.origin).toBe(new URL(APP_URL).origin);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      ref_form: "client/intake",
      ref_name: "Client & Vendor Intake",
      utm_campaign: "client/intake",
      utm_content: "acme ops",
      utm_medium: "success",
      utm_source: "form",
      utm_term: "create_form",
    });
  });

  test("parses form referrals into safe landing context", () => {
    expect(
      parseFormAcquisitionContext({
        formName: "  Client Intake  ",
        formSlug: "client-intake",
        source: "form",
      }),
    ).toEqual({
      formName: "Client Intake",
      formSlug: "client-intake",
    });
  });

  test("preserves footer attribution for branding referrals", () => {
    const url = new URL(
      buildFormAcquisitionUrl({
        formSlug: "client-intake",
        medium: "branding",
      }),
    );

    expect(url.searchParams.get("utm_medium")).toBe("branding");
    expect(url.searchParams.get("utm_term")).toBe("footer");
  });

  test("rejects unrelated, incomplete, and oversized referral context", () => {
    expect(
      parseFormAcquisitionContext({
        formName: "Client Intake",
        formSlug: "client-intake",
        source: "newsletter",
      }),
    ).toBeNull();
    expect(
      parseFormAcquisitionContext({
        formName: "Client Intake",
        source: "form",
      }),
    ).toBeNull();
    expect(
      parseFormAcquisitionContext({
        formName: "x".repeat(81),
        formSlug: "client-intake",
        source: "form",
      }),
    ).toEqual({
      formName: undefined,
      formSlug: "client-intake",
    });
  });
});
