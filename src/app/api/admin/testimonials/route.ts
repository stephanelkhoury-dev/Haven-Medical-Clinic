import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM testimonials ORDER BY id ASC`;
    return NextResponse.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      treatment: r.treatment || "",
      text: r.text || "",
      rating: r.rating ?? 5,
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
    const id = `t-${Date.now()}`;
    await sql`INSERT INTO testimonials (id, name, treatment, text, rating)
      VALUES (${id}, ${body.name}, ${body.treatment || ""}, ${body.text || ""}, ${body.rating ?? 5})`;
    return NextResponse.json({ id, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
