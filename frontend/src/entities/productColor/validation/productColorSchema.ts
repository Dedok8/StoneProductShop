import * as yup from "yup";

import type { TFunction } from "i18next";

export const productColorSchema = (t: TFunction) => {
  return yup.object().shape({
    name: yup
      .string()
      .trim()
      .min(2, ({ min }) => t("validation.minLength", { count: min }))
      .max(50, ({ max }) => t("validation.maxLength", { count: max }))
      .required(t("validation.required")),

    hex: yup
      .string()
      .trim()
      .matches(
        /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
        t("validation.hexColor")
      )
      .nullable()
      .notRequired(),
  });
};
