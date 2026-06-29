import { baseApi } from "@/shared";
import { API_ROUTES } from "@/shared/config/routes";

import type {
  IApiResponse,
  ICategory,
  ICategoryQuery,
  ICreateCategoryRequest,
  IUpdateCategoryRequest,
} from "@/shared/api/types";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCategories: build.query<ICategory[], ICategoryQuery | void>({
      query: (params) => ({
        url: API_ROUTES.category.getAll,
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: (response: IApiResponse<ICategory[]>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Categories" as const, id })),
              { type: "Categories" as const, id: "LIST" },
            ]
          : [{ type: "Categories" as const, id: "LIST" }],
    }),

    getCategoryById: build.query<ICategory, string>({
      query: (id) => ({
        url: API_ROUTES.category.byId(id),
        method: "GET",
      }),
      transformResponse: (response: IApiResponse<ICategory>) => response.data,
      providesTags: (_result, _error, id) => [
        { type: "Categories" as const, id },
      ],
    }),

    createCategory: build.mutation<ICategory, ICreateCategoryRequest>({
      query: (body) => ({
        url: API_ROUTES.category.create,
        method: "POST",
        body,
      }),
      transformResponse: (response: IApiResponse<ICategory>) => response.data,
      invalidatesTags: [{ type: "Categories" as const, id: "LIST" }],
    }),

    updateCategory: build.mutation<
      ICategory,
      { id: string; body: IUpdateCategoryRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.category.update(id),
        method: "PATCH",
        body,
      }),
      transformResponse: (response: IApiResponse<ICategory>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Categories" as const, id },
      ],
    }),

    deleteCategory: build.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.category.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Categories" as const, id },
        { type: "Categories" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
