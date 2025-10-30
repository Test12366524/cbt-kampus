import { apiSlice } from "./base-query";
import type { DashboardAdmin } from "@/types/dashboard";

export const dashboardAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardAdmin: builder.query<DashboardAdmin, void>({
      query: () => ({
        url: "/dashboard",
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: DashboardAdmin;
      }) => response.data,
      providesTags: ["DashboardAdmin"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardAdminQuery } = dashboardAdminApi;