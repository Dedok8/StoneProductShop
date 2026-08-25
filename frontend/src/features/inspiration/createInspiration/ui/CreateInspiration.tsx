import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useCreateInspiration } from "@/features/inspiration/createInspiration/model/useCreateInspiration";
import { useCreateInspirationForm } from "@/features/inspiration/createInspiration/model/useCreateInspirationForm";
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="image">{t("inspiration.image")}</label>
        <Input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          {...register("image")}
        />
        {errors.image && <p>{errors.image.message}</p>}
      </div>

      <div>
        <label htmlFor="alt">{t("inspiration.alt")}</label>
        <Input id="alt" {...register("alt")} />
        {errors.alt && <p>{errors.alt.message}</p>}
      </div>

      {isError && <p>{error?.toString()}</p>}

      {previewUrl && (
        <img
          src={previewUrl}
          alt="preview"
          style={{ maxWidth: 200, marginTop: 8 }}
        />
      )}

      <button type="submit" disabled={isLoading}>
        {t("inspiration.create")}
      </button>
    </form>
  );
}

export default CreateInspiration;
