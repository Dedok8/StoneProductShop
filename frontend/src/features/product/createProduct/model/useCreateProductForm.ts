import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from "yup";

import { productSchema } from "@/entities";

export const useCreateProductForm = () => {
  const { t } = useTranslation();
  const schema = useMemo(() => productSchema(t), [t]);

  const form = useForm<ProductFormValues>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      stock: 0,
      images: [],
      categoryId: "",
      ownerId: "",
    },
    resolver: yupResolver(schema) as Resolver<ProductFormValues>,
  });

  return { ...form, errors: form.formState.errors };
};

export type ProductFormValues = yup.InferType<ReturnType<typeof productSchema>>;
