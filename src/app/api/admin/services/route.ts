import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { logActivity, getRequestUser } from "@/lib/activity";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM admin_services ORDER BY title ASC`;
    const services = rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      shortDescription: r.short_description || "",
      category: r.category,
      iconName: r.icon_name || "Sparkles",
      heroImage: r.hero_image || "",
      overview: r.overview || "",
      whoIsItFor: r.who_is_it_for || "",
      benefits: r.benefits || [],
      procedureSteps: r.procedure_steps || [],
      duration: r.duration || "",
      recovery: r.recovery || "",
      expectedResults: r.expected_results || "",
      faqs: r.faqs || [],
      relatedSlugs: r.related_slugs || [],
      price: r.price,
      priceFrom: r.price_from || false,
      priceNote: r.price_note || "",
      featured: r.featured || false,
      subServices: r.sub_services || [],
    }));
    return NextResponse.json(services);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    await sql`INSERT INTO admin_services (slug, title, short_description, category, icon_name, hero_image, overview, who_is_it_for, benefits, procedure_steps, duration, recovery, expected_results, faqs, related_slugs, price, price_from, price_note, featured, sub_services)
      VALUES (${body.slug}, ${body.title}, ${body.shortDescription || ""}, ${body.category || "aesthetic"}, ${body.iconName || "Sparkles"}, ${body.heroImage || ""}, ${body.overview || ""}, ${body.whoIsItFor || ""}, ${JSON.stringify(body.benefits || [])}, ${JSON.stringify(body.procedureSteps || [])}, ${body.duration || ""}, ${body.recovery || ""}, ${body.expectedResults || ""}, ${JSON.stringify(body.faqs || [])}, ${JSON.stringify(body.relatedSlugs || [])}, ${body.price ?? null}, ${body.priceFrom || false}, ${body.priceNote || ""}, ${body.featured || false}, ${JSON.stringify(body.subServices || [])})`;
    const u = await getRequestUser(request);
    if (u) logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "created", entityType: "service", entityId: body.slug, details: `Created service: ${body.title}` });
    return NextResponse.json(body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
