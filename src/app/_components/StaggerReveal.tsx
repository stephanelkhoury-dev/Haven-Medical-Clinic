"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function StaggerReveal({
  children,
  staggerMs = 120,
  className = "",
}: {
  children: ReactNode;
  staggerMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(el.children) as HTMLElement[];
    items.forEach((child) => child.classList.add("scroll-reveal-hidden"));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((child, i) => {
            setTimeout(() => {
              child.classList.remove("scroll-reveal-hidden");
              child.classList.add("animate-fade-in-up");
            }, i * staggerMs);
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [staggerMs]);

  return <div ref={ref} className={className}>{children}</div>;
}
