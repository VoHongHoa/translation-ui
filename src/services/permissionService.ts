import { apiClient } from './apiClient';
import type {
  CreatePermissionPayload,
  PermissionEntity,
  UpdatePermissionPayload,
} from '../types/permission';

export const permissionService = {
  // POST /permissions
  createPermission: (payload: CreatePermissionPayload): Promise<PermissionEntity> => {
    return apiClient.post('/permissions', payload);
  },

  // GET /permissions
  getPermissions: (): Promise<PermissionEntity[]> => {
    return apiClient.get('/permissions');
  },

  // GET /permissions/:id
  getPermissionById: (id: string): Promise<PermissionEntity> => {
    return apiClient.get(`/permissions/${id}`);
  },

  // PATCH /permissions/:id
  updatePermission: (id: string, payload: UpdatePermissionPayload): Promise<PermissionEntity> => {
    return apiClient.patch(`/permissions/${id}`, payload);
  },

  // DELETE /permissions/:id
  deletePermission: (id: string): Promise<void> => {
    return apiClient.delete(`/permissions/${id}`);
  },
};
