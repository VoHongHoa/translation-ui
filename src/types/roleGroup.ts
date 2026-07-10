import type { PermissionEntity } from './permission';

export interface RoleGroupEntity {
  id: string;
  code: string;
  name: string;
  description: string | null;
  permissions: PermissionEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleGroupPayload {
  code: string;
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleGroupPayload {
  code?: string;
  name?: string;
  description?: string;
  permissionIds?: string[];
}
