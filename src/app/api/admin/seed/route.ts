import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

// This endpoint creates all tables and seeds initial data.
// Call it once after setting up your Neon database on Vercel.
// POST /api/admin/seed

export async function POST() {
  try {
    const sql = getDb();

    // ── Auth tables ────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'front_desk',
        active BOOLEAN DEFAULT true,
        created_at TEXT NOT NULL DEFAULT ''
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES admin_users(id),
        expires_at TEXT NOT NULL
      )
    `;

    // Seed default admin user
    const existingAdmin = await sql`SELECT COUNT(*) as count FROM admin_users`;
    if (Number(existingAdmin[0].count) === 0) {
      await sql`INSERT INTO admin_users (id, username, password_hash, name, role, active, created_at)
        VALUES ('admin-001', 'admin', 'Haven2024!', 'Admin', 'admin', true, ${new Date().toISOString()})`;
    }

    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        email TEXT DEFAULT '',
        service TEXT NOT NULL,
        date TEXT NOT NULL DEFAULT '',
        time TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT '',
        notes TEXT DEFAULT ''
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        slug TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        excerpt TEXT DEFAULT '',
        content TEXT DEFAULT '',
        category TEXT NOT NULL DEFAULT '',
        image TEXT DEFAULT '',
        author TEXT DEFAULT '',
        date TEXT NOT NULL DEFAULT '',
        read_time TEXT DEFAULT '5 min read'
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        scheduled_at TEXT,
        sent_at TEXT,
        recipients INTEGER DEFAULT 0,
        open_rate REAL,
        click_rate REAL,
        content TEXT DEFAULT ''
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS subscribers (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL DEFAULT '',
        subscribed_at TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active',
        source TEXT NOT NULL DEFAULT 'manual'
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL DEFAULT 0,
        interval TEXT NOT NULL DEFAULT 'monthly',
        features JSONB DEFAULT '[]'::jsonb,
        popular BOOLEAN DEFAULT false,
        description TEXT DEFAULT ''
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS member_subscriptions (
        id TEXT PRIMARY KEY,
        member_id TEXT NOT NULL,
        member_name TEXT NOT NULL,
        member_email TEXT NOT NULL,
        plan_id TEXT NOT NULL,
        plan_name TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active',
        start_date TEXT NOT NULL DEFAULT '',
        next_billing TEXT DEFAULT '',
        amount REAL DEFAULT 0
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_services (
        slug TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        short_description TEXT DEFAULT '',
        category TEXT NOT NULL DEFAULT 'aesthetic',
        icon_name TEXT DEFAULT 'Sparkles',
        hero_image TEXT DEFAULT '',
        overview TEXT DEFAULT '',
        who_is_it_for TEXT DEFAULT '',
        benefits JSONB DEFAULT '[]'::jsonb,
        procedure_steps JSONB DEFAULT '[]'::jsonb,
        duration TEXT DEFAULT '',
        recovery TEXT DEFAULT '',
        expected_results TEXT DEFAULT '',
        faqs JSONB DEFAULT '[]'::jsonb,
        related_slugs JSONB DEFAULT '[]'::jsonb,
        price REAL,
        price_from BOOLEAN DEFAULT false,
        price_note TEXT DEFAULT '',
        featured BOOLEAN DEFAULT false,
        sub_services JSONB DEFAULT '[]'::jsonb
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS media (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        url TEXT NOT NULL,
        alt TEXT DEFAULT '',
        category TEXT NOT NULL DEFAULT 'general',
        mime_type TEXT DEFAULT 'image/webp',
        size_bytes INTEGER DEFAULT 0,
        width INTEGER,
        height INTEGER,
        uploaded_at TEXT NOT NULL DEFAULT '',
        file_data BYTEA
      )
    `;

    // Add file_data column if missing (existing tables)
    await sql`ALTER TABLE media ADD COLUMN IF NOT EXISTS file_data BYTEA`;

    await sql`
      CREATE TABLE IF NOT EXISTS doctors (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        specialty TEXT NOT NULL DEFAULT '',
        image TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0,
        slug TEXT UNIQUE,
        full_bio TEXT DEFAULT '',
        education JSONB DEFAULT '[]',
        languages TEXT DEFAULT '',
        experience_years INTEGER DEFAULT 0,
        certifications JSONB DEFAULT '[]',
        gallery JSONB DEFAULT '[]',
        social_links JSONB DEFAULT '{}'
      )
    `;

    // Add new columns if table already exists
    await sql`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE`;
    await sql`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS full_bio TEXT DEFAULT ''`;
    await sql`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'`;
    await sql`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS languages TEXT DEFAULT ''`;
    await sql`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0`;
    await sql`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'`;
    await sql`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'`;
    await sql`ALTER TABLE doctors ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'`;

    await sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        treatment TEXT NOT NULL DEFAULT '',
        text TEXT NOT NULL DEFAULT '',
        rating INTEGER DEFAULT 5
      )
    `;

    // ── Accounting tables ──────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS acc_employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT '',
        specialty TEXT NOT NULL DEFAULT '',
        split_rules JSONB NOT NULL DEFAULT '[]',
        sort_order INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TEXT NOT NULL DEFAULT ''
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS acc_entries (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL REFERENCES acc_employees(id),
        date TEXT NOT NULL,
        service_type TEXT NOT NULL DEFAULT '',
        description TEXT DEFAULT '',
        amount REAL NOT NULL DEFAULT 0,
        discount REAL NOT NULL DEFAULT 0,
        employee_share REAL NOT NULL DEFAULT 0,
        clinic_share REAL NOT NULL DEFAULT 0,
        period TEXT NOT NULL DEFAULT '',
        in_audit BOOLEAN DEFAULT true,
        created_at TEXT NOT NULL DEFAULT ''
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS acc_expenses (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        amount REAL NOT NULL DEFAULT 0,
        category TEXT NOT NULL DEFAULT 'general',
        period TEXT NOT NULL DEFAULT '',
        in_audit BOOLEAN DEFAULT true,
        created_at TEXT NOT NULL DEFAULT ''
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS acc_products (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        product_type TEXT NOT NULL DEFAULT 'facial',
        description TEXT DEFAULT '',
        amount REAL NOT NULL DEFAULT 0,
        operator_name TEXT NOT NULL DEFAULT '',
        operator_share REAL NOT NULL DEFAULT 0,
        clinic_share REAL NOT NULL DEFAULT 0,
        period TEXT NOT NULL DEFAULT '',
        in_audit BOOLEAN DEFAULT true,
        created_at TEXT NOT NULL DEFAULT ''
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS acc_recurring (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        amount REAL NOT NULL DEFAULT 0,
        category TEXT NOT NULL DEFAULT 'general',
        frequency TEXT NOT NULL DEFAULT 'monthly',
        day_of_month INTEGER DEFAULT 1,
        active BOOLEAN DEFAULT true,
        last_generated TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT ''
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS acc_payroll (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL REFERENCES acc_employees(id),
        period TEXT NOT NULL,
        gross_amount REAL NOT NULL DEFAULT 0,
        paid_amount REAL NOT NULL DEFAULT 0,
        paid_date TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT ''
      )
    `;

    // Seed accounting employees
    const existingAccEmployees = await sql`SELECT COUNT(*) as count FROM acc_employees`;
    if (Number(existingAccEmployees[0].count) === 0) {
      await sql`INSERT INTO acc_employees (id, name, role, specialty, split_rules, sort_order, active, created_at) VALUES
        ('emp-nacouzi', 'Dr. Nacouzi', 'doctor', 'Medical Aesthetic', ${JSON.stringify([
          { serviceType: "all", employeePercent: 0, clinicPercent: 100, label: "All Services" }
        ])}, 1, true, ${new Date().toISOString()}),
        ('emp-carol', 'Dr. Carol', 'doctor', 'Gynecology', ${JSON.stringify([
          { serviceType: "chirurgie", employeePercent: 70, clinicPercent: 30, label: "Chirurgie" },
          { serviceType: "consultation", employeePercent: 80, clinicPercent: 20, label: "Consultation" }
        ])}, 2, true, ${new Date().toISOString()}),
        ('emp-rachelle', 'Rachelle', 'operator', 'Aesthetics', ${JSON.stringify([
          { serviceType: "all", employeePercent: 70, clinicPercent: 30, label: "All Services" }
        ])}, 3, true, ${new Date().toISOString()}),
        ('emp-rewa', 'Rewa', 'operator', 'Laser Hair Removal', ${JSON.stringify([
          { serviceType: "all", employeePercent: 0, clinicPercent: 100, label: "All Services" }
        ])}, 4, true, ${new Date().toISOString()}),
        ('emp-roula', 'Roula', 'operator', 'Skin Therapy', ${JSON.stringify([
          { serviceType: "all", employeePercent: 70, clinicPercent: 30, label: "All Services" }
        ])}, 5, true, ${new Date().toISOString()}),
        ('emp-nour', 'Nour', 'operator', 'Laser & Nutrition', ${JSON.stringify([
          { serviceType: "laser", employeePercent: 0, clinicPercent: 100, label: "Laser" },
          { serviceType: "nutrition", employeePercent: 50, clinicPercent: 50, label: "Nutrition" }
        ])}, 6, true, ${new Date().toISOString()}),
        ('emp-bahia', 'Dr. Bahia', 'doctor', 'Physiotherapy & Laser', ${JSON.stringify([
          { serviceType: "physiotherapy", employeePercent: 40, clinicPercent: 60, label: "Physiotherapy" },
          { serviceType: "laser", employeePercent: 30, clinicPercent: 70, label: "Laser" }
        ])}, 7, true, ${new Date().toISOString()}),
        ('emp-ghinwa', 'Ghinwa', 'operator', 'Medical Pedicure', ${JSON.stringify([
          { serviceType: "all", employeePercent: 30, clinicPercent: 70, label: "All Services" }
        ])}, 8, true, ${new Date().toISOString()}),
        ('emp-hayat', 'Hayat', 'operator', 'Epilation Electrique', ${JSON.stringify([
          { serviceType: "all", employeePercent: 70, clinicPercent: 30, label: "All Services" }
        ])}, 9, true, ${new Date().toISOString()})
      `;
    }

    // Seed appointments
    const existingAppointments = await sql`SELECT COUNT(*) as count FROM appointments`;
    if (Number(existingAppointments[0].count) === 0) {
      await sql`INSERT INTO appointments (id, name, phone, service, date, time, status, created_at) VALUES
        ('1', 'Carla Mansour', '+961 70 123 456', 'Botox & Fillers', '2026-04-02', '10:00 AM', 'confirmed', '2026-03-28'),
        ('2', 'Ahmad Khalil', '+961 71 234 567', 'Rhinoplasty', '2026-04-05', '9:00 AM', 'pending', '2026-03-29'),
        ('3', 'Maya Lahoud', '+961 76 345 678', 'Facial Treatments', '2026-04-01', '2:00 PM', 'confirmed', '2026-03-27'),
        ('4', 'Rita Saade', '+961 03 456 789', 'Laser Hair Removal', '2026-04-03', '11:00 AM', 'pending', '2026-03-30'),
        ('5', 'Sami Boustani', '+961 70 567 890', 'Physiotherapy', '2026-03-31', '3:00 PM', 'completed', '2026-03-25'),
        ('6', 'Nour Haddad', '+961 71 678 901', 'Deep Tissue Massage', '2026-03-30', '4:00 PM', 'cancelled', '2026-03-26')
      `;
    }

    // Seed blog posts
    const existingPosts = await sql`SELECT COUNT(*) as count FROM blog_posts`;
    if (Number(existingPosts[0].count) === 0) {
      await sql`INSERT INTO blog_posts (slug, title, excerpt, content, category, image, author, date, read_time) VALUES
        ('ultimate-guide-laser-hair-removal', 'The Ultimate Guide to Laser Hair Removal: What to Expect', 'Everything you need to know before your first laser hair removal session — from preparation to aftercare and expected results.', 'Laser hair removal has become one of the most popular aesthetic treatments worldwide...', 'Aesthetic Medicine', '/images/blog/laser-guide.webp', 'Dr. Sarah Mitchell', '2026-03-15', '5 min read'),
        ('skincare-routine-for-glowing-skin', 'Build Your Perfect Medical-Grade Skincare Routine', 'Discover how to layer medical-grade products for maximum results, with expert tips from our dermatology team.', 'A well-structured skincare routine is the foundation of healthy, glowing skin...', 'Skin Care', '/images/blog/skincare-routine.webp', 'Dr. Layla Haddad', '2026-03-10', '7 min read'),
        ('botox-myths-debunked', '5 Common Botox Myths Debunked by Our Specialists', 'Separating fact from fiction about Botox treatments — learn the truth from experienced practitioners.', 'Botox remains one of the most popular non-surgical cosmetic treatments...', 'Aesthetic Medicine', '/images/blog/botox-myths.webp', 'Dr. Marc Antoine', '2026-03-05', '4 min read'),
        ('importance-of-lymphatic-drainage', 'Why Lymphatic Drainage Should Be Part of Your Wellness Routine', 'Explore the science behind lymphatic drainage and why it is beneficial for post-surgery recovery and overall well-being.', 'The lymphatic system is a crucial part of your body''s immune defense...', 'Wellness', '/images/blog/lymphatic-drainage.webp', 'Marie Khalil', '2026-02-28', '6 min read'),
        ('nutrition-for-healthy-skin', 'Foods That Transform Your Skin: A Nutritionist''s Guide', 'What you eat directly impacts your skin health. Our nutritionist shares the top foods for a radiant complexion.', 'Your skin is a reflection of your inner health...', 'Nutrition', '/images/blog/nutrition-skin.webp', 'Dr. Nadia Farhat', '2026-02-20', '5 min read'),
        ('post-rhinoplasty-care-guide', 'Essential Post-Rhinoplasty Care: Your Recovery Roadmap', 'A comprehensive guide to rhinoplasty recovery — tips for the first week, months ahead, and achieving the best results.', 'Recovery after rhinoplasty is a journey that requires patience and proper care...', 'Post-Treatment Care', '/images/blog/rhinoplasty-care.webp', 'Dr. Georges Khoury', '2026-02-15', '8 min read')
      `;
    }

    // Seed campaigns
    const existingCampaigns = await sql`SELECT COUNT(*) as count FROM campaigns`;
    if (Number(existingCampaigns[0].count) === 0) {
      await sql`INSERT INTO campaigns (id, subject, status, scheduled_at, sent_at, recipients, open_rate, click_rate) VALUES
        ('1', 'Spring Special: 20% Off Facial Treatments', 'sent', NULL, '2026-03-20', 234, 42.5, 12.3),
        ('2', 'New Service: Skin Boosters Now Available', 'sent', NULL, '2026-03-10', 218, 38.7, 9.8),
        ('3', 'Your Monthly Wellness Tips – March 2026', 'scheduled', '2026-04-01', NULL, 245, NULL, NULL),
        ('4', 'Easter Gift Voucher Special', 'draft', NULL, NULL, 0, NULL, NULL)
      `;
    }

    // Seed subscribers
    const existingSubs = await sql`SELECT COUNT(*) as count FROM subscribers`;
    if (Number(existingSubs[0].count) === 0) {
      await sql`INSERT INTO subscribers (id, email, name, subscribed_at, status, source) VALUES
        ('1', 'carla.m@email.com', 'Carla Mansour', '2026-03-15', 'active', 'footer'),
        ('2', 'rita.s@email.com', 'Rita Saade', '2026-03-12', 'active', 'blog'),
        ('3', 'ahmad.k@email.com', 'Ahmad Khalil', '2026-03-10', 'active', 'appointment'),
        ('4', 'maya.l@email.com', 'Maya Lahoud', '2026-03-08', 'active', 'popup'),
        ('5', 'sami.b@email.com', 'Sami Boustani', '2026-03-05', 'active', 'footer'),
        ('6', 'nour.h@email.com', 'Nour Haddad', '2026-02-28', 'unsubscribed', 'footer'),
        ('7', 'lara.f@email.com', 'Lara Fares', '2026-02-25', 'active', 'blog'),
        ('8', 'joe.a@email.com', 'Joe Aoun', '2026-02-20', 'active', 'manual')
      `;
    }

    // Seed subscription plans
    const existingPlans = await sql`SELECT COUNT(*) as count FROM subscription_plans`;
    if (Number(existingPlans[0].count) === 0) {
      await sql`INSERT INTO subscription_plans (id, name, price, interval, features, popular, description) VALUES
        ('essential', 'Essential', 49, 'monthly', ${JSON.stringify(["1 Facial Treatment per month","10% off all other services","Priority booking","Free skin consultation (quarterly)","Newsletter with exclusive wellness tips"])}, false, 'Perfect for those who want to maintain their wellness routine with regular access to basic treatments.'),
        ('premium', 'Premium', 129, 'monthly', ${JSON.stringify(["1 Facial Treatment per month","1 Body Treatment per month (massage or lymphatic drainage)","20% off all injectable treatments","15% off all other services","Priority booking with preferred time slots","Free skin consultation (monthly)","Complimentary birthday treatment","Exclusive member events & previews"])}, true, 'Our most popular plan for dedicated patients who want comprehensive aesthetic and wellness care.'),
        ('elite', 'Elite', 299, 'monthly', ${JSON.stringify(["2 Facial Treatments per month","2 Body Treatments per month","1 Injectable treatment per quarter (Botox or Filler)","30% off surgical consultations","25% off all other services","VIP priority booking – same day available","Free monthly skin and body consultation","Personal treatment coordinator","Complimentary gift voucher on anniversary","Access to exclusive VIP lounge"])}, false, 'The ultimate membership for those who want unlimited access to our full range of aesthetic and wellness services.')
      `;
    }

    // Seed member subscriptions
    const existingMembers = await sql`SELECT COUNT(*) as count FROM member_subscriptions`;
    if (Number(existingMembers[0].count) === 0) {
      await sql`INSERT INTO member_subscriptions (id, member_id, member_name, member_email, plan_id, plan_name, status, start_date, next_billing, amount) VALUES
        ('1', 'm1', 'Carla Mansour', 'carla.m@email.com', 'premium', 'Premium', 'active', '2026-01-15', '2026-04-15', 129),
        ('2', 'm2', 'Maya Lahoud', 'maya.l@email.com', 'essential', 'Essential', 'active', '2026-02-01', '2026-04-01', 49),
        ('3', 'm3', 'Rita Saade', 'rita.s@email.com', 'elite', 'Elite', 'active', '2025-12-10', '2026-04-10', 299),
        ('4', 'm4', 'Lara Fares', 'lara.f@email.com', 'premium', 'Premium', 'paused', '2026-01-20', '2026-04-20', 129),
        ('5', 'm5', 'Nour Haddad', 'nour.h@email.com', 'essential', 'Essential', 'cancelled', '2025-11-01', '-', 49)
      `;
    }

    // Seed media library
    const existingMedia = await sql`SELECT COUNT(*) as count FROM media`;
    if (Number(existingMedia[0].count) === 0) {
      await sql`INSERT INTO media (id, filename, url, alt, category, mime_type, uploaded_at) VALUES
        ('svc-laser', 'laser-hair-removal.webp', '/images/services/laser-hair-removal.webp', 'Laser hair removal treatment', 'service', 'image/webp', '2026-03-31'),
        ('svc-botox', 'botox-fillers.webp', '/images/services/botox-fillers.webp', 'Botox and fillers treatment', 'service', 'image/webp', '2026-03-31'),
        ('svc-skin-boosters', 'skin-boosters.webp', '/images/services/skin-boosters.webp', 'Skin boosters treatment', 'service', 'image/webp', '2026-03-31'),
        ('svc-rhinoplasty', 'rhinoplasty.webp', '/images/services/rhinoplasty.webp', 'Rhinoplasty procedure', 'service', 'image/webp', '2026-03-31'),
        ('svc-blepharoplasty', 'blepharoplasty.webp', '/images/services/blepharoplasty.webp', 'Blepharoplasty procedure', 'service', 'image/webp', '2026-03-31'),
        ('svc-face-lifting', 'face-lifting.webp', '/images/services/face-lifting.webp', 'Face lifting procedure', 'service', 'image/webp', '2026-03-31'),
        ('svc-lip-lift', 'lip-lift.webp', '/images/services/lip-lift.webp', 'Lip lift procedure', 'service', 'image/webp', '2026-03-31'),
        ('svc-otoplasty', 'otoplasty.webp', '/images/services/otoplasty.webp', 'Otoplasty procedure', 'service', 'image/webp', '2026-03-31'),
        ('svc-orl', 'orl-consultations.webp', '/images/services/orl-consultations.webp', 'ORL consultations', 'service', 'image/webp', '2026-03-31'),
        ('svc-gyneco', 'gyneco-aesthetic.webp', '/images/services/gyneco-aesthetic.webp', 'Gyneco-aesthetic treatment', 'service', 'image/webp', '2026-03-31'),
        ('svc-psychosexology', 'psychosexology.webp', '/images/services/psychosexology.webp', 'Psychosexology consultation', 'service', 'image/webp', '2026-03-31'),
        ('svc-physiotherapy', 'physiotherapy.webp', '/images/services/physiotherapy.webp', 'Physiotherapy treatment', 'service', 'image/webp', '2026-03-31'),
        ('svc-nutritionist', 'nutritionist.webp', '/images/services/nutritionist.webp', 'Nutritionist consultation', 'service', 'image/webp', '2026-04-02'),
        ('svc-lymphatic', 'lymphatic-drainage.webp', '/images/services/lymphatic-drainage.webp', 'Lymphatic drainage massage', 'service', 'image/webp', '2026-03-31'),
        ('svc-deep-tissue', 'deep-tissue-massage.webp', '/images/services/deep-tissue-massage.webp', 'Deep tissue massage', 'service', 'image/webp', '2026-04-02'),
        ('svc-nail', 'nail-repair.webp', '/images/services/nail-repair.webp', 'Medical pedicure and nail repair', 'service', 'image/webp', '2026-04-01'),
        ('svc-massage', 'massage.webp', '/images/services/massage.webp', 'Massage therapy', 'service', 'image/webp', '2026-04-02'),
        ('svc-physiotherapy1', 'physiotherapy1.webp', '/images/services/physiotherapy1.webp', 'Physiotherapy session', 'service', 'image/webp', '2026-03-31'),
        ('blog-laser', 'laser-guide.webp', '/images/blog/laser-guide.webp', 'Laser hair removal guide', 'blog', 'image/webp', '2026-04-02'),
        ('blog-skincare', 'skincare-routine.webp', '/images/blog/skincare-routine.webp', 'Skincare routine guide', 'blog', 'image/webp', '2026-04-02'),
        ('blog-botox', 'botox-myths.webp', '/images/blog/botox-myths.webp', 'Botox myths debunked', 'blog', 'image/webp', '2026-04-02'),
        ('blog-nutrition', 'nutrition-skin.webp', '/images/blog/nutrition-skin.webp', 'Nutrition for healthy skin', 'blog', 'image/webp', '2026-04-02'),
        ('blog-rhinoplasty', 'rhinoplasty-care.webp', '/images/blog/rhinoplasty-care.webp', 'Post-rhinoplasty care', 'blog', 'image/webp', '2026-04-02'),
        ('doc-mansour', 'dr-mansour.webp', '/images/doctors/dr-mansour.webp', 'Dr. Mansour', 'doctor', 'image/webp', '2026-04-02'),
        ('doc-mansour-2', 'dr-mansour-2.webp', '/images/doctors/dr-mansour-2.webp', 'Dr. Mansour portrait', 'doctor', 'image/webp', '2026-04-02'),
        ('doc-mansour-3', 'dr-mansour-3.webp', '/images/doctors/dr-mansour-3.webp', 'Dr. Mansour profile', 'doctor', 'image/webp', '2026-04-02'),
        ('doc-mansour-4', 'dr-mansour-4.webp', '/images/doctors/dr-mansour-4.webp', 'Dr. Mansour clinical', 'doctor', 'image/webp', '2026-04-02'),
        ('doc-mansour-botox', 'dr-mansour-botox.webp', '/images/doctors/dr-mansour-botox.webp', 'Dr. Mansour performing Botox', 'doctor', 'image/webp', '2026-04-02'),
        ('og-image', 'og-image.webp', '/og-image.webp', 'Haven Medical Clinic', 'general', 'image/webp', '2026-04-02')
      `;
    }

    // Seed default settings
    const existingSettings = await sql`SELECT COUNT(*) as count FROM settings`;
    if (Number(existingSettings[0].count) === 0) {
      await sql`INSERT INTO settings (key, value) VALUES
        ('general', ${JSON.stringify({ name: "Haven Medical", tagline: "Where Medical Excellence Meets Luxury Care", phone: "+961 71 888 930", email: "havenmedicalcliniclb@gmail.com", address: "Bayada, Qornet Chehwan, Lebanon", whatsapp: "+96171888930", hours: "Monday – Friday: 9:00 AM – 7:00 PM" })}),
        ('notifications', ${JSON.stringify({ newAppointments: true, newSubscribers: true, subscriptionChanges: true, weeklySummary: true })}),
        ('appearance', ${JSON.stringify({ primaryColor: "#1fbda6", accentColor: "#1fbda6" })}),
        ('email', ${JSON.stringify({ fromName: "Haven Medical", fromEmail: "havenmedicalcliniclb@gmail.com", replyTo: "havenmedicalcliniclb@gmail.com" })})
      `;
    }

    // Seed doctors
    const existingDoctors = await sql`SELECT COUNT(*) as count FROM doctors`;
    if (Number(existingDoctors[0].count) === 0) {
      await sql`INSERT INTO doctors (id, name, title, specialty, image, bio, sort_order, slug, full_bio, education, languages, experience_years, certifications, gallery, social_links) VALUES
        ('doc-1', 'Dr. Georges Khoury', 'Medical Director', 'Plastic & Reconstructive Surgery', '/images/doctors/dr-mansour.webp', 'With over 15 years of experience in plastic and reconstructive surgery, Dr. Khoury leads Haven Medical with a commitment to excellence and patient-centered care.', 1, 'dr-georges-khoury', 'Dr. Georges Khoury is the founder and Medical Director of Haven Medical Clinic. With over 15 years of experience in plastic and reconstructive surgery, he leads the clinic with a vision of combining world-class medical expertise with luxury patient care. Trained at some of the finest institutions in Europe and the Middle East, Dr. Khoury specializes in facial and body contouring procedures, rhinoplasty, and reconstructive surgery. His meticulous approach and artistic eye ensure natural-looking results that enhance each patient''s unique features.', ${JSON.stringify([{degree:"MD, Doctor of Medicine",institution:"Saint Joseph University, Beirut",year:"2008"},{degree:"Residency in Plastic Surgery",institution:"Hôtel-Dieu de France",year:"2013"},{degree:"Fellowship in Aesthetic Surgery",institution:"Paris, France",year:"2014"}])}, 'Arabic, French, English', 15, ${JSON.stringify([{title:"Board Certified Plastic Surgeon",issuer:"Lebanese Order of Physicians"},{title:"Member, ISAPS",issuer:"International Society of Aesthetic Plastic Surgery"},{title:"Advanced Rhinoplasty Certification",issuer:"European Academy of Facial Plastic Surgery"}])}, ${JSON.stringify(["/images/doctors/dr-mansour.webp","/images/doctors/dr-mansour-botox.webp"])}, ${JSON.stringify({instagram:"",facebook:"",linkedin:""})}),
        ('doc-2', 'Dr. Layla Haddad', 'Dermatologist', 'Dermatology & Aesthetic Medicine', '/images/doctors/dr-mansour-2.webp', 'Specializing in advanced dermatological treatments and aesthetic procedures, Dr. Haddad brings expertise in skin health and rejuvenation.', 2, 'dr-layla-haddad', 'Dr. Layla Haddad is a board-certified dermatologist specializing in both medical and aesthetic dermatology. With extensive training in the latest skin treatments and technologies, she provides personalized care plans that address each patient''s unique skin concerns. Her expertise spans from treating complex skin conditions to performing advanced aesthetic procedures including chemical peels, microneedling, and laser treatments. Dr. Haddad is passionate about helping patients achieve healthy, radiant skin through evidence-based approaches.', ${JSON.stringify([{degree:"MD, Doctor of Medicine",institution:"Lebanese University",year:"2010"},{degree:"Residency in Dermatology",institution:"American University of Beirut Medical Center",year:"2015"},{degree:"Fellowship in Cosmetic Dermatology",institution:"Milan, Italy",year:"2016"}])}, 'Arabic, French, English, Italian', 12, ${JSON.stringify([{title:"Board Certified Dermatologist",issuer:"Lebanese Order of Physicians"},{title:"Member, AAD",issuer:"American Academy of Dermatology"},{title:"Laser Safety Certification",issuer:"European Society for Laser Dermatology"}])}, ${JSON.stringify(["/images/doctors/dr-mansour-2.webp"])}, ${JSON.stringify({instagram:"",facebook:"",linkedin:""})}),
        ('doc-3', 'Dr. Marc Antoine', 'Aesthetic Physician', 'Injectable Treatments & Facial Aesthetics', '/images/doctors/dr-mansour-3.webp', 'An expert in non-surgical facial rejuvenation, Dr. Antoine is known for his natural-looking approach to Botox, fillers, and advanced injectable techniques.', 3, 'dr-marc-antoine', 'Dr. Marc Antoine is a leading aesthetic physician specializing in non-surgical facial rejuvenation. Known for his artistic approach and attention to detail, Dr. Antoine delivers subtle, natural-looking results that enhance his patients'' features without looking overdone. His expertise includes Botox, dermal fillers, thread lifts, and the latest injectable techniques. With years of specialized training and thousands of successful procedures, he has earned a reputation as one of Lebanon''s most sought-after aesthetic practitioners.', ${JSON.stringify([{degree:"MD, Doctor of Medicine",institution:"Université Saint-Esprit de Kaslik",year:"2011"},{degree:"Diploma in Aesthetic Medicine",institution:"Paris Descartes University",year:"2015"},{degree:"Advanced Injectable Training",institution:"London, UK",year:"2017"}])}, 'Arabic, French, English', 10, ${JSON.stringify([{title:"Certified Aesthetic Medicine Practitioner",issuer:"Lebanese Order of Physicians"},{title:"Allergan Medical Institute Trainer",issuer:"Allergan"},{title:"Member, AMWC",issuer:"Aesthetic & Anti-Aging Medicine World Congress"}])}, ${JSON.stringify(["/images/doctors/dr-mansour-3.webp"])}, ${JSON.stringify({instagram:"",facebook:"",linkedin:""})}),
        ('doc-4', 'Dr. Nadia Farhat', 'Nutritionist', 'Clinical Nutrition & Dietetics', '/images/doctors/dr-mansour-4.webp', 'Dr. Farhat combines clinical nutrition science with a holistic approach to help patients achieve their health and body composition goals.', 4, 'dr-nadia-farhat', 'Dr. Nadia Farhat is a clinical nutritionist and dietetics expert who takes a holistic approach to health and wellness. She believes that optimal nutrition is the foundation of beauty and well-being, and works closely with patients to develop personalized dietary plans that complement their aesthetic treatments. Whether helping patients prepare for surgery, recover from procedures, or simply achieve their ideal body composition, Dr. Farhat combines the latest nutritional science with practical, sustainable lifestyle guidance.', ${JSON.stringify([{degree:"PhD in Clinical Nutrition",institution:"Université Saint-Joseph, Beirut",year:"2013"},{degree:"Diploma in Sports Nutrition",institution:"International Olympic Committee",year:"2016"}])}, 'Arabic, French, English', 10, ${JSON.stringify([{title:"Licensed Dietitian",issuer:"Lebanese Ministry of Health"},{title:"Certified Sports Nutritionist",issuer:"International Society of Sports Nutrition"},{title:"Member, AND",issuer:"Academy of Nutrition and Dietetics"}])}, ${JSON.stringify(["/images/doctors/dr-mansour-4.webp"])}, ${JSON.stringify({instagram:"",facebook:"",linkedin:""})})
      `;
    }

    // Seed testimonials
    const existingTestimonials = await sql`SELECT COUNT(*) as count FROM testimonials`;
    if (Number(existingTestimonials[0].count) === 0) {
      await sql`INSERT INTO testimonials (id, name, treatment, text, rating) VALUES
        ('t-1', 'Carla M.', 'Laser Hair Removal', 'The team at Haven Medical made my laser hair removal experience so comfortable. After just a few sessions, I saw incredible results. The staff is professional and the clinic is beautiful.', 5),
        ('t-2', 'Rita S.', 'Botox & Fillers', 'I was nervous about my first Botox treatment, but the doctor''s expertise and gentle approach put me at ease. The results are so natural — exactly what I wanted.', 5),
        ('t-3', 'Ahmad K.', 'Rhinoplasty', 'My rhinoplasty results exceeded my expectations. The surgeon was meticulous, and the follow-up care was exceptional. I finally feel confident about my profile.', 5),
        ('t-4', 'Maya L.', 'Facial Treatments', 'The medical facial I received was unlike any spa treatment. My skin has never looked better. The combination of medical-grade products and expert care is unmatched.', 5),
        ('t-5', 'Sami B.', 'Physiotherapy', 'After my sports injury, the physiotherapy team helped me recover faster than I expected. They''re knowledgeable, patient, and truly care about your progress.', 5)
      `;
    }

    // Seed all services into admin_services
    const existingSvcs = await sql`SELECT COUNT(*) as count FROM admin_services`;
    if (Number(existingSvcs[0].count) === 0) {
      const allSvcs = [
        { slug: "laser-hair-removal", title: "Laser Hair Removal", shortDescription: "Permanent hair reduction with state-of-the-art laser technology for smooth, hair-free skin.", category: "aesthetic", iconName: "Zap", heroImage: "/images/services/laser-hair-removal.webp", overview: "Our advanced laser hair removal uses the latest diode and alexandrite laser technology to target hair follicles precisely. This FDA-approved treatment delivers long-lasting results with minimal discomfort, suitable for all skin types.", whoIsItFor: "Ideal for anyone looking to eliminate unwanted hair on the face, arms, legs, underarms, bikini area, back, or chest. Suitable for men and women of all skin types.", benefits: ["Permanent hair reduction after recommended sessions","Suitable for all skin types","Minimal discomfort with cooling technology","No downtime required","Smoother skin texture","Cost-effective long-term solution"], procedureSteps: ["Initial consultation and skin assessment","Treatment area is cleansed and prepared","Protective eyewear is provided","Laser is applied to the treatment area","Cooling gel or device soothes the skin","Post-treatment care instructions provided"], duration: "15-60 minutes depending on the treatment area", recovery: "No downtime. Mild redness may occur for 24-48 hours. Avoid sun exposure for 2 weeks.", expectedResults: "Noticeable hair reduction after 2-3 sessions. Optimal results typically achieved in 6-8 sessions, spaced 4-6 weeks apart.", faqs: [{question:"Is laser hair removal painful?",answer:"Most patients describe the sensation as a mild snapping feeling. Our advanced cooling systems minimize discomfort significantly."},{question:"How many sessions do I need?",answer:"Typically 6-8 sessions are recommended for optimal results, spaced 4-6 weeks apart depending on the treatment area."},{question:"Is it safe for dark skin?",answer:"Yes, our advanced laser technology is safe and effective for all skin types, including darker skin tones."},{question:"Can I shave between sessions?",answer:"Yes, shaving is encouraged between sessions. However, avoid waxing, plucking, or threading as these remove the hair root."}], relatedSlugs: ["facial-treatments","skin-boosters"] },
        { slug: "botox-fillers", title: "Botox & Fillers", shortDescription: "Restore youthful volume and smooth wrinkles with expert injectable treatments.", category: "aesthetic", iconName: "Syringe", heroImage: "/images/services/botox-fillers.webp", overview: "Our skilled practitioners use premium-grade botulinum toxin and hyaluronic acid fillers to rejuvenate your appearance naturally. Each treatment is customized to your unique facial anatomy for beautiful, balanced results.", whoIsItFor: "Adults seeking to reduce fine lines, wrinkles, and loss of facial volume. Ideal for forehead lines, crow's feet, nasolabial folds, lips, and jawline enhancement.", benefits: ["Immediate visible results","Non-surgical and minimally invasive","Natural-looking rejuvenation","Quick treatment with no downtime","Customized to your facial structure","Results last 4-12 months"], procedureSteps: ["Detailed facial assessment and consultation","Treatment plan designed to your goals","Topical numbing cream applied","Precise injection technique","Post-treatment massage (for fillers)","Follow-up appointment scheduled"], duration: "30-60 minutes", recovery: "Minimal downtime. Minor swelling or bruising may occur for 2-3 days. Full results visible within 2 weeks.", expectedResults: "Botox results appear within 3-7 days and last 3-4 months. Filler results are immediate and last 6-12 months depending on the product used.", faqs: [{question:"Will I look frozen or unnatural?",answer:"Our expert approach focuses on natural enhancement. We use precise doses to maintain your natural expressions while smoothing wrinkles."},{question:"How often do I need treatment?",answer:"Botox typically needs refreshing every 3-4 months. Fillers last 6-12 months depending on the area and product used."},{question:"Is the treatment painful?",answer:"Most patients find it very tolerable. We use topical numbing cream and fine needles to minimize discomfort."},{question:"What is the difference between Botox and fillers?",answer:"Botox relaxes muscles to smooth expression lines. Fillers add volume to areas that have lost fullness, like cheeks and lips."}], relatedSlugs: ["skin-boosters","facial-treatments","lip-lift"] },
        { slug: "skin-boosters", title: "Skin Boosters", shortDescription: "Deep hydration and rejuvenation treatments for radiant, glowing skin from within.", category: "aesthetic", iconName: "Droplets", heroImage: "/images/services/skin-boosters.webp", overview: "Skin boosters deliver hyaluronic acid micro-injections deep into the skin to improve hydration, elasticity, and overall skin quality. Unlike fillers, skin boosters hydrate the skin from within for a natural, dewy glow.", whoIsItFor: "Anyone experiencing dull, dehydrated, or tired-looking skin. Ideal for those wanting to improve skin texture, fine lines, and overall radiance without altering facial features.", benefits: ["Deep skin hydration from within","Improved skin elasticity and firmness","Reduction of fine lines","Natural radiant glow","Improved skin texture","Long-lasting hydration effects"], procedureSteps: ["Skin analysis and consultation","Cleansing and preparation","Topical anesthetic applied","Micro-injections of hyaluronic acid","Gentle massage of treated area","Post-care instructions provided"], duration: "30-45 minutes", recovery: "Minimal downtime. Small bumps may be visible for 24-48 hours. Normal activities can be resumed immediately.", expectedResults: "Initial glow visible immediately. Optimal results after 2-3 sessions spaced 2-4 weeks apart, lasting 6-9 months.", faqs: [{question:"What is the difference between skin boosters and fillers?",answer:"Skin boosters hydrate and improve skin quality without adding volume. Fillers add volume and reshape facial contours."},{question:"How many sessions do I need?",answer:"A course of 2-3 sessions spaced 2-4 weeks apart is recommended, with maintenance every 6-9 months."},{question:"Is there any downtime?",answer:"Minimal. You may notice small bumps or mild redness for 24-48 hours."}], relatedSlugs: ["botox-fillers","facial-treatments"] },
        { slug: "facial-treatments", title: "Facial Treatments", shortDescription: "Customized facial therapies combining medical expertise with luxury skincare.", category: "aesthetic", iconName: "Sparkles", heroImage: "/images/services/facial-treatments.webp", overview: "Our medical-grade facial treatments combine advanced skincare technologies with luxurious techniques. From deep cleansing and chemical peels to microneedling and LED therapy, each treatment is tailored to your specific skin concerns.", whoIsItFor: "Anyone seeking professional skincare solutions for acne, aging, hyperpigmentation, dull skin, or simply wanting to maintain healthy, glowing skin.", benefits: ["Medical-grade skincare products","Customized to your skin type","Deep cleansing and detoxification","Anti-aging and brightening effects","Relaxing and rejuvenating experience","Visible results from first session"], procedureSteps: ["In-depth skin analysis","Customized treatment plan","Deep cleansing and exfoliation","Targeted treatment application","Mask and serum infusion","SPF protection and aftercare"], duration: "45-75 minutes depending on the treatment", recovery: "No downtime for most treatments. Chemical peels may require 2-3 days of mild peeling.", expectedResults: "Immediate glow and improved skin texture. Best results achieved with regular monthly sessions.", faqs: [{question:"How often should I get a facial?",answer:"We recommend a professional facial every 4-6 weeks for optimal skin health."},{question:"Can I wear makeup after the treatment?",answer:"We recommend waiting at least 12 hours before applying makeup to allow your skin to absorb the benefits fully."},{question:"Which facial is best for me?",answer:"During your consultation, our specialists will assess your skin and recommend the most suitable treatment for your concerns."}], relatedSlugs: ["skin-boosters","laser-hair-removal"] },
        { slug: "rhinoplasty", title: "Rhinoplasty", shortDescription: "Expert nose reshaping surgery for improved aesthetics and function.", category: "surgical", iconName: "SmilePlus", heroImage: "/images/services/rhinoplasty.webp", overview: "Rhinoplasty at Haven Medical is performed by highly experienced surgeons who specialize in both aesthetic and functional nose surgery. We use the latest techniques to achieve natural, harmonious results that complement your facial features.", whoIsItFor: "Individuals seeking to improve the shape, size, or proportion of their nose, or those with breathing difficulties due to structural issues.", benefits: ["Improved facial harmony and balance","Enhanced self-confidence","Correction of breathing issues","Natural-looking results","Permanent transformation","Personalized surgical approach"], procedureSteps: ["Comprehensive consultation with 3D imaging","Detailed surgical plan development","Pre-operative preparation","Surgery under general anesthesia","Recovery room monitoring","Post-operative follow-up schedule"], duration: "2-3 hours", recovery: "Splint removal after 7 days. Swelling reduces significantly within 2 weeks. Final results visible in 6-12 months.", expectedResults: "Subtle and natural improvement visible once swelling subsides. Final refined result emerges over 6-12 months as the nose fully heals.", faqs: [{question:"Is rhinoplasty painful?",answer:"Discomfort is usually mild and well-managed with prescribed pain medication. Most patients report less pain than expected."},{question:"When can I return to work?",answer:"Most patients return to desk work within 7-10 days. Strenuous activities should be avoided for 4-6 weeks."},{question:"Will I have visible scars?",answer:"Closed rhinoplasty leaves no visible scars. Open rhinoplasty has a tiny incision on the columella that heals nearly invisibly."},{question:"Can rhinoplasty fix breathing problems?",answer:"Yes, functional rhinoplasty can correct a deviated septum and other structural issues that impair breathing."}], relatedSlugs: ["blepharoplasty","face-lifting","lip-lift"] },
        { slug: "blepharoplasty", title: "Blepharoplasty", shortDescription: "Eyelid surgery to rejuvenate and refresh your eye area for a youthful look.", category: "surgical", iconName: "Eye", heroImage: "/images/services/blepharoplasty.webp", overview: "Blepharoplasty removes excess skin, fat, and muscle from the upper and/or lower eyelids to create a more youthful, refreshed appearance. Our surgeons use precise techniques to achieve natural results that open up the eyes.", whoIsItFor: "Adults experiencing drooping upper eyelids, under-eye bags, or excess skin around the eyes that creates a tired or aged appearance.", benefits: ["More youthful and alert appearance","Improved peripheral vision (upper eyelid surgery)","Long-lasting results","Minimal visible scarring","Quick recovery time","Enhanced facial aesthetics"], procedureSteps: ["Detailed eye area assessment","Surgical plan customization","Local or general anesthesia","Precise tissue removal and sculpting","Fine suture closure","Post-operative care and follow-up"], duration: "1-2 hours", recovery: "Initial swelling resolves within 10-14 days. Most patients return to normal activities within 7-10 days.", expectedResults: "A refreshed, more youthful eye area. Results are long-lasting, typically 5-10 years or more.", faqs: [{question:"Will blepharoplasty change my eye shape?",answer:"The goal is to rejuvenate your eye area while maintaining your natural eye shape and expression."},{question:"Is the procedure performed under general anesthesia?",answer:"It can be performed under local anesthesia with sedation or general anesthesia, depending on the extent of surgery."},{question:"When will I see the final results?",answer:"Initial results are visible once swelling subsides (2-3 weeks). Final results are apparent within 3-6 months."}], relatedSlugs: ["rhinoplasty","face-lifting"] },
        { slug: "face-lifting", title: "Face Lifting", shortDescription: "Advanced surgical face lifting to restore youthful contours and firmness.", category: "surgical", iconName: "Heart", heroImage: "/images/services/face-lifting.webp", overview: "Our facelift procedures address sagging skin, deep folds, and loss of jawline definition. Using modern surgical techniques, we achieve natural-looking rejuvenation that turns back the clock while preserving your unique features.", whoIsItFor: "Men and women experiencing significant signs of facial aging including jowls, sagging cheeks, deep nasolabial folds, and neck laxity.", benefits: ["Restored youthful facial contours","Tightened jawline and neck","Natural-looking rejuvenation","Long-lasting results (7-10 years)","Improved skin texture","Enhanced self-confidence"], procedureSteps: ["Comprehensive facial analysis","Customized surgical plan","General anesthesia","Tissue repositioning and tightening","Excess skin removal","Recovery and follow-up care"], duration: "3-5 hours", recovery: "Initial healing in 2-3 weeks. Final results visible in 3-6 months. Support garments worn for 1-2 weeks.", expectedResults: "A naturally rejuvenated appearance with improved facial definition. Results last 7-10 years with good skincare.", faqs: [{question:"At what age should I consider a facelift?",answer:"There is no specific age. The right time is when you notice significant sagging that non-surgical treatments cannot adequately address, typically in the 40s-60s."},{question:"Will I look 'pulled' or unnatural?",answer:"Our approach focuses on natural repositioning rather than pulling. The goal is a refreshed, youthful look that still looks like you."},{question:"How long do facelift results last?",answer:"Results typically last 7-10 years. The aging process continues, but you will always look younger than if you had not had the procedure."}], relatedSlugs: ["blepharoplasty","rhinoplasty","lip-lift"] },
        { slug: "lip-lift", title: "Lip Lift", shortDescription: "Surgical enhancement to create a more defined, youthful upper lip.", category: "surgical", iconName: "SmilePlus", heroImage: "/images/services/lip-lift.webp", overview: "A lip lift is a subtle surgical procedure that shortens the distance between the nose and the upper lip, creating a more youthful and defined lip appearance. Unlike fillers, a lip lift provides a permanent enhancement of your lip contour.", whoIsItFor: "Individuals who feel their upper lip appears thin or elongated, or those seeking a more permanent alternative to lip fillers for upper lip enhancement.", benefits: ["Permanent lip enhancement","More visible upper lip vermilion","Youthful upper lip position","Natural-looking results","Improved lip-nose proportion","Complements other facial procedures"], procedureSteps: ["Facial proportion assessment","Surgical plan with precise measurements","Local anesthesia with sedation","Precise tissue removal","Careful suture closure","Follow-up and scar care"], duration: "45-60 minutes", recovery: "Sutures removed in 5-7 days. Most swelling resolves within 2 weeks. Scar fades over 3-6 months.", expectedResults: "More defined upper lip with greater vermilion show. Permanent results with a well-hidden scar at the base of the nose.", faqs: [{question:"How is a lip lift different from lip fillers?",answer:"A lip lift surgically shortens the space between nose and lip for permanent results. Fillers add volume but are temporary (6-12 months)."},{question:"Will the scar be visible?",answer:"The incision is placed at the base of the nose where it heals into a virtually invisible scar."},{question:"Can I combine a lip lift with fillers?",answer:"Yes, some patients combine a lip lift with subtle filler placement for optimal results."}], relatedSlugs: ["botox-fillers","face-lifting","rhinoplasty"] },
        { slug: "otoplasty", title: "Otoplasty", shortDescription: "Ear reshaping surgery for improved symmetry and confidence.", category: "surgical", iconName: "Ear", heroImage: "/images/services/otoplasty.webp", overview: "Otoplasty corrects protruding or misshapen ears through precise surgical reshaping. Our surgeons create natural-looking results that bring balance to your facial features and boost your confidence.", whoIsItFor: "Children (from age 5) and adults who are self-conscious about protruding, asymmetrical, or unusually shaped ears.", benefits: ["Improved ear symmetry","Natural-looking proportions","Boosted self-confidence","Permanent results","Hidden scarring behind the ear","Suitable for children and adults"], procedureSteps: ["Ear assessment and measurement","Customized surgical plan","Local or general anesthesia","Cartilage reshaping and repositioning","Precise suture placement","Headband and aftercare instructions"], duration: "1-2 hours", recovery: "Headband worn for 1-2 weeks. Return to normal activities within 7 days. Full healing in 4-6 weeks.", expectedResults: "Ears positioned closer to the head with natural proportions. Results are permanent.", faqs: [{question:"What is the best age for otoplasty?",answer:"Ears are nearly fully developed by age 5-6. Surgery can be performed from age 5 through adulthood."},{question:"Will there be visible scars?",answer:"Scars are placed behind the ears and are virtually invisible once healed."},{question:"Is the procedure painful?",answer:"Post-operative discomfort is mild and well-managed with pain medication."}], relatedSlugs: ["rhinoplasty","face-lifting"] },
        { slug: "orl-consultations", title: "ORL Consultations", shortDescription: "Expert ear, nose, and throat consultations for comprehensive ENT care.", category: "medical", iconName: "Stethoscope", heroImage: "/images/services/orl-consultations.webp", overview: "Our ORL (Otorhinolaryngology) specialists provide comprehensive consultations for ear, nose, and throat conditions. From chronic sinusitis and hearing issues to voice disorders, we offer thorough diagnostic evaluations and treatment plans.", whoIsItFor: "Patients experiencing ear infections, hearing loss, nasal congestion, sinusitis, throat problems, snoring, or any ENT-related concerns.", benefits: ["Expert ENT diagnosis","Advanced diagnostic equipment","Comprehensive treatment plans","Medical and surgical options","Follow-up care included","Multidisciplinary approach"], procedureSteps: ["Detailed medical history review","Physical examination of ears, nose, and throat","Diagnostic tests if needed","Clear diagnosis explanation","Personalized treatment plan","Follow-up scheduling"], duration: "30-45 minutes", recovery: "No recovery needed for consultations. Treatment recovery varies based on the recommended procedure.", expectedResults: "Clear understanding of your condition and a comprehensive treatment plan tailored to your needs.", faqs: [{question:"When should I see an ORL specialist?",answer:"If you experience persistent ear pain, hearing loss, chronic nasal congestion, recurrent sore throats, or voice changes lasting more than 2 weeks."},{question:"Do I need a referral?",answer:"No referral is necessary. You can book a consultation directly."},{question:"What should I bring to my consultation?",answer:"Bring any previous medical records, test results, and a list of current medications."}], relatedSlugs: ["rhinoplasty","physiotherapy"] },
        { slug: "gyneco-aesthetic", title: "Gyneco-Aesthetic", shortDescription: "Specialized gynecological aesthetic treatments in a confidential, caring environment.", category: "medical", iconName: "Heart", heroImage: "/images/services/gyneco-aesthetic.webp", overview: "Our gyneco-aesthetic services address intimate concerns with the utmost discretion and professionalism. Using the latest medical technologies, we offer treatments to improve comfort, confidence, and quality of life.", whoIsItFor: "Women seeking solutions for intimate aesthetic or functional concerns, including post-childbirth changes, hormonal effects, or age-related changes.", benefits: ["Confidential and discreet care","Female-focused approach","Non-surgical and surgical options","Improved comfort and confidence","Advanced medical technologies","Personalized treatment plans"], procedureSteps: ["Private consultation","Thorough assessment","Discussion of treatment options","Personalized treatment plan","Treatment with ongoing support","Follow-up and aftercare"], duration: "Varies by treatment", recovery: "Depends on the specific treatment chosen. Full details provided during consultation.", expectedResults: "Improved comfort, confidence, and quality of life. Results vary by treatment type.", faqs: [{question:"Are the consultations confidential?",answer:"Absolutely. All consultations and treatments are conducted in complete privacy and confidentiality."},{question:"Are the treatments painful?",answer:"Most treatments involve minimal discomfort. We use local anesthesia and gentle techniques to ensure your comfort."}], relatedSlugs: ["psychosexology"] },
        { slug: "psychosexology", title: "Psychosexology", shortDescription: "Professional psychosexual therapy for intimate health and wellbeing.", category: "medical", iconName: "Brain", heroImage: "/images/services/psychosexology.webp", overview: "Our psychosexology services provide professional, empathetic counseling for sexual and intimate health concerns. Our qualified therapists offer a safe, non-judgmental space to address psychological and relational aspects of sexual wellbeing.", whoIsItFor: "Individuals or couples experiencing sexual difficulties, intimacy concerns, relationship challenges related to sexual health, or seeking to improve their intimate wellbeing.", benefits: ["Safe and confidential environment","Qualified and empathetic therapists","Evidence-based therapeutic approaches","Individual and couples sessions","Holistic approach to sexual health","Improved quality of life and relationships"], procedureSteps: ["Initial confidential assessment","Discussion of concerns and goals","Personalized therapy plan","Regular therapy sessions","Progress evaluation","Ongoing support and guidance"], duration: "50-60 minutes per session", recovery: "No physical recovery. Ongoing therapy supports gradual improvement and lasting change.", expectedResults: "Improved understanding, coping strategies, and enhanced intimate wellbeing. Progress is gradual and personalized.", faqs: [{question:"Is everything I share confidential?",answer:"Yes, all sessions are strictly confidential in accordance with professional ethics and data protection regulations."},{question:"Do I need to come with my partner?",answer:"Sessions can be individual or with a partner, depending on your preference and the therapist's recommendation."}], relatedSlugs: ["gyneco-aesthetic"] },
        { slug: "physiotherapy", title: "Physiotherapy", shortDescription: "Expert physiotherapy for rehabilitation, pain management, and physical wellness.", category: "medical", iconName: "Activity", heroImage: "/images/services/physiotherapy.webp", overview: "Our physiotherapy department offers evidence-based treatments for musculoskeletal conditions, sports injuries, post-surgical rehabilitation, and chronic pain. Our qualified physiotherapists develop personalized programs to restore mobility and enhance your quality of life.", whoIsItFor: "Anyone experiencing pain, limited mobility, sports injuries, post-surgical recovery needs, or seeking preventive physical health maintenance.", benefits: ["Evidence-based treatment protocols","Personalized rehabilitation programs","Pain reduction and management","Improved mobility and strength","Sports injury recovery","Post-surgical rehabilitation"], procedureSteps: ["Comprehensive physical assessment","Diagnosis and goal setting","Personalized treatment plan","Manual therapy and exercises","Progress monitoring","Home exercise program"], duration: "45-60 minutes per session", recovery: "Ongoing improvement over the course of treatment. Most conditions show significant improvement within 6-8 sessions.", expectedResults: "Reduced pain, improved mobility, enhanced strength, and better overall physical function.", faqs: [{question:"How many sessions will I need?",answer:"This varies based on your condition. After your initial assessment, your physiotherapist will recommend a treatment plan with estimated session count."},{question:"Do I need a doctor's referral?",answer:"No referral is necessary to book a physiotherapy appointment."},{question:"What should I wear to my session?",answer:"Wear comfortable, loose-fitting clothing that allows easy movement and access to the affected area."}], relatedSlugs: ["deep-tissue-massage","lymphatic-drainage"] },
        { slug: "nutritionist", title: "Nutritionist", shortDescription: "Personalized nutrition plans for optimal health, wellness, and body composition.", category: "medical", iconName: "Apple", heroImage: "/images/services/nutritionist.webp", overview: "Our nutrition specialists provide science-based dietary guidance tailored to your unique needs. From weight management and body composition optimization to medical nutrition therapy, we help you achieve lasting health through proper nutrition.", whoIsItFor: "Anyone seeking to improve their diet, manage weight, optimize body composition, address nutritional deficiencies, or manage diet-related health conditions.", benefits: ["Personalized nutrition plans","Body composition analysis","Evidence-based dietary guidance","Weight management support","Medical nutrition therapy","Long-term lifestyle changes"], procedureSteps: ["Initial nutrition assessment","Body composition measurement","Dietary history review","Personalized nutrition plan","Regular follow-up sessions","Plan adjustments as needed"], duration: "45-60 minutes (initial), 30 minutes (follow-up)", recovery: "No recovery needed. Nutritional changes are implemented gradually for lasting results.", expectedResults: "Improved energy, body composition, and overall health within 4-8 weeks of following the personalized plan.", faqs: [{question:"Will I receive a meal plan?",answer:"Yes, you will receive a detailed, personalized meal plan based on your goals, preferences, and nutritional needs."},{question:"How often should I have follow-up sessions?",answer:"Typically every 2-4 weeks initially, then monthly as you progress toward your goals."},{question:"Do you offer body composition analysis?",answer:"Yes, we use advanced body composition analysis tools to track your progress accurately."}], subServices: [{name:"Body Composition Analysis",description:"Advanced body composition measurement to understand your muscle mass, body fat percentage, and metabolic health."},{name:"Nutrition Plans",description:"Customized meal plans designed around your lifestyle, food preferences, and health objectives."}], relatedSlugs: ["physiotherapy","lymphatic-drainage"] },
        { slug: "lymphatic-drainage", title: "Lymphatic Drainage", shortDescription: "Gentle massage technique to stimulate lymph flow and reduce swelling.", category: "wellness", iconName: "Leaf", heroImage: "/images/services/lymphatic-drainage.webp", overview: "Manual lymphatic drainage is a gentle, rhythmic massage technique that stimulates the lymphatic system to reduce fluid retention, boost immunity, and promote detoxification. This therapeutic treatment is both relaxing and medically beneficial.", whoIsItFor: "Individuals experiencing fluid retention, post-surgical swelling, heavy legs, or those seeking detoxification and immune system support.", benefits: ["Reduced fluid retention and swelling","Enhanced immune system function","Post-surgical recovery support","Detoxification and cleansing","Improved circulation","Deep relaxation"], procedureSteps: ["Health assessment and consultation","Comfortable positioning","Gentle rhythmic massage movements","Focus on lymph node areas","Full body or targeted treatment","Post-treatment hydration advice"], duration: "60-90 minutes", recovery: "No downtime. Increased urination is normal as the body eliminates excess fluid. Drink plenty of water post-treatment.", expectedResults: "Immediate reduction in swelling and sensation of lightness. Regular sessions provide cumulative benefits.", faqs: [{question:"Is lymphatic drainage painful?",answer:"Not at all. It uses very gentle, rhythmic movements that most patients find deeply relaxing."},{question:"How often should I have treatments?",answer:"1-2 sessions per week during an initial course, then monthly maintenance sessions for ongoing benefits."},{question:"Is it good after liposuction or surgery?",answer:"Yes, lymphatic drainage is highly recommended after surgical procedures to reduce swelling and speed recovery."}], relatedSlugs: ["deep-tissue-massage","physiotherapy"] },
        { slug: "deep-tissue-massage", title: "Deep Tissue Massage", shortDescription: "Targeted massage therapy for chronic tension, pain relief, and muscle recovery.", category: "wellness", iconName: "HandMetal", heroImage: "/images/services/deep-tissue-massage.webp", overview: "Our deep tissue massage targets the deeper layers of muscle and connective tissue to release chronic tension patterns, alleviate pain, and promote muscle recovery. Our trained therapists use firm pressure and specialized techniques for therapeutic results.", whoIsItFor: "Individuals with chronic muscle tension, athletes needing recovery, those with postural problems, or anyone seeking deep muscular relief.", benefits: ["Release of chronic muscle tension","Pain relief and management","Improved posture and flexibility","Sports recovery support","Stress and anxiety reduction","Improved blood circulation"], procedureSteps: ["Discussion of pain points and goals","Targeted treatment plan","Warm-up massage techniques","Deep tissue pressure application","Trigger point release","Cool-down and stretching advice"], duration: "60-90 minutes", recovery: "Mild soreness may occur for 24-48 hours. Drink plenty of water after the session.", expectedResults: "Significant tension relief after the first session. Regular sessions provide lasting improvement in chronic conditions.", faqs: [{question:"Is deep tissue massage painful?",answer:"You may experience some discomfort in areas of tension, but our therapists communicate with you to ensure the pressure is effective yet tolerable."},{question:"How often should I book a session?",answer:"For chronic issues, weekly sessions for the first month, then bi-weekly or monthly maintenance."},{question:"Can I exercise after the massage?",answer:"We recommend light activity for 24 hours post-treatment to allow your muscles to recover fully."}], relatedSlugs: ["lymphatic-drainage","physiotherapy"] },
        { slug: "medical-pedicure", title: "Medical Pedicure", shortDescription: "Professional medical foot care for nail health and foot wellness.", category: "wellness", iconName: "Scissors", heroImage: "/images/services/nail-repair.webp", overview: "Our medical pedicure goes beyond cosmetic foot care to address medical podiatric conditions. Performed in a sterile clinical environment using specialized instruments, we treat ingrown nails, fungal infections, calluses, and more.", whoIsItFor: "Anyone with nail problems, fungal infections, diabetic foot concerns, ingrown toenails, or those seeking professional clinical-grade foot care.", benefits: ["Clinical-grade sterile environment","Treatment of nail disorders","Fungal infection management","Ingrown toenail care","Professional nail restoration","Ongoing foot health maintenance"], procedureSteps: ["Foot assessment and diagnosis","Sterile preparation of treatment area","Professional nail and cuticle care","Treatment of specific conditions","Nail repair or restoration if needed","Foot care advice and follow-up plan"], duration: "45-60 minutes", recovery: "No downtime for standard treatments. Specific conditions may require follow-up appointments.", expectedResults: "Healthier nails and feet from the first session. Chronic conditions improve with regular treatments.", faqs: [{question:"How is a medical pedicure different from a regular pedicure?",answer:"Medical pedicures are performed in a sterile clinical environment using medical-grade instruments and treat actual foot and nail conditions, not just cosmetics."},{question:"Is it safe for diabetic patients?",answer:"Yes, our medical pedicure is especially recommended for diabetic patients who need professional, sterile foot care."},{question:"How often should I come?",answer:"Every 4-6 weeks for maintenance, or as recommended for specific conditions."}], subServices: [{name:"Nail Polish",description:"Medical-grade, breathable nail polish application that allows the nail to remain healthy."},{name:"Nail Repair System",description:"Advanced nail repair techniques for damaged, split, or broken nails using specialized medical products."},{name:"Fungus Treatment",description:"Targeted anti-fungal treatment protocols using medical-grade products and laser therapy when indicated."}], relatedSlugs: ["lymphatic-drainage","deep-tissue-massage"] },
      ];

      for (const s of allSvcs) {
        await sql`INSERT INTO admin_services (slug, title, short_description, category, icon_name, hero_image, overview, who_is_it_for, benefits, procedure_steps, duration, recovery, expected_results, faqs, related_slugs, sub_services)
          VALUES (${s.slug}, ${s.title}, ${s.shortDescription}, ${s.category}, ${s.iconName}, ${s.heroImage}, ${s.overview}, ${s.whoIsItFor}, ${JSON.stringify(s.benefits)}, ${JSON.stringify(s.procedureSteps)}, ${s.duration}, ${s.recovery}, ${s.expectedResults}, ${JSON.stringify(s.faqs)}, ${JSON.stringify(s.relatedSlugs)}, ${JSON.stringify(s.subServices || [])})`;
      }
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
