export interface UserRolePivot {
  model_type: string;
  model_id: number;
  role_id: number;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: UserRolePivot;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
  // opsional – jika backend punya status
  status?: boolean | number;
}

export type Users = User;

export interface ApiPaginated<T> {
  current_page: number;
  data: T[];
  last_page: number;
  total: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: ApiPaginated<T>;
}

export interface ItemResponse<T> {
  code: number;
  message: string;
  data: T;
}

export type UserListFilters = {
  page?: number; // default 1
  paginate?: number; // default 10
  search?: string; // kata kunci
  role_id?: number; // contoh: 2 (student)
};

export type CreateUserPayload = {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  password_confirmation: string;
  role_id: number; // role target saat create (contoh: 2)
  status?: boolean | number; // ⬅️ ditambahkan
};

export type UpdateUserPayload = Partial<{
  name: string;
  email: string;
  phone: string | null;
  role_id: number;
  status: boolean | number; // ⬅️ ditambahkan
}>;

export type UpdatePasswordPayload = {
  password: string;
  password_confirmation: string;
};