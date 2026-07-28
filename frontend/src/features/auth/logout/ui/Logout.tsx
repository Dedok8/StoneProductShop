import { useLogout } from "@/features/auth/logout/model/useLogout";
import { FRONT_ROUTES } from "@/shared";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import { Button } from "@/shared/ui/components/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/components/alert-dialog";

function Logout() {
  const { logout, isLoading } = useLogout();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleConfirm = async () => {
    await logout();
    navigate(FRONT_ROUTES.pages.Login.path);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="outline">{t("logout.submit")}</Button>}
      />

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("logout.confirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("logout.confirmMessage")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading}>
            {t("logout.submit")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default Logout;
