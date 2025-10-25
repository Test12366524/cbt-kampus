import { apiSlice } from "@/services/base-query";
import type { School } from "@/types/master/school";

export const schoolApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all (paginated + optional search)
    getSchoolList: builder.query<
      {
        data: School[];
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
          url: `/master/schools?page=${page}&paginate=${paginate}${s}`,
          method: "GET",
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: School[];
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
    getSchoolById: builder.query<School, number>({
      query: (id) => ({
        url: `/master/schools/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: School;
      }) => response.data,
    }),

    // ✅ Create
    createSchool: builder.mutation<School, Partial<School>>({
      query: (payload) => ({
        url: `/master/schools`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: School;
      }) => response.data,
    }),

    // ✅ Update
    updateSchool: builder.mutation<
      School,
      { id: number; payload: Partial<School> }
    >({
      query: ({ id, payload }) => ({
        url: `/master/schools/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: School;
      }) => response.data,
    }),

    // ✅ Delete
    deleteSchool: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/master/schools/${id}`,
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
  useGetSchoolListQuery,
  useGetSchoolByIdQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
} = schoolApi;