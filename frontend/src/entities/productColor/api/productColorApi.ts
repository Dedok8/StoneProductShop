import { API_ROUTES, baseApi } from "@/shared";
import type {
  ICreateProductColorRequest,
  IProductColorResponse,
  IUpdateProductColorRequest,
} from "@/shared/types";

export const productColorApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllProductColor: build.query<IProductColorResponse[], void>({
      query: () => ({
        url: API_ROUTES.productColor.getAll,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "ProductColor" as const,
                id,
              })),
              { type: "ProductColor" as const, id: "LIST" },
            ]
          : [{ type: "ProductColor" as const, id: "LIST" }],
    }),

    findProductColorById: build.query<IProductColorResponse, string>({
      query: (id: string) => ({
        url: API_ROUTES.productColor.byId(id),
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "ProductColor" as const, id },
      ],
    }),

    createProductColor: build.mutation<
      IProductColorResponse,
      ICreateProductColorRequest
    >({
      query: (body) => ({
        url: API_ROUTES.productColor.create,
        method: "POST",
        body: body,
      }),
      invalidatesTags: [{ type: "ProductColor", id: "LIST" }],
    }),

    updateProductColor: build.mutation<
      IProductColorResponse,
      { id: string; body: IUpdateProductColorRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.productColor.update(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ProductColor", id },
        { type: "ProductColor", id: "LIST" },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProductColor: build.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.productColor.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ProductColor", id },
        { type: "ProductColor", id: "LIST" },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllProductColorQuery,
  useFindProductColorByIdQuery,
  useCreateProductColorMutation,
  useUpdateProductColorMutation,
  useDeleteProductColorMutation,
} = productColorApi;
