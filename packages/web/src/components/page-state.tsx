import type { ReactNode } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@formbro/ui/empty";

export function PageState({
  children,
  description,
  status = "info",
  icon,
  title,
}: {
  children?: ReactNode;
  description?: ReactNode;
  status?: "error" | "warning" | "info";
  icon?: ReactNode;
  title: ReactNode;
}) {
  return (
    <Empty asChild>
      <main>
        <EmptyHeader>
          {icon ? (
            <EmptyMedia
              variant="icon"
              className={
                status === "error"
                  ? "border-destructive-border text-destructive"
                  : status === "warning"
                    ? "border-amber-200 text-amber-600"
                    : undefined
              }
            >
              {icon}
            </EmptyMedia>
          ) : null}
          <EmptyTitle>{title}</EmptyTitle>
          {description ? <EmptyDescription>{description}</EmptyDescription> : null}
        </EmptyHeader>
        {children ? <EmptyContent>{children}</EmptyContent> : null}
      </main>
    </Empty>
  );
}
