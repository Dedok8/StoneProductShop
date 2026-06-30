import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useRegistration } from "@/features/auth/registration/model/useRegistration";
import { useRegistrationForm } from "@/features/auth/registration/model/useRegistrationForm";
import { FRONT_ROUTES, getApiErrorMessage } from "@/shared";
import Input from "@/shared/ui/Input/Input";

import type { IRegisterRequest } from "@/shared/api/types";

function RegisterFrom() {
  const { register: sendRegistration, isLoading, error } = useRegistration();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useRegistrationForm();

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const apiErrorMessage = getApiErrorMessage(error);

  const onSubmit = async (values: IRegisterRequest) => {
    setErrorMessage("");
    try {
      await sendRegistration(values);
      navigate(FRONT_ROUTES.pages.Home.path);
    } catch (error) {
      if (error instanceof Error) setErrorMessage(error.message);
      else setErrorMessage(t("error.errLog"));
    }
  };

  if (apiErrorMessage || errorMessage) {
    console.log(apiErrorMessage || errorMessage);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        <Input
          label={t("inputs.name")}
          placeholder={t("inputs.usernamePlaceholder")}
          {...register("name")}
          error={errors.name?.message}
        />
      </label>

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
          label={t("inputs.password")}
          placeholder={t("inputs.passwordPlaceholder")}
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />
      </label>

      <label>
        <Input
          label={t("inputs.confirmPassword")}
          placeholder={t("inputs.confirmPasswordPlaceholder")}
          type="password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
      </label>

      <div>
        <button type="submit" disabled={!isValid || isSubmitting || isLoading}>
          {isSubmitting ? t("loading") : t("buttons.register")}
        </button>
      </div>
    </form>
  );
}

export default RegisterFrom;
