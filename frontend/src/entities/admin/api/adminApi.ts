import { baseApi } from "@/shared";

export const adminApi = baseApi.injectEndpoints({
  endpoints:(build) => ({
    getAllUsers:build.query<>
  }),
})