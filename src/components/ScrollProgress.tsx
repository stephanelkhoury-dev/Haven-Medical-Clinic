"use client";

import { useScrollProgress } from "@/lib/animations";

export default function ScrollProgress() {
  const barRef = useScrollProgress();

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none"
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-primary via-accent to-primary-light"
        style={{ width: "0%" }}
      />
    </div>
  );
}
