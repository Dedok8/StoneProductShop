import { API_ROUTES, baseApi } from "@/shared";
import type {
  ICreateProductOriginRequest,
  IProductOriginResponse,
  IUpdateProductOriginRequest,
} from "@/shared/types";

export const productOriginApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllProductOrigin: build.query<IProductOriginResponse[], void>({
      query: () => ({
        url: API_ROUTES.productOrigin.getAll,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "ProductOrigin" as const,
                id,
              })),
              { type: "ProductOrigin" as const, id: "LIST" },
            ]
          : [{ type: "ProductOrigin" as const, id: "LIST" }],
    }),

    findProductOriginById: build.query<IProductOriginResponse, string>({
      query: (id: string) => ({
        url: API_ROUTES.productOrigin.byId(id),
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "ProductOrigin" as const, id },
      ],
    }),

    createProductOrigin: build.mutation<
      IProductOriginResponse,
      ICreateProductOriginRequest
    >({
      query: (body) => ({
        url: API_ROUTES.productOrigin.create,
        method: "POST",
        body: body,
      }),
      invalidatesTags: [{ type: "ProductOrigin", id: "LIST" }],
    }),

    updateProductOrigin: build.mutation<
      IProductOriginResponse,
      { id: string; body: IUpdateProductOriginRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.productOrigin.update(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ProductOrigin", id },
        { type: "ProductOrigin", id: "LIST" },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProductOrigin: build.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.productOrigin.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ProductOrigin", id },
        { type: "ProductOrigin", id: "LIST" },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllProductOriginQuery,
  useFindProductOriginByIdQuery,
  useCreateProductOriginMutation,
  useUpdateProductOriginMutation,
  useDeleteProductOriginMutation,
} = productOriginApi;
