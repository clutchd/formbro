import { z } from "zod";

const NonEmptyIdentifierSchema = z.string().trim().min(1);

export const OrganizationAccessGrantSchema = z
  .object({
    provider: NonEmptyIdentifierSchema,
    organizationId: NonEmptyIdentifierSchema,
    groupIds: z.array(NonEmptyIdentifierSchema).min(1).optional(),
    roles: z.array(NonEmptyIdentifierSchema).min(1).optional(),
  })
  .strict();

export const RespondentIdentityEvidenceSchema = z
  .object({
    authId: NonEmptyIdentifierSchema,
    providers: z.array(
      z
        .object({
          provider: NonEmptyIdentifierSchema,
          subject: NonEmptyIdentifierSchema,
          organizationId: NonEmptyIdentifierSchema.optional(),
          groupIds: z.array(NonEmptyIdentifierSchema).optional(),
          roles: z.array(NonEmptyIdentifierSchema).optional(),
        })
        .strict(),
    ),
  })
  .strict();

export const RespondentAccessPolicySchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("public") }).strict(),
  z.object({ mode: z.literal("authenticated") }).strict(),
  z
    .object({
      mode: z.literal("organization"),
      grants: z.array(OrganizationAccessGrantSchema).min(1),
    })
    .strict(),
]);

export type RespondentAccessPolicy = z.output<typeof RespondentAccessPolicySchema>;
export type RespondentIdentityEvidence = z.output<typeof RespondentIdentityEvidenceSchema>;

export type RespondentAccessDecision =
  | {
      allowed: true;
      reason: "public" | "authenticated" | "organization";
    }
  | {
      allowed: false;
      reason:
        | "authentication-required"
        | "organization-required"
        | "group-required"
        | "role-required"
        | "entitlement-required";
    };

/**
 * Evaluates normalized identity-provider evidence against a form's respondent policy.
 *
 * Provider adapters are responsible for verifying and normalizing claims. This module only trusts
 * immutable provider and organization identifiers; email domains are intentionally not part of the
 * interface.
 */
export function evaluateRespondentAccess(
  policy: RespondentAccessPolicy,
  identity?: RespondentIdentityEvidence | null,
): RespondentAccessDecision {
  if (policy.mode === "public") {
    return { allowed: true, reason: "public" };
  }

  if (!identity) {
    return { allowed: false, reason: "authentication-required" };
  }

  if (policy.mode === "authenticated") {
    return { allowed: true, reason: "authenticated" };
  }

  const organizationEvidence = policy.grants.flatMap((grant) =>
    identity.providers.flatMap((evidence) =>
      grant.provider === evidence.provider && grant.organizationId === evidence.organizationId
        ? [{ evidence, grant }]
        : [],
    ),
  );

  if (organizationEvidence.length === 0) {
    return { allowed: false, reason: "organization-required" };
  }

  let hasGroupMatch = false;
  let hasRoleMatch = false;

  for (const { evidence, grant } of organizationEvidence) {
    const groupMatches =
      !grant.groupIds ||
      evidence.groupIds?.some((groupId) => grant.groupIds?.includes(groupId)) === true;
    const roleMatches =
      !grant.roles || evidence.roles?.some((role) => grant.roles?.includes(role)) === true;

    hasGroupMatch ||= groupMatches;
    hasRoleMatch ||= roleMatches;

    if (groupMatches && roleMatches) {
      return { allowed: true, reason: "organization" };
    }
  }

  if (!hasGroupMatch) return { allowed: false, reason: "group-required" };
  if (!hasRoleMatch) return { allowed: false, reason: "role-required" };
  return { allowed: false, reason: "entitlement-required" };
}
