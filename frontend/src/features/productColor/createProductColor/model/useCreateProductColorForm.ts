import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from "yup";

import { productColorSchema } from "@/entities";

export const useCreateProductColorForm = () => {
  const { t } = useTranslation();
  const schema = useMemo(() => productColorSchema(t), [t]);

  const form = useForm<ProductColorValues>({
    mode: "onBlur",
    defaultValues: {
      hex: null,
      name: "",
    },
    resolver: yupResolver(schema) as Resolver<ProductColorValues>,
  });

  return { ...form, errors: form.formState.errors };
};

export type ProductColorValues = yup.InferType<
  ReturnType<typeof productColorSchema>
>;
