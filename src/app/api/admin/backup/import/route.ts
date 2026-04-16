import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";
import * as XLSX from "xlsx";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

// Tables that are safe to import (excludes sessions, media binary data)
const IMPORTABLE_TABLES: Record<string, { pk: string; skipCols?: string[] }> = {
  appointments:          { pk: "id" },
  blog_posts:            { pk: "slug" },
  doctors:               { pk: "id" },
  testimonials:          { pk: "id" },
  admin_services:        { pk: "slug" },
  subscribers:           { pk: "id" },
  subscription_plans:    { pk: "id" },
  member_subscriptions:  { pk: "id" },
  acc_employees:         { pk: "id" },
  acc_entries:            { pk: "id" },
  acc_expenses:           { pk: "id" },
  acc_products:           { pk: "id" },
  acc_recurring:          { pk: "id" },
  acc_payroll:            { pk: "id" },
  clients:               { pk: "id", skipCols: ["password_hash", "setup_token", "setup_token_expires", "reset_token", "reset_token_expires"] },
  settings:              { pk: "key" },
};

export async function POST(request: NextRequest) {
  const user = await verifyAuth(request, ["admin"]);
  if (isAuthError(user)) return user;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const mode = formData.get("mode") as string || "preview"; // "preview" or "confirm"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });

    // Parse each sheet
    const importData: Record<string, Record<string, unknown>[]> = {};
    const preview: { table: string; rows: number; status: string }[] = [];

    for (const sheetName of wb.SheetNames) {
      const table = sheetName.toLowerCase();
      if (!IMPORTABLE_TABLES[table]) {
        preview.push({ table: sheetName, rows: 0, status: "skipped (not importable)" });
        continue;
      }

      const ws = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

      if (!rows.length) {
        preview.push({ table, rows: 0, status: "skipped (empty)" });
        continue;
      }

      // Filter out skip columns
      const skipCols = IMPORTABLE_TABLES[table].skipCols || [];
      const cleaned = rows.map(row => {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(row)) {
          if (skipCols.includes(k)) continue;
          if (k === "file_data" || k === "password_hash") continue;
          // Try to parse stringified JSON back
          if (typeof v === "string" && (v.startsWith("[") || v.startsWith("{"))) {
            try { out[k] = JSON.parse(v); } catch { out[k] = v; }
          } else {
            out[k] = v;
          }
        }
        return out;
      });

      importData[table] = cleaned;
      preview.push({ table, rows: cleaned.length, status: "ready" });
    }

    // Preview mode — just return what would be imported
    if (mode === "preview") {
      return NextResponse.json({ success: true, preview });
    }

    // Confirm mode — actually write to DB
    const sql = getSQL();
    const results: { table: string; inserted: number; updated: number; errors: string[] }[] = [];

    for (const [table, rows] of Object.entries(importData)) {
      const meta = IMPORTABLE_TABLES[table];
      if (!meta) continue;

      let inserted = 0;
      let updated = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          const pk = meta.pk;
          const pkValue = row[pk];
          if (!pkValue) {
            errors.push(`Row missing primary key "${pk}"`);
            continue;
          }

          // Check if row exists
          const existing = await sql.query(`SELECT ${pk} FROM ${table} WHERE ${pk} = $1`, [pkValue]);

          const cols = Object.keys(row);
          const vals = Object.values(row).map(v =>
            typeof v === "object" && v !== null ? JSON.stringify(v) : v
          );

          if (existing.length > 0) {
            // Update existing row
            const setClauses = cols
              .filter(c => c !== pk)
              .map((c, i) => `${c} = $${i + 1}`)
              .join(", ");
            const updateVals = cols.filter(c => c !== pk).map(c => {
              const v = row[c];
              return typeof v === "object" && v !== null ? JSON.stringify(v) : v;
            });
            if (setClauses) {
              await sql.query(
                `UPDATE ${table} SET ${setClauses} WHERE ${pk} = $${updateVals.length + 1}`,
                [...updateVals, pkValue]
              );
              updated++;
            }
          } else {
            // Insert new row
            const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
            await sql.query(
              `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`,
              vals
            );
            inserted++;
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          errors.push(`Row error: ${msg}`);
        }
      }

      results.push({ table, inserted, updated, errors });
    }

    return NextResponse.json({ success: true, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
