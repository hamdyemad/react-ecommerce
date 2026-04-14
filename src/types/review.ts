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

export interface VendorProduct {
  id: number;
  vendor_id: number;
  product_id: number;
  slug: string;
  points: number;
  sku: string;
  reviews_count: number;
  review_avg_star: number;
  limitation: number;
  status: string;
  number_of_sale: number;
  views: number;
  sort_number: number;
  stock: number;
  is_fav: boolean;
  configuration_type: string;
  taxes: Array<{
    id: number;
    name: string;
    percentage: number;
    tax_rate: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  configuration_tree: any[];
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
