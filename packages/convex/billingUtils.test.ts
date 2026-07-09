import { describe, expect, it } from "bun:test";
import { getWorkspaceLimits, WORKSPACE_LIMITS } from "./billingUtils";

describe("free workspace limits", () => {
  it("allows one private draft without enabling published-form usage", () => {
    expect(WORKSPACE_LIMITS.free).toEqual({
      members: 1,
      forms: 1,
      monthlySubmissions: 0,
      storageBytes: 0,
    });
  });

  it("uses free limits for an inactive paid plan", () => {
    expect(getWorkspaceLimits({ hasActiveSubscription: false, plan: "pro" })).toEqual(
      WORKSPACE_LIMITS.free,
    );
    expect(getWorkspaceLimits({ hasActiveSubscription: true, plan: "pro" })).toEqual(
      WORKSPACE_LIMITS.pro,
    );
  });
});
