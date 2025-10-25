import { apiSlice } from "@/services/base-query";
import type { Test } from "@/types/tryout/test";

/** =====================
 * Payload Types (API)
 * ===================== */
export type TimerType = string;
export type ScoreType = string; //"irt" | "default"
export type AssessmentType = string; // "irt" | "standard"

/** Payload yang DIKIRIM ke backend saat create/update */
export interface TestPayload {
  title: string;
  sub_title: string | null;
  shuffle_questions: boolean | number; // <- angka sesuai spesifikasi backend
  timer_type: TimerType;
  score_type: ScoreType;

  // kondisional
  total_time?: number; // wajib jika timer_type = 'per_test'
  start_date?: string; // wajib jika score_type = 'irt'
  end_date?: string; // wajib jika score_type = 'irt'

  // field lain (optional, sesuai backend kamu)
  slug?: string;
  description?: string | null;
  total_questions?: number;
  pass_grade?: number;
  assessment_type?: AssessmentType;
  code?: string | null;
  max_attempts?: string | null;
  is_graded?: boolean;
  is_explanation_released?: boolean;
}

/** Untuk update jika backend menerima parsial */
export type TestUpdatePayload = Partial<TestPayload>;

/** =====================
 * Response Types
 * ===================== */
type TestListResponse = {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: Test[];
    last_page: number;
    total: number;
    per_page: number;
  };
};

type TestItemResponse = {
  code: number;
  message: string;
  data: Test;
};

type VoidResponse = {
  code: number;
  message: string;
  data: null;
};

/** =====================
 * API Slice
 * ===================== */
export const testApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all (paginated + optional search)
    getTestList: builder.query<
      {
        data: Test[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      {
        page: number;
        paginate: number;
        search?: string;
        searchBySpecific?: string;
      }
    >({
      query: ({ page, paginate, search, searchBySpecific }) => {
        const qs = new URLSearchParams();
        qs.set("page", String(page));
        qs.set("paginate", String(paginate));
        if (search && search.trim()) qs.set("search", search.trim());
        if (searchBySpecific && searchBySpecific.trim()) {
          qs.set("searchBySpecific", searchBySpecific.trim());
        }
        return {
          url: `/test/tests?${qs.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: TestListResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // ✅ Get by ID
    getTestById: builder.query<Test, number>({
      query: (id) => ({
        url: `/test/tests/${id}`,
        method: "GET",
      }),
      transformResponse: (response: TestItemResponse) => response.data,
    }),

    // ✅ Create (pakai TestPayload)
    createTest: builder.mutation<Test, TestPayload>({
      query: (payload) => ({
        url: `/test/tests`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: TestItemResponse) => response.data,
    }),

    // ✅ Update (pakai TestUpdatePayload)
    updateTest: builder.mutation<
      Test,
      { id: number; payload: TestUpdatePayload }
    >({
      query: ({ id, payload }) => ({
        url: `/test/tests/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: TestItemResponse) => response.data,
    }),

    // ✅ Delete
    deleteTest: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/test/tests/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: VoidResponse) => ({
        code: response.code,
        message: response.message,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTestListQuery,
  useGetTestByIdQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  useDeleteTestMutation,
} = testApi;