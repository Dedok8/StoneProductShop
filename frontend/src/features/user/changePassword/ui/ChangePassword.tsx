import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useChangePassword } from "@/features/user/changePassword/model";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function ChangePassword() {
  const { changePassword, isLoading, error, isError } = useChangePassword();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangePassword: React.SubmitEventHandler<
    HTMLFormElement
  > = async (e) => {
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
    <form onSubmit={handleChangePassword}>
      <label>
        {t("password.current")}
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => e.target.value}
          placeholder={t("password.current")}
          autoComplete="Current password"
          required
        />
      </label>
      <label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => e.target.value}
          placeholder={t("password.new")}
          autoComplete="New password"
          minLength={8}
          maxLength={64}
          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+"
          title={t(
            "password.requirements",
            "8–64 characters, must include lowercase, uppercase, and a digit"
          )}
          required
        />
      </label>

      {isError && <div>{getApiErrorMessage(error, t)}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? t("password.changing") : t("password.change")}
      </button>
    </form>
  );
}

export default ChangePassword;
