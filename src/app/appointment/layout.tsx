import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an Appointment — Haven Medical Beirut",
  description:
    "Book your aesthetic or medical appointment at Haven Medical Beirut. Choose Botox, rhinoplasty, laser hair removal, or any treatment — confirmed via WhatsApp.",
  alternates: { canonical: "https://www.haven-beautyclinic.com/appointment" },
  openGraph: {
    title: "Book an Appointment at Haven Medical",
    description: "Schedule your aesthetic or medical treatment consultation at Haven Medical, Beirut.",
    url: "https://www.haven-beautyclinic.com/appointment",
  },
};

export default function AppointmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
