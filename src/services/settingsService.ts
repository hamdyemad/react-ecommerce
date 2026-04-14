import { api } from '../api/client';
import type { SiteInformationResponse, AboutUsResponse } from '../types/api';

export const settingsService = {
  getSiteInformation: async (signal?: AbortSignal): Promise<SiteInformationResponse> => {
    const response = await api.get<SiteInformationResponse>('/site-information', { signal });
    return response.data;
  },
  getAboutUs: async (signal?: AbortSignal): Promise<AboutUsResponse> => {
    const response = await api.get<AboutUsResponse>('/about-us/website', { signal });
    return response.data;
  },
};
