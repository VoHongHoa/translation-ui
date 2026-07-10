import { apiClient } from './apiClient';
import type {
  UpdateUserQuotaPayload,
  UserQuotaEntity,
  UserQuotaUsageEntity,
} from '../types/quota';

export const quotaService = {
  // GET /users/:id/quota
  getUserQuota: (userId: string): Promise<UserQuotaEntity> => {
    return apiClient.get(`/users/${userId}/quota`);
  },

  // PATCH /users/:id/quota
  updateUserQuota: (userId: string, payload: UpdateUserQuotaPayload): Promise<UserQuotaEntity> => {
    return apiClient.patch(`/users/${userId}/quota`, payload);
  },

  // GET /users/:id/quota/usage
  getUserQuotaUsage: (userId: string, from?: string, to?: string): Promise<UserQuotaUsageEntity[]> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    const queryString = params.toString();
    const url = queryString ? `/users/${userId}/quota/usage?${queryString}` : `/users/${userId}/quota/usage`;
    return apiClient.get(url);
  },

  // DELETE /users/:id/quota/usage/:date
  resetUserQuotaUsageByDate: (userId: string, date: string): Promise<void> => {
    return apiClient.delete(`/users/${userId}/quota/usage/${date}`);
  },
};
