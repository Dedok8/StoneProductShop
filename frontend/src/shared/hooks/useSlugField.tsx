import { useEffect, useState } from "react";

import { slugify } from "@/shared";

import type {
  FieldPathByValue,
  FieldValues,
  PathValue,
  UseFormSetValue,
} from "react-hook-form";

export function useSlugField<
  TFieldValues extends FieldValues,
  TSlugField extends FieldPathByValue<TFieldValues, string>,
>(
  nameValue: string | undefined,
  setValue: UseFormSetValue<TFieldValues>,
  slugFieldName: TSlugField
) {
  const [isSlugTouched, setIsSlugTouched] = useState(false);

  const applySlug = () => {
    setValue(
      slugFieldName,
      slugify(nameValue ?? "") as PathValue<TFieldValues, TSlugField>,
      { shouldValidate: true }
    );
  };

  useEffect(() => {
    if (!isSlugTouched) applySlug();
  }, [nameValue, isSlugTouched, setValue, slugFieldName]);

  const onSlugChange = () => setIsSlugTouched(true);

  const resetSlug = () => {
    setIsSlugTouched(false);
    applySlug();
  };

  return { isSlugTouched, onSlugChange, resetSlug };
}
