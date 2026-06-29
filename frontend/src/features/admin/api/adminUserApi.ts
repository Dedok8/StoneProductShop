import { baseApi } from "@/shared";
import { API_ROUTES } from "@/shared/config/routes";

import type {
  IApiResponse,
  IUpdateUserRequest,
  IUser,
} from "@/shared/api/types";

export const adminUserApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUsers: build.query<IUser[], void>({
      query: () => ({
        url: API_ROUTES.adminUser.getAll,
        method: "GET",
      }),
      transformResponse: (response: IApiResponse<IUser[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Users" as const, id })),
              { type: "Users" as const, id: "LIST" },
            ]
          : [{ type: "Users" as const, id: "LIST" }],
    }),

    getUserById: build.query<IUser, string>({
      query: (id) => ({
        url: API_ROUTES.adminUser.byId(id),
        method: "GET",
      }),
    }),

    updateUser: build.mutation<
      IUser,
      { id: string; credentials: IUpdateUserRequest }
    >({
      query: ({ id, credentials }) => ({
        url: API_ROUTES.adminUser.update(id),
        method: "PATCH",
        body: credentials,
      }),
      transformResponse: (response: IApiResponse<IUser>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Users" as const, id },
      ],
    }),

    deleteUser: build.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.adminUser.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Users" as const, id },
        { type: "Users" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = adminUserApi;
