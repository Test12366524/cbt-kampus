import { apiSlice } from "@/services/base-query";
import type { Student } from "@/types/student";

/** ================== TYPES ================== */

export type StudentRead = Omit<
  Student,
  "status" | "password" | "password_confirmation"
> & {
  status: boolean; // normalisasi dari boolean | 0 | 1
};

export type StudentCreatePayload = Pick<
  Student,
  "school_id" | "class_id" | "name" | "email" | "phone" | "role_id"
> & {
  status: boolean;
  password: string;
  password_confirmation: string;
};

export type StudentUpdatePayload = Partial<
  Omit<StudentCreatePayload, "password" | "password_confirmation">
> & {
  password?: string;
  password_confirmation?: string;
};

export type StudentImportPayload = {
  file: File;
};

export type StudentExportPayload = Partial<{
  from_date: string;
  to_date: string;
  school_id: number;
  class_id: number;
}>;

/** Template file URL (langsung siap digunakan untuk link download) */
export const STUDENT_IMPORT_TEMPLATE_URL =
  "https://api-cbt.naditechno.id/student-import.csv";

/** ================== SERVICE ================== */

export const studentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all (paginated + optional search + optional role_id + optional searchBySpecific)
    getStudentList: builder.query<
      {
        data: StudentRead[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      {
        page: number;
        paginate: number;
        search?: string;
        role_id?: number;
        searchBySpecific?: "school_id" | "class_id" | "status";
      }
    >({
      query: ({ page, paginate, search, role_id, searchBySpecific }) => {
        const params: string[] = [
          `page=${page}`,
          `paginate=${paginate}`,
          `search=${encodeURIComponent((search ?? "").trim())}`,
        ];

        if (typeof role_id === "number") {
          params.push(`role_id=${role_id}`);
        }

        if (searchBySpecific) {
          params.push(
            `searchBySpecific=${encodeURIComponent(searchBySpecific)}`
          );
        }

        return {
          url: `/user/students?${params.join("&")}`,
          method: "GET",
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Array<
            Omit<StudentRead, "status"> & { status: boolean | 0 | 1 }
          >;
          last_page: number;
          total: number;
          per_page: number;
        };
      }) => ({
        data: response.data.data.map((it) => ({ ...it, status: !!it.status })),
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // ✅ Get by ID
    getStudentById: builder.query<StudentRead, number>({
      query: (id) => ({
        url: `/user/students/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Omit<StudentRead, "status"> & { status: boolean | 0 | 1 };
      }) => ({ ...response.data, status: !!response.data.status }),
    }),

    // ✅ Create
    createStudent: builder.mutation<StudentRead, StudentCreatePayload>({
      query: (payload) => ({
        url: `/user/students`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Omit<StudentRead, "status"> & { status: boolean | 0 | 1 };
      }) => ({ ...response.data, status: !!response.data.status }),
    }),

    // ✅ Update
    updateStudent: builder.mutation<
      StudentRead,
      { id: number; payload: StudentUpdatePayload }
    >({
      query: ({ id, payload }) => ({
        url: `/user/students/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Omit<StudentRead, "status"> & { status: boolean | 0 | 1 };
      }) => ({ ...response.data, status: !!response.data.status }),
    }),

    // ✅ Delete
    deleteStudent: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({
        url: `/user/students/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({
        code: response.code,
        message: response.message,
      }),
    }),

    // 🆕 Template Excel (mengembalikan URL template untuk dipakai langsung di <a href=...>)
    getStudentImportTemplate: builder.query<string, void>({
      // Tidak perlu request ke server karena URL sudah statis dari requirement
      queryFn: async () => ({ data: STUDENT_IMPORT_TEMPLATE_URL }),
    }),

    // 🆕 Import Excel (POST /user/students/import) — body: file
    importStudents: builder.mutation<
      { code: number; message: string },
      StudentImportPayload
    >({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/user/students/import`,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data?: unknown;
      }) => ({
        code: response.code,
        message: response.message,
      }),
    }),

    // 🆕 Export Excel (POST /user/students/export) — body: filter optional
    exportStudents: builder.mutation<
      { code: number; message: string; data: string },
      StudentExportPayload | void
    >({
      query: (payload) => {
        const clean: Record<string, string | number> = {};
        if (payload && payload.from_date) clean.from_date = payload.from_date;
        if (payload && payload.to_date) clean.to_date = payload.to_date;
        if (payload && typeof payload.school_id === "number")
          clean.school_id = payload.school_id;
        if (payload && typeof payload.class_id === "number")
          clean.class_id = payload.class_id;

        return {
          url: `/user/students/export`,
          method: "POST",
          body: Object.keys(clean).length ? clean : {},
        };
      },
      transformResponse: (response: {
        code: number;
        message: string;
        data: string; // "Export process has been started. You will be notified once it is complete."
      }) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudentListQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetStudentImportTemplateQuery,
  useImportStudentsMutation,
  useExportStudentsMutation,
} = studentApi;