import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmWorkspaceFormRoute } from "app/(app)/dashboard/[workspace]/[form]/_prewarm";
import { prewarmWorkspaceRoute } from "app/(app)/dashboard/[workspace]/_prewarm";
import { describe, it } from "bun:test";
import { getFunctionName } from "convex/server";
import assert from "node:assert/strict";
import { prewarmRoute } from "./route-prewarm";

describe("convex:route-prewarm", () => {
  it("dedupes prewarm queries within the dedupe window", () => {
    const calls: Array<{ name: string; args: unknown }> = [];
    const convex = {
      prewarmQuery: ({ query, args }: { query: typeof api.workspace.list; args: {} }) => {
        calls.push({ name: getFunctionName(query), args });
      },
    } as unknown as ConvexReactClient;

    const queries = [{ query: api.workspace.list, args: {} }];

    prewarmRoute(convex, queries);
    prewarmRoute(convex, queries);

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.name, "workspace:list");
  });

  it("skips dependent query when context has no workspace", async () => {
    const calls: Array<{ name: string; args: unknown }> = [];

    const convex = {
      prewarmQuery: ({ query, args }: { query: typeof api.workspace.context; args: unknown }) => {
        calls.push({ name: getFunctionName(query), args });
      },
      query: async () => null,
    } as unknown as ConvexReactClient;

    await prewarmWorkspaceRoute(convex, "missing-workspace");

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.name, "workspace:context");
  });

  it("prewarms form context with workspace and form slugs", async () => {
    const calls: Array<{ name: string; args: unknown }> = [];

    const convex = {
      prewarmQuery: ({ query, args }: { query: typeof api.workspace.context; args: unknown }) => {
        calls.push({ name: getFunctionName(query), args });
      },
      query: async () => ({
        ok: true,
        data: {
          workspace: { _id: "workspace-id" },
          form: { _id: "form-id" },
        },
      }),
    } as unknown as ConvexReactClient;

    await prewarmWorkspaceFormRoute(convex, "workspace-slug", "form-slug");

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.name, "workspace:context");
    assert.deepEqual(calls[0]?.args, { workspaceSlug: "workspace-slug", formSlug: "form-slug" });
  });

  it("skips form dependent prewarm when context has no form", async () => {
    const calls: Array<{ name: string; args: unknown }> = [];

    const convex = {
      prewarmQuery: ({ query, args }: { query: typeof api.workspace.context; args: unknown }) => {
        calls.push({ name: getFunctionName(query), args });
      },
      query: async () => null,
    } as unknown as ConvexReactClient;

    await prewarmWorkspaceFormRoute(convex, "missing-form-workspace", "missing-form");

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.name, "workspace:context");
  });
});
