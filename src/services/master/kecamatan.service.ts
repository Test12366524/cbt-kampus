import { apiSlice } from "@/services/base-query";
import {
  Kecamatan,
  KecamatanResponse,
  CreateKecamatanRequest,
  UpdateKecamatanRequest,
} from "@/types/master/kecamatan";

export const kecamatanApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Kecamatan (with pagination)
    getKecamatanList: builder.query<
      {
        data: Kecamatan[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string; regency_id?: string }
    >({
      query: ({ page, paginate, search, regency_id }) => ({
        url: `/master/reg/districts`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
          regency_id
        },
      }),
      transformResponse: (response: KecamatanResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Kecamatan by ID
    getKecamatanById: builder.query<Kecamatan, string>({
      query: (id) => ({
        url: `/master/reg/districts/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kecamatan;
      }) => response.data,
    }),

    // ➕ Create Kecamatan
    createKecamatan: builder.mutation<
      Kecamatan,
      CreateKecamatanRequest
    >({
      query: (payload) => ({
        url: `/master/reg/districts`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kecamatan;
      }) => response.data,
    }),

    // ✏️ Update Kecamatan by ID
    updateKecamatan: builder.mutation<
      Kecamatan,
      { id: string; payload: UpdateKecamatanRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/master/reg/districts/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kecamatan;
      }) => response.data,
    }),

    // ❌ Delete Kecamatan by ID
    deleteKecamatan: builder.mutation<
      { code: number; message: string },
      string
    >({
      query: (id) => ({
        url: `/master/reg/districts/${id}`,
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
  useGetKecamatanListQuery,
  useGetKecamatanByIdQuery,
  useCreateKecamatanMutation,
  useUpdateKecamatanMutation,
  useDeleteKecamatanMutation,
} = kecamatanApi;
