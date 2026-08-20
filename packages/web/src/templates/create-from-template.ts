import type { Id } from "@formbro/convex/_generated/dataModel";
import type { FormInput } from "@formbro/core/schema/form";

export function formCreateFromTemplateArgs({
  workspaceId,
  name,
  templateId,
  templateVersion,
  schema,
}: {
  workspaceId: Id<"workspaces">;
  name: string;
  templateId: string;
  templateVersion: number;
  schema: FormInput;
}) {
  return {
    workspaceId,
    name,
    source: {
      kind: "template" as const,
      templateId,
      templateVersion,
      schema,
    },
  };
}
