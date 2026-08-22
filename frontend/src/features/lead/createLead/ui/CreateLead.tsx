import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  useCreateLead,
  useCreateLeadForm,
  type LeadFormValues,
} from "@/features/lead/createLead/model";
import { Checkbox } from "@/shared/ui/components/checkbox";
import { Input } from "@/shared/ui/components/input";

function CreateLead() {
  const { createLead, isLoading, error, isError } = useCreateLead();
  const { register, handleSubmit, control, errors } = useCreateLeadForm();
  const { t } = useTranslation();

  const onSubmit = async (value: LeadFormValues) => {
    try {
      await createLead(value);
    } catch {
      //
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5 text-background"
    >
      <div className="flex flex-col gap-4">
        <div>
          <Input id="name" {...register("name")} placeholder={t("lead.name")} />
          <p
            className={`mt-1 text-xs text-red-400 ${errors.name ? "" : "invisible"}`}
          >
            {errors.name?.message || "placeholder"}
          </p>
        </div>
        <div>
          <Input
            id="phone"
            {...register("phone")}
            placeholder={t("lead.phone")}
          />
          <p
            className={`mt-1 text-xs text-red-400 ${errors.phone ? "" : "invisible"}`}
          >
            {errors.phone?.message || "placeholder"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <Controller
          name="consent"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="consent"
              checked={field.value}
              onCheckedChange={field.onChange}
              className="mt-0.5"
            />
          )}
        />
        <label htmlFor="consent" className="cursor-pointer text-sm">
          {t("lead.consent")}{" "}
          <a href="/privacy" className="underline">
            {t("lead.pd")}
          </a>
        </label>
      </div>
      <p
        className={`mt-1 text-xs text-red-400 ${errors.consent ? "" : "invisible"}`}
      >
        {errors.consent?.message || "placeholder"}
      </p>

      {isError && (
        <p className="text-xs text-red-400">
          {error instanceof Error
            ? error.message
            : t("lead.submitError", "Something went wrong. Please try again.")}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-emerald-600 p-3 text-sm uppercase text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {isLoading ? t("lead.sending", "Sending...") : t("lead.create")}
      </button>
    </form>
  );
}

export default CreateLead;
