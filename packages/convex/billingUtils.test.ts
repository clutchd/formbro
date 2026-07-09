import { describe, expect, it } from "bun:test";
import { getSubmissionLimitReason, getWorkspaceLimits, WORKSPACE_LIMITS } from "./billingUtils";

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

describe("submission limits", () => {
  it("blocks submissions without an active subscription", () => {
    expect(
      getSubmissionLimitReason({
        hasActiveSubscription: false,
        incomingBytes: 100,
        limits: WORKSPACE_LIMITS.free,
        monthlySubmissionsUsed: 0,
        storageUsedBytes: 0,
      }),
    ).toBe("inactive_subscription");
  });

  it("blocks submissions at the monthly response limit", () => {
    expect(
      getSubmissionLimitReason({
        hasActiveSubscription: true,
        incomingBytes: 100,
        limits: WORKSPACE_LIMITS.basic,
        monthlySubmissionsUsed: WORKSPACE_LIMITS.basic.monthlySubmissions ?? 0,
        storageUsedBytes: 0,
      }),
    ).toBe("monthly_submission_limit");
  });

  it("blocks a submission that would exceed storage", () => {
    expect(
      getSubmissionLimitReason({
        hasActiveSubscription: true,
        incomingBytes: 2,
        limits: { monthlySubmissions: null, storageBytes: 100 },
        monthlySubmissionsUsed: 0,
        storageUsedBytes: 99,
      }),
    ).toBe("storage_limit");
  });

  it("allows submissions within finite and unlimited limits", () => {
    expect(
      getSubmissionLimitReason({
        hasActiveSubscription: true,
        incomingBytes: 1,
        limits: { monthlySubmissions: 10, storageBytes: 100 },
        monthlySubmissionsUsed: 9,
        storageUsedBytes: 99,
      }),
    ).toBeNull();
    expect(
      getSubmissionLimitReason({
        hasActiveSubscription: true,
        incomingBytes: Number.MAX_SAFE_INTEGER,
        limits: WORKSPACE_LIMITS.unlimited,
        monthlySubmissionsUsed: Number.MAX_SAFE_INTEGER,
        storageUsedBytes: Number.MAX_SAFE_INTEGER,
      }),
    ).toBeNull();
  });
});
