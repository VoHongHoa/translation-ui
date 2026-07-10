import { apiClient } from './apiClient';
import {
  GoogleLoginPayload,
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
  },

  // POST /auth/google-login
  googleLogin: (payload: GoogleLoginPayload): Promise<LoginResponse> => {
    return apiClient.post('/auth/google-login', payload);
  },
};