import {
  useRegistration,
  useRegistrationForm,
} from "@/features/auth/registration/model";
import { FRONT_ROUTES, type IRegisterRequest } from "@/shared";
import { getApiErrorMessage } from "@/shared/ui/Error";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

function Registration() {
  const { registration, isLoading } = useRegistration();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    field: { errors },
    setError,
  } = useRegistrationForm();

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}

      <input type="password" {...register("confirmPassword")} />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      {errors.root && <span>{errors.root.message}</span>}

      <button type="submit" disabled={isLoading}>
        {t("register")}
      </button>
    </form>
  );
}

export default Registration;
