import { PageState } from "./page-state";

export function Loading({ title }: { title?: string }) {
  return (
    <PageState
      title={
        <span aria-live="polite" className="inline-flex items-center text-muted-foreground">
          {title ? `Loading ${title}` : "Loading"}
          <span aria-hidden="true" className="inline-block w-[3ch] text-left">
            <span className="loading-dots-text" />
          </span>
        </span>
      }
    />
  );
}
