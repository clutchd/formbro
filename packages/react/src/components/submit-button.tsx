import type { CompiledForm } from "@formbro/core/compile";
import { type ReactNode, useSyncExternalStore } from "react";
import * as React from "react";
import { useFormContext } from "../hooks/tanstack-context.js";
import { cx } from "../utils/cx.js";
import { Button, Spinner } from "./primitives.js";

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
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const contextForm = useFormContext() as FormWithSubscribe;
  const form = tanstack ?? contextForm;

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
              className={cx(
                "relative font-semibold transition-all duration-200",
                schema.submit?.size === "full-width" ? "w-full" : "min-w-[120px]",
                isSubmitting ? "cursor-wait" : "cursor-pointer",
                className,
              )}
            >
              <span
                className={cx(
                  "flex items-center transition-all duration-150",
                  !isSubmitting && "-ml-6 opacity-0",
                )}
              >
                <Spinner className="size-4" />
              </span>
              <span className="inline-flex items-center gap-2">
                <span>{buttonLabel}</span>
              </span>
            </Button>
          </div>
        );
      }}
    </form.Subscribe>
  );
}
