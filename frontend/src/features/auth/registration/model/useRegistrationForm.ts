import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { registerSchema } from "@/entities";
import type { IRegisterRequest } from "@/shared";

const defaultValues: IRegisterRequest = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const useRegistrationForm = () => {
  const { t } = useTranslation();
  const schema = registerSchema(t);

  const form = useForm({
    mode: "onBlur",
    defaultValues,
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
