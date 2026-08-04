import { PublishedFormSnapshotSchema, type PublishedFormSnapshot } from "@formbro/core/embed";

export type EmbedFetchInit = RequestInit & {
  next?: {
    revalidate: number;
  };
};

export type EmbedFetcher = (
  input: string | URL | Request,
  init?: EmbedFetchInit,
) => Promise<Response>;

export type PublishedFormLoadResult =
  | { ok: true; snapshot: PublishedFormSnapshot }
  | { ok: false; error: { code: string; message: string; status: number } };

export type PublishedSubmissionResult =
  | { ok: true; data: { bytes: number; submissionId: string } }
  | { ok: false; error: { code: string; message: string; status: number } };

function resourceUrl(apiUrl: string, publicId: string, resource: "snapshot" | "submissions") {
  return `${apiUrl.replace(/\/$/, "")}/api/v1/forms/${encodeURIComponent(publicId)}/${resource}`;
}

function publicApiError(body: unknown, status: number) {
  const error =
    body && typeof body === "object" && "error" in body && body.error
      ? (body.error as { code?: unknown; message?: unknown })
      : null;

  return {
    code: typeof error?.code === "string" ? error.code : "FORM_UNAVAILABLE",
    message: typeof error?.message === "string" ? error.message : "This form could not be loaded.",
    status,
  };
}

export async function fetchPublishedFormSnapshot({
  apiUrl,
  fetcher = fetch,
  publicId,
  revalidate = 60,
}: {
  apiUrl: string;
  fetcher?: EmbedFetcher;
  publicId: string;
  revalidate?: number;
}): Promise<PublishedFormLoadResult> {
  const response = await fetcher(resourceUrl(apiUrl, publicId, "snapshot"), {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    return { ok: false, error: publicApiError(body, response.status) };
  }

  const snapshot = PublishedFormSnapshotSchema.safeParse(body);
  if (!snapshot.success) {
    return {
      ok: false,
      error: {
        code: "FORM_UNAVAILABLE",
        message: "This form could not be loaded.",
        status: 503,
      },
    };
  }

  return { ok: true, snapshot: snapshot.data };
}

export async function submitPublishedForm({
  apiUrl,
  fetcher = fetch,
  idempotencyKey,
  publicId,
  revision,
  values,
}: {
  apiUrl: string;
  fetcher?: EmbedFetcher;
  idempotencyKey: string;
  publicId: string;
  revision: string;
  values: Record<string, string>;
}): Promise<PublishedSubmissionResult> {
  const response = await fetcher(resourceUrl(apiUrl, publicId, "submissions"), {
    body: JSON.stringify({ idempotencyKey, revision, values }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    return { ok: false, error: publicApiError(body, response.status) };
  }

  const body: unknown = await response.json().catch(() => null);
  if (
    !body ||
    typeof body !== "object" ||
    !("data" in body) ||
    !body.data ||
    typeof body.data !== "object" ||
    !("bytes" in body.data) ||
    typeof body.data.bytes !== "number" ||
    !("submissionId" in body.data) ||
    typeof body.data.submissionId !== "string"
  ) {
    return {
      ok: false,
      error: {
        code: "FORM_UNAVAILABLE",
        message: "The response could not be submitted. Please try again.",
        status: 503,
      },
    };
  }

  return {
    ok: true,
    data: { bytes: body.data.bytes, submissionId: body.data.submissionId },
  };
}
