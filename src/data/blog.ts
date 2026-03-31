export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
}

export const blogCategories = [
  "Skin Care",
  "Aesthetic Medicine",
  "Wellness",
  "Foot Care",
  "Nutrition",
  "Post-Treatment Care",
  "Medical Advice",
  "Clinic Updates",
];

export const blogPosts: BlogPost[] = [
  {
    slug: "ultimate-guide-laser-hair-removal",
    title: "The Ultimate Guide to Laser Hair Removal: What to Expect",
    excerpt: "Everything you need to know before your first laser hair removal session — from preparation to aftercare and expected results.",
    content: "Laser hair removal has become one of the most popular aesthetic treatments worldwide...",
    category: "Aesthetic Medicine",
    image: "/images/blog/laser-guide.jpg",
    author: "Dr. Sarah Mitchell",
    date: "2026-03-15",
    readTime: "5 min read",
  },
  {
    slug: "skincare-routine-for-glowing-skin",
    title: "Build Your Perfect Medical-Grade Skincare Routine",
    excerpt: "Discover how to layer medical-grade products for maximum results, with expert tips from our dermatology team.",
    content: "A well-structured skincare routine is the foundation of healthy, glowing skin...",
    category: "Skin Care",
    image: "/images/blog/skincare-routine.jpg",
    author: "Dr. Layla Haddad",
    date: "2026-03-10",
    readTime: "7 min read",
  },
  {
    slug: "botox-myths-debunked",
    title: "5 Common Botox Myths Debunked by Our Specialists",
    excerpt: "Separating fact from fiction about Botox treatments — learn the truth from experienced practitioners.",
    content: "Botox remains one of the most popular non-surgical cosmetic treatments...",
    category: "Aesthetic Medicine",
    image: "/images/blog/botox-myths.jpg",
    author: "Dr. Marc Antoine",
    date: "2026-03-05",
    readTime: "4 min read",
  },
  {
    slug: "importance-of-lymphatic-drainage",
    title: "Why Lymphatic Drainage Should Be Part of Your Wellness Routine",
    excerpt: "Explore the science behind lymphatic drainage and why it's beneficial for post-surgery recovery and overall well-being.",
    content: "The lymphatic system is a crucial part of your body's immune defense...",
    category: "Wellness",
    image: "/images/blog/lymphatic-drainage.jpg",
    author: "Marie Khalil",
    date: "2026-02-28",
    readTime: "6 min read",
  },
  {
    slug: "nutrition-for-healthy-skin",
    title: "Foods That Transform Your Skin: A Nutritionist's Guide",
    excerpt: "What you eat directly impacts your skin health. Our nutritionist shares the top foods for a radiant complexion.",
    content: "Your skin is a reflection of your inner health...",
    category: "Nutrition",
    image: "/images/blog/nutrition-skin.jpg",
    author: "Dr. Nadia Farhat",
    date: "2026-02-20",
    readTime: "5 min read",
  },
  {
    slug: "post-rhinoplasty-care-guide",
    title: "Essential Post-Rhinoplasty Care: Your Recovery Roadmap",
    excerpt: "A comprehensive guide to rhinoplasty recovery — tips for the first week, months ahead, and achieving the best results.",
    content: "Recovery after rhinoplasty is a journey that requires patience and proper care...",
    category: "Post-Treatment Care",
    image: "/images/blog/rhinoplasty-care.jpg",
    author: "Dr. Georges Khoury",
    date: "2026-02-15",
    readTime: "8 min read",
  },
];
