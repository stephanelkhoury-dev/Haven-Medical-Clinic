import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Haven Medical — Premium Medical & Aesthetic Clinic",
    short_name: "Haven Medical",
    description:
      "Premium aesthetic treatments, surgical procedures, and wellness services in Beirut, Lebanon.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFBFA",
    theme_color: "#1fbda6",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
