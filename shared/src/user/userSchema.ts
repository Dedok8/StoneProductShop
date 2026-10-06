import { z } from "zod";
import { PasswordSchema } from "../common/auth/passwordSchema";
import { EmailSchema } from "../common/auth/emailSchema";
import { SORT_USER, USER_ROLE } from "../enums";
import { SearchSchema } from "../common/searchSchema";
import { BaseQuerySchema } from "../pagination/paginationSchema";

const NameSchema = z
  .string()
  .trim()
  .min(2, { error: "Name must be at least 2 characters long" })
  .max(60, { error: "Name must be at most 60 characters long" });

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: "Current password is required" })
      .min(1, { error: "Current password is required" })
      .max(64, { error: "Password must not exceed 64 characters" }),
    newPassword: PasswordSchema,
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    error: "New password must differ from the current one",
    path: ["newPassword"],
  });

export const CreateUserSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

export const AdminCreateUserSchema = CreateUserSchema.extend({
  role: z.enum(USER_ROLE, { error: "Invalid role" }).optional(),
});

export const SearchUserSchema = SearchSchema;

export const UpdateUserRoleSchema = z.object({
  role: z.enum(USER_ROLE, { error: "Invalid role" }),
});

export const UpdateUserSchema = z.object({
  name: NameSchema,
});

export const UserQuerySchema = BaseQuerySchema.extend({
  sortBy: z
    .enum(SORT_USER, { error: "Invalid sort field" })
    .default(SORT_USER.CREATED_AT),
  role: z.enum(USER_ROLE, { error: "Invalid role" }).optional(),
});

export type UserQueryInput = z.infer<typeof UserQuerySchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type AdminCreateUserInput = z.infer<typeof AdminCreateUserSchema>;
export type SearchUserInput = z.infer<typeof SearchUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
