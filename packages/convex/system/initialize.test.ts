import { JsonSerialize } from "@formbro/core/schema/form";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../schema";
import { _createFromSlug } from "../submissions";
import { modules } from "../test.setup";
import { SYSTEM_FORMS, type SystemFormSlug, syncSystemForm } from "./initialize";

const SUBMISSION_DATA = {
  "create-form": { name: "Customer feedback" },
  "create-workspace": { name: "Acme" },
  "invite-member": { email: "teammate@example.com" },
} satisfies Record<SystemFormSlug, Record<string, string>>;

describe("system forms", () => {
  it("reconciles and records a submission for every registered form", async () => {
    const t = convexTest(schema, modules);
    const workspaceId = await t.mutation(async (ctx) => {
      return await ctx.db.insert("workspaces", {
        name: "System",
        slug: "system",
        ownerAuthId: "system-owner",
        plan: "unlimited",
      });
    });

    const initialized = await t.mutation(async (ctx) => {
      return await Promise.all(
        Object.values(SYSTEM_FORMS).map((definition) =>
          syncSystemForm({ ctx, workspaceId, definition }),
        ),
      );
    });

    expect(initialized).toHaveLength(Object.keys(SYSTEM_FORMS).length);
    expect(initialized.every((result) => result.changed)).toBe(true);

    await t.mutation(async (ctx) => {
      for (const result of initialized) {
        await ctx.db.patch(result.formId, { name: "Stale name", status: "open" });
        await ctx.db.patch(result.publishedSchemaId, { schema: "{}" });
      }
    });

    const reconciled = await t.mutation(async (ctx) => {
      return await Promise.all(
        Object.values(SYSTEM_FORMS).map((definition) =>
          syncSystemForm({ ctx, workspaceId, definition }),
        ),
      );
    });

    expect(reconciled.every((result) => result.changed)).toBe(true);
    expect(reconciled.map((result) => result.publishedSchemaId)).not.toEqual(
      initialized.map((result) => result.publishedSchemaId),
    );

    const unchanged = await t.mutation(async (ctx) => {
      return await Promise.all(
        Object.values(SYSTEM_FORMS).map((definition) =>
          syncSystemForm({ ctx, workspaceId, definition }),
        ),
      );
    });

    expect(unchanged.every((result) => !result.changed)).toBe(true);
    expect(unchanged.map((result) => result.publishedSchemaId)).toEqual(
      reconciled.map((result) => result.publishedSchemaId),
    );

    const asUser = t.withIdentity({ subject: "user" });
    for (const definition of Object.values(SYSTEM_FORMS)) {
      await asUser.mutation(async (ctx) => {
        await _createFromSlug(ctx, {
          slug: definition.slug,
          data: SUBMISSION_DATA[definition.slug],
        });
      });
    }

    const state = await t.run(async (ctx) => {
      return {
        forms: await ctx.db.query("forms").collect(),
        schemas: await ctx.db.query("formSchemas").collect(),
        submissions: await ctx.db.query("submissions").collect(),
      };
    });

    expect(state.forms).toHaveLength(Object.keys(SYSTEM_FORMS).length);
    expect(state.schemas).toHaveLength(Object.keys(SYSTEM_FORMS).length * 3);
    expect(state.submissions).toHaveLength(Object.keys(SYSTEM_FORMS).length);

    for (const definition of Object.values(SYSTEM_FORMS)) {
      const form = state.forms.find((candidate) => candidate.slug === definition.slug);
      expect(form).toMatchObject({
        name: definition.typed.name,
        status: "closed",
        workspaceId,
      });

      const currentSchema = state.schemas.find(
        (candidate) => candidate._id === form?.publishedSchemaId,
      );
      expect(currentSchema).toMatchObject({
        formId: form?._id,
        schema: JsonSerialize(definition.typed),
        status: "published",
      });

      const submission = state.submissions.find((candidate) => candidate.formId === form?._id);
      expect(submission).toMatchObject({
        data: SUBMISSION_DATA[definition.slug],
        schemaId: currentSchema?._id,
        workspaceId,
      });
      expect(submission?.bytes).toBeGreaterThan(0);
    }
  });
});
