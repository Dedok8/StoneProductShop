import {
  API_ROUTES,
  baseApi,
  type ICreateProductRequest,
  type IGetProductsQuery,
  type IProductResponse,
  type IUpdateProductRequest,
  type PaginatedProductResponse,
} from "@/shared";

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllProduct: build.query<
      PaginatedProductResponse, 
      IGetProductsQuery | void
    >({
      query: (params) => ({
        url: API_ROUTES.product.getAll,
        method: "GET",
        params: params ?? undefined, 
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Product" as const,
                id,
              })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    findProductById: build.query<IProductResponse, string>({
      query: (id) => ({
        url: API_ROUTES.product.byId(id),
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Product", id }],
    }),

    createProduct: build.mutation<IProductResponse, ICreateProductRequest>({
      query: (credentials) => ({
        url: API_ROUTES.product.create,
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),

    updateProduct: build.mutation<
      IProductResponse,
      { id: string; body: IUpdateProductRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.product.update(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: build.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.product.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllProductQuery,
  useFindProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;