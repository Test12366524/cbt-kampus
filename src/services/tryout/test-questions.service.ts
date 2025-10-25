import { apiSlice } from "@/services/base-query";
import type { TestQuestion } from "@/types/tryout/test-questions";

export const testQuestionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // List pertanyaan yang SUDAH dipilih dalam test_category tsb
    getTestQuestionList: builder.query<
      {
        data: TestQuestion[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      {
        test_id: number;
        test_question_category_id: number; // ← ini = row.id dari tabel "questions-category" di test
        page: number;
        paginate: number;
        search?: string;
      }
    >({
      query: ({
        test_id,
        test_question_category_id,
        page,
        paginate,
        search,
      }) => {
        const s =
          search && search.trim()
            ? `&search=${encodeURIComponent(search.trim())}`
            : "";
        // ⚠️ URL sesuai backend-mu
        return {
          url: `/test/${test_id}/${test_question_category_id}/questions?page=${page}&paginate=${paginate}${s}`,
          method: "GET",
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: TestQuestion[];
          last_page: number;
          total: number;
          per_page: number;
        };
      }) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // Tambah pertanyaan ke kategori test tertentu
    createTestQuestion: builder.mutation<
      { inserted: number }, // sesuaikan bila backend return beda
      {
        test_id: number;
        test_question_category_id: number; // ← pakai row.id (relasi di test), BUKAN question_category_id global
        payload: { question_ids: number[] };
      }
    >({
      query: ({ test_id, test_question_category_id, payload }) => ({
        // ⚠️ URL sesuai backend-mu
        url: `/test/${test_id}/${test_question_category_id}/questions`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data?: { inserted: number };
      }) => response.data ?? { inserted: 0 },
    }),
  }),
  overrideExisting: false,
});

export const { useGetTestQuestionListQuery, useCreateTestQuestionMutation } =
  testQuestionApi;