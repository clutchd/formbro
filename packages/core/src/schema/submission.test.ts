import { describe, expect, it } from "bun:test";
import { SubmissionDataSchema } from "./submission";

describe("SubmissionDataSchema", () => {
  it("accepts scalar and recursively structured JSON values", () => {
    const data = {
      work_order: "A-1042",
      urgent: true,
      travel_hours: 1.5,
      notes: null,
      tags: ["repair", "warranty"],
      equipment: [
        {
          asset_id: "RTU-1",
          readings: { entering_air: 72, leaving_air: 54 },
        },
        {
          asset_id: "RTU-2",
          readings: { entering_air: 73, leaving_air: 55 },
        },
      ],
    };

    expect(SubmissionDataSchema.parse(data)).toEqual(data);
  });

  it("rejects values that cannot be represented as JSON", () => {
    expect(SubmissionDataSchema.safeParse({ invalid: undefined }).success).toBe(false);
    expect(SubmissionDataSchema.safeParse({ invalid: 1n }).success).toBe(false);
    expect(SubmissionDataSchema.safeParse({ invalid: new Date() }).success).toBe(false);
  });
});
