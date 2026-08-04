import { PublishedFormSnapshotSchema, type PublishedFormSnapshot } from "@formbro/core/embed";

type PublishedFormFetcher = (
  input: string,
  init?: {
    next?: {
      revalidate: number;
    };
  },
) => Promise<Response>;

type PublishedFormLoadResult =
  | {
      ok: true;
      snapshot: PublishedFormSnapshot;
    }
  | {
      ok: false;
      code: string;
      message: string;
      status: number;
    };

function formEndpoint(apiUrl: string, publicId: string, resource: "snapshot" | "submissions") {
  const baseUrl = apiUrl.replace(/\/$/, "");
  return `${baseUrl}/api/v1/forms/${encodeURIComponent(publicId)}/${resource}`;
}

export function publishedFormSubmissionUrl(apiUrl: string, publicId: string) {
  return formEndpoint(apiUrl, publicId, "submissions");
}

export async function loadPublishedForm({
  apiUrl,
  fetcher = fetch,
  publicId,
}: {
  apiUrl: string;
  fetcher?: PublishedFormFetcher;
  publicId: string;
}): Promise<PublishedFormLoadResult> {
  const response = await fetcher(formEndpoint(apiUrl, publicId, "snapshot"), {
    next: {
      revalidate: 60,
    },
  });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error =
      body && typeof body === "object" && "error" in body && body.error
        ? (body.error as { code?: unknown; message?: unknown })
        : null;

    return {
      ok: false,
      code: typeof error?.code === "string" ? error.code : "FORM_UNAVAILABLE",
      message:
        typeof error?.message === "string" ? error.message : "This form could not be loaded.",
      status: response.status,
    };
  }

  const snapshot = PublishedFormSnapshotSchema.safeParse(body);
  if (!snapshot.success) {
    return {
      ok: false,
      code: "FORM_UNAVAILABLE",
      message: "This form could not be loaded.",
      status: 503,
    };
  }

  return {
    ok: true,
    snapshot: snapshot.data,
  };
}
