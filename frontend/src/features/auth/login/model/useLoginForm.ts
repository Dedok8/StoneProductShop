import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { yupResolver } from "@hookform/resolvers/yup";

import { loginSchema } from "@/entities/user";

import type { ILoginForm } from "@/features/auth/login/model/types";

const defaultValues: ILoginForm = {
  email: "",
  password: "",
};

const useLoginForm = () => {
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

export default useLoginForm;
