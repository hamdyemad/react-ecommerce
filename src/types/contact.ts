export interface SendMessageRequest {
  name: string;
  email: string;
  title: string;
  content: string;
}

export interface SubscribeRequest {
  email: string;
}

export interface CommonResponse {
  status: boolean;
  message: string;
  errors: any[];
}
