import { describe, expect, test } from "bun:test";
import { loadPublishedForm } from "./published-form";

describe("hosted published form loader", () => {
  test("loads and validates the portable snapshot interface", async () => {
    const requested: string[] = [];
    const result = await loadPublishedForm({
      apiUrl: "https://forms.example.com",
      fetcher: async (input) => {
        requested.push(String(input));
        return Response.json({
          protocolVersion: 1,
          publicId: "employment-application",
          publishedTime: 1_000,
          revision: "revision-a",
          schema: {
            id: "employment_application",
            version: "1.0.0",
            name: "Employment application",
            elements: [],
          },
        });
      },
      publicId: "employment-application",
    });

    expect(requested).toEqual([
      "https://forms.example.com/api/v1/forms/employment-application/snapshot",
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.snapshot.revision).toBe("revision-a");
  });
});
