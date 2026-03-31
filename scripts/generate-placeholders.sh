#!/bin/bash
# ============================================================
# Haven Medical - Generate Placeholder Images
# ============================================================
# Creates placeholder SVG images for development
# Usage: ./scripts/generate-placeholders.sh
# ============================================================

set -e

cd "$(dirname "$0")/.."

echo "🏥 Haven Medical — Generating Placeholder Images"
echo ""

# Create directories
mkdir -p public/images/services
mkdir -p public/images/blog
mkdir -p public/images/doctors

# Function to create an SVG placeholder
create_svg() {
  local path=$1
  local width=$2
  local height=$3
  local label=$4
  local bg=${5:-"#D4C5A9"}

  cat > "$path" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect fill="${bg}" width="${width}" height="${height}"/>
  <rect fill="#8B7355" x="$((width/2 - 120))" y="$((height/2 - 20))" width="240" height="40" rx="8"/>
  <text fill="#FDFBF7" font-family="system-ui,sans-serif" font-size="14" font-weight="600" text-anchor="middle" x="$((width/2))" y="$((height/2 + 5))">${label}</text>
</svg>
EOF
  echo "   ✅ $path"
}

# Branding
create_svg "public/og-image.jpg" 1200 630 "Haven Medical — OG Image"
create_svg "public/logo.png" 200 60 "Haven Medical"
create_svg "public/icon-192.png" 192 192 "HM" "#8B7355"
create_svg "public/icon-512.png" 512 512 "HM" "#8B7355"

# Doctors
for i in 1 2 3 4; do
  create_svg "public/images/doctors/doctor-${i}.jpg" 400 500 "Doctor ${i}"
done

# Services
services=(
  "botox" "dermal-fillers" "chemical-peels" "microneedling" "laser-hair-removal"
  "hydrafacial" "prp-therapy" "body-contouring" "skin-tightening" "iv-therapy"
  "medical-consultation" "health-screening" "chronic-disease-management"
  "nutrition-counseling" "hormone-therapy" "acne-treatment" "scar-treatment"
)
for svc in "${services[@]}"; do
  create_svg "public/images/services/${svc}.jpg" 1200 600 "${svc}"
done

# Blog
for i in 1 2 3 4 5 6; do
  create_svg "public/images/blog/blog-${i}.jpg" 1200 600 "Blog Post ${i}"
done

echo ""
echo "✅ All placeholder images generated!"
echo "   Replace with real images before production."
