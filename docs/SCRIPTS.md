# Scripts

All scripts are in the `scripts/` directory and are executable (`chmod +x`).

---

## Quick Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `setup.sh` | `./scripts/setup.sh` | Full project setup from scratch |
| `dev.sh` | `./scripts/dev.sh [port]` | Start dev server |
| `build.sh` | `./scripts/build.sh` | Lint + production build |
| `start.sh` | `./scripts/start.sh [port]` | Serve production build |
| `deploy.sh` | `./scripts/deploy.sh [--prod]` | Deploy to Vercel |
| `push.sh` | `./scripts/push.sh "message"` | Git commit & push |
| `lint.sh` | `./scripts/lint.sh [--fix]` | TypeScript + ESLint check |
| `install.sh` | `./scripts/install.sh [--clean]` | Install dependencies |
| `clean.sh` | `./scripts/clean.sh [--all]` | Remove build artifacts |
| `generate-placeholders.sh` | `./scripts/generate-placeholders.sh` | Create SVG placeholder images |

---

## NPM Scripts

Defined in `package.json`:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

---

## Script Details

### `setup.sh` — Full Project Setup

Runs the complete setup pipeline:

1. `npm install` — Install dependencies
2. `generate-placeholders.sh` — Create placeholder images
3. `npm run build` — Build for production
4. Prints summary with available commands

```bash
./scripts/setup.sh
```

---

### `dev.sh` — Development Server

Starts Next.js dev server with Turbopack. Auto-installs dependencies if missing.

```bash
./scripts/dev.sh        # Default port 3000
./scripts/dev.sh 3001   # Custom port
```

---

### `build.sh` — Production Build

Runs linter first (non-blocking), then builds for production.

```bash
./scripts/build.sh
```

---

### `start.sh` — Production Server

Serves the production build. Triggers build automatically if `.next` doesn't exist.

```bash
./scripts/start.sh        # Default port 3000
./scripts/start.sh 8080   # Custom port
```

---

### `deploy.sh` — Deploy to Vercel

Deploys to Vercel. Installs Vercel CLI if not present.

```bash
./scripts/deploy.sh          # Preview deployment
./scripts/deploy.sh --prod   # Production deployment
```

---

### `push.sh` — Git Push

Stages all changes, commits with message, and pushes to `origin main`.

```bash
./scripts/push.sh "Add new feature"
./scripts/push.sh                    # Default: "Update Haven Medical website"
```

---

### `lint.sh` — Code Quality

Runs TypeScript type check (`tsc --noEmit`) then ESLint.

```bash
./scripts/lint.sh          # Check only
./scripts/lint.sh --fix    # Auto-fix ESLint issues
```

---

### `install.sh` — Install Dependencies

Standard or clean install.

```bash
./scripts/install.sh           # npm install
./scripts/install.sh --clean   # Remove node_modules + package-lock, then install
```

---

### `clean.sh` — Clean Artifacts

Removes build cache and artifacts.

```bash
./scripts/clean.sh         # Remove .next + tsbuildinfo
./scripts/clean.sh --all   # Also remove node_modules + package-lock
```

---

### `generate-placeholders.sh` — Placeholder Images

Generates SVG placeholder images for all image slots (for development). Creates:

| Category | Count | Path |
|----------|-------|------|
| Branding | 4 | `public/og-image.jpg`, `logo.png`, `icon-192.png`, `icon-512.png` |
| Doctors | 4 | `public/images/doctors/doctor-[1-4].jpg` |
| Services | 17 | `public/images/services/[slug].jpg` |
| Blog | 6 | `public/images/blog/blog-[1-6].jpg` |

Total: **31 placeholder files**

> Replace these with real images before production launch.
