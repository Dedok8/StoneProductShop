import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { createUserSchema } from "@/entities";
import type { ICreateUserRequest } from "@/shared";

export const useCreateUserForm = () => {
  const { t } = useTranslation();
  const schema = useMemo(() => createUserSchema(t), [t]);

  const form = useForm<ICreateUserRequest>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER" as const,
    },
    resolver: yupResolver(schema),
  });

  return { ...form, errors: form.formState.errors };
};
