export interface FAQ {
  id: number;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface FAQResponse {
  status: boolean;
  message: string;
  errors: any[];
  data: FAQ[];
}
