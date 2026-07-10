export interface UserQuotaEntity {
  userId: string;
  dailyRequestLimit: number;
  dailyCharacterLimit: number;
  maxCharacterPerRequest: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserQuotaPayload {
  dailyRequestLimit?: number;
  dailyCharacterLimit?: number;
  maxCharacterPerRequest?: number;
}

export interface UserQuotaUsageEntity {
  userId: string;
  usageDate: string;
  googleRequestCount: number;
  characterCount: number;
  cacheHitCount: number;
  createdAt: string;
  updatedAt: string;
}
