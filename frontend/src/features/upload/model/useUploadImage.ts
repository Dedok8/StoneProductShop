import { useCreateUploadMutation } from "@/entities";

export const useUploadImage = () => {
  const [createUploadMutation, { isLoading, error, isError }] =
    useCreateUploadMutation();

  async function uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);

    const { url } = await createUploadMutation(formData).unwrap();
    return url;
  }

  return { uploadImage, isLoading, error, isError };
};
