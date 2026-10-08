import * as yup from "yup";

import type { TFunction } from "i18next";

export const categorySchema = (t: TFunction) => {
  return yup.object().shape({
    name: yup
      .string()
      .trim()
      .min(2, ({ min }) => t("validation.minLength", { count: min }))
      .max(50, ({ max }) => t("validation.maxLength", { count: max }))
      .required(t("validation.required")),
    slug: yup
      .string()
      .trim()
      .min(2, ({ min }) => t("validation.minLength", { count: min }))
      .max(60, ({ max }) => t("validation.maxLength", { count: max }))
      .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, t("validation.slugFormat"))
      .required(t("validation.required")),
  });
};
