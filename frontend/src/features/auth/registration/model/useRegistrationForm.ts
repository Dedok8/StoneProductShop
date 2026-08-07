import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { registerSchema } from "@/entities";
import type { IRegisterRequest } from "@/shared";

export const useRegistrationForm = () => {
  const { t } = useTranslation();
  const schema = useMemo(() => registerSchema(t), [t]);

  const form = useForm<IRegisterRequest>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(schema),
  });

  return { ...form, errors: form.formState.errors };
};
