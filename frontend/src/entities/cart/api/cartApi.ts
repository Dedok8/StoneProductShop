import {
  API_ROUTES,
  baseApi,
  type IAddCartItemRequest,
  type ICartResponse,
  type IUpdateCartItemRequest,
} from "@/shared";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<ICartResponse, void>({
      query: () => ({
        url: API_ROUTES.cart.get,
        method: "GET",
      }),
      providesTags: [{ type: "Cart", id: "MY_CART" }],
    }),

    getUserCartAsAdmin: build.query<ICartResponse, string>({
      query: (userId) => ({
        url: API_ROUTES.cart.getCartAsAdmin(userId),
        method: "GET",
      }),
      providesTags: (_result, _error, userId) => [{ type: "Cart", id: userId }],
    }),

    addCartItem: build.mutation<ICartResponse, IAddCartItemRequest>({
      query: (body) => ({
        url: API_ROUTES.cart.addItem,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Cart", id: "MY_CART" }],
    }),

    updateCartItem: build.mutation<
      ICartResponse,
      { productId: string; body: IUpdateCartItemRequest }
    >({
      query: ({ productId, body }) => ({
        url: API_ROUTES.cart.updateItem(productId),
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Cart", id: "MY_CART" }],
    }),

    removeCartItem: build.mutation<ICartResponse, string>({
      query: (productId) => ({
        url: API_ROUTES.cart.removeItem(productId),
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Cart", id: "MY_CART" }],
    }),

    clearCart: build.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.cart.clear,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Cart", id: "MY_CART" }],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;
