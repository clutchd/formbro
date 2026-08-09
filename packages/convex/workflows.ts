import { APP_URL } from "@formbro/shared/brand";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { internalMutation, type MutationCtx } from "./_generated/server";

function getSubmissionsUrl(workspaceSlug: string, formSlug: string) {
  return `${APP_URL}/dashboard/${encodeURIComponent(workspaceSlug)}/${encodeURIComponent(formSlug)}/submissions`;
}

/**
 * Transactionally hands a stored submission to the workflow runner. Submission
 * writes call this interface without knowing which actions are configured.
 */
export async function enqueuePostSubmissionWorkflows(
  ctx: MutationCtx,
  submissionId: Id<"submissions">,
) {
  await ctx.scheduler.runAfter(0, internal.workflows.handleSubmissionCreated, {
    submissionId,
  });
}

export const handleSubmissionCreated = internalMutation({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) return;

    const form = await ctx.db.get(submission.formId);
    if (!form?.submissionNotificationEmail) return;

    const workspace = await ctx.db.get(submission.workspaceId);
    if (!workspace) return;

    await ctx.scheduler.runAfter(0, internal.emails.transactional, {
      email: {
        template: "submissionNotification",
        to: form.submissionNotificationEmail,
        formName: form.name,
        submissionsUrl: getSubmissionsUrl(workspace.slug, form.slug),
        workspaceName: workspace.name,
      },
    });
  },
});
