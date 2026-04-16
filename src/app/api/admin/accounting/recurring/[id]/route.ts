import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

const ALLOWED = ["admin", "finance"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request, ALLOWED);
    if (isAuthError(auth)) return auth;

    const sql = getDb();
    const { id } = await params;
    const body = await request.json();

    await sql`UPDATE acc_recurring SET
      description = ${body.description},
      amount = ${Number(body.amount) || 0},
      category = ${body.category || 'general'},
      frequency = ${body.frequency || 'monthly'},
      day_of_month = ${Number(body.dayOfMonth) || 1},
      active = ${body.active !== false}
      WHERE id = ${id}`;

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(request, ALLOWED);
    if (isAuthError(auth)) return auth;

    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM acc_recurring WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
