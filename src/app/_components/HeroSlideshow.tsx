"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

const clinicImages = [
  { src: "/images/Pictures Clinic Space/entrance-haven.webp", alt: "Haven Medical & Beauty Clinic entrance" },
  { src: "/images/Pictures Clinic Space/welcome-desk.webp", alt: "Haven Medical reception desk" },
  { src: "/images/Pictures Clinic Space/medical-room.webp", alt: "Haven Medical treatment room" },
  { src: "/images/Pictures Clinic Space/room-laser-1.webp", alt: "Haven Medical laser treatment room" },
  { src: "/images/Pictures Clinic Space/room-3.webp", alt: "Haven Medical consultation room" },
  { src: "/images/Pictures Clinic Space/nutritionist-desk.webp", alt: "Haven Medical consultation office" },
  { src: "/images/Pictures Clinic Space/room-laser-2.webp", alt: "Haven Medical aesthetic treatment room" },
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % clinicImages.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative bg-gradient-to-br from-secondary-light to-secondary animate-fade-in stagger-2">
      {clinicImages.map((img, i) => (
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          fill
          className="object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
          sizes="(max-width: 1024px) 0vw, 50vw"
          priority={i === 0}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}
    </div>
  );
}
