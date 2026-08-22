import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as yup from "yup";

import { leadSchema } from "@/entities";

export const useCreateLeadForm = () => {
  const { t } = useTranslation();
  const schema = useMemo(() => leadSchema(t), [t]);

  const form = useForm<LeadFormValues>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      phone: "",
      consent: false,
    },
    resolver: yupResolver(schema) as Resolver<LeadFormValues>,
  });

  return { ...form, errors: form.formState.errors };
};

export type LeadFormValues = yup.InferType<ReturnType<typeof leadSchema>>;
