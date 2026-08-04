import { useTranslation } from "react-i18next";

import {
  useCreateUser,
  useCreateUserForm,
} from "@/features/admin/createUser/model";
import type { ICreateUserRequest } from "@/shared";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function CreateUser() {
  const { createUser, isLoading, error, isError } = useCreateUser();
  const {
    register,
    handleSubmit,
    field: { errors },
  } = useCreateUserForm();
  const { t } = useTranslation();

  const onSubmit = async (value: ICreateUserRequest) => {
    try {
      await createUser(value);
    } catch (e) {
      //
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("name")} placeholder={t("user.name")} />
      {errors.name && <span>{errors.name.message}</span>}

      <Input {...register("email")} placeholder={t("user.email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <Input
        {...register("password")}
        type="password"
        placeholder={t("auth.password")}
      />
      {errors.password && <span>{errors.password.message}</span>}

      <select {...register("role")}>
        <option value="USER">{t("role.USER")}</option>
        <option value="MANAGER">{t("role.MANAGER")}</option>
        <option value="ADMIN">{t("role.ADMIN")}</option>
      </select>
      {errors.role && <span>{errors.role.message}</span>}

      {isError && <div>{getApiErrorMessage(error, t)}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? t("common.loading") : t("admin.createUser")}
      </button>
    </form>
  );
}

export default CreateUser;
