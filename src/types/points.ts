export interface PointsSummary {
  total_points: number;
  points_value: number;
  earned_points: number;
  redeemed_points: number;
  expired_points: number;
  adjusted_points: number;
  available_points: number;
  expiring_soon: any[];
}

export interface PointsSettings {
  system_enabled: boolean;
  points_per_currency: number;
  welcome_points: number;
}

export interface PointTransaction {
  id: number;
  points: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  type_label: string;
  description: string;
  expires_at: string | null;
  is_expired: boolean;
  created_at: string;
}

export interface PointsTransactionsResponse {
  items: PointTransaction[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}
