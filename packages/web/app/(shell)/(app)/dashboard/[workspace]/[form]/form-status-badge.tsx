import type { Doc } from "@formbro/convex/_generated/dataModel";
import { Badge } from "@formbro/ui/badge";

export function FormStatusBadge({ status }: { status: Doc<"forms">["status"] }) {
  switch (status) {
    case "draft":
      return (
        <Badge variant="outline" status="neutral">
          Draft
        </Badge>
      );
    case "open":
      return (
        <Badge variant="outline" status="success">
          Open
        </Badge>
      );
    case "closed":
      return (
        <Badge variant="outline" status="error">
          Closed
        </Badge>
      );
    default: {
      const exhaustiveStatus: never = status;
      return exhaustiveStatus;
    }
  }
}
