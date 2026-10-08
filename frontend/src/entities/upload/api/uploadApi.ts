import { API_ROUTES, baseApi } from "@/shared";
import type { IUploadResponse } from "@/shared/types";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createUpload: build.mutation<IUploadResponse, FormData>({
      query: (formData) => ({
        url: API_ROUTES.upload.createUpload,
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const { useCreateUploadMutation } = uploadApi;
