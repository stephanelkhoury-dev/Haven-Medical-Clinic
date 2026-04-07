import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await request.json();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await sql`UPDATE doctors SET
      name = ${body.name},
      title = ${body.title || ""},
      specialty = ${body.specialty || ""},
      image = ${body.image || ""},
      bio = ${body.bio || ""},
      sort_order = ${body.sortOrder ?? 0},
      slug = ${slug},
      full_bio = ${body.fullBio || ""},
      education = ${JSON.stringify(body.education || [])},
      languages = ${body.languages || ""},
      experience_years = ${body.experienceYears ?? 0},
      certifications = ${JSON.stringify(body.certifications || [])},
      gallery = ${JSON.stringify(body.gallery || [])},
      social_links = ${JSON.stringify(body.socialLinks || {})}
      WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM doctors WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
