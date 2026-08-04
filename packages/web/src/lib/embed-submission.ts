const PUBLIC_SUBMISSION_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
  "Cross-Origin-Resource-Policy": "cross-origin",
  "X-Content-Type-Options": "nosniff",
};

type SubmissionResult =
  | {
      ok: true;
      data: {
        bytes: number;
        submissionId: string;
      };
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        status: Status;
      };
    };

export function embedSubmissionResponse(result: SubmissionResult) {
  if (!result.ok) {
    return Response.json(
      {
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      },
      {
        headers: PUBLIC_SUBMISSION_HEADERS,
        status: codes[result.error.status],
      },
    );
  }

  return Response.json(
    { data: result.data },
    {
      headers: PUBLIC_SUBMISSION_HEADERS,
      status: 201,
    },
  );
}

export function embedSubmissionOptionsResponse() {
  return new Response(null, {
    headers: {
      ...PUBLIC_SUBMISSION_HEADERS,
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
    status: 204,
  });
}
import { codes, type Status } from "@formbro/shared/result";
