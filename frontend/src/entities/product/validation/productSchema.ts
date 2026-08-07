import * as yup from "yup";

import type { TFunction } from "i18next";

export const productSchema = (t: TFunction) => {
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

    description: yup
      .string()
      .trim()
      .min(5, ({ min }) => t("validation.minLength", { count: min }))
      .max(200, ({ max }) => t("validation.maxLength", { count: max }))
      .optional(),

    price: yup
      .number()
      .typeError(t("validation.number"))
      .min(0.01, ({ min }) => t("validation.minValue", { count: min }))
      .max(1_000_000, ({ max }) => t("validation.maxValue", { count: max }))
      .required(t("validation.required")),

    stock: yup
      .number()
      .typeError(t("validation.number"))
      .integer(t("validation.integer"))
      .min(0, ({ min }) => t("validation.minValue", { count: min }))
      .max(1_000_000, ({ max }) => t("validation.maxValue", { count: max }))
      .required(t("validation.required")),

    images: yup
      .array()
      .of(
        yup.string().url(t("validation.url")).required(t("validation.required"))
      )
      .max(10, ({ max }) => t("validation.maxItems", { count: max }))
      .required(t("validation.required")),

    categoryId: yup
      .string()
      .uuid(t("validation.uuid"))
      .required(t("validation.required")),

    ownerId: yup
      .string()
      .uuid(t("validation.uuid"))
      .required(t("validation.required")),
  });
};
