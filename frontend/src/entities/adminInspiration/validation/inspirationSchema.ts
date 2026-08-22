import * as yup from "yup";

import type { IInspirationFormValues } from "@/entities/adminInspiration/validation/fileTypes";

import type { TFunction } from "i18next";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp"];

export const inspirationSchema = (
  t: TFunction
): yup.ObjectSchema<IInspirationFormValues> => {
  return yup.object().shape({
    image: yup
      .mixed<FileList | File>()
      .required(t("validation.required"))
      .test(
        "fileSize",
        t("validation.fileTooLarge", { max: "5MB" }),
        (value) => {
          const file = value instanceof FileList ? value[0] : value;
          if (!file) return true;
          return file.size <= MAX_FILE_SIZE;
        }
      )
      .test("fileFormat", t("validation.unsupportedFormat"), (value) => {
        const file = value instanceof FileList ? value[0] : value;
        if (!file) return true;
        return SUPPORTED_FORMATS.includes(file.type);
      }),
    alt: yup.string().trim().required(t("validation.required")),
  }) as yup.ObjectSchema<IInspirationFormValues>;
};
