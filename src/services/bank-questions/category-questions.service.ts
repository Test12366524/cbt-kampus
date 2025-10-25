import { apiSlice } from "@/services/base-query";
import type { CategoryQuestion } from "@/types/bank-questions/category-questions";

export const questionCategoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all (paginated + optional search)
    getQuestionCategoryList: builder.query<
      {
        data: CategoryQuestion[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => {
        const s =
          search && search.trim()
            ? `&search=${encodeURIComponent(search.trim())}`
            : "";
        return {
          url: `/master/question-categories?page=${page}&paginate=${paginate}${s}`,
          method: "GET",
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: CategoryQuestion[];
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

    // ✅ Get by ID
    getQuestionCategoryById: builder.query<CategoryQuestion, number>({
      query: (id) => ({
        url: `/master/question-categories/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: CategoryQuestion;
      }) => response.data,
    }),

    // ✅ Create
    createQuestionCategory: builder.mutation<
      CategoryQuestion,
      Partial<CategoryQuestion>
    >({
      query: (payload) => ({
        url: `/master/question-categories`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: CategoryQuestion;
      }) => response.data,
    }),

    // ✅ Update
    updateQuestionCategory: builder.mutation<
      CategoryQuestion,
      { id: number; payload: Partial<CategoryQuestion> }
    >({
      query: ({ id, payload }) => ({
        url: `/master/question-categories/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: CategoryQuestion;
      }) => response.data,
    }),

    // ✅ Delete
    deleteQuestionCategory: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/master/question-categories/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({ code: response.code, message: response.message }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuestionCategoryListQuery,
  useGetQuestionCategoryByIdQuery,
  useCreateQuestionCategoryMutation,
  useUpdateQuestionCategoryMutation,
  useDeleteQuestionCategoryMutation,
} = questionCategoryApi;