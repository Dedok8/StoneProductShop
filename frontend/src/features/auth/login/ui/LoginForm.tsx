import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useLogin } from "@/features/auth/login/model";
import useLoginForm from "@/features/auth/login/model/useLoginForm";
import { FRONT_ROUTES, getApiErrorMessage } from "@/shared";
import Input from "@/shared/ui/Input/Input";

import type { ILoginRequest } from "@/shared/api/types";

function LoginFrom() {
  const { login, isLoading, error } = useLogin();
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useLoginForm();

  const apiErrorMessage = getApiErrorMessage(error);

  const onSubmit = async (values: ILoginRequest) => {
    setErrorMessage("");

    try {
      await login(values);
      navigate(FRONT_ROUTES.pages.Profile.path);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(t("error.errLog"));
      }
    }
  };

  if (apiErrorMessage || errorMessage) {
    console.log(apiErrorMessage || errorMessage);
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        <Input
          label={t("inputs.email")}
          placeholder={t("inputs.emailPlaceholder")}
          {...register("email")}
          error={errors.email?.message}
        />
      </label>

      <label>
        <Input
          type="password"
          label={t("inputs.password")}
          placeholder={t("inputs.passwordPlaceholder")}
          {...register("password")}
          error={errors.password?.message}
        />
      </label>

      <div>
        <button type="submit" disabled={!isValid || isSubmitting || isLoading}>
          {isSubmitting ? t("loading") : t("buttons.login")}
        </button>
      </div>
    </form>
  );
}

export default LoginFrom;
