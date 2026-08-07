import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import {
  useRegistration,
  useRegistrationForm,
} from "@/features/auth/registration/model";
import { FRONT_ROUTES, type IRegisterRequest } from "@/shared";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function Registration() {
  const { registration, isLoading } = useRegistration();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, handleSubmit, errors, setError } = useRegistrationForm();

  const onSubmit = async (values: IRegisterRequest) => {
    try {
      await registration(values);
      navigate(FRONT_ROUTES.pages.Profile.path);
    } catch (error) {
      const message = getApiErrorMessage(error, t);
      setError("root", { message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Input
        aria-label={t("name")}
        placeholder={t("name")}
        autoComplete="name"
        {...register("name")}
      />
      {errors.name && <span>{errors.name.message}</span>}

      <Input
        aria-label={t("email")}
        placeholder={t("email")}
        type="email"
        autoComplete="email"
        {...register("email")}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <Input
        aria-label={t("password")}
        placeholder={t("password")}
        type="password"
        autoComplete="new-password"
        {...register("password")}
      />
      {errors.password && <span>{errors.password.message}</span>}

      <Input
        aria-label={t("confirmPassword")}
        placeholder={t("confirmPassword")}
        type="password"
        autoComplete="new-password"
        {...register("confirmPassword")}
      />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      {errors.root && <span role="alert">{errors.root.message}</span>}

      <button type="submit" disabled={isLoading}>
        {t("register")}
      </button>
    </form>
  );
}

export default Registration;
