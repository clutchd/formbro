import { z } from "zod";
import { ElementRegistry, RegistryKeys } from "../registry";
import { IdSchema } from "./id";

export const BaseElementSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  type: z.enum(RegistryKeys),
});

export const ElementSchema = z.union(
  ElementRegistry.map((e) =>
    BaseElementSchema.extend({
      type: z.literal(e.key),
      category: z.literal(e.category).default(e.category),
      ...e.schema.shape,
    }),
  ),
);
