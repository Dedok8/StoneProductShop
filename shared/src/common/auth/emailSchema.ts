import { email, z } from "zod";

export const EmailSchema = z
  .string({ error: "validation.required" })
  .trim()
  .toLowerCase()
  .pipe(email({ error: "validation.auth.email.invalid" }));
