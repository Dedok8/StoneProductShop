import { useTranslation } from "react-i18next";

import { useUpdateUserRole } from "@/features/adminUser/updateUserRole/model";
import { useQueryState } from "@/shared";
import type { UserRole } from "@/shared/types";

function UpdateUserRole({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: UserRole;
}) {
  const { updateUserRole, isLoading, error, isError } = useUpdateUserRole();
  const { t } = useTranslation();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    if (role === currentRole) return;

    try {
      await updateUserRole(userId, { role });
    } catch (e) {
      //
    }
  };

  const queryState = useQueryState(isLoading, isError, error);

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <select
          value={currentRole}
          onChange={handleChange}
          disabled={isLoading}
          className="rounded-md border border-input bg-transparent py-1.5 pl-2 pr-7 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        >
          <option value="USER">{t("role.USER")}</option>
          <option value="MANAGER">{t("role.MANAGER")}</option>
          <option value="ADMIN">{t("role.ADMIN")}</option>
        </select>
      </div>

      {queryState}
    </div>
  );
}

export default UpdateUserRole;
