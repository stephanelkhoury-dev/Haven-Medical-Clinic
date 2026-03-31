# Admin Dashboard

The admin dashboard is a client-side panel protected by session-based authentication. All data is currently **mock data** (no backend API).

---

## Access

| | |
|---|---|
| **URL** | `/admin` |
| **Username** | `admin` |
| **Password** | `Haven2024!` |
| **Auth Storage** | `sessionStorage` (key: `haven_admin_auth`) |
| **Logout** | Clears session + redirects to login |

---

## Authentication

**File:** `src/app/admin/layout.tsx`

The admin layout acts as a login gate:

1. On mount, checks `sessionStorage.getItem("haven_admin_auth")`
2. If not authenticated → shows login form
3. On successful login → sets `sessionStorage` + renders dashboard
4. The sidebar has a "Sign Out" button that clears the session

> **Note:** This is a client-side only auth pattern suitable for demo/prototype. For production, implement server-side authentication.

---

## Admin Pages

### Dashboard `/admin`

**File:** `src/app/admin/page.tsx`

Overview cards with key metrics:

| Metric | Mock Value |
|--------|-----------|
| Total Appointments | 156 |
| Active Subscribers | 245 |
| Newsletter Sent | 12 |
| Active Memberships | 89 |
| Revenue This Month | $12,450 |
| Website Visitors | 3,421 |

Plus a recent appointments table and recent subscriber list.

---

### Appointments `/admin/appointments`

**File:** `src/app/admin/appointments/page.tsx`

Table of appointment requests with:
- Status badges (pending, confirmed, completed, cancelled)
- Service, date, time
- Patient name, phone, email
- Notes field

---

### Newsletter `/admin/newsletter`

**File:** `src/app/admin/newsletter/page.tsx`

Campaign management:
- List of campaigns with status (draft, scheduled, sent)
- Open rate and click rate metrics
- "Create Campaign" button (UI only)

---

### Subscribers `/admin/subscribers`

**File:** `src/app/admin/subscribers/page.tsx`

Subscriber list with:
- Email, name, subscription date
- Status (active, unsubscribed)
- Source (footer, popup, blog, appointment, manual)
- Export functionality (UI only)

---

### Subscriptions `/admin/subscriptions`

**File:** `src/app/admin/subscriptions/page.tsx`

Two sections:
1. **Plans** — 3 subscription tiers
2. **Active Members** — Member subscription list

#### Subscription Plans

| Plan | Price | Interval | Popular |
|------|-------|----------|---------|
| Essential Care | $49/mo | Monthly | No |
| Premium Wellness | $129/mo | Monthly | Yes |
| Elite Experience | $299/mo | Monthly | No |

---

### Services `/admin/services`

**File:** `src/app/admin/services/page.tsx`

Service management table showing all 20 services with category tags and edit/delete buttons (UI only).

---

### Blog `/admin/blog`

**File:** `src/app/admin/blog/page.tsx`

Blog post management with draft/published status, edit and delete actions (UI only).

---

### Settings `/admin/settings`

**File:** `src/app/admin/settings/page.tsx`

5-tab settings interface:

| Tab | Settings |
|-----|----------|
| **General** | Clinic name, tagline, address, phone, email, hours |
| **Notifications** | Email toggles (appointments, newsletter, subscriptions) |
| **Appearance** | Primary color, accent color |
| **Email** | Sender name, sender email, SMTP config |
| **Security** | Password change, 2FA toggle |

---

## Data Types

All types defined in `src/data/admin.ts`:

```typescript
interface Subscriber {
  id: string;
  email: string;
  name: string;
  subscribedAt: string;
  status: "active" | "unsubscribed";
  source: "footer" | "popup" | "blog" | "appointment" | "manual";
}

interface NewsletterCampaign {
  id: string;
  subject: string;
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: string;
  sentAt?: string;
  recipients: number;
  openRate?: number;
  clickRate?: number;
}

interface AppointmentRequest {
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

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: "monthly" | "quarterly" | "yearly";
  features: string[];
  popular?: boolean;
  description: string;
}

interface MemberSubscription {
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
```

---

## Mock Data Summary

| Collection | Count | Source |
|-----------|-------|--------|
| `mockSubscribers` | 8 subscribers | `src/data/admin.ts` |
| `mockCampaigns` | 4 campaigns | `src/data/admin.ts` |
| `mockAppointments` | 6 appointments | `src/data/admin.ts` |
| `subscriptionPlans` | 3 plans | `src/data/admin.ts` |
| `mockMemberSubscriptions` | 5 members | `src/data/admin.ts` |
| `dashboardStats` | 6 metrics | `src/data/admin.ts` |

---

## Admin Sidebar Navigation

| Icon | Label | Route |
|------|-------|-------|
| LayoutDashboard | Dashboard | `/admin` |
| Calendar | Appointments | `/admin/appointments` |
| Mail | Newsletter | `/admin/newsletter` |
| Users | Subscribers | `/admin/subscribers` |
| CreditCard | Subscriptions | `/admin/subscriptions` |
| Sparkles | Services | `/admin/services` |
| FileText | Blog | `/admin/blog` |
| Settings | Settings | `/admin/settings` |
