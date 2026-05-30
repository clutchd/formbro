"use client";

import { CREATE_FORM } from "@formbro/convex/system/forms/create_form";
import { RiAddLine } from "@remixicon/react";
import * as React from "react";
import { InternalDialogForm } from "@/components/internal-dialog-form";

export function CreateForm({ children }: { children?: React.ReactNode }) {
  // const createForm = useMutation(api.core.forms.create);
  return (
    <InternalDialogForm
      title="Create Form"
      description="Create a new form in this workspace."
      schema={CREATE_FORM.typed}
      Icon={RiAddLine}
    >
      {children}
    </InternalDialogForm>
  );
}
