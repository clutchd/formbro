import { describe, expect, it } from "bun:test";
import {
  evaluateRespondentAccess,
  RespondentAccessPolicySchema,
  RespondentIdentityEvidenceSchema,
} from "./respondent-access";

describe("RespondentAccessPolicySchema", () => {
  it("requires at least one immutable organization reference", () => {
    expect(
      RespondentAccessPolicySchema.safeParse({ mode: "organization", grants: [] }).success,
    ).toBe(false);
  });

  it("rejects email domains as an authorization rule", () => {
    expect(
      RespondentAccessPolicySchema.safeParse({
        mode: "organization",
        grants: [{ provider: "microsoft", organizationId: "tenant-1" }],
        emailDomains: ["example.com"],
      }).success,
    ).toBe(false);
  });
});

describe("evaluateRespondentAccess", () => {
  const identity = RespondentIdentityEvidenceSchema.parse({
    authId: "formbro-user-1",
    providers: [
      {
        provider: "microsoft",
        subject: "entra-user-1",
        organizationId: "tenant-1",
        groupIds: ["field-technicians"],
        roles: ["submit-service-report"],
      },
    ],
  });

  it("allows anonymous respondents only for public forms", () => {
    expect(evaluateRespondentAccess({ mode: "public" })).toEqual({
      allowed: true,
      reason: "public",
    });
    expect(evaluateRespondentAccess({ mode: "authenticated" })).toEqual({
      allowed: false,
      reason: "authentication-required",
    });
  });

  it("allows any signed-in identity for authenticated forms", () => {
    expect(evaluateRespondentAccess({ mode: "authenticated" }, identity)).toEqual({
      allowed: true,
      reason: "authenticated",
    });
  });

  it("matches provider, organization, group, and role on the same evidence", () => {
    expect(
      evaluateRespondentAccess(
        {
          mode: "organization",
          grants: [
            {
              provider: "microsoft",
              organizationId: "tenant-1",
              groupIds: ["field-technicians"],
              roles: ["submit-service-report"],
            },
          ],
        },
        identity,
      ),
    ).toEqual({ allowed: true, reason: "organization" });
  });

  it("denies identities from another organization", () => {
    expect(
      evaluateRespondentAccess(
        {
          mode: "organization",
          grants: [{ provider: "microsoft", organizationId: "tenant-2" }],
        },
        identity,
      ),
    ).toEqual({ allowed: false, reason: "organization-required" });
  });

  it("reports the entitlement that prevented access", () => {
    expect(
      evaluateRespondentAccess(
        {
          mode: "organization",
          grants: [{ provider: "microsoft", organizationId: "tenant-1", groupIds: ["it"] }],
        },
        identity,
      ),
    ).toEqual({ allowed: false, reason: "group-required" });

    expect(
      evaluateRespondentAccess(
        {
          mode: "organization",
          grants: [
            {
              provider: "microsoft",
              organizationId: "tenant-1",
              roles: ["approve-service-report"],
            },
          ],
        },
        identity,
      ),
    ).toEqual({ allowed: false, reason: "role-required" });
  });

  it("does not combine entitlements from different organizations", () => {
    const splitIdentity = RespondentIdentityEvidenceSchema.parse({
      authId: "formbro-user-1",
      providers: [
        {
          provider: "microsoft",
          subject: "entra-user-1",
          organizationId: "tenant-1",
          groupIds: ["field-technicians"],
        },
        {
          provider: "microsoft",
          subject: "entra-user-2",
          organizationId: "tenant-2",
          roles: ["submit-service-report"],
        },
      ],
    });

    expect(
      evaluateRespondentAccess(
        {
          mode: "organization",
          grants: [
            {
              provider: "microsoft",
              organizationId: "tenant-1",
              groupIds: ["field-technicians"],
              roles: ["submit-service-report"],
            },
          ],
        },
        splitIdentity,
      ),
    ).toEqual({ allowed: false, reason: "role-required" });
  });

  it("does not combine partial matches from separate grants", () => {
    expect(
      evaluateRespondentAccess(
        {
          mode: "organization",
          grants: [
            {
              provider: "microsoft",
              organizationId: "tenant-1",
              groupIds: ["field-technicians"],
              roles: ["approve-service-report"],
            },
            {
              provider: "microsoft",
              organizationId: "tenant-1",
              groupIds: ["it"],
              roles: ["submit-service-report"],
            },
          ],
        },
        identity,
      ),
    ).toEqual({ allowed: false, reason: "entitlement-required" });
  });
});
