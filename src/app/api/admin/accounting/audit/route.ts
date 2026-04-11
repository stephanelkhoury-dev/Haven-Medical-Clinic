import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// POST: Run migration to add in_audit column
export async function POST() {
  try {
    const sql = getDb();

    // Add in_audit column to all accounting tables if not exists
    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'acc_entries' AND column_name = 'in_audit') THEN
          ALTER TABLE acc_entries ADD COLUMN in_audit BOOLEAN DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'acc_expenses' AND column_name = 'in_audit') THEN
          ALTER TABLE acc_expenses ADD COLUMN in_audit BOOLEAN DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'acc_products' AND column_name = 'in_audit') THEN
          ALTER TABLE acc_products ADD COLUMN in_audit BOOLEAN DEFAULT true;
        END IF;
      END $$;
    `;

    return NextResponse.json({ success: true, message: "Audit columns added to all accounting tables" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Toggle in_audit for a specific record
export async function PATCH(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { table, id, inAudit } = body;

    if (!table || !id || typeof inAudit !== "boolean") {
      return NextResponse.json({ error: "Missing table, id, or inAudit field" }, { status: 400 });
    }

    // Validate table name to prevent SQL injection
    if (!["acc_entries", "acc_expenses", "acc_products"].includes(table)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    // Update the record
    if (table === "acc_entries") {
      await sql`UPDATE acc_entries SET in_audit = ${inAudit} WHERE id = ${id}`;
    } else if (table === "acc_expenses") {
      await sql`UPDATE acc_expenses SET in_audit = ${inAudit} WHERE id = ${id}`;
    } else if (table === "acc_products") {
      await sql`UPDATE acc_products SET in_audit = ${inAudit} WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true, id, inAudit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Bulk update in_audit for multiple records
export async function PUT(request: NextRequest) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { table, ids, inAudit } = body;

    if (!table || !Array.isArray(ids) || typeof inAudit !== "boolean") {
      return NextResponse.json({ error: "Missing table, ids array, or inAudit field" }, { status: 400 });
    }

    if (!["acc_entries", "acc_expenses", "acc_products"].includes(table)) {
      return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    if (ids.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    // Update all records
    if (table === "acc_entries") {
      await sql`UPDATE acc_entries SET in_audit = ${inAudit} WHERE id = ANY(${ids})`;
    } else if (table === "acc_expenses") {
      await sql`UPDATE acc_expenses SET in_audit = ${inAudit} WHERE id = ANY(${ids})`;
    } else if (table === "acc_products") {
      await sql`UPDATE acc_products SET in_audit = ${inAudit} WHERE id = ANY(${ids})`;
    }

    return NextResponse.json({ success: true, updated: ids.length, inAudit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
