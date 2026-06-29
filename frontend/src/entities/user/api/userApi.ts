import { baseApi } from "@/shared";
import { API_ROUTES } from "@/shared/config/routes";

import type {
  IApiResponse,
  IUpdateUserRequest,
  IUser,
} from "@/shared/api/types";

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<IUser, void>({
      query: () => ({
        url: API_ROUTES.user.getMe,
        method: "GET",
      }),

      transformResponse: (response: IApiResponse<IUser>) => response.data,
      providesTags: ["Me"],
    }),
    updateMe: build.mutation<IUser, IUpdateUserRequest>({
      query: (credentials) => ({
        url: API_ROUTES.user.updateMe,
        method: "PATCH",
        body: credentials,
      }),
      transformResponse: (response: IApiResponse<IUser>) => response.data,
      invalidatesTags: ["Me"],
    }),
    deleteMe: build.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.user.deleteMe,
        method: "DELETE",
      }),
      invalidatesTags: ["Me"],
    }),
  }),
});

export const { useGetMeQuery, useUpdateMeMutation, useDeleteMeMutation } =
  userApi;
