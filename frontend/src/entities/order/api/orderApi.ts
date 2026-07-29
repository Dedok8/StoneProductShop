import {
  API_ROUTES,
  baseApi,
  type ICreateOrderRequest,
  type IGetOrdersQuery,
  type IOrderResponse,
  type IUpdateOrderStatusRequest,
  type PaginatedOrderResponse,
} from "@/shared";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation<IOrderResponse, ICreateOrderRequest>({
      query: (body) => ({
        url: API_ROUTES.order.create,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),
    getMyOrders: build.query<
      PaginatedOrderResponse,
      Omit<IGetOrdersQuery, "userId">
    >({
      query: (params) => ({
        url: API_ROUTES.order.mine,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Order" as const,
                id,
              })),
              { type: "Order" as const, id: "MY_LIST" },
            ]
          : [{ type: "Order" as const, id: "MY_LIST" }],
    }),

    getOrderById: build.query<IOrderResponse, string>({
      query: (id) => ({
        url: API_ROUTES.order.byId(id),
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

    getAllOrders: build.query<PaginatedOrderResponse, IGetOrdersQuery>({
      query: (params) => ({
        url: API_ROUTES.order.all,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Order" as const,
                id,
              })),
              { type: "Order" as const, id: "LIST" },
            ]
          : [{ type: "Order" as const, id: "LIST" }],
    }),

    updateOrderStatus: build.mutation<
      IOrderResponse,
      { id: string; body: IUpdateOrderStatusRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.order.status(id),
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
        { type: "Order", id: "MY_LIST" },
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = orderApi;
