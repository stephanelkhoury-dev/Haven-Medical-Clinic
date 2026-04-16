import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { logActivity, getRequestUser } from "@/lib/activity";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const sql = getDb();
    const { slug } = await params;
    const body = await request.json();
    await sql`UPDATE blog_posts SET
      title = ${body.title},
      excerpt = ${body.excerpt || ""},
      content = ${body.content || ""},
      category = ${body.category || ""},
      image = ${body.image || ""},
      author = ${body.author || ""},
      date = ${body.date || ""},
      read_time = ${body.readTime || "5 min read"}
      WHERE slug = ${slug}`;
    const u = await getRequestUser(request);
    if (u) logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "updated", entityType: "blog", entityId: slug, details: `Updated blog: ${body.title}` });
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
    await sql`DELETE FROM blog_posts WHERE slug = ${slug}`;
    const u = await getRequestUser(_request);
    if (u) logActivity({ userId: u.id, userName: u.name, userRole: u.role, action: "deleted", entityType: "blog", entityId: slug, details: `Deleted blog post: ${slug}` });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
