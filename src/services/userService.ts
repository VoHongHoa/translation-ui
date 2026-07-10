import { apiClient } from './apiClient';
import type { ProfileResponse } from '../types/auth';
import type {
  CreateUserPayload,
  SearchUsersQuery,
  SearchUsersResponse,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UserEntity,
} from '../types/user';

export const userService = {
	// GET /users/me
	getProfile: (): Promise<ProfileResponse> => {
		return apiClient.get('/users/me');
	},

	// POST /users
	createUser: (payload: CreateUserPayload): Promise<UserEntity> => {
		return apiClient.post('/users', payload);
	},

	// GET /users/search
	searchUsers: (query: SearchUsersQuery): Promise<SearchUsersResponse> => {
		return apiClient.get('/users/search', { params: query });
	},

	// PATCH /users/:id
	updateUser: (id: string, payload: UpdateUserPayload): Promise<UserEntity> => {
		return apiClient.patch(`/users/${id}`, payload);
	},

	// PATCH /users/:id/status
	updateUserStatus: (id: string, payload: UpdateUserStatusPayload): Promise<UserEntity> => {
		return apiClient.patch(`/users/${id}/status`, payload);
	},

	// DELETE /users/:id
	deleteUser: (id: string): Promise<void> => {
		return apiClient.delete(`/users/${id}`);
	},
};
