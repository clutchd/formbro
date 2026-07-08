"use client";

import * as React from "react";
import { cx } from "../utils/cx.js";

type ButtonVariant = "default" | "destructive" | "outline";
type ButtonSize = "default" | "sm";

const buttonBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";
const buttonVariants: Record<ButtonVariant, string> = {
  default: "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-700",
  destructive: "border-red-700 bg-red-700 text-white hover:bg-red-600",
  outline: "border-neutral-300 bg-white text-neutral-950 hover:bg-neutral-50",
};
const buttonSizes: Record<ButtonSize, string> = {
  default: "h-9 px-3",
  sm: "h-8 px-2.5",
};

export function Button({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"button"> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={cx(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
      {...props}
    />
  );
}

const controlClass =
  "flex h-9 w-full min-w-0 rounded-md border border-neutral-300 bg-white px-3 py-1 text-base text-neutral-950 shadow-none outline-none transition-colors placeholder:text-neutral-500 focus-visible:border-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-600 aria-invalid:ring-red-600/20 md:text-sm";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cx(controlClass, className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cx(controlClass, "appearance-auto", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cx(
        "flex min-h-24 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-950 shadow-none outline-none transition-colors placeholder:text-neutral-500 focus-visible:border-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-950/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-600 aria-invalid:ring-red-600/20 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return <fieldset className={cx("flex min-w-0 flex-col gap-6", className)} {...props} />;
}

export function FieldLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return <legend className={cx("mb-3 text-base font-semibold", className)} {...props} />;
}

export function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cx("flex w-full flex-col gap-5", className)} {...props} />;
}

export function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "responsive" | "vertical";
}) {
  return (
    <div
      data-orientation={orientation}
      className={cx(
        "flex w-full gap-3 data-[invalid=true]:text-red-700",
        orientation === "horizontal" && "flex-row items-center",
        orientation === "responsive" && "flex-col sm:flex-row sm:items-center",
        orientation === "vertical" && "flex-col",
        className,
      )}
      {...props}
    />
  );
}

export function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cx("flex flex-1 flex-col gap-1.5 leading-snug", className)} {...props} />;
}

export function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cx("flex w-fit gap-2 text-sm font-medium leading-snug", className)}
      {...props}
    />
  );
}

export function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cx("text-sm leading-normal font-normal text-neutral-600", className)}
      {...props}
    />
  );
}

export function FieldSeparator({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cx("relative my-4 flex items-center gap-3 text-sm", className)} {...props}>
      <div className="h-px flex-1 bg-neutral-200" />
      {children ? <span className="text-neutral-600">{children}</span> : null}
      <div className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}

export function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  let content: React.ReactNode = children ?? null;

  if (!content && errors?.length) {
    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];

    if (uniqueErrors.length === 1) {
      content = uniqueErrors[0]?.message;
    } else {
      content = (
        <ul className="ml-4 flex list-disc flex-col gap-1">
          {uniqueErrors.map(
            (error) => error?.message && <li key={error.message}>{error.message}</li>,
          )}
        </ul>
      );
    }
  }

  if (!content) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cx("text-sm font-normal text-red-700", className)}
      {...props}
    >
      {content}
    </div>
  );
}

export function Progress({
  className,
  value = 0,
  ...props
}: React.ComponentProps<"div"> & {
  value?: number;
}) {
  const normalized = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={normalized}
      className={cx("h-1 w-full overflow-hidden rounded-full bg-neutral-200", className)}
      {...props}
    >
      <div
        className="h-full bg-neutral-950 transition-transform"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}

export function Spinner({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cx(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      )}
      {...props}
    />
  );
}
