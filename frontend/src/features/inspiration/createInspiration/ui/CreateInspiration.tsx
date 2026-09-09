import { ImagePlus } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useCreateInspiration } from "@/features/inspiration/createInspiration/model/useCreateInspiration";
import { useCreateInspirationForm } from "@/features/inspiration/createInspiration/model/useCreateInspirationForm";
import { useQueryState } from "@/shared";
import type { IInspirationFormValues } from "@/shared/types";
import { Input } from "@/shared/ui/components/input";

function CreateInspiration() {
  const { createInspiration, isLoading, error, isError } =
    useCreateInspiration();
  const { register, handleSubmit, errors, watch } = useCreateInspirationForm();
  const { t } = useTranslation();

  const imageValue = watch("image");
  const file = imageValue instanceof FileList ? imageValue[0] : imageValue;

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const onSubmit = async (value: IInspirationFormValues) => {
    try {
      await createInspiration(value);
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
        {t("inspiration.create")}
      </h2>

      <div className="flex flex-col items-center gap-3">
        <label
          htmlFor="image"
          className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground transition-colors hover:bg-muted/40"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-sm">{t("inspiration.image")}</span>
            </>
          )}
        </label>
        <Input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          {...register("image")}
        />
        {errors.image && (
          <p className="text-sm text-destructive">{errors.image.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="alt" className="text-sm font-medium text-foreground">
          {t("inspiration.alt")}
        </label>
        <Input id="alt" {...register("alt")} />
        {errors.alt && (
          <p className="text-sm text-destructive">{errors.alt.message}</p>
        )}
      </div>

      {queryState}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {t("inspiration.create")}
      </button>
    </form>
  );
}

export default CreateInspiration;
