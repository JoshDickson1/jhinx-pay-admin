import api from "./axiosInstance";

export interface ActivityFeedItem {
  transaction_id: string;
  user_id: string;
  user_full_name: string;
  user_email: string;
  title: string;
  amount_ngn: number;
  created_at: string;
  status: string;
  crypto_amount: string | null;
}

export interface ActivityFeedResponse {
  items: ActivityFeedItem[];
}

export const getActivityFeed = (limit = 20) =>
  api.get<ActivityFeedResponse>("/admin/activity-feed", {
    params: { limit },
  }).then((r) => r.data);