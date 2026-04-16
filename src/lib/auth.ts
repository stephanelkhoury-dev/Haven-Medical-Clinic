import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

/**
 * Verify the session token from the request and optionally check role.
 * Returns the authenticated user or a 401/403 NextResponse.
 */
export async function verifyAuth(
  request: NextRequest,
  allowedRoles?: string[]
): Promise<AuthUser | NextResponse> {
  const token = request.headers.get("x-auth-token");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT u.id, u.username, u.name, u.role
    FROM admin_sessions s
    JOIN admin_users u ON s.user_id = u.id
    WHERE s.token = ${token} AND u.active = true AND s.expires_at > NOW()
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const user = rows[0] as AuthUser;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: "Forbidden — insufficient permissions" }, { status: 403 });
  }

  return user;
}

/** Check if a verifyAuth result is an error response */
export function isAuthError(result: AuthUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
