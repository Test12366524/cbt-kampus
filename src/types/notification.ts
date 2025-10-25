export interface NotificationData {
  title: string;
  message: string;
  url: string | null;
  type: "info" | "warning" | "success" | "error";
}

export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}