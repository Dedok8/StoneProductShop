import { baseApi } from "@/shared";
import { API_ROUTES } from "@/shared/config/routes";

import type { IApiResponse, IAuthResponse } from "@/shared/api/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<IAuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: API_ROUTES.auth.login,
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: IApiResponse<IAuthResponse>) => {
        return response.data;
      },
    }),

    logout: build.mutation<void, void>({
      query: () => ({ url: API_ROUTES.auth.logout, method: "POST" }),
    }),

    refresh: build.mutation<IAuthResponse, void>({
      query: () => ({
        url: API_ROUTES.auth.refresh,
        method: "POST",
      }),
      transformResponse: (response: IApiResponse<IAuthResponse>) => {
        return response.data;
      },
    }),

    register: build.mutation<
      IAuthResponse,
      { email: string; password: string; name: string }
    >({
      query: (data) => ({
        url: API_ROUTES.auth.register,
        method: "POST",
        body: data,
      }),
      transformResponse: (response: IApiResponse<IAuthResponse>) => {
        return response.data;
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useRegisterMutation,
} = authApi;
