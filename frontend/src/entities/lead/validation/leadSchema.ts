import * as yup from "yup";

import type { TFunction } from "i18next";

export const leadSchema = (t: TFunction) =>
  yup.object({
    name: yup
      .string()
      .required(t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 })),
    phone: yup
      .string()
      .required(t("validation.required"))
      .matches(/^\+?[0-9\s\-()]{10,}$/, t("validation.invalidPhone")),
    consent: yup
      .boolean()
      .oneOf([true], t("validation.consentRequired"))
      .required(t("validation.required")),
  });
