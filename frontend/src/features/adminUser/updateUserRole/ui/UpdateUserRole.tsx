import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useUpdateUserRole } from "@/features/adminUser/updateUserRole/model";
import type { UserRole } from "@/shared/types";
import { getApiErrorMessage } from "@/shared/ui/Error";

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

        {isLoading && (
          <Loader2 className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isError && (
        <span className="text-xs text-destructive">
          {getApiErrorMessage(error, t)}
        </span>
      )}
    </div>
  );
}

export default UpdateUserRole;
