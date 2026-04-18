"use client";

import type { IFieldProps } from "@formbro/core/schema/form";
import { Input } from "@formbro/ui/input";
import { RiLinkM } from "@remixicon/react";
import * as React from "react";
import { useFieldContext } from "../hooks/tanstack-context";

const LinkIcon = RiLinkM;
const LinkColor = "bg-cyan-100 text-cyan-600";

function Link({ schema, ariaInvalid }: IFieldProps) {
  const field = useFieldContext<string>();

  return (
    <Input
      id={schema.id}
      name={schema.id}
      type="url"
      placeholder={schema?.placeholder ?? "https://"}
      autoComplete="url"
      value={field.state.value ?? ""}
      onChange={(e) => field.handleChange(e.target.value)}
      onBlur={field.handleBlur}
      aria-invalid={ariaInvalid}
    />
  );
}

export { LinkColor as color, Link as component, LinkIcon as icon };
