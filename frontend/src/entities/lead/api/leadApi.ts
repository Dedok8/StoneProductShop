import {
  API_ROUTES,
  baseApi,
  type ICreateLead,
  type IGetLeadQuery,
  type ILeadsResponse,
  type paginatedLeadResponse,
} from "@/shared";

export const leadApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllLead: build.query<paginatedLeadResponse, IGetLeadQuery>({
      query: (param) => ({
        url: API_ROUTES.lead.getAll,
        method: "GET",
        params: param ?? undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Lead" as const,
                id,
              })),
              {
                type: "Lead" as const,
                id: "LIST",
              },
            ]
          : [{ type: "Lead" as const, id: "LIST" }],
    }),

    createLead: build.mutation<ILeadsResponse, ICreateLead>({
      query: (credential) => ({
        url: API_ROUTES.lead.create,
        method: "POST",
        body: credential,
      }),
      invalidatesTags: [{ type: "Lead", id: "LIST" }],
    }),
  }),
});

export const { useGetAllLeadQuery, useCreateLeadMutation } = leadApi;
