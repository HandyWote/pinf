export type SubscriptionStatus = 'pending' | 'sent' | 'cancelled' | 'missed';

export interface NotificationSubscription {
  id: number;
  appointmentId: number;
  userId?: number;
  channel?: string;
  token?: string | null;
  remindTime: string; // ISO
  status: SubscriptionStatus;
  createdAt?: string;
  sentAt?: string | null;
}
