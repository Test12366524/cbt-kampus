import { apiSlice } from "@/services/base-query";

export interface ExportTestPayload {
  test_id: number;
}

// sesuai response backend kamu
export interface ExportTestResponse {
  code: number;
  message: string;
  data: string;
}

export const testExportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    exportTest: builder.mutation<ExportTestResponse, ExportTestPayload>({
      query: (body) => ({
        url: `/test/export`,
        method: "POST",
        body,
      }),
      transformResponse: (res: ExportTestResponse) => res,
    }),
  }),
  overrideExisting: false,
});

export const { useExportTestMutation } = testExportApi;