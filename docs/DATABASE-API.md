# Database & API Reference

> Complete reference for Haven Medical's Neon PostgreSQL database schema and REST API endpoints.

---

## Database: Neon PostgreSQL (Serverless)

- **Provider:** Neon (free tier)
- **Driver:** `@neondatabase/serverless` (tagged template SQL)
- **Connection:** `DATABASE_URL` environment variable
- **Auto-suspend:** 5 minutes idle (free tier)
- **Tables:** 11

### Connection Setup

```typescript
// src/lib/db.ts
import { neon } from "@neondatabase/serverless";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}
```

---

## Table Schemas

### `appointments`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | TEXT | PK | Unique identifier |
| `name` | TEXT | NOT NULL | Patient name |
| `phone` | TEXT | NOT NULL | Phone number |
| `email` | TEXT | `''` | Email address |
| `service` | TEXT | NOT NULL | Requested service |
| `date` | TEXT | NOT NULL | Appointment date |
| `time` | TEXT | NOT NULL | Appointment time |
| `status` | TEXT | `'pending'` | pending / confirmed / completed / cancelled |
| `created_at` | TEXT | `''` | Submission timestamp |
| `notes` | TEXT | `''` | Additional notes |

### `blog_posts`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `slug` | TEXT | PK | URL slug |
| `title` | TEXT | NOT NULL | Post title |
| `excerpt` | TEXT | `''` | Short summary |
| `content` | TEXT | `''` | Full HTML content |
| `category` | TEXT | `''` | Post category |
| `image` | TEXT | `''` | Featured image path |
| `author` | TEXT | `''` | Author name |
| `date` | TEXT | `''` | Publication date |
| `read_time` | TEXT | `''` | Estimated read time |

### `campaigns`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | TEXT | PK | Unique identifier |
| `subject` | TEXT | NOT NULL | Email subject line |
| `status` | TEXT | `'draft'` | draft / scheduled / sent |
| `scheduled_at` | TEXT | NULL | Scheduled send time |
| `sent_at` | TEXT | NULL | Actual send time |
| `recipients` | INTEGER | `0` | Number of recipients |
| `open_rate` | REAL | NULL | Open rate percentage |
| `click_rate` | REAL | NULL | Click rate percentage |
| `content` | TEXT | `''` | Email body content |

### `subscribers`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | TEXT | PK | Unique identifier |
| `email` | TEXT | UNIQUE, NOT NULL | Email address |
| `name` | TEXT | `''` | Subscriber name |
| `subscribed_at` | TEXT | `''` | Subscription date |
| `status` | TEXT | `'active'` | active / unsubscribed |
| `source` | TEXT | `'website'` | footer / blog / popup / appointment / manual |

### `subscription_plans`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | TEXT | PK | Plan slug (essential/premium/elite) |
| `name` | TEXT | NOT NULL | Display name |
| `price` | REAL | NOT NULL | Monthly price (USD) |
| `interval` | TEXT | `'monthly'` | Billing interval |
| `features` | JSONB | `'[]'` | Array of feature strings |
| `popular` | BOOLEAN | `false` | Highlighted plan flag |
| `description` | TEXT | `''` | Plan description |

### `member_subscriptions`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | TEXT | PK | Unique identifier |
| `member_id` | TEXT | NOT NULL | Member reference |
| `member_name` | TEXT | NOT NULL | Member full name |
| `member_email` | TEXT | NOT NULL | Member email |
| `plan_id` | TEXT | NOT NULL | Plan reference |
| `plan_name` | TEXT | `''` | Plan display name |
| `status` | TEXT | `'active'` | active / paused / cancelled |
| `start_date` | TEXT | `''` | Subscription start |
| `next_billing` | TEXT | `''` | Next billing date |
| `amount` | REAL | `0` | Billing amount |

### `settings`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `key` | TEXT | PK | Setting group (general/notifications/appearance/email) |
| `value` | JSONB | NOT NULL | Setting values object |

**Settings keys:**

| Key | Fields |
|-----|--------|
| `general` | name, tagline, phone, email, address, whatsapp, hours |
| `notifications` | newAppointments, newSubscribers, subscriptionChanges, weeklySummary |
| `appearance` | primaryColor, accentColor |
| `email` | fromName, fromEmail, replyTo |

