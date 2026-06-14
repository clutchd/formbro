import { twx } from "@formbro/shared/twx";
import { PageState } from "./page-state";

export function Loading({ title, className }: { title?: string; className?: string }) {
  return (
    <PageState
      title={
        <span
          aria-live="polite"
          className={twx("inline-flex items-center text-muted-foreground", className)}
        >
          {title ? `Loading ${title}` : "Loading"}
          <span aria-hidden="true" className="inline-block w-[3ch] text-left">
            <span className="loading-dots-text" />
          </span>
        </span>
      }
    />
  );
}
