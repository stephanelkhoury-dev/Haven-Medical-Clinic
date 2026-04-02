"use client";

import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { clinicInfo } from "@/data/clinic";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/*  Instagram icon SVG                                                 */
/* ------------------------------------------------------------------ */

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Instagram Feed Grid                                                */
/* ------------------------------------------------------------------ */

function InstagramGrid() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/instagram")
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const hasPosts = posts.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center gap-3 text-lg font-semibold text-dark">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center">
            <InstagramIcon className="w-4 h-4 text-white" />
          </span>
          @havenmedicalcliniclb
        </h3>
        <a
          href={clinicInfo.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
        >
          Follow <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>

      {/* Grid */}
      {!loaded ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : hasPosts ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {posts.slice(0, 6).map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  post.media_type === "VIDEO"
                    ? post.thumbnail_url || post.media_url
                    : post.media_url
                }
                alt={
                  post.caption
                    ? post.caption.slice(0, 120)
                    : "Instagram post from Haven Medical"
                }
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <InstagramIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              {post.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs line-clamp-2">{post.caption}</p>
                </div>
              )}
            </a>
          ))}
        </div>
      ) : (
        /* Fallback: beautiful placeholder CTA when no token / no posts */
        <a
          href={clinicInfo.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-gradient-to-br from-[#f09433]/5 via-[#dc2743]/5 to-[#bc1888]/5 border-2 border-dashed border-[#dc2743]/20 flex items-center justify-center group-hover:border-[#dc2743]/40 transition-colors"
              >
                <InstagramIcon className="w-8 h-8 text-[#dc2743]/25 group-hover:text-[#dc2743]/50 transition-colors" />
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-dark-light mt-6 group-hover:text-primary transition-colors">
            Follow us on Instagram for the latest treatments &amp; results
            <ArrowRight className="inline-block w-3 h-3 ml-1" aria-hidden="true" />
          </p>
        </a>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Facebook Page Plugin                                               */
/* ------------------------------------------------------------------ */

function FacebookEmbed() {
  const fbUrl = encodeURIComponent(clinicInfo.social.facebook);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center gap-3 text-lg font-semibold text-dark">
          <span className="w-8 h-8 rounded-lg bg-[#1877F2] flex items-center justify-center">
            <FacebookIcon className="w-4 h-4 text-white" />
          </span>
          Haven Medical
        </h3>
        <a
          href={clinicInfo.social.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
        >
          Follow <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>

      {/* Embed */}
      <div className="rounded-xl overflow-hidden border border-border-light bg-white">
        <iframe
          src={`https://www.facebook.com/plugins/page.php?href=${fbUrl}&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
          width="500"
          height="500"
          className="w-full border-0"
          style={{ maxWidth: "100%", overflow: "hidden" }}
          scrolling="no"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          title="Haven Medical Facebook Page"
          loading="lazy"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Composed SocialFeed section                                        */
/* ------------------------------------------------------------------ */

export default function SocialFeed() {
  return (
    <section
      className="py-20 lg:py-28 bg-white"
      aria-labelledby="social-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-primary font-medium tracking-[0.2em] text-sm uppercase mb-3">
            Follow Us
          </p>
          <h2
            id="social-heading"
            className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4"
          >
            Stay Connected on Social Media
          </h2>
          <div className="section-divider mx-auto mb-4" role="presentation" />
          <p className="text-dark-light max-w-2xl mx-auto">
            Follow Haven Medical for the latest treatments, patient
            transformations, and expert wellness tips from our specialists in
            Beirut.
          </p>
        </div>

        {/* Two-column: Instagram (left) + Facebook (right) */}
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7">
            <InstagramGrid />
          </div>
          <div className="lg:col-span-5">
            <FacebookEmbed />
          </div>
        </div>

        {/* Follow buttons row */}
        <div className="flex flex-wrap justify-center gap-4 mt-14">
          <a
            href={clinicInfo.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white px-6 py-3 rounded-full font-medium hover:shadow-lg hover:shadow-[#dc2743]/25 transition-all focus-visible:ring-2 focus-visible:ring-[#dc2743] focus-visible:ring-offset-2"
          >
            <InstagramIcon className="w-5 h-5" />
            Follow on Instagram
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </a>
          <a
            href={clinicInfo.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3 rounded-full font-medium hover:bg-[#1565c0] hover:shadow-lg hover:shadow-[#1877F2]/25 transition-all focus-visible:ring-2 focus-visible:ring-[#1877F2] focus-visible:ring-offset-2"
          >
            <FacebookIcon className="w-5 h-5" />
            Follow on Facebook
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
