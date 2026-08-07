import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { categorySchema } from "@/entities";
import type { ICreateCategoryRequest } from "@/shared";

export const useCreateCategoryForm = () => {
  const { t } = useTranslation();
  const schema = useMemo(() => categorySchema(t), [t]);

  const form = useForm<ICreateCategoryRequest>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      slug: "",
    },
    resolver: yupResolver(schema),
  });

  return { ...form, errors: form.formState.errors };
};
