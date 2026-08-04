import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { loginSchema } from "@/entities";
import type { ILoginRequest } from "@/shared";

const defaultValues: ILoginRequest = {
  email: "",
  password: "",
};

export const useLoginForm = () => {
  const { t } = useTranslation();
  const schema = loginSchema(t);

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
