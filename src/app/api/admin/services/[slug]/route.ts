import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { logActivity, getRequestUser } from "@/lib/activity";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const sql = getDb();
    const { slug } = await params;
    const body = await request.json();
    await sql`UPDATE admin_services SET
      title = ${body.title},
      short_description = ${body.shortDescription || ""},
      category = ${body.category || "aesthetic"},
      icon_name = ${body.iconName || "Sparkles"},
      hero_image = ${body.heroImage || ""},
      overview = ${body.overview || ""},
      who_is_it_for = ${body.whoIsItFor || ""},
      benefits = ${JSON.stringify(body.benefits || [])},
      procedure_steps = ${JSON.stringify(body.procedureSteps || [])},
      duration = ${body.duration || ""},
      recovery = ${body.recovery || ""},
      expected_results = ${body.expectedResults || ""},
      faqs = ${JSON.stringify(body.faqs || [])},
      related_slugs = ${JSON.stringify(body.relatedSlugs || [])},
      price = ${body.price ?? null},
      price_from = ${body.priceFrom || false},
      price_note = ${body.priceNote || ""},
      featured = ${body.featured || false},
      sub_services = ${JSON.stringify(body.subServices || [])}
      WHERE slug = ${slug}`;
    const u = await getRequestUser(request);
    if (u) logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "updated", entityType: "service", entityId: slug, details: `Updated service: ${body.title}` });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const sql = getDb();
    const { slug } = await params;
    await sql`DELETE FROM admin_services WHERE slug = ${slug}`;
    const u = await getRequestUser(_request);
    if (u) logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "deleted", entityType: "service", entityId: slug, details: `Deleted service: ${slug}` });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
