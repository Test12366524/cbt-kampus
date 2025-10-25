import { apiSlice } from "@/services/base-query";
import type { Class } from "@/types/master/class";

export const classApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all (paginated + optional search)
    getClassList: builder.query<
      {
        data: Class[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("paginate", String(paginate));
        if (search && search.trim()) params.set("search", search.trim());
        return {
          url: `master/class?${params.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Class[];
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
    getClassById: builder.query<Class, number>({
      query: (id) => ({
        url: `master/class/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Class;
      }) => response.data,
    }),

    // ✅ Create
    createClass: builder.mutation<Class, Partial<Class>>({
      query: (payload) => ({
        url: `master/class`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Class;
      }) => response.data,
    }),

    // ✅ Update
    updateClass: builder.mutation<
      Class,
      { id: number; payload: Partial<Class> }
    >({
      query: ({ id, payload }) => ({
        url: `master/class/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Class;
      }) => response.data,
    }),

    // ✅ Delete
    deleteClass: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `master/class/${id}`,
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
  useGetClassListQuery,
  useGetClassByIdQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} = classApi;