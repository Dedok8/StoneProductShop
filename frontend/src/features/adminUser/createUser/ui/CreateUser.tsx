import { useTranslation } from "react-i18next";

import {
  useCreateUser,
  useCreateUserForm,
} from "@/features/adminUser/createUser/model";
import { useQueryState } from "@/shared";
import type { ICreateUserRequest } from "@/shared/types";
import { Input } from "@/shared/ui/components/input";

function CreateUser() {
  const { createUser, isLoading, error, isError } = useCreateUser();
  const { register, handleSubmit, errors } = useCreateUserForm();
  const { t } = useTranslation();

  const onSubmit = async (value: ICreateUserRequest) => {
    try {
      await createUser(value);
    } catch (e) {
      //
    }
  };

  const queryState = useQueryState(isLoading, isError, error);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex max-w-md flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-foreground">
        {t("admin.createUser")}
      </h2>

      <div className="flex flex-col gap-1.5">
        <Input {...register("name")} placeholder={t("user.name")} />
        {errors.name && (
          <span className="text-sm text-destructive">
            {errors.name.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Input {...register("email")} placeholder={t("user.email")} />
        {errors.email && (
          <span className="text-sm text-destructive">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Input
          {...register("password")}
          type="password"
          placeholder={t("auth.password")}
        />
        {errors.password && (
          <span className="text-sm text-destructive">
            {errors.password.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <select
          {...register("role")}
          className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="USER">{t("role.USER")}</option>
          <option value="MANAGER">{t("role.MANAGER")}</option>
          <option value="ADMIN">{t("role.ADMIN")}</option>
        </select>
        {errors.role && (
          <span className="text-sm text-destructive">
            {errors.role.message}
          </span>
        )}
      </div>

      {queryState}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading ? t("common.loading") : t("admin.createUser")}
      </button>
    </form>
  );
}

export default CreateUser;
