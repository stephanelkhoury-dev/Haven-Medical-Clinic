// ── iCalendar (.ics) and calendar URL generation ────────────────────
// Works with Apple Calendar, Google Calendar, Outlook, and any iCal-compatible app

const CLINIC_NAME = "Haven Medical Clinic";
const CLINIC_LOCATION = "Haven Medical Clinic, Beirut, Lebanon";
const CLINIC_PHONE = "+961 71 888 930";

interface AppointmentEvent {
  id: string;
  service: string;
  date: string;       // "YYYY-MM-DD" or readable date
  time: string;       // "HH:MM" or readable time like "10:00 AM"
  name: string;
  notes?: string;
}

/** Parse time string into { hours, minutes } – handles "14:00", "2:00 PM", etc. */
function parseTime(time: string): { hours: number; minutes: number } {
  const normalized = time.trim().toUpperCase();
  const ampm = normalized.match(/(AM|PM)$/);
  const digits = normalized.replace(/(AM|PM)/i, "").trim();
  const [h, m] = digits.split(":").map(Number);

  let hours = h || 0;
  const minutes = m || 0;

  if (ampm) {
    if (ampm[1] === "PM" && hours < 12) hours += 12;
    if (ampm[1] === "AM" && hours === 12) hours = 0;
  }

  return { hours, minutes };
}

/** Parse date string into Date – handles "YYYY-MM-DD", "DD/MM/YYYY", etc. */
function parseDate(dateStr: string): Date {
  // Try ISO format first
  const iso = Date.parse(dateStr);
  if (!isNaN(iso)) return new Date(iso);

  // Try DD/MM/YYYY
  const parts = dateStr.split(/[/\-.]/).map(Number);
  if (parts.length === 3) {
    if (parts[0] > 31) return new Date(parts[0], parts[1] - 1, parts[2]); // YYYY-MM-DD
    return new Date(parts[2], parts[1] - 1, parts[0]); // DD/MM/YYYY
  }

  return new Date(dateStr);
}

/** Format date to iCal DTSTART format: 20260416T100000 */
function toICalDate(date: Date, hours: number, minutes: number): string {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(hours).padStart(2, "0");
  const mi = String(minutes).padStart(2, "0");
  return `${y}${mo}${d}T${h}${mi}00`;
}

/** Generate .ics file content for an appointment */
export function generateICS(appointment: AppointmentEvent): string {
  const date = parseDate(appointment.date);
  const { hours, minutes } = parseTime(appointment.time);

  const start = toICalDate(date, hours, minutes);
  // Default 1-hour appointment
  const endHours = hours + 1;
  const end = toICalDate(date, endHours, minutes);

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

  const description = [
    `Service: ${appointment.service}`,
    `Patient: ${appointment.name}`,
    appointment.notes ? `Notes: ${appointment.notes}` : "",
    `Contact: ${CLINIC_PHONE}`,
  ].filter(Boolean).join("\\n");

  // Fold long lines per RFC 5545 (max 75 octets per line)
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Haven Medical Clinic//Appointments//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@haven-beautyclinic.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${appointment.service} — ${CLINIC_NAME}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${CLINIC_LOCATION}`,
    "STATUS:CONFIRMED",
    `ORGANIZER;CN=${CLINIC_NAME}:mailto:havenmedicalcliniclb@gmail.com`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:Reminder: ${appointment.service} at ${CLINIC_NAME}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

/** Generate Google Calendar add-event URL */
export function googleCalendarUrl(appointment: AppointmentEvent): string {
  const date = parseDate(appointment.date);
  const { hours, minutes } = parseTime(appointment.time);

  const start = toICalDate(date, hours, minutes);
  const end = toICalDate(date, hours + 1, minutes);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${appointment.service} — ${CLINIC_NAME}`,
    dates: `${start}/${end}`,
    details: `Service: ${appointment.service}\nPatient: ${appointment.name}${appointment.notes ? "\nNotes: " + appointment.notes : ""}\nContact: ${CLINIC_PHONE}`,
    location: CLINIC_LOCATION,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Generate Outlook.com add-event URL */
export function outlookCalendarUrl(appointment: AppointmentEvent): string {
  const date = parseDate(appointment.date);
  const { hours, minutes } = parseTime(appointment.time);

  const startDate = new Date(date);
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate);
  endDate.setHours(hours + 1);

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: `${appointment.service} — ${CLINIC_NAME}`,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: `Service: ${appointment.service}\nPatient: ${appointment.name}${appointment.notes ? "\nNotes: " + appointment.notes : ""}\nContact: ${CLINIC_PHONE}`,
    location: CLINIC_LOCATION,
  });

  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}

/** Generate calendar button HTML for emails */
export function calendarEmailButtons(appointmentId: string, appointment: AppointmentEvent): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.haven-beautyclinic.com";
  const icsUrl = `${baseUrl}/api/admin/appointments/${appointmentId}/calendar`;
  const googleUrl = googleCalendarUrl(appointment);

  return `
    <div style="text-align:center;margin:24px 0 8px;">
      <p style="color:#7c8694;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Add to Calendar</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td style="padding:0 6px;">
            <a href="${icsUrl}" target="_blank"
              style="display:inline-block;padding:10px 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;color:#1a1a2e;text-decoration:none;border:1px solid #e2e8f0;border-radius:6px;background:#ffffff;">
              🍎 Apple
            </a>
          </td>
          <td style="padding:0 6px;">
            <a href="${googleUrl}" target="_blank"
              style="display:inline-block;padding:10px 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;color:#1a1a2e;text-decoration:none;border:1px solid #e2e8f0;border-radius:6px;background:#ffffff;">
              📅 Google
            </a>
          </td>
          <td style="padding:0 6px;">
            <a href="${icsUrl}" target="_blank"
              style="display:inline-block;padding:10px 20px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:600;color:#1a1a2e;text-decoration:none;border:1px solid #e2e8f0;border-radius:6px;background:#ffffff;">
              📧 Outlook
            </a>
          </td>
        </tr>
      </table>
    </div>`;
}
