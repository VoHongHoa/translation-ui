import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { translationService } from '../services/translationService';
import { TranslateRequest, TranslateResponse } from '../types/translation';

export const useTranslate = (debounceDelay: number = 500) => {
  const [debouncedText, setDebouncedText] = useState('');

  const mutation = useMutation({
    mutationFn: (data: TranslateRequest): Promise<TranslateResponse> => {
      return translationService.translate(data);
    },
  });

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedText.trim()) {
        mutation.mutate({
          text: debouncedText,
          sourceLanguage: '',
          targetLanguage: '',
        });
      }
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [debouncedText, debounceDelay, mutation]);

  return {
    ...mutation,
    setDebouncedText,
    debouncedText,
  };
};
