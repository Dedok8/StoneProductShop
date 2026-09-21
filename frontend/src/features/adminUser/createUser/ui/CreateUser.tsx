import { useTranslation } from "react-i18next";

import {
  useCreateUser,
  useCreateUserForm,
} from "@/features/adminUser/createUser/model";
import { useQueryState } from "@/shared";
import type { ICreateUserRequest } from "@/shared/types";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/components/field";
import { Input } from "@/shared/ui/components/input";

function CreateUser() {
  const { createUser, isLoading, error, isError } = useCreateUser();
  const { register, handleSubmit, errors } = useCreateUserForm();
  const { t } = useTranslation();

  const onSubmit = async (value: ICreateUserRequest) => {
    try {
      await createUser(value);
    } catch (e) {
      console.error(e);
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

      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">{t("user.name")}</FieldLabel>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">{t("user.email")}</FieldLabel>
          <Input
            id="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">{t("auth.password")}</FieldLabel>
          <Input
            id="password"
            type="password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <FieldError>{errors.password.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!errors.role}>
          <FieldLabel htmlFor="role">{t("user.role")}</FieldLabel>
          <select
            id="role"
            aria-invalid={!!errors.role}
            {...register("role")}
            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="USER">{t("role.USER")}</option>
            <option value="MANAGER">{t("role.MANAGER")}</option>
            <option value="ADMIN">{t("role.ADMIN")}</option>
          </select>
          {errors.role && <FieldError>{errors.role.message}</FieldError>}
        </Field>
      </FieldGroup>

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
