import type { FormLabel } from "@formbro/core/schema/label";
import { twx } from "@formbro/shared/twx";
import { FieldLegend } from "@formbro/ui/field";
import { RiHeading } from "@remixicon/react";
import * as React from "react";

const HeadingIcon = RiHeading;
const HeadingColor = "bg-purple-100 text-purple-600";

function Heading({ level = 2, label }: { level?: 1 | 2 | 3; label?: FormLabel }) {
  if (!label) return null;

  let fontSize: string;
  switch (level) {
    case 1:
      fontSize = "!text-2xl";
      break;
    case 2:
      fontSize = "!text-xl";
      break;
    case 3:
      fontSize = "!text-lg";
      break;
  }

  return (
    <FieldLegend className={twx("font-display font-bold tracking-tight text-foreground", fontSize)}>
      {label}
    </FieldLegend>
  );
}

export { HeadingColor as color, Heading as component, HeadingIcon as icon };
