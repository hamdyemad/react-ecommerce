import { api } from '../api/client';
import type { FAQResponse } from '../types/api';

export const faqService = {
  getFAQs: async (): Promise<FAQResponse> => {
    const response = await api.get<FAQResponse>('/faqs');
    return response.data;
  },
};
