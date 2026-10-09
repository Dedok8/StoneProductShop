import { z } from "zod";
import { PasswordSchema } from "../common/auth/passwordSchema";
import { EmailSchema } from "../common/auth/emailSchema";
import { SORT_USER, USER_ROLE } from "../enums";
import { SearchSchema } from "../common/searchSchema";
import { BaseQuerySchema } from "../pagination/paginationSchema";

const NameSchema = z
  .string({ error: "validation.string" })
  .trim()
  .min(2, { error: "validation.user.name.min" })
  .max(60, { error: "validation.user.name.max" });

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string({ error: "validation.user.currentPassword.required" })
      .min(1, { error: "validation.user.currentPassword.required" })
      .max(64, { error: "validation.user.currentPassword.max" }),
    newPassword: PasswordSchema,
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    error: "validation.user.newPassword.sameAsCurrent",
    path: ["newPassword"],
  });

export const CreateUserSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

export const AdminCreateUserSchema = CreateUserSchema.extend({
  role: z.enum(USER_ROLE, { error: "validation.user.role.invalid" }).optional(),
});

export const SearchUserSchema = SearchSchema;

export const UpdateUserRoleSchema = z.object({
  role: z.enum(USER_ROLE, { error: "validation.user.role.invalid" }),
});

export const UpdateUserSchema = z.object({
  name: NameSchema,
});

export const UserQuerySchema = BaseQuerySchema.extend({
  sortBy: z
    .enum(SORT_USER, { error: "validation.user.sortBy.invalid" })
    .default(SORT_USER.CREATED_AT),
  role: z.enum(USER_ROLE, { error: "validation.user.role.invalid" }).optional(),
});

export type UserQueryInput = z.infer<typeof UserQuerySchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type AdminCreateUserInput = z.infer<typeof AdminCreateUserSchema>;
export type SearchUserInput = z.infer<typeof SearchUserSchema>;
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
