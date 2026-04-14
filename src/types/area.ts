export interface Currency {
  id: number;
  name: string;
  code: string;
  symbol: string;
  use_image: boolean;
  image: string | null;
  display: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: number;
  name: string;
  name_ar?: string;
  code: string;
  slug: string;
  default: number;
  phone_code: string;
  phone_length: number;
  image: string;
  currency: Currency;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface AreaResponse {
  status: boolean;
  message: string;
  errors: any[];
  data: Country[];
}

export interface City {
  id: number;
  name: string;
  slug: string;
  default: number;
  image: string;
  country?: Country;
  shipping?: {
    min_cost: number;
    has_shipping: boolean;
  };
  active: number;
  created_at: string;
  updated_at: string;
}

export interface CityResponse {
  status: boolean;
  message: string;
  errors: any[];
  data: City[];
  pagination?: any;
}

export interface Region {
  id: number;
  name: string;
  slug: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface RegionResponse {
  status: boolean;
  message: string;
  errors: any[];
  data: Region[];
  pagination?: any;
}
