import { z } from "zod";

export const IdSchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9_]{0,63}$/,
    "ID must start with a lowercase letter and contain only lowercase letters, numbers, and underscores",
  );

export type FormBroId = z.infer<typeof IdSchema>;
