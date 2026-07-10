import { apiClient } from './apiClient';
import type {
  CreateRoleGroupPayload,
  RoleGroupEntity,
  UpdateRoleGroupPayload,
} from '../types/roleGroup';

export const roleGroupService = {
  // POST /role-groups
  createRoleGroup: (payload: CreateRoleGroupPayload): Promise<RoleGroupEntity> => {
    return apiClient.post('/role-groups', payload);
  },

  // GET /role-groups
  getRoleGroups: (): Promise<RoleGroupEntity[]> => {
    return apiClient.get('/role-groups');
  },

  // GET /role-groups/:id
  getRoleGroupById: (id: string): Promise<RoleGroupEntity> => {
    return apiClient.get(`/role-groups/${id}`);
  },

  // PATCH /role-groups/:id
  updateRoleGroup: (id: string, payload: UpdateRoleGroupPayload): Promise<RoleGroupEntity> => {
    return apiClient.patch(`/role-groups/${id}`, payload);
  },

  // DELETE /role-groups/:id
  deleteRoleGroup: (id: string): Promise<void> => {
    return apiClient.delete(`/role-groups/${id}`);
  },
};