### `admin_services`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `slug` | TEXT | PK | URL slug |
| `title` | TEXT | NOT NULL | Service title |
| `category` | TEXT | `''` | Service category |
| `icon_name` | TEXT | `''` | Lucide icon name |
| `hero_image` | TEXT | `''` | Hero image path |
| `overview` | TEXT | `''` | Short overview |
| `who_is_it_for` | TEXT | `''` | Target audience |
| `benefits` | JSONB | `'[]'` | Array of benefits |
| `procedure_steps` | JSONB | `'[]'` | Array of {step, title, description} |
| `duration` | TEXT | `''` | Procedure duration |
| `recovery` | TEXT | `''` | Recovery info |
| `expected_results` | TEXT | `''` | Expected results |
| `faqs` | JSONB | `'[]'` | Array of {question, answer} |
| `related_slugs` | JSONB | `'[]'` | Related service slugs |
| `price` | TEXT | `''` | Price range |
| `featured` | BOOLEAN | `false` | Featured on homepage |

### `media`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | TEXT | PK | Unique identifier |
| `filename` | TEXT | NOT NULL | Original filename |
| `url` | TEXT | NOT NULL | Public URL or API path |
| `alt` | TEXT | `''` | Alt text |
| `category` | TEXT | `'general'` | doctor / service / blog / general |
| `mime_type` | TEXT | `'image/webp'` | MIME type |
| `size_bytes` | INTEGER | `0` | File size |
| `width` | INTEGER | NULL | Image width |
| `height` | INTEGER | NULL | Image height |
| `uploaded_at` | TEXT | `''` | Upload timestamp |
| `file_data` | BYTEA | NULL | Binary image data |

### `doctors`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | TEXT | PK | Unique identifier |
| `name` | TEXT | NOT NULL | Doctor's full name |
| `title` | TEXT | `''` | Role (Medical Director, etc.) |
| `specialty` | TEXT | `''` | Medical specialty |
| `image` | TEXT | `''` | Profile photo path |
| `bio` | TEXT | `''` | Short bio for cards |
| `sort_order` | INTEGER | `0` | Display order |
| `slug` | TEXT | UNIQUE | URL slug for profile page |
| `full_bio` | TEXT | `''` | Detailed biography for profile |
| `education` | JSONB | `'[]'` | Array of {degree, institution, year} |
| `languages` | TEXT | `''` | Spoken languages |
| `experience_years` | INTEGER | `0` | Years of experience |
| `certifications` | JSONB | `'[]'` | Array of {title, issuer} |
| `gallery` | JSONB | `'[]'` | Array of image URLs |
| `social_links` | JSONB | `'{}'` | {instagram?, facebook?, linkedin?} |

### `testimonials`

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | TEXT | PK | Unique identifier |
| `name` | TEXT | NOT NULL | Patient name |
| `treatment` | TEXT | `''` | Treatment received |
| `text` | TEXT | `''` | Testimonial text |
| `rating` | INTEGER | `5` | Rating (1-5) |

---

## API Endpoints

### Admin Endpoints

All admin endpoints are under `/api/admin/`. No server-side auth — admin UI uses client-side sessionStorage.

#### Appointments

```
GET    /api/admin/appointments          → [{id, name, phone, email, service, date, time, status, createdAt, notes}]
POST   /api/admin/appointments          → Create appointment
PUT    /api/admin/appointments/[id]     → Update appointment
DELETE /api/admin/appointments/[id]     → Delete appointment
```

#### Blog Posts

```
GET    /api/admin/blog                  → [{slug, title, excerpt, content, category, image, author, date, readTime}]
POST   /api/admin/blog                  → Create blog post
PUT    /api/admin/blog/[slug]           → Update blog post
DELETE /api/admin/blog/[slug]           → Delete blog post
```

#### Campaigns

```
GET    /api/admin/campaigns             → [{id, subject, status, scheduledAt, sentAt, recipients, openRate, clickRate, content}]
POST   /api/admin/campaigns             → Create campaign
PUT    /api/admin/campaigns/[id]        → Update campaign
DELETE /api/admin/campaigns/[id]        → Delete campaign
```

