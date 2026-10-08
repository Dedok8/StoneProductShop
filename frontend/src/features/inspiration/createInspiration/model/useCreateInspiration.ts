import {
  useCreateInspirationMutation,
  useCreateUploadMutation,
} from "@/entities";
import type { IInspirationFormValues } from "@/shared/types";

export const useCreateInspiration = () => {
  const [
    createInspirationMutation,
    { isLoading: isCreating, error: createError, isError: isCreateError },
  ] = useCreateInspirationMutation();
  const [
    createUploadMutation,
    { isLoading: isUploading, error: uploadError, isError: isUploadError },
  ] = useCreateUploadMutation();

  async function createInspiration(credential: IInspirationFormValues) {
    const file =
      credential.image instanceof FileList
        ? credential.image[0]
        : credential.image;

    if (!file) throw new Error("Image is required");

    const formData = new FormData();
    formData.append("image", file);

    const { url } = await createUploadMutation(formData).unwrap();

    const data = await createInspirationMutation({
      imageUrl: url,
      alt: credential.alt,
    }).unwrap();

    return data;
  }

  return {
    createInspiration,
    isLoading: isCreating || isUploading,
    error: createError || uploadError,
    isError: isCreateError || isUploadError,
  };
};
