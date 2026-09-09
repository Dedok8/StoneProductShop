import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useCreateUploadMutation } from "@/entities";
import { useFindInspirationById } from "@/features/inspiration/findInspirationById/model";
import { useUpdateInspiration } from "@/features/inspiration/updateInspiration/model/useUpdateInspiration";
import { useQueryState } from "@/shared";
import type { IInspirationResponse } from "@/shared/types";
import { Input } from "@/shared/ui/components/input";

function UpdateInspiration() {
  const { id } = useParams<{ id: string }>();


  const {
    inspiration,
    isLoading: isInspirationLoading,
    isError: isInspirationError,
    error: inspirationError,
  } = useFindInspirationById(id);

  const queryState = useQueryState(
    isInspirationLoading,
    isInspirationError,
    inspirationError
  );

  if (queryState) return queryState;
  if (!inspiration) return null;
  return <UpdateInspirationForm inspiration={inspiration} />;
}

function UpdateInspirationForm({
  inspiration,
}: {
  inspiration: IInspirationResponse;
}) {
  const {
    updateInspiration,
    isLoading: isUpdating,
    error,
    isError,
  } = useUpdateInspiration();
  const [createUpload, { isLoading: isUploading }] = useCreateUploadMutation();
  const { t } = useTranslation();

  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState(inspiration.alt);

  const previewUrl = useMemo(() => {
    if (!file) return inspiration.imageUrl;
    return URL.createObjectURL(file);
  }, [file, inspiration.imageUrl]);

  const isChanged = !!file || alt !== inspiration.alt;
  const isLoading = isUpdating || isUploading;

  const handleUpdate: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!isChanged) return;

    const changes: Partial<{ imageUrl: string; alt: string }> = {};

    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      const { url } = await createUpload(formData).unwrap();
      changes.imageUrl = url;
    }

    if (alt !== inspiration.alt) changes.alt = alt;

    try {
      await updateInspiration(inspiration.id, changes);
    } catch (e) {
      //
    }
  };

  return (
    <form onSubmit={handleUpdate}>
      <div>
        <label htmlFor="image">{t("inspiration.image")}</label>
        <Input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            style={{ maxWidth: 200, marginTop: 8 }}
          />
        )}
      </div>

      <div>
        <label htmlFor="alt">{t("inspiration.alt")}</label>
        <Input id="alt" value={alt} onChange={(e) => setAlt(e.target.value)} />
      </div>

      {isError && <p>{error?.toString()}</p>}

      <button type="submit" disabled={isLoading || !isChanged}>
        {t("inspiration.save")}
      </button>
    </form>
  );
}

export default UpdateInspiration;
