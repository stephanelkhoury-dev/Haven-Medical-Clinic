import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sql = getDb();

    const [appointmentCount] = await sql`SELECT COUNT(*) as count FROM appointments`;
    const [pendingCount] = await sql`SELECT COUNT(*) as count FROM appointments WHERE status = 'pending'`;
    const [subscriberCount] = await sql`SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'`;
    const [memberCount] = await sql`SELECT COUNT(*) as count FROM member_subscriptions WHERE status = 'active'`;
    const [serviceCount] = await sql`SELECT COUNT(*) as count FROM admin_services`;
    const [blogCount] = await sql`SELECT COUNT(*) as count FROM blog_posts`;
    const [campaignCount] = await sql`SELECT COUNT(*) as count FROM campaigns`;
    const [mediaCount] = await sql`SELECT COUNT(*) as count FROM media`;

    return NextResponse.json({
      totalAppointments: Number(appointmentCount.count),
      pendingAppointments: Number(pendingCount.count),
      totalSubscribers: Number(subscriberCount.count),
      activeMembers: Number(memberCount.count),
      totalServices: Number(serviceCount.count),
      totalBlogPosts: Number(blogCount.count),
      totalCampaigns: Number(campaignCount.count),
      totalMedia: Number(mediaCount.count),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
