import { useTranslation } from "react-i18next";

import { useUploadImage } from "@/features/upload/model";
import { Input } from "@/shared/ui/components/input";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface IUploadImageProps {
  value: string[];
  onChange: (urls: string[]) => void;
  error?: SerializedError | FetchBaseQueryError;
}

function UploadImage({ value, onChange, error }: IUploadImageProps) {
  const { uploadImage, isLoading: isUploading } = useUploadImage();
  const { t } = useTranslation();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => await uploadImage(file))
      );

      onChange([...value, ...uploaded]);
    } catch (e) {
      //
    }
  };

  const handleRemove = async (url: string) => {
    onChange(value.filter((v) => v !== url));
  };

  return (
    <div>
      <Input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        disabled={isUploading || value.length >= 10}
        onChange={(e) => handleFiles(e.target.files)}
        aria-invalid={!!error}
      />

      {isUploading && (
        <p className="text-xs text-stone-500">{t("common.uploading")}</p>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url) => (
            <div
              key={url}
              className="relative size-20 overflow-hidden rounded-md border border-stone-200"
            >
              <img src={url} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                aria-label={t("common.remove")}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UploadImage;
