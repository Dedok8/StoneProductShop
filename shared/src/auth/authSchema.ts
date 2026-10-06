import { email, z } from "zod";
import { PasswordSchema } from "../common/auth/passwordSchema";
import { EmailSchema } from "../common/auth/emailSchema";

export const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export const RegisterSchema = z.object({
  name: z
    .string()
    .toLowerCase()
    .min(2, { error: "Name must be at most 50 characters long" }),
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
