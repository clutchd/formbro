"use client";

import type { FormProps } from "@formbro/react/components/form";
import { getErrorMessage, shouldReportError } from "@formbro/convex/errors";
import { Form } from "@formbro/react/components/form";
import { Button } from "@formbro/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@formbro/ui/dialog";
import { type RemixiconComponentType } from "@remixicon/react";
import { captureException } from "@sentry/nextjs";
import * as React from "react";
import { toast } from "sonner";

export function InternalDialogForm<
  T extends FormProps["schema"] = FormProps["schema"],
  TData = unknown,
>({
  title,
  description,
  schema,
  action,
  onMutate,
  onSuccess,
  onError,
  Icon,
  children = (
    <Button>
      {Icon && <Icon className="size-4" />}
      {title}
    </Button>
  ),
  open,
  onOpenChange,
  disabled,
}: Pick<FormProps<T, TData>, "schema" | "action" | "onMutate" | "onSuccess" | "onError"> & {
  title: string;
  description: React.ReactNode;
  Icon?: RemixiconComponentType;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const handleOpenChange = onOpenChange ?? setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form
          schema={schema}
          action={action}
          onMutate={onMutate}
          instrumentation={{
            onSubmitStart: ({ form }) => {
              if (form.toasts?.loading) {
                toast.loading(form.toasts.loading, {
                  description: undefined,
                  id: form.id,
                });
              }
            },
            onSubmitSuccess: ({ form }) => {
              if (form.toasts?.success) {
                toast.success(form.toasts.success, {
                  description: undefined,
                  id: form.id,
                });
              }
            },
            onSubmitError: ({ form, error }) => {
              if (shouldReportError(error)) {
                captureException(error, {
                  extra: {
                    formId: form.id,
                    formName: form.name,
                    version: form.version,
                  },
                  tags: {
                    type: "form_submission",
                  },
                });
              }

              if (form.toasts?.error) {
                const message = getErrorMessage(error);
                toast.error(form.toasts.error, {
                  description: message,
                  id: form.id,
                });
              }
            },
          }}
          onSuccess={(context) => {
            onSuccess?.(context);
            handleOpenChange(false);
          }}
          onError={onError}
        />
      </DialogContent>
    </Dialog>
  );
}
