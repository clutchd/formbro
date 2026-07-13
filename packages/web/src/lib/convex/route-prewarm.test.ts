import type { ConvexReactClient } from "convex/react";
import { api } from "@formbro/convex/_generated/api";
import { prewarmWorkspaceFormRoute } from "app/(shell)/(app)/dashboard/[workspace]/[form]/_prewarm";
import { prewarmFormSubmissionsRoute } from "app/(shell)/(app)/dashboard/[workspace]/[form]/submissions/_prewarm";
import { prewarmWorkspaceRoute } from "app/(shell)/(app)/dashboard/[workspace]/_prewarm";
import { prewarmWorkspaceSettingsRoute } from "app/(shell)/(app)/dashboard/[workspace]/settings/_prewarm";
import { describe, it } from "bun:test";
import { getFunctionName } from "convex/server";
import assert from "node:assert/strict";
import { prewarmRoute, routeQuery } from "./route-prewarm";

describe("convex:route-prewarm", () => {
  it("dedupes prewarm queries within the dedupe window", () => {
    const calls: Array<{ name: string; args: unknown }> = [];
    const convex = {
      prewarmQuery: ({ query, args }: { query: typeof api.workspace.list; args: {} }) => {
        calls.push({ name: getFunctionName(query), args });
      },
    } as unknown as ConvexReactClient;

    const queries = [routeQuery(api.workspace.list, {})];

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

  it("prewarms overview forms and metrics from workspace context", async () => {
    const calls: Array<{ name: string; args: unknown }> = [];
    const convex = {
      prewarmQuery: ({ query, args }: { query: typeof api.workspace.context; args: unknown }) => {
        calls.push({ name: getFunctionName(query), args });
      },
      query: async () => ({
        ok: true,
        data: {
          workspace: { _id: "overview-workspace-id" },
        },
      }),
    } as unknown as ConvexReactClient;

    await prewarmWorkspaceRoute(convex, "overview-workspace");

    assert.deepEqual(calls, [
      { name: "workspace:context", args: { workspaceSlug: "overview-workspace" } },
      { name: "forms:list", args: { workspaceId: "overview-workspace-id" } },
      { name: "workspace:metrics", args: { workspaceId: "overview-workspace-id" } },
    ]);
  });

  it("prewarms form route data from workspace context", async () => {
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

    assert.equal(calls.length, 2);
    assert.equal(calls[0]?.name, "workspace:context");
    assert.deepEqual(calls[0]?.args, { workspaceSlug: "workspace-slug", formSlug: "form-slug" });
    assert.equal(calls[1]?.name, "forms:list");
    assert.deepEqual(calls[1]?.args, { workspaceId: "workspace-id" });
  });

  it("prewarms settings route data from workspace context", async () => {
    const calls: Array<{ name: string; args: unknown }> = [];

    const convex = {
      prewarmQuery: ({ query, args }: { query: typeof api.workspace.context; args: unknown }) => {
        calls.push({ name: getFunctionName(query), args });
      },
      query: async () => ({
        ok: true,
        data: {
          workspace: { _id: "settings-workspace-id" },
        },
      }),
    } as unknown as ConvexReactClient;

    await prewarmWorkspaceSettingsRoute(convex, "workspace-slug");

    assert.deepEqual(calls, [
      { name: "workspace:context", args: { workspaceSlug: "workspace-slug" } },
      { name: "forms:list", args: { workspaceId: "settings-workspace-id" } },
      { name: "workspace:listMembers", args: { workspaceId: "settings-workspace-id" } },
      { name: "workspace:listInvites", args: { workspaceId: "settings-workspace-id" } },
      { name: "workspace:billing", args: { workspaceId: "settings-workspace-id" } },
    ]);
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

  it("prewarms submissions from form context", async () => {
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

    await prewarmFormSubmissionsRoute(convex, "submissions-workspace", "submissions-form");

    assert.deepEqual(calls, [
      {
        name: "workspace:context",
        args: { workspaceSlug: "submissions-workspace", formSlug: "submissions-form" },
      },
      { name: "submissions:list", args: { formId: "form-id" } },
    ]);
  });
});
