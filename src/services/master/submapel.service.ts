import { apiSlice } from "@/services/base-query";
import type { SubMapel } from "@/types/master/submapel";

export const subjectSubApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all (paginated + optional search + optional subject_id filter)
    getSubjectSubList: builder.query<
      {
        data: SubMapel[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string; subject_id?: number }
    >({
      query: ({ page, paginate, search, subject_id }) => {
        const s =
          search && search.trim()
            ? `&search=${encodeURIComponent(search.trim())}`
            : "";
        const sid =
          typeof subject_id === "number" ? `&subject_id=${subject_id}` : "";
        return {
          url: `/master/subject-subs?page=${page}&paginate=${paginate}${s}${sid}`,
          method: "GET",
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: SubMapel[];
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
    getSubjectSubById: builder.query<SubMapel, number>({
      query: (id) => ({
        url: `/master/subject-subs/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: SubMapel;
      }) => response.data,
    }),

    // ✅ Create
    createSubjectSub: builder.mutation<SubMapel, Partial<SubMapel>>({
      query: (payload) => ({
        url: `/master/subject-subs`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: SubMapel;
      }) => response.data,
    }),

    // ✅ Update
    updateSubjectSub: builder.mutation<
      SubMapel,
      { id: number; payload: Partial<SubMapel> }
    >({
      query: ({ id, payload }) => ({
        url: `/master/subject-subs/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: SubMapel;
      }) => response.data,
    }),

    // ✅ Delete
    deleteSubjectSub: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/master/subject-subs/${id}`,
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
  useGetSubjectSubListQuery,
  useGetSubjectSubByIdQuery,
  useCreateSubjectSubMutation,
  useUpdateSubjectSubMutation,
  useDeleteSubjectSubMutation,
} = subjectSubApi;