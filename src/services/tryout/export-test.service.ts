import { apiSlice } from "@/services/base-query";

export interface ExportTestPayload {
  test_id: number;
}

export const testExportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Export file (Blob)
    exportTest: builder.mutation<Blob, ExportTestPayload>({
      query: (body) => ({
        url: `/test/export`,
        method: "POST",
        body,
        responseHandler: async (response) => await response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useExportTestMutation } = testExportApi;