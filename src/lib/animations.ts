"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";

// ── Register ScrollTrigger on client only ─────────────────────────────
let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;

async function ensureScrollTrigger() {
  if (ScrollTrigger) return ScrollTrigger;
  const mod = await import("gsap/ScrollTrigger");
  ScrollTrigger = mod.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  return ScrollTrigger;
}

// ── Magnetic hover effect for buttons/links ───────────────────────────
export function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.3, ease: "power2.out" });
    };
    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.3)" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return ref;
}

// ── Smooth parallax on scroll ─────────────────────────────────────────
export function useParallax(speed = 0.5) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number;
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const offset = (rect.top - window.innerHeight / 2) * speed;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return ref;
}

// ── Text split + animate by characters ────────────────────────────────
export function useTextReveal() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const text = el.textContent || "";
    const words = text.split(" ");
    el.innerHTML = "";
    el.setAttribute("aria-label", text);

    words.forEach((word, wi) => {
      const wordSpan = document.createElement("span");
      wordSpan.style.display = "inline-block";
      wordSpan.style.overflow = "hidden";
      wordSpan.setAttribute("aria-hidden", "true");

      word.split("").forEach((char) => {
        const s = document.createElement("span");
        s.textContent = char;
        s.style.display = "inline-block";
        s.style.opacity = "0";
        s.style.transform = "translateY(100%)";
        s.className = "char";
        wordSpan.appendChild(s);
      });
      el.appendChild(wordSpan);
      if (wi < words.length - 1) {
        const space = document.createTextNode("\u00A0");
        el.appendChild(space);
      }
    });

    const chars = el.querySelectorAll(".char");

    ensureScrollTrigger().then((ST) => {
      gsap.to(chars, {
        y: "0%",
        opacity: 1,
        duration: 0.6,
        stagger: 0.02,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    });
  }, []);

  return ref;
}

// ── Stagger children on scroll ────────────────────────────────────────
export function useStaggerReveal(stagger = 0.1) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const children = el.children;
    gsap.set(children, { opacity: 0, y: 40 });

    ensureScrollTrigger().then((ST) => {
      gsap.to(children, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
      });
    });
  }, [stagger]);

  return ref;
}

// ── Fade-in from direction on scroll ──────────────────────────────────
export function useScrollReveal(
  direction: "up" | "down" | "left" | "right" = "up",
  options?: { delay?: number; duration?: number }
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (el) el.style.opacity = "1";
      return;
    }

    const axis = direction === "left" || direction === "right" ? "x" : "y";
    const distance =
      direction === "up" || direction === "left" ? 60 : -60;

    gsap.set(el, { opacity: 0, [axis]: distance });

    ensureScrollTrigger().then((ST) => {
      gsap.to(el, {
        opacity: 1,
        [axis]: 0,
        duration: options?.duration ?? 0.8,
        delay: options?.delay ?? 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
      });
    });
  }, [direction, options?.delay, options?.duration]);

  return ref;
}

// ── Counter/number animation ──────────────────────────────────────────
export function useCountUp(target: number, duration = 2) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = target.toLocaleString();
      return;
    }

    const obj = { val: 0 };

    ensureScrollTrigger().then((ST) => {
      gsap.to(obj, {
        val: target,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          once: true,
        },
        onUpdate() {
          el.textContent = Math.round(obj.val).toLocaleString();
        },
      });
    });
  }, [target, duration]);

  return ref;
}

// ── Smooth scroll-linked progress bar ─────────────────────────────────
export function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      el.style.width = `${progress}%`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return ref;
}

// ── Hero entrance timeline ────────────────────────────────────────────
export function useHeroEntrance() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    const subtitle = el.querySelector("[data-anim='subtitle']");
    const title = el.querySelector("[data-anim='title']");
    const desc = el.querySelector("[data-anim='desc']");
    const cta = el.querySelector("[data-anim='cta']");
    const image = el.querySelector("[data-anim='image']");
    const floats = el.querySelectorAll("[data-anim='float']");

    tl.set([subtitle, title, desc, cta], { opacity: 0, y: 40 });
    if (image) tl.set(image, { opacity: 0, scale: 0.92 });
    if (floats.length) tl.set(floats, { opacity: 0, y: 30, scale: 0.9 });

    tl.to(subtitle, { opacity: 1, y: 0, duration: 0.6 }, 0.2)
      .to(title, { opacity: 1, y: 0, duration: 0.8 }, 0.35)
      .to(desc, { opacity: 1, y: 0, duration: 0.7 }, 0.6)
      .to(cta, { opacity: 1, y: 0, duration: 0.6 }, 0.8);

    if (image) {
      tl.to(image, { opacity: 1, scale: 1, duration: 1 }, 0.4);
    }
    if (floats.length) {
      tl.to(floats, { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.15 }, 0.9);
    }
  }, []);

  return containerRef;
}
