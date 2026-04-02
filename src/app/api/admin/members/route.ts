import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM member_subscriptions ORDER BY start_date DESC`;
    const members = rows.map((r) => ({
      id: r.id,
      memberId: r.member_id,
      memberName: r.member_name,
      memberEmail: r.member_email,
      planId: r.plan_id,
      planName: r.plan_name || "",
      status: r.status,
      startDate: r.start_date,
      nextBilling: r.next_billing || "",
      amount: r.amount || 0,
    }));
    return NextResponse.json(members);
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
    const memberId = body.memberId || `m${Date.now()}`;
    await sql`INSERT INTO member_subscriptions (id, member_id, member_name, member_email, plan_id, plan_name, status, start_date, next_billing, amount)
      VALUES (${id}, ${memberId}, ${body.memberName}, ${body.memberEmail}, ${body.planId}, ${body.planName || ""}, ${body.status || "active"}, ${body.startDate || new Date().toISOString().split("T")[0]}, ${body.nextBilling || ""}, ${body.amount || 0})`;
    return NextResponse.json({ id, memberId, ...body });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
