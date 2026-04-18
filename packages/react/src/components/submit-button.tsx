import type { CompiledForm } from "@formbro/core/compile";
import { twx } from "@formbro/shared/twx";
import { Button } from "@formbro/ui/button";
import { Spinner } from "@formbro/ui/spinner";
import { cva } from "class-variance-authority";
import { type ReactNode, useEffect, useState } from "react";
import * as React from "react";
import { useFormContext } from "../hooks/tanstack-context";

interface FormWithSubscribe<
  T = {
    canSubmit: boolean;
    isSubmitting: boolean;
  },
> {
  Subscribe: (props: {
    selector: (state: { canSubmit: boolean; isSubmitting: boolean }) => T;
    children: (state: T) => ReactNode;
  }) => ReactNode;
}

const submitButtonVariants = cva("relative font-semibold transition-all duration-200", {
  variants: {
    size: {
      default: "min-w-[120px]",
      "full-width": "w-full",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export function SubmitButton({
  schema,
  className,
  disabled,
  tanstack,
}: {
  schema: Pick<CompiledForm, "submit">;
  className?: string;
  disabled?: boolean;
  tanstack?: FormWithSubscribe;
}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const contextForm = useFormContext() as FormWithSubscribe;
  const form = tanstack ?? contextForm;

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <form.Subscribe
      selector={(formState) => ({
        canSubmit: formState.canSubmit,
        isSubmitting: formState.isSubmitting,
      })}
    >
      {({ canSubmit, isSubmitting }: { canSubmit: boolean; isSubmitting: boolean }) => {
        const isDisabled = !isHydrated || disabled || !canSubmit;
        const buttonLabel = schema.submit?.label ?? "Submit";

        return (
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isDisabled}
              aria-disabled={isDisabled}
              aria-busy={isSubmitting}
              variant={schema.submit?.variant}
              className={twx(
                submitButtonVariants({ size: schema.submit?.size }),
                isSubmitting ? "cursor-wait" : "cursor-pointer",
                className,
              )}
            >
              <span
                className={twx(
                  "flex items-center transition-all duration-150",
                  !isSubmitting && "-ml-6 opacity-0",
                )}
              >
                <Spinner className="size-4" />
              </span>
              <span className={twx("inline-flex items-center gap-2")}>
                <span>{buttonLabel}</span>
              </span>
            </Button>
          </div>
        );
      }}
    </form.Subscribe>
  );
}
