import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { createUserSchema } from "@/entities";

export const useCreateUserForm = () => {
  const { t } = useTranslation();
  const schema = createUserSchema(t);

  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER" as const,
    },
    resolver: yupResolver(schema),
  });

  const field = useMemo(
    () => ({
      errors: form.formState.errors,
    }),
    [form.formState.errors]
  );

  return { ...form, field };
};
