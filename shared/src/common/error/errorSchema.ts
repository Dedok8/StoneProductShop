import { z } from "zod";
import { ErrorCode } from "./errorCode";

export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  code: z.enum(ErrorCode),
  message: z.string(),
  errors: z
    .array(z.object({ path: z.string(), message: z.string() }))
    .optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
