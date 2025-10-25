import { apiSlice } from "@/services/base-query";
import type { ServiceUpload } from "@/types/bank-questions/questions";

/** Bentuk data yang umum dikembalikan backend upload */
export type ServiceUploadResponse = {
  url: string;
  name?: string;
  size?: number;
  mime?: string;
  path?: string;
};

export const serviceUploadApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Upload file (body: FormData)
    serviceUpload: builder.mutation<ServiceUploadResponse, FormData>({
      query: (formData) => ({
        url: `/service/upload`,
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: ServiceUploadResponse;
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const { useServiceUploadMutation } = serviceUploadApi;

/** Helper: bikin FormData dari interface ServiceUpload */
export function buildServiceUploadFormData(payload: ServiceUpload): FormData {
  const fd = new FormData();
  if (payload.file instanceof File) {
    fd.append("file", payload.file);
  } else if (typeof payload.file === "string" && payload.file) {
    // jika backend menerima base64/URL dalam field "file" (opsional)
    fd.append("file", payload.file);
  }
  return fd;
}