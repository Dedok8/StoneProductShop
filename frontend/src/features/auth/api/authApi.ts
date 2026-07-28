import {
  API_ROUTES,
  baseApi,
  type IAccessTokenResponse,
  type ILoginRequest,
  type IRegisterRequest,
} from "@/shared";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<IAccessTokenResponse, ILoginRequest>({
      query: (credentials) => ({
        url: API_ROUTES.auth.login,
        method: "POST",
        body: credentials,
      }),
    }),

    logout: build.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.auth.logout,
        method: "POST",
      }),
    }),

    refresh: build.mutation<IAccessTokenResponse, void>({
      query: () => ({
        url: API_ROUTES.auth.refresh,
        method: "POST",
      }),
    }),

    register: build.mutation<IAccessTokenResponse, IRegisterRequest>({
      query: (data) => ({
        url: API_ROUTES.auth.register,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useRegisterMutation,
} = authApi;
