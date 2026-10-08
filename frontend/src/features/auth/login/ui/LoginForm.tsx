import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { useLogin } from "@/features/auth/login/model/useLogin";
import { useLoginForm } from "@/features/auth/login/model/useLoginForm";
import { FRONT_ROUTES } from "@/shared";
import type { ILoginRequest } from "@/shared/types";
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

function LoginForm() {
  const { login, isLoading } = useLogin();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, handleSubmit, errors, setError } = useLoginForm();

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
    <Card className="w-full max-w-sm rounded-2xl border border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {t("login.title")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("login.subtitle")}
        </CardDescription>
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
              className="rounded-lg"
              {...register("email")}
            />
            <p
              className={`text-xs text-red-500 min-h-[1rem] ${errors.email ? "" : "invisible"}`}
            >
              {errors.email?.message || "placeholder"}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">{t("login.passwordLabel")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("login.passwordPlaceholder")}
              aria-invalid={!!errors.password}
              className="rounded-lg"
              {...register("password")}
            />
            <p
              className={`text-xs text-red-500 min-h-[1rem] ${errors.password ? "" : "invisible"}`}
            >
              {errors.password?.message || "placeholder"}
            </p>
          </div>

          {errors.root && (
            <p className="text-sm text-destructive text-center">
              {errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg py-5 font-medium"
          >
            {isLoading ? t("login.submit") + "..." : t("login.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
