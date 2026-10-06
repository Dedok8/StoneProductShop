import { z } from "zod";

export const slugSchema = z
  .string()
  .min(2, { error: "Slug must be at least 2 characters long" })
  .max(50, { error: "Slug must be at most 50 characters long" })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    error: "Slug must be lowercase, contain only letters, numbers and hyphens",
  });
