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

// Mock data for admin dashboard

export const mockSubscribers: Subscriber[] = [
  { id: "1", email: "carla.m@email.com", name: "Carla Mansour", subscribedAt: "2026-03-15", status: "active", source: "footer" },
  { id: "2", email: "rita.s@email.com", name: "Rita Saade", subscribedAt: "2026-03-12", status: "active", source: "blog" },
  { id: "3", email: "ahmad.k@email.com", name: "Ahmad Khalil", subscribedAt: "2026-03-10", status: "active", source: "appointment" },
  { id: "4", email: "maya.l@email.com", name: "Maya Lahoud", subscribedAt: "2026-03-08", status: "active", source: "popup" },
  { id: "5", email: "sami.b@email.com", name: "Sami Boustani", subscribedAt: "2026-03-05", status: "active", source: "footer" },
  { id: "6", email: "nour.h@email.com", name: "Nour Haddad", subscribedAt: "2026-02-28", status: "unsubscribed", source: "footer" },
  { id: "7", email: "lara.f@email.com", name: "Lara Fares", subscribedAt: "2026-02-25", status: "active", source: "blog" },
  { id: "8", email: "joe.a@email.com", name: "Joe Aoun", subscribedAt: "2026-02-20", status: "active", source: "manual" },
];

export const mockCampaigns: NewsletterCampaign[] = [
  { id: "1", subject: "Spring Special: 20% Off Facial Treatments", status: "sent", sentAt: "2026-03-20", recipients: 234, openRate: 42.5, clickRate: 12.3 },
  { id: "2", subject: "New Service: Skin Boosters Now Available", status: "sent", sentAt: "2026-03-10", recipients: 218, openRate: 38.7, clickRate: 9.8 },
  { id: "3", subject: "Your Monthly Wellness Tips – March 2026", status: "scheduled", scheduledAt: "2026-04-01", recipients: 245 },
  { id: "4", subject: "Easter Gift Voucher Special", status: "draft", recipients: 0 },
];

export const mockAppointments: AppointmentRequest[] = [
  { id: "1", name: "Carla Mansour", phone: "+961 70 123 456", service: "Botox & Fillers", date: "2026-04-02", time: "10:00 AM", status: "confirmed", createdAt: "2026-03-28" },
  { id: "2", name: "Ahmad Khalil", phone: "+961 71 234 567", service: "Rhinoplasty", date: "2026-04-05", time: "9:00 AM", status: "pending", createdAt: "2026-03-29" },
  { id: "3", name: "Maya Lahoud", phone: "+961 76 345 678", service: "Facial Treatments", date: "2026-04-01", time: "2:00 PM", status: "confirmed", createdAt: "2026-03-27" },
  { id: "4", name: "Rita Saade", phone: "+961 03 456 789", service: "Laser Hair Removal", date: "2026-04-03", time: "11:00 AM", status: "pending", createdAt: "2026-03-30" },
  { id: "5", name: "Sami Boustani", phone: "+961 70 567 890", service: "Physiotherapy", date: "2026-03-31", time: "3:00 PM", status: "completed", createdAt: "2026-03-25" },
  { id: "6", name: "Nour Haddad", phone: "+961 71 678 901", service: "Deep Tissue Massage", date: "2026-03-30", time: "4:00 PM", status: "cancelled", createdAt: "2026-03-26" },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "essential",
    name: "Essential",
    price: 49,
    interval: "monthly",
    description: "Perfect for those who want to maintain their wellness routine with regular access to basic treatments.",
    features: [
      "1 Facial Treatment per month",
      "10% off all other services",
      "Priority booking",
      "Free skin consultation (quarterly)",
      "Newsletter with exclusive wellness tips",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 129,
    interval: "monthly",
    popular: true,
    description: "Our most popular plan for dedicated patients who want comprehensive aesthetic and wellness care.",
    features: [
      "1 Facial Treatment per month",
      "1 Body Treatment per month (massage or lymphatic drainage)",
      "20% off all injectable treatments",
      "15% off all other services",
      "Priority booking with preferred time slots",
      "Free skin consultation (monthly)",
      "Complimentary birthday treatment",
      "Exclusive member events & previews",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 299,
    interval: "monthly",
    description: "The ultimate membership for those who want unlimited access to our full range of aesthetic and wellness services.",
    features: [
      "2 Facial Treatments per month",
      "2 Body Treatments per month",
      "1 Injectable treatment per quarter (Botox or Filler)",
      "30% off surgical consultations",
      "25% off all other services",
      "VIP priority booking – same day available",
      "Free monthly skin and body consultation",
      "Personal treatment coordinator",
      "Complimentary gift voucher on anniversary",
      "Access to exclusive VIP lounge",
    ],
  },
];

export const mockMemberSubscriptions: MemberSubscription[] = [
  { id: "1", memberId: "m1", memberName: "Carla Mansour", memberEmail: "carla.m@email.com", planId: "premium", planName: "Premium", status: "active", startDate: "2026-01-15", nextBilling: "2026-04-15", amount: 129 },
  { id: "2", memberId: "m2", memberName: "Maya Lahoud", memberEmail: "maya.l@email.com", planId: "essential", planName: "Essential", status: "active", startDate: "2026-02-01", nextBilling: "2026-04-01", amount: 49 },
  { id: "3", memberId: "m3", memberName: "Rita Saade", memberEmail: "rita.s@email.com", planId: "elite", planName: "Elite", status: "active", startDate: "2025-12-10", nextBilling: "2026-04-10", amount: 299 },
  { id: "4", memberId: "m4", memberName: "Lara Fares", memberEmail: "lara.f@email.com", planId: "premium", planName: "Premium", status: "paused", startDate: "2026-01-20", nextBilling: "2026-04-20", amount: 129 },
  { id: "5", memberId: "m5", memberName: "Nour Haddad", memberEmail: "nour.h@email.com", planId: "essential", planName: "Essential", status: "cancelled", startDate: "2025-11-01", nextBilling: "-", amount: 49 },
];

export const dashboardStats = {
  totalAppointments: 156,
  pendingAppointments: 12,
  totalSubscribers: 245,
  newSubscribersThisMonth: 34,
  activeMembers: 28,
  monthlyRevenue: 8420,
  blogPosts: 6,
  totalServices: 17,
};
