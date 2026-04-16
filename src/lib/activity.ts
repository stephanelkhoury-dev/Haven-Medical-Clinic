import { getDb } from "@/lib/db";
import { NextRequest } from "next/server";

/**
 * Try to extract the authenticated user from the request.
 * Returns null if no valid session — never blocks the request.
 */
export async function getRequestUser(request: NextRequest): Promise<{ id: string; name: string; role: string } | null> {
  try {
    const token = request.headers.get("x-auth-token");
    if (!token) return null;
    const sql = getDb();
    const rows = await sql`
      SELECT u.id, u.name, u.role FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.token = ${token} AND u.active = true AND s.expires_at > NOW()
    `;
    if (rows.length === 0) return null;
    return { id: rows[0].id as string, name: rows[0].name as string, role: rows[0].role as string };
  } catch { return null; }
}

/**
 * Log an admin user action.
 * Call this from API routes after any create/update/delete operation.
 */
export async function logActivity(opts: {
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
}) {
  try {
    const sql = getDb();
    const id = crypto.randomUUID();
    await sql`INSERT INTO activity_logs (id, user_id, user_name, user_role, action, entity_type, entity_id, details, created_at)
      VALUES (${id}, ${opts.userId}, ${opts.userName}, ${opts.userRole}, ${opts.action}, ${opts.entityType}, ${opts.entityId || ""}, ${opts.details || ""}, ${new Date().toISOString()})`;
  } catch {
    // Never block the main operation if logging fails
  }
}

/**
 * Create a notification for admin users.
 * userId = specific user, or leave empty and use roleTarget for role-based notifications.
 */
export async function createNotification(opts: {
  userId?: string;
  roleTarget?: string;
  title: string;
  message?: string;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
}) {
  try {
    const sql = getDb();
    const id = crypto.randomUUID();
    await sql`INSERT INTO notifications (id, user_id, role_target, title, message, type, link, read, created_at)
      VALUES (${id}, ${opts.userId || ""}, ${opts.roleTarget || ""}, ${opts.title}, ${opts.message || ""}, ${opts.type || "info"}, ${opts.link || ""}, false, ${new Date().toISOString()})`;
  } catch {
    // Never block
  }
}
