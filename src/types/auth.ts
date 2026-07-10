import type { UserEntity } from './user';

// Dữ liệu trả về từ API khi Login thành công (AuthResponseDto)
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

// Dữ liệu gửi lên khi Login (LoginDto)
export interface LoginPayload {
  email: string;
  password: string;
}

// Dữ liệu gửi lên khi Register (RegisterDto)
export interface RegisterPayload {
  email: string;
  fullName: string;
  password: string;
}

// Dữ liệu trả về khi Register thành công
export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
}

export interface ProfileQuota {
  dailyRequestLimit: number;
  dailyCharacterLimit: number;
  maxCharacterPerRequest: number;
}

export interface ProfileUsage {
  usageDate: string;
  googleRequestCount: number;
  characterCount: number;
  cacheHitCount: number;
  remainingDailyRequest: number;
  remainingDailyCharacter: number;
}

export interface ProfileResponse {
  user: UserEntity;
  quota: ProfileQuota;
  usage: ProfileUsage;
}