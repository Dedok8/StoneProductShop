import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import type { RegisterFormValues } from "@/entities";
import {
  useRegistration,
  useRegistrationForm,
} from "@/features/auth/registration/model";
import { FRONT_ROUTES } from "@/shared";
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

function RegistrationForm() {
  const { registration, isLoading } = useRegistration();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register, handleSubmit, errors, setError } = useRegistrationForm();

  const onSubmit = async (values: RegisterFormValues) => {
    const { confirmPassword, ...payload } = values;

    try {
      await registration(payload);
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
          {t("registration.title")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("registration.subtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("registration.nameLabel")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("registration.namePlaceholder")}
              autoComplete="name"
              aria-invalid={!!errors.name}
              className="rounded-lg"
              {...register("name")}
            />
            <p
              className={`text-xs text-red-500 min-h-[1rem] ${errors.name ? "" : "invisible"}`}
            >
              {errors.name?.message || "placeholder"}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("registration.emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("registration.emailPlaceholder")}
              autoComplete="email"
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
            <Label htmlFor="password">{t("registration.passwordLabel")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("registration.passwordPlaceholder")}
              autoComplete="new-password"
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">
              {t("registration.confirmPasswordLabel")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t("registration.confirmPasswordPlaceholder")}
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              className="rounded-lg"
              {...register("confirmPassword")}
            />
            <p
              className={`text-xs text-red-500 min-h-[1rem] ${errors.confirmPassword ? "" : "invisible"}`}
            >
              {errors.confirmPassword?.message || "placeholder"}
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
            {isLoading
              ? t("registration.submit") + "..."
              : t("registration.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default RegistrationForm;
