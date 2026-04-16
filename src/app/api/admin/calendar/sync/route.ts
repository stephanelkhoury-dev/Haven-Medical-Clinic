import { createDAVClient } from "tsdav";
import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError } from "@/lib/auth";

// Parse iCal VEVENT data into a usable object
function parseVEvent(icalData: string) {
  const events: Array<{
    uid: string;
    summary: string;
    dtstart: string;
    dtend: string;
    location: string;
    description: string;
  }> = [];

  const vevents = icalData.split("BEGIN:VEVENT");
  for (let i = 1; i < vevents.length; i++) {
    const block = vevents[i].split("END:VEVENT")[0];
    const get = (key: string) => {
      // Handle folded lines (RFC 5545: continuation lines start with space/tab)
      const unfolded = block.replace(/\r?\n[ \t]/g, "");
      const match = unfolded.match(new RegExp(`^${key}[;:](.*)$`, "m"));
      return match ? match[1].replace(/^[^:]*:/, "").trim() : "";
    };

    const uid = get("UID");
    const summary = get("SUMMARY");
    const dtstart = get("DTSTART");
    const dtend = get("DTEND");
    const location = get("LOCATION");
    const description = get("DESCRIPTION");

    if (uid && summary) {
      events.push({ uid, summary, dtstart, dtend, location, description });
    }
  }
  return events;
}

// Convert iCal date (20260416T100000) to readable date/time
function parseICalDate(ical: string): { date: string; time: string } {
  if (!ical) return { date: "", time: "" };
  // Remove timezone prefix like TZID=...:
  const clean = ical.replace(/^.*:/, "");
  const match = clean.match(/^(\d{4})(\d{2})(\d{2})T?(\d{2})?(\d{2})?/);
  if (!match) return { date: ical, time: "" };
  const [, y, mo, d, h, mi] = match;
  const date = `${y}-${mo}-${d}`;
  const time = h && mi ? `${h}:${mi}` : "";
  return { date, time };
}

// GET — fetch synced events (from local cache, no credentials needed)
export async function GET(request: NextRequest) {
  const user = await verifyAuth(request);
  if (isAuthError(user)) return user;

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT * FROM ical_events ORDER BY event_date DESC, event_time ASC
    `;
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}

// POST — trigger sync from iCloud Calendar
export async function POST(request: NextRequest) {
  const user = await verifyAuth(request, ["admin"]);
  if (isAuthError(user)) return user;

  try {
    const sql = getDb();

    // Get iCloud credentials from settings
    const settingsRows = await sql`SELECT value FROM settings WHERE key = 'ical'`;
    if (settingsRows.length === 0) {
      return NextResponse.json({ error: "iCloud Calendar not configured. Go to Settings → Calendar to set up." }, { status: 400 });
    }

    const config = settingsRows[0].value as { appleId: string; appPassword: string; calendarName?: string };
    if (!config.appleId || !config.appPassword) {
      return NextResponse.json({ error: "Apple ID and App-Specific Password are required." }, { status: 400 });
    }

    // Connect to iCloud CalDAV
    const client = await createDAVClient({
      serverUrl: "https://caldav.icloud.com",
      credentials: {
        username: config.appleId,
        password: config.appPassword,
      },
      authMethod: "Basic",
      defaultAccountType: "caldav",
    });

    // Fetch all calendars
    const calendars = await client.fetchCalendars();
    if (!calendars.length) {
      return NextResponse.json({ error: "No calendars found in this iCloud account." }, { status: 404 });
    }

    // Pick the target calendar (by name or use all)
    const targetCalendars = config.calendarName
      ? calendars.filter(c => String(c.displayName || "").toLowerCase() === config.calendarName!.toLowerCase())
      : calendars;

    if (config.calendarName && targetCalendars.length === 0) {
      const available = calendars.map(c => String(c.displayName || "")).join(", ");
      return NextResponse.json(
        { error: `Calendar "${config.calendarName}" not found. Available: ${available}` },
        { status: 404 }
      );
    }

    // Ensure table exists
    await sql`CREATE TABLE IF NOT EXISTS ical_events (
      uid TEXT PRIMARY KEY,
      summary TEXT NOT NULL,
      event_date TEXT NOT NULL DEFAULT '',
      event_time TEXT NOT NULL DEFAULT '',
      end_date TEXT DEFAULT '',
      end_time TEXT DEFAULT '',
      location TEXT DEFAULT '',
      description TEXT DEFAULT '',
      calendar_name TEXT DEFAULT '',
      synced_at TEXT NOT NULL DEFAULT ''
    )`;

    let totalEvents = 0;
    let synced = 0;
    const now = new Date().toISOString();

    for (const calendar of targetCalendars) {
      try {
        const objects = await client.fetchCalendarObjects({ calendar });
        const calName = calendar.displayName || "Unnamed";

        for (const obj of objects) {
          if (!obj.data) continue;
          const events = parseVEvent(obj.data);
          totalEvents += events.length;

          for (const event of events) {
            const start = parseICalDate(event.dtstart);
            const end = parseICalDate(event.dtend);

            await sql`INSERT INTO ical_events (uid, summary, event_date, event_time, end_date, end_time, location, description, calendar_name, synced_at)
              VALUES (${event.uid}, ${event.summary}, ${start.date}, ${start.time}, ${end.date}, ${end.time}, ${event.location}, ${event.description}, ${calName}, ${now})
              ON CONFLICT (uid) DO UPDATE SET
                summary = ${event.summary},
                event_date = ${start.date},
                event_time = ${start.time},
                end_date = ${end.date},
                end_time = ${end.time},
                location = ${event.location},
                description = ${event.description},
                calendar_name = ${calName},
                synced_at = ${now}`;
            synced++;
          }
        }
      } catch {
        // Skip individual calendar errors
      }
    }

    return NextResponse.json({
      success: true,
      calendars: targetCalendars.map(c => c.displayName),
      totalEvents,
      synced,
      syncedAt: now,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
