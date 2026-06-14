import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmWorkspaceRoute } from "app/(app)/dashboard/[workspace]/data-provider";
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
});
