import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Resolve MIME type from file or fallback from extension
    let mimeType = file.type;
    if (!mimeType || mimeType === "application/octet-stream") {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      mimeType = EXT_MIME[ext] || "";
    }

    if (!ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum 5 MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const id = crypto.randomUUID();
    const category = (formData.get("category") as string) || "general";
    const alt = (formData.get("alt") as string) || "";
    const now = new Date().toISOString().split("T")[0];

    const sql = getDb();
    await sql`INSERT INTO media (id, filename, url, alt, category, mime_type, size_bytes, uploaded_at, file_data)
      VALUES (${id}, ${file.name}, ${`/api/images/${id}`}, ${alt}, ${category}, ${mimeType}, ${file.size}, ${now}, ${buffer})`;

    return NextResponse.json({
      id,
      url: `/api/images/${id}`,
      filename: file.name,
      mimeType,
      sizeBytes: file.size,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
