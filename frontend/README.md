# FromScratch.ai Webapp

Transform your software ideas into comprehensive project plans — with automatic diagram generation, tech stack recommendations, estimates, and full documentation — in seconds. Collaborate live with your team on edits  and iterate rapidly.

## Key Features

- Automatic diagram generation: architecture, flows, and Gantt timelines
- Design pattern and tech stack recommendations
- Timeline and cost estimation
- Full documentation generation (API specs, guides, cahier des charges)
- Project scaffolding/code skeleton previews
- Real-time collaboration UX model
- In-page assistant chatbot

## Tech Stack

- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + Tailwind Typography
- UI Components: shadcn/ui (Radix primitives)
- Icons: lucide-react

## Project Structure

- `src/app` — App Router pages (`/`, `/features`, `/contact`, `/auth/*`), root layout and providers
- `src/components` — Landing sections and UI components (shadcn/ui)
- `src/context` — Theme provider
- `public/` — Static assets (logos, images)

## Getting Started (macOS & cross-platform)

Prerequisites:

- macOS (Apple Silicon or Intel)
- Node.js 18+ (recommend installing via `fnm`, `nvm`, or Homebrew)
- Package manager: npm (default) or bun (optional)

### 1. Clone the repository

```bash
git clone https://github.com/Tissir-ai/FromScratch-Frontend.git
cd FromScratch-Frontend
```

### 2. Install dependencies

Using npm:

```bash
npm install
```

Optional: Using bun (faster installs):

```bash
bun install
```

### 3. Run the dev server

Using npm:

```bash
npm run dev
```

Using bun:

```bash
bun run dev
```

Open <http://localhost:3000> in your browser.

## Maintenance Tips (macOS)

- Keep Node updated: `brew upgrade node` (if installed via Homebrew) or use version managers.
- Run `npm audit` occasionally for vulnerability checks.
- Use `npm run lint` before commits to catch issues early.
- Prefer component-level testing (to be added) with tools like Vitest or Jest (not yet configured).

## Build & Start (Production Preview)

Using npm:

```bash
npm run build
npm start
```

Using bun:

```bash
bun run build
bun run start
```

This runs a production server on port 3000.

## Lint & Type Check

ESLint:

```bash
npm run lint
```

TypeScript (implicit during build) optional explicit check:

```bash
npx tsc --noEmit
```

## Performance

- Dev server uses Turbopack by default (`next dev --turbo`) for faster cold and incremental rebuilds.
- Tailwind scanning narrowed to `./src/**/*.{ts,tsx}` to reduce class extraction time.
- ESLint runs with caching (`next lint --cache`).
- Tip: In CI, preserve `.next/cache` between runs to speed up subsequent builds.

### After Upgrading to Next.js 15

- Removed obsolete `experimental.appDir` flag (App Router is stable).
- Keep React 18 for now (React 19 optional; upgrade after verifying third‑party compatibility).
- Potential to adopt Partial Prerendering and Server Actions for further performance gains.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3000 already in use | `lsof -i :3000` then `kill -9 <PID>` |
| Styles not updating | Restart dev server; ensure `tailwind.config.ts` paths include `src` |
| Missing module error | Run `npm install` (dependency may not be installed) |
| Type errors block build | Run `npx tsc --noEmit` for details |

## GitHub Export (OAuth)

The app includes an Export panel with a GitHub push option that:

- Redirects to GitHub OAuth
- Creates a new public repo with a random name/description
- Pushes a README with random content

Setup environment variables in `.env.local`:

```
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
```

Create a GitHub OAuth App with callback URL:

```
http://localhost:3000/api/github/callback
```

Routes:

- `GET /api/github/login` – starts OAuth
- `GET /api/github/callback` – exchanges code, creates repo, pushes README

Open the Export panel via the header Export button.
