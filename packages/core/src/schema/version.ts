import { z } from "zod";

export const FORMBRO_SCHEMA_VERSION = "1.0.0";

export const VersionSchema = z.union([z.number(), z.string()]).default(FORMBRO_SCHEMA_VERSION);
