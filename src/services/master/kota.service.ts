import { apiSlice } from "@/services/base-query";
import {
  Kota,
  KotaResponse,
  CreateKotaRequest,
  UpdateKotaRequest,
} from "@/types/master/kota";

export const kotaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Kota (with pagination)
    getKotaList: builder.query<
      {
        data: Kota[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string; province_id?: string }
    >({
      query: ({ page, paginate, search, province_id }) => ({
        url: `/master/reg/regencies`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
          province_id,
        },
      }),
      transformResponse: (response: KotaResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Kota by ID
    getKotaById: builder.query<Kota, string>({
      query: (id) => ({
        url: `/master/reg/regencies/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kota;
      }) => response.data,
    }),

    // ➕ Create Kota
    createKota: builder.mutation<
      Kota,
      CreateKotaRequest
    >({
      query: (payload) => ({
        url: `/master/reg/regencies`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kota;
      }) => response.data,
    }),

    // ✏️ Update Kota by ID
    updateKota: builder.mutation<
      Kota,
      { id: string; payload: UpdateKotaRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/master/reg/regencies/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Kota;
      }) => response.data,
    }),

    // ❌ Delete Kota by ID
    deleteKota: builder.mutation<
      { code: number; message: string },
      string
    >({
      query: (id) => ({
        url: `/master/reg/regencies/${id}`,
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
  useGetKotaListQuery,
  useGetKotaByIdQuery,
  useCreateKotaMutation,
  useUpdateKotaMutation,
  useDeleteKotaMutation,
} = kotaApi;
