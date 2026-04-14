import type { VendorProduct } from './product';

export interface Customer {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  image: string;
  lang: string;
  gender: 'male' | 'female' | 'other';
  status: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}



export interface Review {
  id: number;
  reviewable_id: number;
  reviewable_type: 'products' | 'vendors';
  customer_id: number;
  customer: Customer;
  review: string;
  star: number;
  reviewable: VendorProduct;
  created_at: string;
  updated_at: string;
}

export interface ReviewSubmitData {
  review: string;
  star: number;
}

export interface ReviewsResponse {
  status: boolean;
  message: string;
  errors: any[];
  data: Review[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}
