import { API_ROUTES, baseApi } from "@/shared";
import {
  type IProductTypeResponse,
  type ICreateProductTypeRequest,
  type IUpdateProductTypeRequest,
} from "@/shared/types";

export const productTypeApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllProductType: build.query<IProductTypeResponse[], void>({
      query: () => ({
        url: API_ROUTES.productType.getAll,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "ProductType" as const, id })),
              { type: "ProductType" as const, id: "LIST" },
            ]
          : [{ type: "ProductType" as const, id: "LIST" }],
    }),

    findProductTypeById: build.query<IProductTypeResponse, string>({
      query: (id) => ({
        url: API_ROUTES.productType.byId(id),
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "ProductType", id }],
    }),

    createProductType: build.mutation<IProductTypeResponse, ICreateProductTypeRequest>({
      query: (body) => ({
        url: API_ROUTES.productType.create,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ProductType", id: "LIST" }],
    }),

    updateProductType: build.mutation<
      IProductTypeResponse,
      { id: string; body: IUpdateProductTypeRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.productType.update(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ProductType", id },
        { type: "ProductType", id: "LIST" },
        { type: "Product", id: "LIST" }, 
      ],
    }),

    deleteProductType: build.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.productType.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "ProductType", id },
        { type: "ProductType", id: "LIST" },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllProductTypeQuery,
  useFindProductTypeByIdQuery,
  useCreateProductTypeMutation,
  useUpdateProductTypeMutation,
  useDeleteProductTypeMutation,
} = productTypeApi;