import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Request an appointment at Haven Medical. Choose your treatment, preferred date and time, and our team will confirm via WhatsApp.",
};

export default function AppointmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
