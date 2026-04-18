import { Badge } from "@formbro/ui/badge";
import * as React from "react";

export function FormStatusBadge({ status }: { status: "draft" | "open" | "closed" | "archived" }) {
  let badgeStatus: "neutral" | "success" | "error" | undefined;
  switch (status) {
    case "open":
      badgeStatus = "success";
      break;
    case "closed":
      badgeStatus = "error";
      break;
    case "draft":
    case "archived":
      badgeStatus = "neutral";
      break;
  }

  return (
    <Badge variant="outline" status={badgeStatus}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
