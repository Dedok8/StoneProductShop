import { API_ROUTES, baseApi } from "@/shared";
import {
  type IAddCartItemRequest,
  type ICartResponse,
  type IUpdateCartItemRequest,
} from "@/shared/types";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<ICartResponse, string>({
      query: () => ({
        url: API_ROUTES.cart.get,
        method: "GET",
      }),
      providesTags: (_result, _error, userId) => [{ type: "Cart", id: userId }],
    }),

    getUserCartAsAdmin: build.query<ICartResponse, string>({
      query: (userId) => ({
        url: API_ROUTES.cart.getCartAsAdmin(userId),
        method: "GET",
      }),
      providesTags: (_result, _error, userId) => [{ type: "Cart", id: userId }],
    }),

    addCartItem: build.mutation<
      ICartResponse,
      IAddCartItemRequest & { userId: string }
    >({
      query: ({ userId: _userId, ...body }) => ({
        url: API_ROUTES.cart.addItem,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Cart", id: userId },
      ],
    }),

    updateCartItem: build.mutation<
      ICartResponse,
      { userId: string; productId: string; body: IUpdateCartItemRequest }
    >({
      query: ({ productId, body }) => ({
        url: API_ROUTES.cart.updateItem(productId),
        method: "PATCH",
        body,
      }),
      async onQueryStarted(
        { userId, productId, body },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          cartApi.util.updateQueryData("getCart", userId, (draft) => {
            const item = draft.items.find((i) => i.productId === productId);
            if (item && body.quantity !== undefined)
              item.quantity = body.quantity;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Cart", id: userId },
      ],
    }),

    removeCartItem: build.mutation<
      ICartResponse,
      { userId: string; productId: string }
    >({
      query: ({ productId }) => ({
        url: API_ROUTES.cart.removeItem(productId),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Cart", id: userId },
      ],
    }),

    clearCart: build.mutation<void, string>({
      query: () => ({
        url: API_ROUTES.cart.clear,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: "Cart", id: userId },
      ],
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
