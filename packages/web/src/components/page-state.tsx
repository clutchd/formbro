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
  error,
  icon,
  title,
}: {
  children?: ReactNode;
  description?: ReactNode;
  error?: boolean;
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
              className={error ? "border-destructive-border text-destructive" : undefined}
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
