import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period");

    let rows;
    if (period) {
      rows = await sql`SELECT * FROM acc_products WHERE period = ${period} ORDER BY date DESC`;
    } else {
      rows = await sql`SELECT * FROM acc_products ORDER BY date DESC`;
    }

    const products = rows.map((r) => ({
      id: r.id,
      date: r.date,
      productType: r.product_type,
      description: r.description,
      amount: r.amount,
      operatorName: r.operator_name,
      operatorShare: r.operator_share,
      clinicShare: r.clinic_share,
      period: r.period,
      createdAt: r.created_at,
      inAudit: r.in_audit !== false,
    }));
    return NextResponse.json(products);
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
    const amount = Number(body.amount) || 0;

    // Product split rules: Facial → Roula 90% clinic / 10% operator (reversed from Excel: operator gets product commission)
    // Nail → Ghinwa 10% clinic / 90% operator
    // Actually from Excel: Facial products → Roula row shows 90%, Nail → Ghinwa shows 10%
    // These represent the percentage that goes to the respective operator
    let operatorName = body.operatorName || '';
    let operatorShare = 0;
    let clinicShare = amount;

    if (body.productType === 'facial') {
      operatorName = operatorName || 'Roula';
      operatorShare = Math.round(amount * 0.9 * 100) / 100;
      clinicShare = Math.round((amount - operatorShare) * 100) / 100;
    } else if (body.productType === 'nail') {
      operatorName = operatorName || 'Ghinwa';
      operatorShare = Math.round(amount * 0.1 * 100) / 100;
      clinicShare = Math.round((amount - operatorShare) * 100) / 100;
    }

    await sql`INSERT INTO acc_products (id, date, product_type, description, amount, operator_name, operator_share, clinic_share, period, created_at)
      VALUES (${id}, ${date}, ${body.productType || 'facial'}, ${body.description || ''}, ${amount}, ${operatorName}, ${operatorShare}, ${clinicShare}, ${period}, ${now})`;

    return NextResponse.json({ id, date, productType: body.productType, description: body.description, amount, operatorName, operatorShare, clinicShare, period, createdAt: now });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
