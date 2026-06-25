import { z } from "zod";

export const IdSchema = z
  .string()
  .regex(/^[a-z0-9_]+$/, "ID must contain only lowercase letters, numbers, and underscores");

export type FormBroId = z.infer<typeof IdSchema>;
