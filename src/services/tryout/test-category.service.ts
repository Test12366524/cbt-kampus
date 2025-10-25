import { apiSlice } from "@/services/base-query";
import type { TestCategory } from "@/types/tryout/test-category";

// === Response types ===
type TestCategoryListResponse = {
  code: number;
  message: string;
  data: {
    current_page: number;
    data: TestCategory[];
    last_page: number;
    total: number;
    per_page: number;
  };
};

type TestCategoryItemResponse = {
  code: number;
  message: string;
  data: TestCategory;
};

type VoidResponse = {
  code: number;
  message: string;
  data: null;
};

export const testCategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all (paginated + optional search) untuk test tertentu
    getTestCategoryList: builder.query<
      {
        data: TestCategory[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { test_id: number; page: number; paginate: number; search?: string }
    >({
      query: ({ test_id, page, paginate, search }) => {
        const s =
          search && search.trim()
            ? `&search=${encodeURIComponent(search.trim())}`
            : "";
        return {
          url: `/test/${test_id}/question-categories?page=${page}&paginate=${paginate}${s}`,
          method: "GET",
        };
      },
      transformResponse: (response: TestCategoryListResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // ✅ Get by ID (dalam konteks test tertentu)
    getTestCategoryById: builder.query<
      TestCategory,
      { test_id: number; id: number }
    >({
      query: ({ test_id, id }) => ({
        url: `/test/${test_id}/question-categories/${id}`,
        method: "GET",
      }),
      transformResponse: (response: TestCategoryItemResponse) => response.data,
    }),

    // ✅ Create (dalam konteks test tertentu)
    createTestCategory: builder.mutation<
      TestCategory,
      { test_id: number; payload: Partial<TestCategory> }
    >({
      query: ({ test_id, payload }) => ({
        url: `/test/${test_id}/question-categories`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: TestCategoryItemResponse) => response.data,
    }),

    // ✅ Update (dalam konteks test tertentu)
    updateTestCategory: builder.mutation<
      TestCategory,
      { test_id: number; id: number; payload: Partial<TestCategory> }
    >({
      query: ({ test_id, id, payload }) => ({
        url: `/test/${test_id}/question-categories/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: TestCategoryItemResponse) => response.data,
    }),

    // ✅ Delete (dalam konteks test tertentu)
    deleteTestCategory: builder.mutation<
      { code: number; message: string },
      { test_id: number; id: number }
    >({
      query: ({ test_id, id }) => ({
        url: `/test/${test_id}/question-categories/${id}`,
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
  useGetTestCategoryListQuery,
  useGetTestCategoryByIdQuery,
  useCreateTestCategoryMutation,
  useUpdateTestCategoryMutation,
  useDeleteTestCategoryMutation,
} = testCategoryApi;