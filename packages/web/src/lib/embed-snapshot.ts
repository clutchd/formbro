import type { PublishedFormSnapshot } from "@formbro/core/embed";

const PUBLIC_EMBED_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Expose-Headers": "ETag",
  "Cross-Origin-Resource-Policy": "cross-origin",
  "X-Content-Type-Options": "nosniff",
};

const CDN_CACHE_CONTROL = "public, s-maxage=60, stale-while-revalidate=86400";

export function publishedSnapshotResponse(snapshot: PublishedFormSnapshot) {
  return Response.json(snapshot, {
    headers: {
      ...PUBLIC_EMBED_HEADERS,
      "Cache-Control": "public, max-age=0, must-revalidate",
      "CDN-Cache-Control": CDN_CACHE_CONTROL,
      ETag: `"${encodeURIComponent(snapshot.revision)}"`,
      "Vercel-CDN-Cache-Control": CDN_CACHE_CONTROL,
    },
  });
}

export function embedSnapshotErrorResponse({
  code,
  message,
  status,
}: {
  code: string;
  message: string;
  status: 404 | 409 | 503;
}) {
  return Response.json(
    {
      error: {
        code,
        message,
      },
    },
    {
      headers: {
        ...PUBLIC_EMBED_HEADERS,
        "Cache-Control": "no-store",
      },
      status,
    },
  );
}
