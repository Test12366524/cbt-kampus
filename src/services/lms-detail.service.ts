import { apiSlice } from "./base-query";
import type { LmsDetail } from "@/types/lms-detail";

interface GetLmsDetailsParams {
  page: number;
  paginate: number;
  search?: string;
  subject_id?: number;
  subject_sub_id?: number;
  lms_id?: number;
}

export const lmsDetailApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ GET all LMS Details (paginated + filters)
    getLmsDetails: builder.query<
      {
        data: LmsDetail[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      GetLmsDetailsParams
    >({
      query: ({
        page,
        paginate,
        search = "",
        subject_id,
        subject_sub_id,
        lms_id,
      }) => ({
        url: "/lms/details",
        method: "GET",
        params: { page, paginate, search, subject_id, subject_sub_id, lms_id },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: LmsDetail[];
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

    // ✅ GET by ID
    getLmsDetailById: builder.query<LmsDetail, number>({
      query: (id) => ({
        url: `/lms/details/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: LmsDetail;
      }) => response.data,
    }),

    // ✅ CREATE (pakai FormData karena ada field "file")
    createLmsDetail: builder.mutation<LmsDetail, FormData>({
      query: (formData) => ({
        url: "/lms/details",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: LmsDetail;
      }) => response.data,
    }),

    // ✅ UPDATE (PUT via POST + _method=PUT)
    updateLmsDetail: builder.mutation<
      LmsDetail,
      { id: number; payload: FormData }
    >({
      query: ({ id, payload }) => ({
        url: `/lms/details/${id}?_method=PUT`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: LmsDetail;
      }) => response.data,
    }),

    // ✅ DELETE
    deleteLmsDetail: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/lms/details/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLmsDetailsQuery,
  useGetLmsDetailByIdQuery,
  useCreateLmsDetailMutation,
  useUpdateLmsDetailMutation,
  useDeleteLmsDetailMutation,
} = lmsDetailApi;