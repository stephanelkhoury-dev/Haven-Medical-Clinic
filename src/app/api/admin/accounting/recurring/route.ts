import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

const ALLOWED = ["admin", "finance"];

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request, ALLOWED);
    if (isAuthError(auth)) return auth;

    const sql = getDb();
    const rows = await sql`SELECT * FROM acc_recurring ORDER BY description`;
    
    const recurring = rows.map((r) => ({
      id: r.id,
      description: r.description,
      amount: r.amount,
      category: r.category,
      frequency: r.frequency,
      dayOfMonth: r.day_of_month,
      active: r.active,
      lastGenerated: r.last_generated,
      createdAt: r.created_at,
    }));
    return NextResponse.json(recurring);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request, ALLOWED);
    if (isAuthError(auth)) return auth;

    const sql = getDb();
    const body = await request.json();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await sql`INSERT INTO acc_recurring (id, description, amount, category, frequency, day_of_month, active, created_at)
      VALUES (${id}, ${body.description}, ${Number(body.amount) || 0}, ${body.category || 'general'}, 
              ${body.frequency || 'monthly'}, ${Number(body.dayOfMonth) || 1}, ${body.active !== false}, ${now})`;

    return NextResponse.json({
      id,
      description: body.description,
      amount: body.amount,
      category: body.category || 'general',
      frequency: body.frequency || 'monthly',
      dayOfMonth: body.dayOfMonth || 1,
      active: body.active !== false,
      lastGenerated: '',
      createdAt: now,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Generate recurring expenses for a specific period
export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const period = body.period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    // Get all active recurring expenses
    const recurring = await sql`SELECT * FROM acc_recurring WHERE active = true`;
    
    // Check which haven't been generated for this period
    const toGenerate = [];
    for (const r of recurring) {
      const lastGen = r.last_generated || '';
      if (!lastGen.startsWith(period)) {
        toGenerate.push(r);
      }
    }

    if (toGenerate.length === 0) {
      return NextResponse.json({ message: "No new recurring expenses to generate", generated: 0 });
    }

    // Generate expenses
    const now = new Date().toISOString();
    let generated = 0;

    for (const r of toGenerate) {
      const id = crypto.randomUUID();
      const day = String(r.day_of_month || 1).padStart(2, "0");
      const date = `${period}-${day}`;

      await sql`INSERT INTO acc_expenses (id, date, description, amount, category, period, in_audit, created_at)
        VALUES (${id}, ${date}, ${r.description}, ${r.amount}, ${r.category}, ${period}, true, ${now})`;

      // Update last_generated
      await sql`UPDATE acc_recurring SET last_generated = ${period} WHERE id = ${r.id}`;
      generated++;
    }

    return NextResponse.json({ message: `Generated ${generated} recurring expense(s)`, generated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
