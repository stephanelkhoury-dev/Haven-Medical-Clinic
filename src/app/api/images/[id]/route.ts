import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sql = getDb();
    const rows = await sql`SELECT file_data, mime_type, filename FROM media WHERE id = ${id} AND file_data IS NOT NULL LIMIT 1`;

    if (!rows.length || !rows[0].file_data) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const { file_data, mime_type, filename } = rows[0];
    const buffer = file_data as Buffer;
    const body = new Uint8Array(buffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": (mime_type as string) || "image/webp",
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
