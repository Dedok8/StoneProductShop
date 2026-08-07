import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { loginSchema } from "@/entities";
import type { ILoginRequest } from "@/shared";


export const useLoginForm = () => {
  const { t } = useTranslation();
  const schema = useMemo(() => loginSchema(t), [t]);

  const form = useForm<ILoginRequest>({
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
    resolver: yupResolver(schema),
  });

  return { ...form, errors: form.formState.errors };
};
