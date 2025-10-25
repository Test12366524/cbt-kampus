import { apiSlice } from "@/services/base-query";
import {
  Provinsi,
  ProvinsiResponse,
  CreateProvinsiRequest,
  UpdateProvinsiRequest,
} from "@/types/master/provinsi";

export const provinsiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Provinsi (with pagination)
    getProvinsiList: builder.query<
      {
        data: Provinsi[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number; search?: string }
    >({
      query: ({ page, paginate, search }) => ({
        url: `/master/reg/provinces`,
        method: "GET",
        params: {
          page,
          paginate,
          search,
        },
      }),
      transformResponse: (response: ProvinsiResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Provinsi by ID
    getProvinsiById: builder.query<Provinsi, string>({
      query: (id) => ({
        url: `/master/reg/provinces/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Provinsi;
      }) => response.data,
    }),

    // ➕ Create Provinsi
    createProvinsi: builder.mutation<
      Provinsi,
      CreateProvinsiRequest
    >({
      query: (payload) => ({
        url: `/master/reg/provinces`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Provinsi;
      }) => response.data,
    }),

    // ✏️ Update Provinsi by ID
    updateProvinsi: builder.mutation<
      Provinsi,
      { id: string; payload: UpdateProvinsiRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/master/reg/provinces/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Provinsi;
      }) => response.data,
    }),

    // ❌ Delete Provinsi by ID
    deleteProvinsi: builder.mutation<
      { code: number; message: string },
      string
    >({
      query: (id) => ({
        url: `/master/reg/provinces/${id}`,
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
  useGetProvinsiListQuery,
  useGetProvinsiByIdQuery,
  useCreateProvinsiMutation,
  useUpdateProvinsiMutation,
  useDeleteProvinsiMutation,
} = provinsiApi;
