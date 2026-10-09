import { z } from "zod";
import { PasswordSchema } from "../common/auth/passwordSchema";
import { EmailSchema } from "../common/auth/emailSchema";

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z
    .string({ error: "validation.required" })
    .min(1, { error: "validation.required" }),
});

export const RegisterSchema = z.object({
  name: z
    .string({ error: "validation.required" })
    .trim()
    .min(2, { error: "validation.auth.name.min" })
    .max(50, { error: "validation.auth.name.max" }),
  email: EmailSchema,
  password: PasswordSchema,
});

export const TokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type TokenInput = z.infer<typeof TokenSchema>;
