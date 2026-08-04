import { describe, expect, test } from "bun:test";
import { fetchPublishedFormSnapshot, submitPublishedForm } from "./transport";

describe("native embed transport", () => {
  test("loads and validates a revalidated published snapshot", async () => {
    const requests: Array<{ input: string; init?: RequestInit & { next?: unknown } }> = [];
    const result = await fetchPublishedFormSnapshot({
      apiUrl: "https://formbro.com/",
      fetcher: async (input, init) => {
        requests.push({ input: String(input), init });
        return Response.json({
          protocolVersion: 1,
          publicId: "jobs/us",
          publishedTime: 1_000,
          revision: "revision-a",
          schema: {
            id: "jobs",
            version: "1.0.0",
            name: "Jobs",
            elements: [],
          },
        });
      },
      publicId: "jobs/us",
      revalidate: 30,
    });

    expect(result.ok).toBe(true);
    expect(requests[0]?.input).toBe("https://formbro.com/api/v1/forms/jobs%2Fus/snapshot");
    expect(requests[0]?.init?.next).toEqual({ revalidate: 30 });
  });

  test("submits the pinned revision and retry key", async () => {
    let body: unknown;
    const result = await submitPublishedForm({
      apiUrl: "https://formbro.com",
      fetcher: async (_input, init) => {
        body = JSON.parse(String(init?.body));
        return Response.json(
          { data: { bytes: 42, submissionId: "submission-a" } },
          { status: 201 },
        );
      },
      idempotencyKey: "attempt-a",
      publicId: "jobs",
      revision: "revision-a",
      values: { email: "person@example.com" },
    });

    expect(body).toEqual({
      idempotencyKey: "attempt-a",
      revision: "revision-a",
      values: { email: "person@example.com" },
    });
    expect(result).toEqual({
      ok: true,
      data: { bytes: 42, submissionId: "submission-a" },
    });
  });

  test("returns public API errors without throwing away the message", async () => {
    const result = await submitPublishedForm({
      apiUrl: "https://formbro.com",
      fetcher: async () =>
        Response.json(
          { error: { code: "FORM_CLOSED", message: "This form is closed." } },
          { status: 409 },
        ),
      idempotencyKey: "attempt-a",
      publicId: "jobs",
      revision: "revision-a",
      values: {},
    });

    expect(result).toEqual({
      ok: false,
      error: { code: "FORM_CLOSED", message: "This form is closed.", status: 409 },
    });
  });
});
