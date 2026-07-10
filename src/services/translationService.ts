import { apiClient } from './apiClient';
import {
  TranslateHistoryResponse,
  TranslateRequest,
  TranslateResponse,
} from '../types/translation';

export const translationService = {
  // POST /translate
  translate: (payload: TranslateRequest): Promise<TranslateResponse> => {
    return apiClient.post('/translate', payload);
  },

  // GET /history
  getHistory: (page: number = 1, limit: number = 20): Promise<TranslateHistoryResponse> => {
    return apiClient.get('/history', { params: { page, limit } });
  },
};
