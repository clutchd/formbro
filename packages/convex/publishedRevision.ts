export const PUBLISHED_REVISION_GRACE_MS = 24 * 60 * 60 * 1_000;

type PublishedRevision = {
  id: string;
  retiredTime?: number;
  status: "draft" | "published";
};

export function canAcceptPublishedRevision({
  currentRevisionId,
  now,
  revision,
}: {
  currentRevisionId?: string;
  now: number;
  revision: PublishedRevision;
}) {
  if (revision.status !== "published") return false;
  if (revision.id === currentRevisionId) return true;

  return (
    revision.retiredTime !== undefined && now <= revision.retiredTime + PUBLISHED_REVISION_GRACE_MS
  );
}
