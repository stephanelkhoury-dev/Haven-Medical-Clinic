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
    title: "The Ultimate Guide to Laser Hair Removal in Beirut: What to Expect",
    excerpt: "Everything you need to know before your first laser hair removal session in Beirut — from preparation to aftercare, costs, and expected results at Haven Medical.",
    content: `<h2>Why Laser Hair Removal Is the Gold Standard</h2>
<p>Laser hair removal has become the most sought-after aesthetic treatment in Beirut and across Lebanon. At Haven Medical, we use FDA-approved diode and alexandrite laser technology that safely treats all skin types — from fair to dark skin tones common in the Middle East.</p>

<h2>How Does Laser Hair Removal Work?</h2>
<p>The laser emits concentrated light that is absorbed by the melanin (pigment) in the hair follicle. This light energy converts to heat, which damages the follicle and inhibits future hair growth. Each session targets hair in the active growth phase, which is why multiple sessions are needed for complete results.</p>

<h2>Preparing for Your Session</h2>
<p>Before your laser hair removal appointment at Haven Medical, follow these preparation steps for the best results:</p>
<ul>
<li><strong>Avoid sun exposure</strong> for 2 weeks before treatment</li>
<li><strong>Shave the treatment area</strong> 24 hours before your session</li>
<li><strong>Avoid waxing or plucking</strong> for 4 weeks prior — the laser needs the hair root intact</li>
<li><strong>Skip retinol and AHA products</strong> on the treatment area for 3-5 days</li>
<li><strong>Come with clean skin</strong> — no lotions, deodorant, or makeup on the area</li>
</ul>

<h2>What Happens During Treatment?</h2>
<p>Your specialist at Haven Medical will first assess your skin type and hair color, then calibrate the laser settings accordingly. You will wear protective eyewear, and a cooling gel may be applied. Most patients describe the sensation as a mild snapping or tingling — far less painful than waxing.</p>

<h2>Areas We Treat</h2>
<p>At Haven Medical in Beirut, we perform laser hair removal on virtually every body area: face (upper lip, chin, sideburns), underarms, arms, legs, bikini line, Brazilian, back, chest, and abdomen. Treatment times range from 10 minutes for the upper lip to 45 minutes for full legs.</p>

<h2>How Many Sessions Do You Need?</h2>
<p>Most patients at our Beirut clinic achieve 80-90% permanent hair reduction after 6-8 sessions, spaced 4-6 weeks apart. The exact number depends on your hair color, skin type, hormonal factors, and the treatment area. Touch-up sessions may be needed once or twice a year.</p>

<h2>Aftercare Tips</h2>
<p>After your laser hair removal session, keep the treated area cool and protected. Apply aloe vera or a soothing moisturizer, avoid hot showers and saunas for 24-48 hours, and wear SPF 50 sunscreen daily. You may notice the treated hairs shedding naturally over the next 1-2 weeks.</p>

<h2>Book Your Laser Hair Removal at Haven Medical</h2>
<p>Ready to say goodbye to razors and waxing? Book a consultation at Haven Medical in Beirut. Our board-certified specialists will create a personalized treatment plan for smooth, hair-free skin.</p>`,
    category: "Aesthetic Medicine",
    image: "/images/blog/laser-guide.webp",
    author: "Dr. Sarah Mitchell",
    date: "2026-03-15",
    readTime: "5 min read",
  },
  {
    slug: "skincare-routine-for-glowing-skin",
    title: "Build Your Perfect Medical-Grade Skincare Routine",
    excerpt: "Discover how to layer medical-grade products for maximum results, with expert tips from our dermatology team in Beirut.",
    content: `<h2>Why Medical-Grade Skincare Matters</h2>
<p>Over-the-counter skincare products can only penetrate the outermost layer of your skin. Medical-grade products, available through clinics like Haven Medical in Beirut, contain higher concentrations of active ingredients that reach deeper skin layers where real transformation happens.</p>

<h2>The Essential Morning Routine</h2>
<p>A solid morning routine protects your skin from environmental damage throughout the day:</p>
<ol>
<li><strong>Gentle Cleanser</strong> — Use a pH-balanced cleanser to remove overnight buildup without stripping your skin barrier</li>
<li><strong>Vitamin C Serum</strong> — A potent antioxidant (15-20% L-ascorbic acid) that brightens, protects against UV damage, and stimulates collagen</li>
<li><strong>Hyaluronic Acid</strong> — Attracts and holds moisture, plumping your skin and reducing fine lines</li>
<li><strong>Moisturizer</strong> — Seal in all active ingredients with a lightweight, non-comedogenic moisturizer</li>
<li><strong>SPF 50 Sunscreen</strong> — The single most important anti-aging product. In Beirut's sunny climate, this is non-negotiable. Reapply every 2 hours when outdoors</li>
</ol>

<h2>The Evening Routine</h2>
<p>Nighttime is when your skin repairs itself. Use this window to apply your most active treatments:</p>
<ol>
<li><strong>Double Cleanse</strong> — Oil-based cleanser first to remove sunscreen and makeup, followed by a water-based cleanser</li>
<li><strong>Exfoliant (2-3x/week)</strong> — AHA (glycolic acid) for surface brightening, or BHA (salicylic acid) for pore-clearing</li>
<li><strong>Retinol / Retinoid</strong> — The gold standard for anti-aging. Start with 0.25% and gradually increase. Stimulates collagen, reduces wrinkles, evens tone</li>
<li><strong>Niacinamide Serum</strong> — Strengthens skin barrier, reduces pore size, calms inflammation</li>
<li><strong>Night Cream or Peptide Moisturizer</strong> — Richer than your daytime moisturizer, supporting overnight repair</li>
</ol>

<h2>Common Mistakes to Avoid</h2>
<p>Our dermatologists at Haven Medical see these errors frequently: over-exfoliating (leads to barrier damage), mixing too many actives at once (retinol + AHA = irritation), skipping sunscreen indoors, and switching products too frequently before giving them time to work (allow 6-12 weeks).</p>

<h2>When to See a Dermatologist</h2>
<p>If you have persistent acne, melasma, rosacea, or concerns about aging, a consultation with our dermatology team at Haven Medical in Beirut can help you build a prescription-grade routine tailored to your specific skin needs.</p>`,
    category: "Skin Care",
    image: "/images/blog/skincare-routine.webp",
    author: "Dr. Layla Haddad",
    date: "2026-03-10",
    readTime: "7 min read",
  },
  {
    slug: "botox-myths-debunked",
    title: "5 Common Botox Myths Debunked by Our Beirut Specialists",
    excerpt: "Separating fact from fiction about Botox treatments in Lebanon — learn the truth from experienced practitioners at Haven Medical.",
    content: `<h2>Myth 1: Botox Will Make You Look Frozen</h2>
<p>This is the number one concern patients at Haven Medical in Beirut share during consultations. The truth? When administered by a skilled practitioner, Botox delivers natural-looking results. The "frozen" look comes from over-injection. Our specialists use precise micro-dosing techniques to soften wrinkles while preserving your natural facial expressions.</p>

<h2>Myth 2: Botox Is Only for Wrinkles</h2>
<p>While Botox is famous for treating frown lines, forehead lines, and crow's feet, it has many other applications. At Haven Medical, we also use Botox for:</p>
<ul>
<li><strong>Jaw slimming</strong> (masseter reduction) for a more oval face shape</li>
<li><strong>Excessive sweating</strong> (hyperhidrosis) in underarms and palms</li>
<li><strong>Gummy smile correction</strong></li>
<li><strong>Neck bands</strong> (platysmal bands)</li>
<li><strong>Migraine relief</strong></li>
<li><strong>Lip flip</strong> for a subtle upper lip enhancement</li>
</ul>

<h2>Myth 3: Botox Is Dangerous</h2>
<p>Botox (botulinum toxin type A) has been FDA-approved since 2002 and has one of the strongest safety profiles of any cosmetic treatment. Billions of doses have been administered worldwide. At Haven Medical, we use only authentic, properly stored products from certified manufacturers, and all treatments are performed by qualified medical professionals.</p>

<h2>Myth 4: Once You Start, You Can't Stop</h2>
<p>Botox is not addictive. If you stop treatments, your muscles will simply return to their pre-treatment state over 3-6 months. There is no "rebound" effect — your wrinkles won't become worse than before. Many of our Beirut patients choose to maintain treatments because they enjoy the results, not because they have to.</p>

<h2>Myth 5: Botox and Fillers Are the Same Thing</h2>
<p>Botox relaxes muscles to prevent wrinkle formation (best for dynamic wrinkles caused by movement). Dermal fillers add volume — restoring lost facial volume, enhancing lips, and smoothing static wrinkles. At Haven Medical, we often combine both for a comprehensive facial rejuvenation approach.</p>

<h2>When Should You Start Botox?</h2>
<p>There's no "right" age to start Botox. Many patients in their late 20s and early 30s opt for preventive "baby Botox" — lower doses that prevent wrinkles from forming in the first place. Others begin in their 40s or 50s to soften existing lines. The best approach? Book a consultation at Haven Medical to discuss your goals with our specialists.</p>`,
    category: "Aesthetic Medicine",
    image: "/images/blog/botox-myths.webp",
    author: "Dr. Marc Antoine",
    date: "2026-03-05",
    readTime: "4 min read",
  },
  {
    slug: "importance-of-lymphatic-drainage",
    title: "Why Lymphatic Drainage Should Be Part of Your Wellness Routine",
    excerpt: "Explore the science behind lymphatic drainage massage and why it's essential for post-surgery recovery and overall well-being at Haven Medical Beirut.",
    content: `<h2>What Is the Lymphatic System?</h2>
<p>Your lymphatic system is a network of tissues, organs, and vessels that work together to maintain fluid balance, remove waste products, and support your immune system. Unlike your blood circulation (which has the heart as a pump), the lymphatic system relies on muscle movement and manual stimulation to flow properly.</p>

<h2>How Does Lymphatic Drainage Massage Work?</h2>
<p>Manual lymphatic drainage (MLD) uses gentle, rhythmic, pumping movements to stimulate lymph flow throughout the body. At Haven Medical in Beirut, our trained therapists follow specific anatomical pathways to guide fluid toward lymph nodes where it can be processed and eliminated. The technique is incredibly gentle — pressure is lighter than a typical massage.</p>

<h2>Benefits of Regular Lymphatic Drainage</h2>
<ul>
<li><strong>Reduces fluid retention and puffiness</strong> — Especially effective for facial puffiness and heavy legs</li>
<li><strong>Boosts immune function</strong> — By moving lymph fluid more efficiently, your body can better fight infections</li>
<li><strong>Accelerates post-surgical recovery</strong> — Essential after liposuction, tummy tuck, rhinoplasty, and face lifting procedures</li>
<li><strong>Detoxification</strong> — Helps your body eliminate metabolic waste and toxins</li>
<li><strong>Reduces cellulite appearance</strong> — Improved lymph flow can minimize the dimpled appearance of cellulite</li>
<li><strong>Deep relaxation</strong> — The gentle, repetitive movements activate your parasympathetic nervous system</li>
</ul>

<h2>Post-Surgery: Why Your Surgeon Recommends It</h2>
<p>After surgical procedures like liposuction, rhinoplasty, or face lifting, swelling is a normal part of healing. Lymphatic drainage significantly reduces this swelling, accelerates healing, and minimizes the risk of complications like seroma (fluid collection). At Haven Medical, we typically recommend starting lymphatic drainage 3-5 days after surgery, with sessions twice weekly for the first month.</p>

<h2>What to Expect During a Session</h2>
<p>A typical session at Haven Medical lasts 60-90 minutes. You'll lie comfortably while our therapist performs gentle, wave-like movements across your body, focusing on areas with lymph node clusters (neck, armpits, abdomen, groin). Most patients describe the experience as deeply relaxing — many fall asleep. You may notice increased urination afterward as your body flushes excess fluid.</p>

<h2>How Often Should You Book?</h2>
<p>For general wellness: once every 2-4 weeks. For post-surgical recovery: 2-3 times per week initially, tapering to weekly. For chronic conditions like lymphedema: as recommended by your physician. Book your lymphatic drainage session at Haven Medical in Beirut today.</p>`,
    category: "Wellness",
    image: "/images/blog/lymphatic-drainage.webp",
    author: "Marie Khalil",
    date: "2026-02-28",
    readTime: "6 min read",
  },
  {
    slug: "nutrition-for-healthy-skin",
    title: "Foods That Transform Your Skin: A Nutritionist's Guide",
    excerpt: "What you eat directly impacts your skin health. Our Beirut-based nutritionist shares the top foods for a radiant, youthful complexion.",
    content: `<h2>The Skin-Nutrition Connection</h2>
<p>Your skin is the largest organ in your body, and like every organ, it requires proper nutrition to function optimally. At Haven Medical in Beirut, our nutritionist works alongside our dermatologists to create holistic treatment plans that address skin health from the inside out.</p>

<h2>Top 10 Foods for Glowing Skin</h2>

<h3>1. Fatty Fish (Salmon, Sardines, Mackerel)</h3>
<p>Rich in omega-3 fatty acids, which reduce inflammation, keep skin moisturized, and protect against UV damage. Aim for 2-3 servings per week.</p>

<h3>2. Avocados</h3>
<p>Packed with healthy monounsaturated fats and vitamins E and C — both essential for skin elasticity and protection against oxidative damage.</p>

<h3>3. Walnuts</h3>
<p>One of the best plant-based sources of omega-3s. They also contain zinc, vitamin E, and selenium — all crucial for skin barrier function and wound healing.</p>

<h3>4. Sweet Potatoes</h3>
<p>Loaded with beta-carotene, which converts to vitamin A in your body. Acts as a natural sunblock and gives skin a warm, healthy glow.</p>

<h3>5. Berries (Blueberries, Strawberries)</h3>
<p>Antioxidant powerhouses that fight free radicals — the unstable molecules that accelerate skin aging and cause dullness.</p>

<h3>6. Tomatoes</h3>
<p>High in lycopene, a potent antioxidant that protects against sun damage. Cooking tomatoes increases lycopene absorption.</p>

<h3>7. Green Tea</h3>
<p>Contains catechins — powerful antioxidants that protect against UV damage, improve skin elasticity, and reduce redness.</p>

<h3>8. Dark Chocolate (70%+ Cacao)</h3>
<p>Rich in flavanols that improve blood flow to the skin, increase hydration, and protect against UV damage.</p>

<h3>9. Bone Broth</h3>
<p>A natural source of collagen, the protein that gives skin its structure and firmness. Regular consumption supports skin elasticity from within.</p>

<h3>10. Bell Peppers</h3>
<p>One cup of red bell pepper provides over 300% of your daily vitamin C needs — essential for collagen production and skin brightness.</p>

<h2>Foods to Avoid</h2>
<p>Excess sugar (causes glycation, which breaks down collagen), processed foods (trigger inflammation), excessive alcohol (dehydrates skin), and high-glycemic foods (can worsen acne) should be minimized for optimal skin health.</p>

<h2>Schedule a Nutrition Consultation</h2>
<p>Want a personalized nutrition plan that targets your skin concerns? Book a consultation with our nutritionist at Haven Medical in Beirut. We also offer comprehensive body composition analysis to track your progress.</p>`,
    category: "Nutrition",
    image: "/images/blog/nutrition-skin.webp",
    author: "Dr. Nadia Farhat",
    date: "2026-02-20",
    readTime: "5 min read",
  },
  {
    slug: "post-rhinoplasty-care-guide",
    title: "Essential Post-Rhinoplasty Care: Your Complete Recovery Roadmap",
    excerpt: "A comprehensive guide to rhinoplasty recovery in Beirut — tips for the first week, month-by-month timeline, and achieving the best results at Haven Medical.",
    content: `<h2>The First 24 Hours After Rhinoplasty</h2>
<p>Right after your rhinoplasty at Haven Medical in Beirut, you will have a nasal splint and possibly internal packing. You will need someone to drive you home and stay with you. Keep your head elevated at a 30-45 degree angle (even while sleeping), apply cold compresses around (not on) the nose to minimize swelling, and take your prescribed medications on schedule.</p>

<h2>Week 1: The Critical Recovery Phase</h2>
<p>The first week is when you will experience the most swelling and bruising. Here is what to expect and do:</p>
<ul>
<li><strong>Keep your head elevated</strong> at all times — sleep propped up with pillows</li>
<li><strong>Apply cold compresses</strong> gently around the cheeks and eyes (never directly on the nose)</li>
<li><strong>Avoid blowing your nose</strong> — gently dab if needed</li>
<li><strong>Take prescribed medications</strong> — antibiotics, pain relief, and anti-swelling medication</li>
<li><strong>Eat soft, easy-to-chew foods</strong> — avoid foods that require wide mouth opening</li>
<li><strong>No glasses</strong> — they put pressure on the nasal bridge. Use tape or a glasses bridge protector</li>
<li><strong>Nasal splint removal</strong> — typically at 5-7 days post-surgery at Haven Medical</li>
</ul>

<h2>Weeks 2-4: Early Recovery</h2>
<p>After the splint is removed, most of the bruising will have faded. You can return to desk work after 10-14 days. Continue to:</p>
<ul>
<li>Avoid strenuous exercise, heavy lifting, and bending over</li>
<li>Sleep on your back with your head elevated</li>
<li>Protect your nose from accidental bumps</li>
<li>Use saline nasal spray as directed</li>
<li>Avoid sun exposure — wear SPF 50 and a hat when outdoors</li>
</ul>

<h2>Months 1-3: Patience Is Key</h2>
<p>Swelling decreases gradually. About 70% of swelling resolves within the first month, but subtle swelling (especially at the tip) can persist for months. Your nose will continue to refine. Avoid contact sports and any activity that risks nasal impact.</p>

<h2>Months 3-12: The Final Result Takes Shape</h2>
<p>The final result of rhinoplasty takes 12-18 months to fully appreciate as the remaining swelling resolves and tissues settle. The nasal tip is the last area to reach its final shape. Be patient — the results are worth the wait.</p>

<h2>What to Report to Your Surgeon Immediately</h2>
<p>Contact Haven Medical immediately if you experience: heavy bleeding that does not stop, sudden increase in pain not relieved by medication, high fever (over 38.5°C), difficulty breathing through both nostrils, or any signs of infection (increasing redness, warmth, pus).</p>

<h2>Follow-Up Schedule at Haven Medical</h2>
<p>We schedule follow-up appointments at 1 week (splint removal), 2 weeks, 1 month, 3 months, 6 months, and 1 year after your rhinoplasty. Each visit allows your surgeon to monitor your healing and address any concerns. Book your rhinoplasty consultation at Haven Medical in Beirut.</p>`,
    category: "Post-Treatment Care",
    image: "/images/blog/rhinoplasty-care.webp",
    author: "Dr. Georges Khoury",
    date: "2026-02-15",
    readTime: "8 min read",
  },
];
