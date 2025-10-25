import { apiSlice } from "./base-query";
import { Setting } from "@/types/settings";

export const settingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get general setting
    getGeneralSetting: builder.query<Setting, void>({
      query: () => `/setting/general`,
      transformResponse: (response: {
        code: number;
        message: string;
        data: Setting;
      }) => response.data,
    }),

    // ✅ Update general setting
    updateGeneralSetting: builder.mutation<
      Setting,
      Partial<Setting> // hanya kirim data yang mau diubah
    >({
      query: (payload) => ({
        url: `/setting/general`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Setting;
      }) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const { useGetGeneralSettingQuery, useUpdateGeneralSettingMutation } =
  settingApi;
