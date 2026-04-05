import { getDb } from "@/lib/db";
import AppointmentForm from "./appointment-form";

export const revalidate = 60;

export default async function AppointmentPage() {
  let serviceNames: string[] = [];
  try {
    const sql = getDb();
    const rows = await sql`SELECT title FROM admin_services ORDER BY title ASC`;
    serviceNames = rows.map((r) => r.title as string);
  } catch { /* fallback to empty */ }

  return <AppointmentForm serviceNames={serviceNames} />;
}
