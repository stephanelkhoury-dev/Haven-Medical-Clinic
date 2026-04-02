import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const category = request.nextUrl.searchParams.get("category");
    const rows = category
      ? await sql`SELECT * FROM media WHERE category = ${category} ORDER BY uploaded_at DESC`
      : await sql`SELECT * FROM media ORDER BY uploaded_at DESC`;
    const media = rows.map((r) => ({
      id: r.id,
      filename: r.filename,
      url: r.url,
      alt: r.alt,
      category: r.category,
      mimeType: r.mime_type,
      sizeBytes: r.size_bytes,
      width: r.width,
      height: r.height,
      uploadedAt: r.uploaded_at,
    }));
    return NextResponse.json(media);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const id = crypto.randomUUID();
    await sql`INSERT INTO media (id, filename, url, alt, category, mime_type, size_bytes, width, height, uploaded_at)
      VALUES (${id}, ${body.filename}, ${body.url}, ${body.alt || ""}, ${body.category || "general"}, ${body.mimeType || "image/webp"}, ${body.sizeBytes || 0}, ${body.width || null}, ${body.height || null}, ${body.uploadedAt || new Date().toISOString().split("T")[0]})`;
    return NextResponse.json({ id, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
