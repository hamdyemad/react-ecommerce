import type { Vendor } from './vendor';

/**
 * Model for Product List Item (Catalog/Search)
 * Matching the /products response
 */
export interface ProductListItem {
  id: number;
  slug: string;
  name: string;
  image: string;
  points: number;
  sku: string;
  status: string;
  is_fav: boolean;
  reviews_count: number;
  review_avg_star: number;
  price_before_taxes: string;
  real_price: string;
  fake_price: string | null;
  discount: number | null;
  remaining_stock: number;
  vendor: {
    id: number;
    name: string;
    slug: string;
  };
  brand: {
    id: number;
    title: string | null;
    slug: string;
  };
  department: {
    id: number;
    name: string;
    slug: string;
  } | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  sub_category: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

/**
 * Model for Product Details
 * Matching the /products/product-by-slug/{slug} response
 */
export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  brand: {
    id: number;
    title: string;
    slug: string;
  } | null;
  category: {
    id: number;
    slug: string;
    name: string;
    image: string;
    sort_number: number;
  };
  department: {
    id: number;
    slug: string;
    image: string;
    name: string;
    sort_number: number;
  };
  sub_category: any | null;
  image: string;
  images: string[];
  details: string | null;
  summary: string | null;
  instructions: string | null;
  features: string | null;
  extras: string | null;
  material: string | null;
  video_link: string | null;
  reviews: {
    total_reviews: number;
    avg_star: number | null;
  };
  vendors: Array<{
    vendor: Vendor & {
      active: boolean;
      num_of_user_review: number;
    };
    selected: boolean;
    vendor_product: VendorProduct;
  }>;
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
  image: string;
  images: string[];
  name: string;
  description: string | null;
  details: string | null;
  summary: string | null;
  instructions: string | null;
  features: string | null;
  extras: string | null;
  material: string | null;
  video_link: string | null;
  number_of_sale: number;
  views: number;
  sort_number: number;
  stock: number;
  booked_stock: number;
  allocated_stock: number;
  delivered_stock: number;
  remaining_stock: number;
  is_fav: boolean;
  configuration_type: string;
  tags: string[];
  meta_description: string | null;
  meta_keywords: string[];
  vendor: Vendor & {
    active: boolean;
    num_of_user_review: number;
  };
  department: {
    id: number;
    slug: string;
    image: string;
    name: string;
    sort_number: number;
  };
  category: {
    id: number;
    slug: string;
    name: string;
    image: string;
    sort_number: number;
  };
  sub_category: any | null;
  reviews: {
    total_reviews: number;
    avg_star: number | null;
  };
  brand: {
    id: number;
    title: string;
    slug: string;
    image: string;
    cover: string;
    type: string;
    icon: string;
  };
  configuration_tree: ConfigurationKey[];
  created_at: string;
  updated_at: string;
}

export interface ConfigurationKey {
  id: number;
  name: string;
  type: 'key';
  children: ConfigurationValue[];
}

export interface ConfigurationValue {
  id: number;
  name: string;
  value: string | null;
  type: 'color' | null;
  color: string | null;
  key_id: number;
  children?: (ConfigurationKey | ConfigurationValue)[];
  variant?: ProductVariant;
}

export interface ProductVariant {
  id: number;
  sku: string;
  stock: number;
  remaining_stock: number;
  price_before_taxes: string;
  real_price: string;
  fake_price: string | null;
  discount: number | null;
  quantity_in_cart: number;
  cart_id: number | null;
  images: string[];
}

// For backward compatibility and general usage
export type Product = ProductListItem; 
