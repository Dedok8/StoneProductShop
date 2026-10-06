import { email, z } from "zod";

export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(email({ error: "Invalid email format" }));
