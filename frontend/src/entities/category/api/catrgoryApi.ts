import {
  API_ROUTES,
  baseApi,
  type ICategoryResponse,
  type ICreateCategoryRequest,
  type ISearchCategoryQuery,
  type IUpdateCategoryRequest,
} from "@/shared";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllCategory: build.query<ICategoryResponse[], void>({
      query: () => ({
        url: API_ROUTES.category.getAll,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Category" as const, id })),
              { type: "Category" as const, id: "LIST" },
            ]
          : [{ type: "Category" as const, id: "LIST" }],
    }),

    searchCategory: build.query<ICategoryResponse, ISearchCategoryQuery>({
      query: (params) => ({
        url: API_ROUTES.category.search,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result ? [{ type: "Category" as const, id: result.id }] : [],
    }),

    findCategoryById: build.query<ICategoryResponse, string>({
      query: (id) => ({
        url: API_ROUTES.category.byId(id),
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Category", id }],
    }),

    createCatgory: build.mutation<ICategoryResponse, ICreateCategoryRequest>({
      query: (credentials) => ({
        url: API_ROUTES.category.create,
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    updateCategory: build.mutation<
      ICategoryResponse,
      { id: string; body: IUpdateCategoryRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.category.update(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
    }),

    deleteCategory: build.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.category.delete(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllCategoryQuery,
  useSearchCategoryQuery,
  useFindCategoryByIdQuery,
  useCreateCatgoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
