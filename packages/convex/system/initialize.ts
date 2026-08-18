import { JsonSerialize } from "@formbro/core/schema/form";
import { APP_NAME } from "@formbro/shared/brand";
import { ok } from "@formbro/shared/result";
import type { Id } from "../_generated/dataModel";
import { internalMutation, type MutationCtx } from "../_generated/server";
import { getAdminAccounts } from "../auth";
import { defineErrors, FormBroError } from "../errors";
import { _createForm, _publishForm } from "../forms";
import {
  _addWorkspaceMember,
  _createWorkspace,
  generateSlug,
  type WorkspaceMember,
} from "../workspace";
import { CREATE_FORM } from "./forms/create_form";
import { CREATE_WORKSPACE } from "./forms/create_workspace";

const ERRORS = defineErrors({
  SYSTEM_OWNER_NOT_FOUND: {
    message: "System owner not found.",
    status: "INTERNAL_SERVER_ERROR",
  },
  SYSTEM_WORKSPACE_INIT_FAILED: {
    message: "Failed to initialize system workspace.",
    status: "INTERNAL_SERVER_ERROR",
  },
});

const SYSTEM_WORKSPACE_NAME = APP_NAME;
const SYSTEM_WORKSPACE_SLUG = generateSlug(SYSTEM_WORKSPACE_NAME);
const SYSTEM_FORMS = [CREATE_WORKSPACE, CREATE_FORM] as const;

export const init = internalMutation({
  args: {},
  handler: async (ctx) => {
    const admins = await getAdminAccounts(ctx);
    const owner = admins.data[0];

    if (!owner) {
      throw new FormBroError(ERRORS.SYSTEM_OWNER_NOT_FOUND);
    } else {
      console.log("System owner initialized");
    }

    const workspace = await initWorkspace(ctx, owner, admins.data);

    if (!workspace) {
      throw new FormBroError(ERRORS.SYSTEM_WORKSPACE_INIT_FAILED);
    } else {
      console.log("System workspace initialized");
    }

    for (const form of SYSTEM_FORMS) {
      const result = await syncSystemForm({
        ctx,
        workspaceId: workspace.workspaceId,
        definition: form,
      });
      if (result.changed) {
        console.log(`System form "${form.slug}" synchronized`);
      } else {
        console.log(`System form "${form.slug}" is up to date`);
      }
    }

    return ok();
  },
});

const initWorkspace = async (
  ctx: MutationCtx,
  owner: WorkspaceMember,
  admins: WorkspaceMember[],
) => {
  const existing = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", SYSTEM_WORKSPACE_SLUG))
    .unique();

  const workspaceId =
    existing?._id ??
    (
      await _createWorkspace({
        ctx,
        name: SYSTEM_WORKSPACE_NAME,
        owner,
        plan: "unlimited",
      })
    ).workspaceId;

  if (existing) {
  }

  const existingMembers = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .collect();
  const ownerAuthId = existing?.ownerAuthId ?? owner.authId;
  const memberAuthIds = new Set(existingMembers.map((member) => member.userAuthId));

  for (const admin of admins) {
    if (memberAuthIds.has(admin.authId)) continue;

    await _addWorkspaceMember({
      ctx,
      workspaceId,
      member: admin,
      role: ownerAuthId === admin.authId ? "owner" : "admin",
    });
  }

  return {
    workspaceId,
    slug: SYSTEM_WORKSPACE_SLUG,
  };
};

export async function syncSystemForm({
  ctx,
  workspaceId,
  definition,
}: {
  ctx: MutationCtx;
  workspaceId: Id<"workspaces">;
  definition: (typeof SYSTEM_FORMS)[number];
}) {
  const existing = await ctx.db
    .query("forms")
    .withIndex("by_slug", (query) => query.eq("slug", definition.slug))
    .unique();

  if (existing && existing.workspaceId !== workspaceId) {
    throw new Error(
      `Cannot initialize system form "${definition.slug}": slug is already used by another workspace.`,
    );
  }

  if (!existing) {
    return initSystemForm(ctx, workspaceId, definition);
  }

  const codeSchema = JsonSerialize(definition.typed);
  const publishedSchema = existing.publishedSchemaId
    ? await ctx.db.get(existing.publishedSchemaId)
    : null;

  if (publishedSchema && publishedSchema.schema === codeSchema) {
    if (existing.name !== definition.typed.name || existing.status !== "closed") {
      await ctx.db.patch(existing._id, {
        name: definition.typed.name,
        status: "closed",
      });
    }

    return {
      formId: existing._id,
      draftSchemaId: existing.draftSchemaId ?? null,
      publishedSchemaId: publishedSchema._id,
      changed: false,
    };
  }

  const published = await _publishForm({
    ctx,
    form: existing,
    schema: definition.typed,
    serialized: JsonSerialize(definition.typed),
    status: "closed",
  });

  return {
    formId: existing._id,
    draftSchemaId: existing.draftSchemaId ?? null,
    publishedSchemaId: published.publishedSchemaId,
    changed: true,
  };
}

async function initSystemForm(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  definition: (typeof SYSTEM_FORMS)[number],
) {
  const created = await _createForm({
    ctx,
    workspaceId,
    slug: definition.slug,
    schema: definition.typed,
    status: "closed",
  });

  const form = await ctx.db.get(created.formId);

  if (!form) {
    throw new Error(`Could not load system form "${definition.slug}" after creating it.`);
  }

  const published = await _publishForm({
    ctx,
    form,
    schema: definition.typed,
    serialized: JsonSerialize(definition.typed),
    status: "closed",
  });

  return {
    formId: form._id,
    draftSchemaId: created.draftSchemaId,
    publishedSchemaId: published.publishedSchemaId,
    changed: true,
  };
}
