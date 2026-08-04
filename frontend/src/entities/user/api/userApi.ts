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
      providesTags: [{ type: "User", id: "ME" }],
    }),

    updateMe: build.mutation<IUserResponse, IUpdateUserRequest>({
      query: (credential) => ({
        url: API_ROUTES.user.updateMe,
        method: "PATCH",
        body: credential,
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    deleteMe: build.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.user.deleteMe,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "ME" }],
    }),

    changeMyPassword: build.mutation<IUserResponse, IChangePasswordRequest>({
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
