import { clinicInfo } from "@/data/clinic";

export function getWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${clinicInfo.whatsapp}?text=${encoded}`;
}

export function getBookingWhatsAppUrl(
  service?: string,
  date?: string,
  time?: string,
  name?: string
): string {
  const parts = ["Hello, I would like to request an appointment at Haven Medical."];
  if (service) parts.push(`Service: ${service}`);
  if (date) parts.push(`Preferred Date: ${date}`);
  if (time) parts.push(`Preferred Time: ${time}`);
  if (name) parts.push(`Name: ${name}`);
  return getWhatsAppUrl(parts.join("\n"));
}
