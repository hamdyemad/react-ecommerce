import { api } from '../api/client';
import type { AreaResponse, CityResponse, RegionResponse } from '../types/api';

export const areaService = {
  getCountries: async (signal?: AbortSignal): Promise<AreaResponse> => {
    const response = await api.get<AreaResponse>('/area/countries', { signal });
    return response.data;
  },
  getCities: async (countryId: string | number, signal?: AbortSignal): Promise<CityResponse> => {
    const response = await api.get<CityResponse>(`/area/countries/${countryId}/cities`, { signal });
    return response.data;
  },
  getRegions: async (cityId: string | number, signal?: AbortSignal): Promise<RegionResponse> => {
    const response = await api.get<RegionResponse>(`/area/cities/${cityId}/regions`, { signal });
    return response.data;
  },
  getAllCities: async (signal?: AbortSignal): Promise<CityResponse> => {
    const response = await api.get<CityResponse>('/area/cities', { signal });
    return response.data;
  },
};
