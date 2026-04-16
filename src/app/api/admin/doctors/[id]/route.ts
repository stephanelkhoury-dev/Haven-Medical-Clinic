import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { logActivity, getRequestUser } from "@/lib/activity";

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
    const u = await getRequestUser(request);
    if (u) logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "updated", entityType: "doctor", entityId: id, details: `Updated doctor: ${body.name}` });
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
    const u = await getRequestUser(_request);
    if (u) logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "deleted", entityType: "doctor", entityId: id, details: `Deleted doctor ${id}` });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
