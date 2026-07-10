import { apiClient } from './apiClient';
import {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from '../types/auth';

export const authService = {
  // POST /auth/login
  login: (payload: LoginPayload): Promise<LoginResponse> => {
    return apiClient.post('/auth/login', payload);
  },

  // POST /auth/register
  register: (payload: RegisterPayload): Promise<RegisterResponse> => {
    return apiClient.post('/auth/register', payload);
  }
};