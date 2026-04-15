import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sendCampaignEmail } from "@/lib/email";

// POST /api/admin/campaigns/[id]/send — Send campaign to all active subscribers
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;

    // Get campaign
    const campaigns = await sql`SELECT * FROM campaigns WHERE id = ${id}`;
    if (campaigns.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    const campaign = campaigns[0];

    // Get all active subscribers
    const subscribers = await sql`SELECT id, email FROM subscribers WHERE status = 'active'`;
    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No active subscribers" }, { status: 400 });
    }

    // Send emails (batch, non-blocking per email)
    let sent = 0;
    for (const sub of subscribers) {
      try {
        await sendCampaignEmail(sub.email, campaign.subject, campaign.content || "", sub.id);
        sent++;
      } catch {
        // Skip failed individual sends
      }
    }

    // Update campaign as sent
    const now = new Date().toISOString().split("T")[0];
    await sql`UPDATE campaigns SET status = 'sent', sent_at = ${now}, recipients = ${sent} WHERE id = ${id}`;

    return NextResponse.json({ success: true, sent, total: subscribers.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
