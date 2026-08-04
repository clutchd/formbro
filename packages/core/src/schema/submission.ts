import { z } from "zod";

/**
 * A submission value is JSON so schemas can model scalar fields, multi-value fields, and nested
 * repeatable groups without inventing a second wire format.
 */
export const SubmissionValueSchema = z.json();

export const SubmissionDataSchema = z.record(z.string(), SubmissionValueSchema);

export type SubmissionValue = z.output<typeof SubmissionValueSchema>;
export type SubmissionData = z.output<typeof SubmissionDataSchema>;
