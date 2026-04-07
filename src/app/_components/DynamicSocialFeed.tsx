"use client";

import dynamic from "next/dynamic";

const SocialFeed = dynamic(() => import("@/components/SocialFeed"), {
  ssr: false,
  loading: () => <div className="py-16" />,
});

export default SocialFeed;
