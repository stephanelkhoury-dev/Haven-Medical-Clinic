import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM doctors ORDER BY sort_order ASC`;
    return NextResponse.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      title: r.title || "",
      specialty: r.specialty || "",
      image: r.image || "",
      bio: r.bio || "",
      sortOrder: r.sort_order ?? 0,
      slug: r.slug || "",
      fullBio: r.full_bio || "",
      education: r.education || [],
      languages: r.languages || "",
      experienceYears: r.experience_years ?? 0,
      certifications: r.certifications || [],
      gallery: r.gallery || [],
      socialLinks: r.social_links || {},
    })));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const id = `doc-${Date.now()}`;
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await sql`INSERT INTO doctors (id, name, title, specialty, image, bio, sort_order, slug, full_bio, education, languages, experience_years, certifications, gallery, social_links)
      VALUES (${id}, ${body.name}, ${body.title || ""}, ${body.specialty || ""}, ${body.image || ""}, ${body.bio || ""}, ${body.sortOrder ?? 0}, ${slug}, ${body.fullBio || ""}, ${JSON.stringify(body.education || [])}, ${body.languages || ""}, ${body.experienceYears ?? 0}, ${JSON.stringify(body.certifications || [])}, ${JSON.stringify(body.gallery || [])}, ${JSON.stringify(body.socialLinks || {})})`;
    return NextResponse.json({ id, slug, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
