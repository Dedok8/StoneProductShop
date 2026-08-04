import { useUpdateUserRole } from "@/features/admin/updateUserRole/model";
import type { UserRole } from "@/shared";
import { getApiErrorMessage } from "@/shared/ui/Error";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

function UpdateUserRole() {
  const { id } = useParams<{ id: string }>();
  const { updateUserRole, isLoading, error, isError } = useUpdateUserRole();
  const { t } = useTranslation();
  const [role, setRole] = useState<UserRole>("USER");

  const handleUpdateUserRole: React.SubmitEventHandler<
    HTMLFormElement
  > = async (e) => {
    e.preventDefault();

    if (!id) return;
    const userId: string = id;

    try {
      await updateUserRole(userId, { role });
    } catch (e) {
      //
    }
  };

  return (
    <form onSubmit={handleUpdateUserRole}>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
      >
        <option value="USER">{t("role.USER")}</option>
        <option value="MANAGER">{t("role.MANAGER")}</option>
        <option value="ADMIN">{t("role.ADMIN")}</option>
      </select>

      {isError && <div>{getApiErrorMessage(error, t)}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? t("common.loading") : t("admin.changeRole")}
      </button>
    </form>
  );
}

export default UpdateUserRole;
