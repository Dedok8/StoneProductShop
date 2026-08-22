import { API_ROUTES, baseApi } from "@/shared";
import type { IInspirationResponse } from "@/shared/types";

export const inspirationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllInspiration: build.query<IInspirationResponse[], void>({
      query: () => ({
        url: API_ROUTES.inspirationAdmin.getAll,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "InspirationAdmin" as const,
                id,
              })),
              { type: "InspirationAdmin" as const, id: "LIST" },
            ]
          : [{ type: "InspirationAdmin" as const, id: "LIST" }],
    }),
  }),
});
