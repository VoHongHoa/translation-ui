export interface PermissionEntity {
  id: string;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionPayload {
  code: string;
  name: string;
  description?: string;
}

export interface UpdatePermissionPayload {
  code?: string;
  name?: string;
  description?: string;
}