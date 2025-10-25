import { apiSlice } from "./base-query";
import type {
  User,
  CreateUserPayload,
  Role,
  PaginatedResponse,
} from "@/types/user";

/* =========================
   ROLE TYPES & HELPERS
========================= */
export type RoleListFilters = {
  page?: number;
  paginate?: number;
  search?: string;
};

export type CreateRolePayload = {
  name: string;
  guard_name: string;
};

function toQueryRoles(filters: RoleListFilters = {}) {
  const q = new URLSearchParams();
  if (filters.paginate != null) q.set("paginate", String(filters.paginate));
  if (filters.page != null) q.set("page", String(filters.page));
  if (filters.search != null) q.set("search", filters.search.trim());
  return q.toString();
}

/* =========================
   API SLICE
========================= */
export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ===== USERS ===== */
    createUser: builder.mutation<User, CreateUserPayload>({
      query: (newUser) => ({
        url: "/user",
        method: "POST",
        body: newUser,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: User;
      }) => response.data,
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    getUsers: builder.query<
      { code: number; data: { data: User[]; last_page: number } },
      { page: number; paginate: number; search?: string; search_by?: string }
    >({
      query: ({ page, paginate, search = "", search_by = "name" }) => ({
        url: `/user?paginate=${paginate}&page=${page}&search=${search}&search_by=${search_by}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        data: { data: User[]; last_page: number };
      }) => response,
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map((u) => ({
                type: "User" as const,
                id: u.id,
              })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    updateUser: builder.mutation<
      User,
      { id: number; payload: Partial<CreateUserPayload> }
    >({
      query: ({ id, payload }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      transformResponse: (response: { code: number; data: User }) =>
        response.data,
      invalidatesTags: (_res, _err, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({ url: `/user/${id}`, method: "DELETE" }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({
        code: response.code,
        message: response.message,
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    updateUserStatus: builder.mutation<
      User,
      { id: number; payload: Partial<User> }
    >({
      query: ({ id, payload }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: "User", id: arg.id }],
    }),

    /* ===== ROLES ===== */

    // LIST dengan filters dan response diratakan
    getRoles: builder.query<
      {
        data: Role[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      RoleListFilters | void
    >({
      query: (filters) => {
        const qs = toQueryRoles({ page: 1, paginate: 10, ...filters });
        return { url: `/role/roles?${qs}`, method: "GET" };
      },
      transformResponse: (response: PaginatedResponse<Role>) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((r) => ({ type: "Role" as const, id: r.id })),
              { type: "Role" as const, id: "LIST" },
            ]
          : [{ type: "Role" as const, id: "LIST" }],
    }),

    getRoleById: builder.query<Role, number>({
      query: (id) => ({ url: `/role/roles/${id}`, method: "GET" }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Role;
      }) => response.data,
      providesTags: (_res, _err, id) => [{ type: "Role", id }],
    }),

    createRole: builder.mutation<Role, CreateRolePayload>({
      query: (newRole) => ({
        url: `/role/roles`,
        method: "POST",
        body: newRole,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Role;
      }) => response.data,
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    updateRole: builder.mutation<
      Role,
      { id: number; payload: Partial<CreateRolePayload> }
    >({
      query: ({ id, payload }) => ({
        url: `/role/roles/${id}`,
        method: "PUT",
        body: payload,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Role;
      }) => response.data,
      invalidatesTags: (_res, _err, arg) => [
        { type: "Role", id: arg.id },
        { type: "Role", id: "LIST" },
      ],
    }),

    deleteRole: builder.mutation<{ code: number; message: string }, number>({
      query: (id) => ({ url: `/role/roles/${id}`, method: "DELETE" }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => ({
        code: response.code,
        message: response.message,
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Role", id },
        { type: "Role", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  // users
  useCreateUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateUserStatusMutation,
  // roles
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = usersApi;