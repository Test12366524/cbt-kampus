import { apiSlice } from "@/services/base-query";
import type { TestIRTData } from "@/types/tryout/irt";

// ====== Response Types (sesuai pola API) ======
type TestIRTEnvelope = {
  code: number;
  message: string;
  data: TestIRTData;
};

// Payload POST belum dispesifikkan; gunakan bentuk JSON generic yang aman (tanpa any)
type JsonPayload = Record<string, unknown>;

export const testIrtApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET /test/irt/:test_id
    getTestIRT: builder.query<TestIRTData, number>({
      query: (test_id) => ({
        url: `/test/irt/${test_id}`,
        method: "GET",
      }),
      transformResponse: (response: TestIRTEnvelope) => response.data,
    }),

    // ✅ POST /test/irt/:test_id (mis. untuk trigger perhitungan/rekalkulasi)
    computeTestIRT: builder.mutation<
      TestIRTData,
      { test_id: number; payload?: JsonPayload }
    >({
      query: ({ test_id, payload }) => ({
        url: `/test/irt/${test_id}`,
        method: "POST",
        body: payload ?? {},
      }),
      transformResponse: (response: TestIRTEnvelope) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const { useGetTestIRTQuery, useComputeTestIRTMutation } = testIrtApi;