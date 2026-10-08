import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

import { API_ROUTES, mainConfig } from "@/shared/config";
import { logout, setCredentials, type IUserSlice } from "@/shared/redux";
import type { IAccessTokenResponse } from "@/shared/types";

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: mainConfig.BASE_URL,

  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth: IUserSlice }).auth.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQuery: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.data && typeof result.data === "object" && "data" in result.data) {
    return { ...result, data: (result.data as { data: unknown }).data };
  }

  return result;
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);

  if (
    result.error?.status === 401 &&
    typeof args !== "string" &&
    args.url !== API_ROUTES.auth.refresh
  ) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const refreshResult = await baseQuery(
          {
            url: API_ROUTES.auth.refresh,
            method: "POST",
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const data = refreshResult.data as IAccessTokenResponse;
          api.dispatch(
            setCredentials({ user: data.user, accessToken: data.accessToken })
          );

          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();

      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: baseQueryWithReauth,

  tagTypes: [
    "Auth",
    "Me",
    "User",
    "Category",
    "Product",
    "Order",
    "Admin",
    "Cart",
    "Lead",
    "InspirationAdmin",
    "Inspiration",
    "Upload",
    "ProductOrigin",
    "ProductColor",
    "ProductType",
  ],

  endpoints: () => ({}),
});
