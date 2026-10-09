import { z } from "zod";

export const PasswordSchema = z
  .string({ error: "validation.required" })
  .min(8, { error: "validation.auth.password.min" })
  .max(64, { error: "validation.auth.password.max" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    error: "validation.auth.password.format",
  });
