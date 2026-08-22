import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { inspirationSchema, type IInspirationFormValues } from "@/entities";

export const useCreateInspirationForm = () => {
  const { t } = useTranslation();
  const schema = useMemo(() => inspirationSchema(t), [t]);

  const form = useForm<IInspirationFormValues>({
    mode: "onBlur",
    defaultValues: {
      image: null,
      alt: "",
    },
    resolver: yupResolver(schema),
  });

  return { ...form, errors: form.formState.errors };
};
