import * as yup from "yup";

import type { UserRole } from "@/shared";

import type { TFunction } from "i18next";

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const USER_ROLES: UserRole[] = ["USER", "MANAGER", "ADMIN"];

export const registerSchema = (t: TFunction) =>
  yup.object().shape({
    name: yup
      .string()
      .trim()
      .min(3, ({ min }) => t("validation.minLength", { count: min }))
      .max(50, ({ max }) => t("validation.maxLength", { count: max }))
      .required(t("validation.required")),
    email: yup
      .string()
      .email(t("validation.email"))
      .max(250, ({ max }) => t("validation.maxLength", { count: max }))
      .required(t("validation.required")),
    password: yup
      .string()
      .min(8, ({ min }) => t("validation.minLength", { count: min }))
      .max(64, ({ max }) => t("validation.maxLength", { count: max }))
      .matches(PASSWORD_COMPLEXITY_REGEX, t("validation.passwordComplexity"))
      .required(t("validation.required")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("validation.passwordMatch"))
      .required(t("validation.required")),
  });

export const loginSchema = (t: TFunction) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t("validation.email"))
      .required(t("validation.required")),
    password: yup.string().required(t("validation.required")),
  });

export const createUserSchema = (t: TFunction) =>
  yup.object().shape({
    name: yup
      .string()
      .trim()
      .min(2, ({ min }) => t("validation.minLength", { count: min }))
      .max(50, ({ max }) => t("validation.maxLength", { count: max }))
      .required(t("validation.required")),
    email: yup
      .string()
      .email(t("validation.email"))
      .max(250, ({ max }) => t("validation.maxLength", { count: max }))
      .required(t("validation.required")),
    password: yup
      .string()
      .min(8, ({ min }) => t("validation.minLength", { count: min }))
      .max(64, ({ max }) => t("validation.maxLength", { count: max }))
      .matches(PASSWORD_COMPLEXITY_REGEX, t("validation.passwordComplexity"))
      .required(t("validation.required")),
    role: yup
      .string()
      .oneOf(USER_ROLES, t("validation.invalidRole"))
      .required(t("validation.required")),
  });
