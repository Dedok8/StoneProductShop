import { useTranslation } from "react-i18next";

import { useGetMe } from "@/features/user/getMe/model";
import { getApiErrorMessage } from "@/shared/ui/Error";

function GetMe() {
  const { user, error, isLoading, isError } = useGetMe();
  const { t } = useTranslation();
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return (
    <div>
      <div>{user?.name}</div>
      <div>{user?.email}</div>
    </div>
  );
}

export default GetMe;
