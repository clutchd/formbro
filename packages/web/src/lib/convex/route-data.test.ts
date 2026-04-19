import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmWorkspace } from "app/(app)/dashboard/[workspace]/data-provider";
import { describe, it } from "bun:test";
import { getFunctionName } from "convex/server";
import assert from "node:assert/strict";
import { makeRouteQuerySpec, prewarmSpecs, _resetPrewarmDedupeForTests } from "./route-data";
import { createRoutePrewarmIntent } from "./use-route-prewarm-intent";

describe("convex:route-data", () => {
  it("dedupes prewarm specs within the dedupe window", () => {
    _resetPrewarmDedupeForTests();

    const calls: Array<{ name: string; args: unknown }> = [];
    const convex = {
      prewarmQuery: ({ query, args }: { query: typeof api.workspace.list; args: {} }) => {
        calls.push({ name: getFunctionName(query), args });
      },
    } as unknown as ConvexReactClient;

    const specs = [makeRouteQuerySpec(api.workspace.list, {})];

    prewarmSpecs(convex, specs);
    prewarmSpecs(convex, specs);

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.name, "workspace:list");
  });

  it("debounces repeated intent events", async () => {
    let calls = 0;
    const intent = createRoutePrewarmIntent(
      () => {
        calls += 1;
      },
      { debounceMs: 20 },
    );

    intent.handlers.onMouseEnter();
    intent.handlers.onFocus();
    intent.handlers.onTouchStart();

    await new Promise((resolve) => setTimeout(resolve, 35));

    assert.equal(calls, 1);

    intent.handlers.onMouseEnter();
    intent.handlers.onMouseLeave();
    await new Promise((resolve) => setTimeout(resolve, 35));

    assert.equal(calls, 1);
  });

  it("skips dependent query when context has no workspace", async () => {
    _resetPrewarmDedupeForTests();

    const calls: Array<{ name: string; args: unknown }> = [];

    const convex = {
      prewarmQuery: ({ query, args }: { query: typeof api.workspace.context; args: unknown }) => {
        calls.push({ name: getFunctionName(query), args });
      },
      query: async () => null,
    } as unknown as ConvexReactClient;

    await prewarmWorkspace(convex, { workspaceSlug: "missing-workspace" });

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.name, "workspace:context");
  });
});
