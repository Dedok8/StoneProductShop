import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useChangePassword } from "@/features/user/changePassword/model";
import { Button } from "@/shared/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/card";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";
import { getApiErrorMessage } from "@/shared/ui/Error";

function ChangePassword() {
  const { changePassword, isLoading, error, isError } = useChangePassword();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();

    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      //
    }
  };

  return (
    <Card className="w-full max-w-sm rounded-2xl border border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {t("password.title", "Change password")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("password.subtitle", "Update your account password")}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleChangePassword}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="currentPassword"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              {t("password.current")}
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t("password.current")}
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="newPassword"
              className="text-xs uppercase tracking-wide text-muted-foreground"
            >
              {t("password.new")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("password.new")}
              autoComplete="new-password"
              minLength={8}
              maxLength={64}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+"
              title={t(
                "password.requirements",
                "8–64 characters, must include lowercase, uppercase, and a digit"
              )}
              required
            />
          </div>

          {isError && (
            <div className="text-sm text-destructive">
              {getApiErrorMessage(error, t)}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t("password.changing") : t("password.change")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default ChangePassword;
