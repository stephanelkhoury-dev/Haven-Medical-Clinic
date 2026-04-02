import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM subscription_plans ORDER BY price ASC`;
    const plans = rows.map((r) => ({
      id: r.id,
      name: r.name,
      price: r.price,
      interval: r.interval,
      features: r.features || [],
      popular: r.popular,
      description: r.description || "",
    }));
    return NextResponse.json(plans);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const id = body.id || body.name.toLowerCase().replace(/\s+/g, "-");
    await sql`INSERT INTO subscription_plans (id, name, price, interval, features, popular, description)
      VALUES (${id}, ${body.name}, ${body.price || 0}, ${body.interval || "monthly"}, ${JSON.stringify(body.features || [])}, ${body.popular || false}, ${body.description || ""})`;
    return NextResponse.json({ id, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
