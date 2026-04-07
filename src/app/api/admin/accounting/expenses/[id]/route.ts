import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();
    const body = await request.json();
    const period = body.date?.slice(0, 7) || '';

    await sql`UPDATE acc_expenses SET
      date = ${body.date},
      description = ${body.description || ''},
      amount = ${Number(body.amount) || 0},
      category = ${body.category || 'general'},
      period = ${period}
    WHERE id = ${id}`;

    return NextResponse.json({ id, ...body, period });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();
    await sql`DELETE FROM acc_expenses WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
