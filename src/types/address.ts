import type { Country, City, Region } from './area';

export interface Address {
  id: number;
  title: string;
  address: string;
  postal_code: string | null;
  is_primary: boolean;
  country: Country;
  city: City;
  region: Region;
  subregion: any | null;
}


export interface AddressCreateData {
  title: string;
  address: string;
  postal_code?: string;
  is_primary: string; // "0" or "1" as per the user's provided screenshot
  country_id: string;
  city_id: string;
  region_id: string;
  subregion_id?: string;
}
