export interface Doctor {
  name: string;
  title: string;
  specialty: string;
  image: string;
  bio: string;
}

export const doctors: Doctor[] = [
  {
    name: "Dr. Georges Khoury",
    title: "Medical Director",
    specialty: "Plastic & Reconstructive Surgery",
    image: "/images/doctors/doctor-1.jpg",
    bio: "With over 15 years of experience in plastic and reconstructive surgery, Dr. Khoury leads Haven Medical with a commitment to excellence and patient-centered care.",
  },
  {
    name: "Dr. Layla Haddad",
    title: "Dermatologist",
    specialty: "Dermatology & Aesthetic Medicine",
    image: "/images/doctors/doctor-2.jpg",
    bio: "Specializing in advanced dermatological treatments and aesthetic procedures, Dr. Haddad brings expertise in skin health and rejuvenation.",
  },
  {
    name: "Dr. Marc Antoine",
    title: "Aesthetic Physician",
    specialty: "Injectable Treatments & Facial Aesthetics",
    image: "/images/doctors/doctor-3.jpg",
    bio: "An expert in non-surgical facial rejuvenation, Dr. Antoine is known for his natural-looking approach to Botox, fillers, and advanced injectable techniques.",
  },
  {
    name: "Dr. Nadia Farhat",
    title: "Nutritionist",
    specialty: "Clinical Nutrition & Dietetics",
    image: "/images/doctors/doctor-4.jpg",
    bio: "Dr. Farhat combines clinical nutrition science with a holistic approach to help patients achieve their health and body composition goals.",
  },
];

export const testimonials = [
  {
    name: "Carla M.",
    treatment: "Laser Hair Removal",
    text: "The team at Haven Medical made my laser hair removal experience so comfortable. After just a few sessions, I saw incredible results. The staff is professional and the clinic is beautiful.",
    rating: 5,
  },
  {
    name: "Rita S.",
    treatment: "Botox & Fillers",
    text: "I was nervous about my first Botox treatment, but the doctor's expertise and gentle approach put me at ease. The results are so natural — exactly what I wanted.",
    rating: 5,
  },
  {
    name: "Ahmad K.",
    treatment: "Rhinoplasty",
    text: "My rhinoplasty results exceeded my expectations. The surgeon was meticulous, and the follow-up care was exceptional. I finally feel confident about my profile.",
    rating: 5,
  },
  {
    name: "Maya L.",
    treatment: "Facial Treatments",
    text: "The medical facial I received was unlike any spa treatment. My skin has never looked better. The combination of medical-grade products and expert care is unmatched.",
    rating: 5,
  },
  {
    name: "Sami B.",
    treatment: "Physiotherapy",
    text: "After my sports injury, the physiotherapy team helped me recover faster than I expected. They're knowledgeable, patient, and truly care about your progress.",
    rating: 5,
  },
];

export const clinicInfo = {
  name: "Haven Medical",
  tagline: "Where Medical Excellence Meets Luxury Care",
  phone: "+961 XX XXX XXX",
  whatsapp: "+961XXXXXXXX",
  email: "info@havenmedical.com",
  address: "Beirut, Lebanon",
  mapUrl: "https://maps.google.com/?q=Haven+Medical+Beirut",
  hours: {
    weekdays: "Monday – Friday: 9:00 AM – 7:00 PM",
    saturday: "Saturday: 9:00 AM – 3:00 PM",
    sunday: "Sunday: Closed",
  },
  social: {
    instagram: "https://instagram.com/havenmedical",
    facebook: "https://facebook.com/havenmedical",
    tiktok: "https://tiktok.com/@havenmedical",
  },
};
