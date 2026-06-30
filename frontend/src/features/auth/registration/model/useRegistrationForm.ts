import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { yupResolver } from "@hookform/resolvers/yup";

import { registerSchema } from "@/entities/user";

import type { IRegisterRequest } from "@/shared/api/types";

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
