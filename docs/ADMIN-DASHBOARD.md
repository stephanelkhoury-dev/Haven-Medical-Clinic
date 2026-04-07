# Admin Dashboard

The admin dashboard is a client-side CMS panel protected by session-based authentication. All data is stored in **Neon Postgres** and managed via REST API endpoints.

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

Overview cards with key metrics loaded from the database:

| Metric | Source |
|--------|--------|
| Total Appointments | `appointments` table |
| Active Subscribers | `subscribers` table |
| Newsletter Sent | `campaigns` table |
| Active Memberships | `member_subscriptions` table |
| Revenue This Month | `member_subscriptions` table |
| Website Visitors | Mock data |

Plus a recent appointments table and recent subscriber list.

---

### Appointments `/admin/appointments`

**File:** `src/app/admin/appointments/page.tsx`  
**API:** `GET/POST /api/admin/appointments`, `PUT/DELETE /api/admin/appointments/[id]`

Table of appointment requests with:
- Status badges (pending, confirmed, completed, cancelled)
- Service, date, time
- Patient name, phone, email
- Notes field
- Create, edit, update status, delete actions

---

### Services `/admin/services`

**File:** `src/app/admin/services/page.tsx`  
**API:** `GET/POST /api/admin/services`, `PUT/DELETE /api/admin/services/[slug]`

Service management with full CRUD. Each service has title, slug, category, description, image, and detailed content fields.

---

### Doctors `/admin/doctors`

**File:** `src/app/admin/doctors/page.tsx`  
**API:** `GET/POST /api/admin/doctors`, `PUT/DELETE /api/admin/doctors/[id]`

Doctor management with a **5-tab modal form**:

| Tab | Fields |
|-----|--------|
| **Basic Info** | Name, title, specialty, short bio, sort order, profile image upload |
| **Biography** | Full biography (textarea), experience years, languages |
| **Credentials** | Education entries (institution, degree, year) + Certification entries (name, issuer, year) — add/remove dynamically |
| **Gallery** | Upload multiple gallery images, remove individual images |
| **Social** | Instagram URL, Facebook URL, LinkedIn URL |

Features:
- Image upload via FormData to `/api/admin/upload`
- Gallery image upload with `target=gallery` parameter
- Auto-slug generation from doctor name
- Inline SVG social icons (lucide-react lacks brand icons)

---

### Testimonials `/admin/testimonials`

**File:** `src/app/admin/testimonials/page.tsx`  
**API:** `GET/POST /api/admin/testimonials`, `PUT/DELETE /api/admin/testimonials/[id]`

Testimonial management with author name, rating (1-5 stars), text content, and visibility toggle.

---

### Blog Posts `/admin/blog`

**File:** `src/app/admin/blog/page.tsx`  
**API:** `GET/POST /api/admin/blog`, `PUT/DELETE /api/admin/blog/[slug]`

Blog post CRUD with rich content editing, category selection, featured image upload, author, read time, and draft/published status.

---

### Newsletter `/admin/newsletter`

**File:** `src/app/admin/newsletter/page.tsx`  
**API:** `GET/POST /api/admin/campaigns`, `PUT/DELETE /api/admin/campaigns/[id]`

Campaign management:
- List of campaigns with status (draft, scheduled, sent)
- Open rate and click rate metrics
- Create and manage email campaigns

---

### Subscribers `/admin/subscribers`

**File:** `src/app/admin/subscribers/page.tsx`  
**API:** `GET/POST /api/admin/subscribers`

Subscriber list with:
- Email, name, subscription date
- Status (active, unsubscribed)
- Source tracking
- Export functionality

---

### Subscriptions `/admin/subscriptions`

**File:** `src/app/admin/subscriptions/page.tsx`  
**API:** `GET/POST /api/admin/plans`, `GET/POST /api/admin/members`

Two sections:
1. **Plans** — Subscription tiers with pricing
2. **Active Members** — Member subscription list with status tracking

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

Types defined in `src/data/admin.ts` and used across admin pages:

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

interface Doctor {
  id: number;
  name: string;
  title: string;
  specialty: string;
  image: string;
  bio: string;
  sortOrder: number;
  slug: string;
  fullBio: string;
  education: { institution: string; degree: string; year: string }[];
  languages: string;
  experienceYears: number;
  certifications: { name: string; issuer: string; year: string }[];
  gallery: string[];
  socialLinks: { instagram?: string; facebook?: string; linkedin?: string };
}
```

See [DATABASE-API.md](DATABASE-API.md) for the full database schema with all 11 tables.

---

## Database Tables

All admin data is stored in Neon Postgres. See [DATABASE-API.md](DATABASE-API.md) for complete schema.

| Table | Admin Page | Records |
|-------|-----------|---------|
| `appointments` | Appointments | Appointment requests |
| `admin_services` | Services | Clinic services |
| `doctors` | Doctors | Doctor profiles |
| `testimonials` | Testimonials | Client reviews |
| `blog_posts` | Blog | Blog articles |
| `campaigns` | Newsletter | Email campaigns |
| `subscribers` | Subscribers | Newsletter subscribers |
| `subscription_plans` | Subscriptions | Membership plans |
| `member_subscriptions` | Subscriptions | Active members |
| `media` | (used by all) | Uploaded images (BYTEA) |
| `settings` | Settings | Clinic configuration |

---

## Admin Sidebar Navigation

| Icon | Label | Route |
|------|-------|-------|
| LayoutDashboard | Dashboard | `/admin` |
| Calendar | Appointments | `/admin/appointments` |
| Stethoscope | Services | `/admin/services` |
| UserCheck | Doctors | `/admin/doctors` |
| MessageSquareQuote | Testimonials | `/admin/testimonials` |
| FileText | Blog Posts | `/admin/blog` |
| Mail | Newsletter | `/admin/newsletter` |
| Users | Subscribers | `/admin/subscribers` |
| CreditCard | Subscriptions | `/admin/subscriptions` |
| Settings | Settings | `/admin/settings` |
