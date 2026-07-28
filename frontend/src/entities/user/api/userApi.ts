import {
  API_ROUTES,
  baseApi,
  type IChangePasswordRequest,
  type IUpdateUserRequest,
  type IUserResponse,
} from "@/shared";

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<IUserResponse, void>({
      query: () => ({
        url: API_ROUTES.user.getMe,
        method: "GET",
      }),
    }),

    updateMe: build.mutation<IUserResponse, IUpdateUserRequest>({
      query: (credential) => ({
        url: API_ROUTES.user.updateMe,
        method: "PATCH",
        body: credential,
      }),
    }),

    deleteMe: build.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.user.deleteMe,
        method: "DELETE",
      }),
    }),

    changeMyPassword: build.mutation<void, IChangePasswordRequest>({
      query: (credential) => ({
        url: API_ROUTES.user.changePassword,
        method: "PATCH",
        body: credential,
      }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useDeleteMeMutation,
  useChangeMyPasswordMutation,
} = userApi;
