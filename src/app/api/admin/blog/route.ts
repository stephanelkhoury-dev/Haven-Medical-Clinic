import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM blog_posts ORDER BY date DESC`;
    const posts = rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt || "",
      content: r.content || "",
      category: r.category,
      image: r.image || "",
      author: r.author || "",
      date: r.date,
      readTime: r.read_time || "5 min read",
    }));
    return NextResponse.json(posts);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    await sql`INSERT INTO blog_posts (slug, title, excerpt, content, category, image, author, date, read_time)
      VALUES (${body.slug}, ${body.title}, ${body.excerpt || ""}, ${body.content || ""}, ${body.category || ""}, ${body.image || ""}, ${body.author || ""}, ${body.date || new Date().toISOString().split("T")[0]}, ${body.readTime || "5 min read"})`;
    return NextResponse.json(body);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
