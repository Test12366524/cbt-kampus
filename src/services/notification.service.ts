import { apiSlice } from "./base-query";
import { Notification } from "@/types/notification";

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all notifications (with paginasi)
    getNotifications: builder.query<
      {
        data: Notification[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) =>
        `/notification?paginate=${paginate}&page=${page}`,
      transformResponse: (response: {
        code: number;
        message: string;
        data: {
          current_page: number;
          data: Notification[];
          last_page: number;
          total: number;
          per_page: number;
        };
      }) => ({
        data: response.data.data,
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // ✅ Get notification by ID
    getNotificationById: builder.query<Notification, string>({
      query: (id) => `/notification/${id}`,
      transformResponse: (response: {
        code: number;
        message: string;
        data: Notification;
      }) => response.data,
    }),

    // ✅ Mark notification as read
    markNotificationAsRead: builder.mutation<
      { message: string },
      { id: string }
    >({
      query: (payload) => ({
        url: `/notification/mark-as-read`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({
        message: response.message,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useMarkNotificationAsReadMutation,
} = notificationApi;
