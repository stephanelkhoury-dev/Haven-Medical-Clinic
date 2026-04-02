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
    await sql`INSERT INTO doctors (id, name, title, specialty, image, bio, sort_order)
      VALUES (${id}, ${body.name}, ${body.title || ""}, ${body.specialty || ""}, ${body.image || ""}, ${body.bio || ""}, ${body.sortOrder ?? 0})`;
    return NextResponse.json({ id, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
