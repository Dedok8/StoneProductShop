import { API_ROUTES, baseApi } from "@/shared";
import type {
  ICreateInspiration,
  IInspirationResponse,
  IUpdateInspiration,
} from "@/shared/types";

export const adminInspiration = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllInspiration: build.query<IInspirationResponse[], void>({
      query: () => ({
        url: API_ROUTES.inspirationAdmin.getAll,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "InspirationAdmin" as const,
                id,
              })),
              { type: "InspirationAdmin" as const, id: "LIST" },
            ]
          : [{ type: "InspirationAdmin" as const, id: "LIST" }],
    }),

    createInspiration: build.mutation<IInspirationResponse, ICreateInspiration>(
      {
        query: (credentials) => ({
          url: API_ROUTES.inspirationAdmin.create,
          method: "POST",
          body: credentials,
        }),
        invalidatesTags: [{ type: "InspirationAdmin", id: "LIST" }],
      }
    ),

    updateInspiration: build.mutation<
      IInspirationResponse,
      { id: string; body: IUpdateInspiration }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.inspirationAdmin.update(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "InspirationAdmin", id },
        { type: "InspirationAdmin", id: "LIST" },
      ],
    }),

    deleteInspiration: build.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.inspirationAdmin.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "InspirationAdmin", id },
        { type: "InspirationAdmin", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllInspirationQuery,
  useCreateInspirationMutation,
  useDeleteInspirationMutation,
  useUpdateInspirationMutation,
} = adminInspiration;
