import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import DeleteMe from "@/features/user/deleteMe/ui/DeleteMe";
import { useGetMe } from "@/features/user/getMe/model";
import { FRONT_ROUTES, useQueryState } from "@/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/card";

function GetMe() {
  const { user, error, isLoading, isError } = useGetMe();
  const { t } = useTranslation();

  const queryState = useQueryState(isLoading, isError, error);

  return (
    <Card className="w-full max-w-sm rounded-2xl border border-border/60 shadow-lg shadow-black/5">
      <CardHeader className="space-y-1.5 pb-4">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {t("profile.title", "Profile")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {t("profile.subtitle", "Your account details")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("profile.nameLabel", "Name")}
          </span>
          <span className="text-sm font-medium">{user?.name}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {t("profile.emailLabel", "Email")}
          </span>
          <span className="text-sm font-medium">{user?.email}</span>
        </div>
      </CardContent>

      <CardContent>
        <DeleteMe />
      </CardContent>
      <Link to={FRONT_ROUTES.pages.ChangePassword.path}>
        {t("user.changePassword")}
      </Link>

      {queryState}
    </Card>
  );
}

export default GetMe;
