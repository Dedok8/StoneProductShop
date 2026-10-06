import { z } from "zod";

export const PasswordSchema = z
  .string()
  .min(8, { error: "Password must be at least 8 characters long" })
  .max(64, { error: "Password must be at most 64 characters long" })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    error:
      "Password must contain at least one uppercase letter, one lowercase letter and one number",
  });
