import { apiSlice } from "@/services/base-query";
import type { Mapel } from "@/types/master/mapel";


export const subjectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all (paginated + optional search)
    getSubjectList: builder.query<
      {
        data: Mapel[];
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
          url: `/master/subjects?page=${page}&paginate=${paginate}${s}`,
          method: "GET",
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Mapel[];
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
    getSubjectById: builder.query<Mapel, number>({
      query: (id) => ({
        url: `/master/subjects/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Mapel;
      }) => response.data,
    }),

    // ✅ Create
    createSubject: builder.mutation<Mapel, Partial<Mapel>>({
      query: (payload) => ({
        url: `/master/subjects`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Mapel;
      }) => response.data,
    }),

    // ✅ Update
    updateSubject: builder.mutation<
      Mapel,
      { id: number; payload: Partial<Mapel> }
    >({
      query: ({ id, payload }) => ({
        url: `/master/subjects/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Mapel;
      }) => response.data,
    }),

    // ✅ Delete
    deleteSubject: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/master/subjects/${id}`,
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
  useGetSubjectListQuery,
  useGetSubjectByIdQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectApi;