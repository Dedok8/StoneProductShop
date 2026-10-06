import { z } from "zod";

export const SearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, { error: "Query must be at least 2 characters long" })
    .max(100, { error: "Query must be at most 100 characters long" }),
});
