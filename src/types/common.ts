export interface ApiResponse<T> {
  status: boolean;
  message: string;
  errors: any[];
  data: T;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  status: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}
