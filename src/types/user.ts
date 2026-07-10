export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

export interface RoleGroup {
  id: string;
  code: string;
  name: string;
  description: string | null;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface UserEntity {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roleGroups: RoleGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  fullName: string;
  roleGroupIds?: string[];
}

export interface SearchUsersQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  isActive?: boolean;
}

export interface SearchUsersResponse {
  items: UserEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateUserPayload {
  email?: string;
  fullName?: string;
  isActive?: boolean;
  roleGroupIds?: string[];
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}