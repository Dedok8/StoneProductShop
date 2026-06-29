import { baseApi } from "@/shared";
import { API_ROUTES } from "@/shared/config/routes";

import type {
  IApiResponse,
  ICreateOrderRequest,
  IOrder,
  IOrderQuery,
  IPaginated,
  IUpdateOrderStatusRequest,
} from "@/shared/api/types";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation<IOrder, ICreateOrderRequest>({
      query: (body) => ({
        url: API_ROUTES.orders.create,
        method: "POST",
        body,
      }),
      transformResponse: (response: IApiResponse<IOrder>) => response.data,
      invalidatesTags: [{ type: "Orders" as const, id: "LIST" }],
    }),

    getMyOrders: build.query<IPaginated<IOrder>, IOrderQuery | void>({
      query: (params) => ({
        url: API_ROUTES.orders.mine,
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: (response: IApiResponse<IPaginated<IOrder>>) =>
        response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "Orders" as const, id })),
              { type: "Orders" as const, id: "LIST" },
            ]
          : [{ type: "Orders" as const, id: "LIST" }],
    }),

    getAllOrders: build.query<IPaginated<IOrder>, IOrderQuery | void>({
      query: (params) => ({
        url: API_ROUTES.orders.all,
        method: "GET",
        params: params ?? {},
      }),
      transformResponse: (response: IApiResponse<IPaginated<IOrder>>) =>
        response.data,
      providesTags: [{ type: "Orders" as const, id: "LIST" }],
    }),

    getOrderById: build.query<IOrder, string>({
      query: (id) => ({
        url: API_ROUTES.orders.byId(id),
        method: "GET",
      }),
      transformResponse: (response: IApiResponse<IOrder>) => response.data,
      providesTags: (_result, _error, id) => [{ type: "Orders" as const, id }],
    }),

    cancelOrder: build.mutation<IOrder, string>({
      query: (id) => ({
        url: API_ROUTES.orders.cancel(id),
        method: "PATCH",
      }),
      transformResponse: (response: IApiResponse<IOrder>) => response.data,
      invalidatesTags: (_result, _error, id) => [
        { type: "Orders" as const, id },
      ],
    }),

    updateOrderStatus: build.mutation<
      IOrder,
      { id: string; body: IUpdateOrderStatusRequest }
    >({
      query: ({ id, body }) => ({
        url: API_ROUTES.orders.status(id),
        method: "PATCH",
        body,
      }),
      transformResponse: (response: IApiResponse<IOrder>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Orders" as const, id },
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useUpdateOrderStatusMutation,
} = orderApi;
