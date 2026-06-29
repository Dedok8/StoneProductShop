import { baseApi } from "@/shared";
import { API_ROUTES } from "@/shared/config/routes";

import type {
  IApiResponse,
  ICreateProductRequest,
  IPaginated,
  IProduct,
  IProductQuery,
  IUpdateProductRequest,
} from "@/shared/api/types";

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<IPaginated<IProduct>, IProductQuery | void>({
      query: (params) => ({
        url: API_ROUTES.products.getAll,
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: (response: IApiResponse<IPaginated<IProduct>>) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Products" as const,
                id,
              })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    getProductById: build.query<IProduct, string>({
      query: (id) => ({
        url: API_ROUTES.products.byId(id),
        method: "GET",
      }),
      transformResponse: (response: IApiResponse<IProduct>) => response.data,
      providesTags: (_result, _error, id) => [
        { type: "Products" as const, id },
      ],
    }),

    createProduct: build.mutation<IProduct, ICreateProductRequest>({
      query: (body) => ({
        url: API_ROUTES.products.create,
        method: "POST",
        body,
      }),
      transformResponse: (response: IApiResponse<IProduct>) => response.data,
      invalidatesTags: [{ type: "Products" as const, id: "LIST" }],
    }),

    updateProduct: build.mutation<
      IProduct,
      { id: string; body: IUpdateProductRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.products.update(id),
        method: "PATCH",
        body,
      }),
      transformResponse: (response: IApiResponse<IProduct>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Products" as const, id },
      ],
    }),

    deleteProduct: build.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.products.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Products" as const, id },
        { type: "Products" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
