import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  Instagram Graph API proxy – fetches latest posts server-side      */
/*  Env var required: INSTAGRAM_ACCESS_TOKEN                          */
/*  Token refresh: POST /api/instagram?refresh=1 (long-lived tokens)  */
/* ------------------------------------------------------------------ */

const INSTAGRAM_API = "https://graph.instagram.com";
const CACHE_MS = 60 * 60 * 1000; // 1 hour

let cache: { data: unknown; ts: number } | null = null;

export async function GET(request: Request) {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ posts: [] });
  }

  // Return cached data if fresh
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data);
  }

  const url = new URL(`${INSTAGRAM_API}/me/media`);
  url.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "9");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    const json = await res.json();

    if (json.error) {
      console.error("Instagram API error:", json.error.message);
      return NextResponse.json({ posts: [] });
    }

    const result = { posts: json.data ?? [] };
    cache = { data: result, ts: Date.now() };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch (err) {
    console.error("Instagram fetch failed:", err);
    return NextResponse.json({ posts: [] });
  }
}

/** Refresh a long-lived token (valid 60 days, refreshable before expiry) */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("refresh") !== "1") {
    return NextResponse.json({ error: "Use ?refresh=1" }, { status: 400 });
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "No token configured" }, { status: 400 });
  }

  const url = new URL(`${INSTAGRAM_API}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);

  try {
    const res = await fetch(url.toString());
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
