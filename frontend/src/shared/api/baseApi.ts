import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";

import { logout, setCredentials } from "@/features/auth/api";
import { mainConfig } from "@/shared/config";
import { API_ROUTES } from "@/shared/config/routes";

import type { RootState } from "@/app/store/types/storeTypes";
import type { IUser } from "@/shared/api/types";

const mutex = new Mutex();

interface RefreshResponse {
  user: IUser;
  accessToken: string;
}

const baseQuery = fetchBaseQuery({
  baseUrl: mainConfig.BASE_URL,

  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

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
          const { data } = refreshResult.data as { data: RefreshResponse };

          api.dispatch(
            setCredentials({
              user: data.user,
              accessToken: data.accessToken,
            })
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

  tagTypes: ["Me", "Users", "Categories", "Products", "Orders"],

  endpoints: () => ({}),
});
