import * as yup from "yup";

import type { TFunction } from "i18next";

export const registerSchema = (t: TFunction) =>
  yup.object().shape({
    name: yup
      .string()
      .trim()
      .min(3, t("validation.nickname_min"))
      .max(50, t("validation.nickname_max"))
      .required(t("validation.nickname_required")),
    email: yup
      .string()
      .email(t("validation.email_invalid"))
      .required(t("validation.email_required"))
      .max(250, t("validation.email_max")),
    password: yup
      .string()
      .trim()
      .min(3, t("validation.password_min"))
      .max(16, t("validation.password_max"))
      .required(t("validation.password_required")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("validation.password_match"))
      .required(t("validation.password_confirm_required")),
  });

export const loginSchema = (t: TFunction) =>
  yup.object().shape({
    email: yup
      .string()
      .email(t("validation.email_invalid"))
      .required(t("validation.email_required")),
    password: yup
      .string()
      .trim()
      .min(3, t("validation.password_min"))
      .max(16, t("validation.password_max"))
      .required(t("validation.password_required")),
  });
