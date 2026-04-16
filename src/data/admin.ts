// Shared types for the admin dashboard and newsletter/subscription systems

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  subscribedAt: string;
  status: "active" | "unsubscribed";
  source: "footer" | "popup" | "blog" | "appointment" | "manual";
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: string;
  sentAt?: string;
  recipients: number;
  openRate?: number;
  clickRate?: number;
}

export interface AppointmentRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  notes?: string;
  clientId?: string;
  employeeId?: string;
  employeeName?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: "monthly" | "quarterly" | "yearly";
  features: string[];
  popular?: boolean;
  description: string;
}

export interface MemberSubscription {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  planId: string;
  planName: string;
  status: "active" | "paused" | "cancelled" | "expired";
  startDate: string;
  nextBilling: string;
  amount: number;
}
