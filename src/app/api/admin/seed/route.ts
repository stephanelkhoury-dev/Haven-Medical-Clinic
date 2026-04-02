import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

// This endpoint creates all tables and seeds initial data.
// Call it once after setting up your Neon database on Vercel.
// POST /api/admin/seed

export async function POST() {
  try {
    const sql = getDb();

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
        uploaded_at TEXT NOT NULL DEFAULT ''
      )
    `;

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
        ('general', ${JSON.stringify({ name: "Haven Medical", tagline: "Where Medical Excellence Meets Luxury Care", phone: "+961 71 888 930", email: "havenmedicalcliniclb@gmail.com", address: "Beirut, Lebanon", whatsapp: "+96171888930", hours: "Monday – Friday: 9:00 AM – 7:00 PM" })}),
        ('notifications', ${JSON.stringify({ newAppointments: true, newSubscribers: true, subscriptionChanges: true, weeklySummary: true })}),
        ('appearance', ${JSON.stringify({ primaryColor: "#1fbda6", accentColor: "#1fbda6" })}),
        ('email', ${JSON.stringify({ fromName: "Haven Medical", fromEmail: "havenmedicalcliniclb@gmail.com", replyTo: "havenmedicalcliniclb@gmail.com" })})
      `;
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
