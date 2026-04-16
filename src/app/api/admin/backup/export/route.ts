import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";
import * as XLSX from "xlsx";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

// All tables to export
const TABLES = [
  "admin_users",
  "appointments",
  "blog_posts",
  "doctors",
  "testimonials",
  "admin_services",
  "subscribers",
  "campaigns",
  "subscription_plans",
  "member_subscriptions",
  "acc_employees",
  "acc_entries",
  "acc_expenses",
  "acc_products",
  "acc_recurring",
  "acc_payroll",
  "clients",
  "media",
  "settings",
  "activity_logs",
  "notifications",
];

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request, ["admin"]);
  if (isAuthError(user)) return user;

  try {
    const sql = getSQL();
    const wb = XLSX.utils.book_new();

    for (const table of TABLES) {
      try {
        const rows = await sql.query(`SELECT * FROM ${table}`);
        // Stringify JSONB columns so Excel can display them
        const cleaned = rows.map((r: Record<string, unknown>) => {
          const out: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(r)) {
            // Skip binary data (media file_data)
            if (k === "file_data") { out[k] = v ? "[BINARY]" : ""; continue; }
            // Skip password hashes for security
            if (k === "password_hash") { out[k] = "[REDACTED]"; continue; }
            out[k] = typeof v === "object" && v !== null ? JSON.stringify(v) : v;
          }
          return out;
        });
        const ws = XLSX.utils.json_to_sheet(cleaned.length ? cleaned : [{}]);
        // Sheet names max 31 chars
        const sheetName = table.length > 31 ? table.substring(0, 31) : table;
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      } catch {
        // Table might not exist yet — add empty sheet
        const ws = XLSX.utils.json_to_sheet([{}]);
        const sheetName = table.length > 31 ? table.substring(0, 31) : table;
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }
    }

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="haven-backup-${date}.xlsx"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
