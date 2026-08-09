import { describe, expect, it } from "bun:test";
import { getFunctionName } from "convex/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

describe("enqueuePostSubmissionWorkflows", () => {
  it("queues the generic submission-created workflow handoff", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

    const { enqueuePostSubmissionWorkflows } = await import("./workflows");
    const scheduled = new Array<{
      args: { submissionId: Id<"submissions"> };
      delayMs: number;
      functionName: string;
    }>();
    const submissionId = "submission_id" as Id<"submissions">;
    const ctx = {
      scheduler: {
        runAfter: async (
          delayMs: number,
          functionReference: Parameters<MutationCtx["scheduler"]["runAfter"]>[1],
          args: { submissionId: Id<"submissions"> },
        ) => {
          scheduled.push({
            args,
            delayMs,
            functionName: getFunctionName(functionReference),
          });
          return "scheduled_workflow";
        },
      },
    } as unknown as MutationCtx;

    await enqueuePostSubmissionWorkflows(ctx, submissionId);

    expect(scheduled).toEqual([
      {
        args: { submissionId },
        delayMs: 0,
        functionName: "workflows:handleSubmissionCreated",
      },
    ]);
  });
});
