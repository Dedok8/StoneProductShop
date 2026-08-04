import {
  API_ROUTES,
  baseApi,
  type ICreateUserRequest,
  type IGetUsersQuery,
  type IUpdateUserRequest,
  type IUpdateUserRoleRequest,
  type IUserResponse,
  type PaginatedUsersResponse,
} from "@/shared";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUsers: build.query<PaginatedUsersResponse, IGetUsersQuery | void>({
      query: (params) => ({
        url: API_ROUTES.adminUser.getAll,
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Admin" as const,
                id,
              })),
              { type: "Admin" as const, id: "LIST" },
            ]
          : [{ type: "Admin" as const, id: "LIST" }],
    }),

    findUserByEmail: build.query<IUserResponse, string>({
      query: (email) => ({
        url: API_ROUTES.adminUser.search,
        method: "GET",
        params: { email },
      }),
      providesTags: (result) =>
        result ? [{ type: "Admin" as const, id: result.id }] : [],
    }),

    findUserById: build.query<IUserResponse, string>({
      query: (id) => ({
        url: API_ROUTES.adminUser.byId(id),
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Admin", id }],
    }),

    createUser: build.mutation<IUserResponse, ICreateUserRequest>({
      query: (credentials) => ({
        url: API_ROUTES.adminUser.create,
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: [{ type: "Admin", id: "LIST" }],
    }),

    updateUser: build.mutation<
      IUserResponse,
      { id: string; body: IUpdateUserRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.adminUser.byId(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Admin", id },
        { type: "Admin", id: "LIST" },
      ],
    }),

    updateUserRole: build.mutation<
      IUserResponse,
      { id: string; body: IUpdateUserRoleRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.adminUser.role(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Admin", id },
        { type: "Admin", id: "LIST" },
      ],
    }),

    deleteUser: build.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.adminUser.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Admin", id },
        { type: "Admin", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useFindUserByEmailQuery,
  useFindUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = adminApi;
