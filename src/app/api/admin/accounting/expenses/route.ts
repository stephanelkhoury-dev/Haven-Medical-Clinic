import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");

    let rows;
    if (period) {
      rows = await sql`SELECT * FROM acc_expenses WHERE period = ${period} ORDER BY date DESC`;
    } else {
      rows = await sql`SELECT * FROM acc_expenses ORDER BY date DESC`;
    }

    const expenses = rows.map((r) => ({
      id: r.id,
      date: r.date,
      description: r.description,
      amount: r.amount,
      category: r.category,
      period: r.period,
      createdAt: r.created_at,
    }));
    return NextResponse.json(expenses);
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
    const now = new Date().toISOString();
    const date = body.date || now.slice(0, 10);
    const period = date.slice(0, 7);

    await sql`INSERT INTO acc_expenses (id, date, description, amount, category, period, created_at)
      VALUES (${id}, ${date}, ${body.description || ''}, ${Number(body.amount) || 0}, ${body.category || 'general'}, ${period}, ${now})`;

    return NextResponse.json({ id, date, description: body.description, amount: body.amount, category: body.category, period, createdAt: now });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