#### Doctors

```
GET    /api/admin/doctors               → [{id, name, title, specialty, image, bio, sortOrder, slug, fullBio, education, languages, experienceYears, certifications, gallery, socialLinks}]
POST   /api/admin/doctors               → Create doctor (auto-generates slug if empty)
PUT    /api/admin/doctors/[id]          → Update doctor
DELETE /api/admin/doctors/[id]          → Delete doctor
```

#### Media

```
GET    /api/admin/media                 → [{id, filename, url, alt, category, mimeType, sizeBytes, uploadedAt}]
POST   /api/admin/media                 → Create media entry
PUT    /api/admin/media/[id]            → Update media
DELETE /api/admin/media/[id]            → Delete media
```

#### Members

```
GET    /api/admin/members               → [{id, memberId, memberName, memberEmail, planId, planName, status, startDate, nextBilling, amount}]
POST   /api/admin/members               → Create member
PUT    /api/admin/members/[id]          → Update member
DELETE /api/admin/members/[id]          → Delete member
```

#### Plans

```
GET    /api/admin/plans                 → [{id, name, price, interval, features, popular, description}]
POST   /api/admin/plans                 → Create plan
PUT    /api/admin/plans/[id]            → Update plan
DELETE /api/admin/plans/[id]            → Delete plan
```

#### Services

```
GET    /api/admin/services              → [{slug, title, category, iconName, heroImage, overview, ...}]
POST   /api/admin/services              → Create service
PUT    /api/admin/services/[slug]       → Update service
DELETE /api/admin/services/[slug]       → Delete service
```

#### Settings

```
GET    /api/admin/settings              → [{key, value}]
PUT    /api/admin/settings              → Upsert setting (body: {key, value})
```

#### Stats

```
GET    /api/admin/stats                 → {appointments, pendingAppointments, blogPosts, subscribers, activeSubscribers, campaigns, members, activeMembers, services, testimonials}
```

#### Subscribers

```
GET    /api/admin/subscribers           → [{id, email, name, subscribedAt, status, source}]
POST   /api/admin/subscribers           → Create subscriber
PUT    /api/admin/subscribers/[id]      → Update subscriber
DELETE /api/admin/subscribers/[id]      → Delete subscriber
```

#### Testimonials

```
GET    /api/admin/testimonials          → [{id, name, treatment, text, rating}]
POST   /api/admin/testimonials          → Create testimonial
PUT    /api/admin/testimonials/[id]     → Update testimonial
DELETE /api/admin/testimonials/[id]     → Delete testimonial
```

#### Upload

```
POST   /api/admin/upload                → Upload image file
  - Body: FormData with file, category, alt
  - Accepts: JPEG, PNG, WebP, GIF, SVG (max 5MB)
  - Returns: {url} (e.g., /api/images/img-1234567890)
```

#### Seed

```
POST   /api/admin/seed                  → Create all tables + seed initial data
  - Returns: {success: true, message: "Database seeded successfully"}
  - Safe to call multiple times (uses IF NOT EXISTS and COUNT checks)
```

### Public Endpoints

```
GET    /api/images/[id]                 → Serve uploaded image binary
  - Headers: Cache-Control: public, max-age=31536000, immutable
  - Content-Type: from media.mime_type

GET    /api/instagram                   → Instagram feed proxy
  - Returns: {data: [{id, media_url, permalink, caption, media_type, timestamp}]}
  - Cache: 1hr server-side
```

---

## Data Flow

```
Browser → Vercel Edge (ISR cache, 60s) → Next.js Server → Neon PostgreSQL
                                                        ← JSON response
                                                        
Admin UI → fetch() → /api/admin/* → Neon PostgreSQL → JSON response
```

### Rendering Strategy

| Page Type | Strategy | Cache |
|-----------|----------|-------|
| Public pages | ISR (`revalidate = 60`) | 60s on Vercel Edge |
| Admin pages | Client-side rendering | No cache |
| API routes | Dynamic | No cache |
| Static assets | Pre-built | 1yr immutable |
| Uploaded images | Dynamic (BYTEA) | 1yr cache header |
