import { api } from '../api/client';
import type { SendMessageRequest, SubscribeRequest, CommonResponse } from '../types/api';

export const contactService = {
  sendMessage: async (data: SendMessageRequest): Promise<CommonResponse> => {
    const response = await api.post<CommonResponse>('/messages/send', data);
    return response.data;
  },
  subscribe: async (data: SubscribeRequest): Promise<CommonResponse> => {
    const response = await api.post<CommonResponse>('/subscriptions', data);
    return response.data;
  },
};
