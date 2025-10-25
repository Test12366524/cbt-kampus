import { apiSlice } from "./base-query";
import type {
  User,
  Users,
  UserListFilters,
  PaginatedResponse,
  ItemResponse,
  CreateUserPayload,
  UpdateUserPayload,
  UpdatePasswordPayload,
} from "@/types/user";

function toQueryUsers(filters: UserListFilters = {}): string {
  const q = new URLSearchParams();
  if (filters.paginate != null) q.set("paginate", String(filters.paginate));
  if (filters.search != null) q.set("search", filters.search.trim());
  if (filters.page != null) q.set("page", String(filters.page));
  if (filters.role_id != null) q.set("role_id", String(filters.role_id));
  return q.toString();
}

export const userUsersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsersList: builder.query<
      {
        data: Users[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      UserListFilters | void
    >({
      query: (filters) => {
        const qs = toQueryUsers({ page: 1, paginate: 10, ...filters });
        return { url: `/user/users?${qs}`, method: "GET" };
      },
      transformResponse: (res: PaginatedResponse<Users>) => ({
        data: res.data.data,
        last_page: res.data.last_page,
        current_page: res.data.current_page,
        total: res.data.total,
        per_page: res.data.per_page,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((u) => ({ type: "User" as const, id: u.id })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    getUserById: builder.query<User, number>({
      query: (id) => ({ url: `/user/users/${id}`, method: "GET" }),
      transformResponse: (res: ItemResponse<User>) => res.data,
      providesTags: (_res, _err, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation<User, CreateUserPayload>({
      query: (payload) => ({
        url: `/user/users`,
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      transformResponse: (res: ItemResponse<User>) => res.data,
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation<
      User,
      { id: number; payload: UpdateUserPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/user/users/${id}`,
        method: "PUT",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      transformResponse: (res: ItemResponse<User>) => res.data,
      invalidatesTags: (_res, _err, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({ url: `/user/users/${id}`, method: "DELETE" }),
      transformResponse: (res: {
        code: number;
        message: string;
        data: null;
      }) => ({
        code: res.code,
        message: res.message,
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    updateUserPassword: builder.mutation<
      User,
      { id: number; payload: UpdatePasswordPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/user/users/${id}/password`,
        method: "PUT",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      transformResponse: (res: ItemResponse<User>) => res.data,
      invalidatesTags: (_res, _err, arg) => [{ type: "User", id: arg.id }],
    }),

    validateUserEmail: builder.mutation<User, number>({
      query: (id) => ({
        url: `/user/users/${id}/email`,
        method: "PUT",
        body: {},
      }),
      transformResponse: (res: ItemResponse<User>) => res.data,
      invalidatesTags: (_res, _err, id) => [{ type: "User", id }],
    }),

    validateUserPhone: builder.mutation<User, number>({
      query: (id) => ({
        url: `/user/users/${id}/phone`,
        method: "PUT",
        body: {},
      }),
      transformResponse: (res: ItemResponse<User>) => res.data,
      invalidatesTags: (_res, _err, id) => [{ type: "User", id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersListQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserPasswordMutation,
  useValidateUserEmailMutation,
  useValidateUserPhoneMutation,
} = userUsersApi;