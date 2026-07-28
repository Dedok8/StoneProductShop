import { useLogin } from "@/features/auth/login/model/useLogin";
import { useLoginForm } from "@/features/auth/login/model/useLoginForm";
import { FRONT_ROUTES, type ILoginRequest } from "@/shared";
import { Button } from "@/shared/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/card";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";
import { getApiErrorMessage } from "@/shared/ui/Error";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

function LoginForm() {
  const { login, isLoading } = useLogin();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    field: { errors },
    setError,
  } = useLoginForm();

  const onSubmit = async (values: ILoginRequest) => {
    try {
      await login(values);
      navigate(FRONT_ROUTES.pages.Profile.path);
    } catch (error) {
      const message = getApiErrorMessage(error, t);
      setError("root", { message });
    }
  };
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t("login.title")}</CardTitle>
        <CardDescription>{t("login.subtitle")}</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("login.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("login.emailPlaceholder")}
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("login.passwordLabel")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <p className="text-sm text-destructive">{errors.root.message}</p>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t("login.submit") + "..." : t("login.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
