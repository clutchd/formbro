import { describe, expect, test } from "bun:test";
import { embedSubmissionOptionsResponse, embedSubmissionResponse } from "./embed-submission";

describe("public embed submission HTTP response", () => {
  test("returns a created response without caching respondent data", async () => {
    const response = embedSubmissionResponse({
      ok: true,
      data: {
        bytes: 128,
        submissionId: "submission-a",
      },
    });

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(await response.json()).toEqual({
      data: {
        bytes: 128,
        submissionId: "submission-a",
      },
    });
  });

  test("preserves the domain error status without exposing internal status names", async () => {
    const response = embedSubmissionResponse({
      ok: false,
      error: {
        code: "FORM_NOT_OPEN",
        message: "This form is not accepting responses.",
        status: "FORBIDDEN",
      },
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: {
        code: "FORM_NOT_OPEN",
        message: "This form is not accepting responses.",
      },
    });
  });

  test("allows JSON submission preflight without credentials", () => {
    const response = embedSubmissionOptionsResponse();

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-methods")).toBe("POST, OPTIONS");
    expect(response.headers.get("access-control-allow-headers")).toBe("Content-Type");
  });
});
