// Dữ liệu gửi lên khi Translate (TranslateRequestDto)
export interface TranslateRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

// Dữ liệu trả về từ API khi Translate thành công (TranslateResponseDto)
export interface TranslateResponse {
  translation: string;
  detectedLanguage: string;
  cached: boolean;
}

export interface TranslateHistoryItem {
  id: string;
  userId: string;
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  detectedLanguage: string;
  cached: boolean;
  createdAt: string;
}

export interface TranslateHistoryResponse {
  items: TranslateHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
