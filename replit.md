# SK MISSION BOARD

Free premium study material for Bihar Board Class 10 students — chapter-wise notes, PYQs, model papers, PDF viewer and download, and video lectures. Deployed at https://skmissionboardin.vercel.app/.

## Run & Operate

- `pnpm --filter @workspace/sk-mission-board run dev` — run the web app (port 26064, preview at `/`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, prefix `/api`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, Tailwind CSS v4, Wouter (routing), Framer Motion
- UI: Shadcn/ui components, Lucide React icons
- PWA: Web App Manifest + Service Worker (`/sw.js`)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (available but not yet used by the frontend)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `artifacts/sk-mission-board/` — main React web app
  - `src/components/SplashScreen.tsx` — 5-second intro animation on first launch
  - `src/components/Navbar.tsx` — top nav with SK MISSION BOARD logo
  - `src/pages/` — Home, Notes, Videos, About
  - `src/data/` — chapters.json, subjects.json, videos.json (content data)
  - `public/logo.png` — official SK MISSION BOARD logo
  - `public/intro.mp4` — 5-second intro animation (Kling AI watermark removed)
  - `public/icons/` — PWA launcher icons (192×192, 512×512) generated from logo
  - `public/manifest.webmanifest` — PWA manifest (name: SK MISSION BOARD)
- `artifacts/api-server/` — Express backend (health check only, extend as needed)
- `lib/` — shared TypeScript libs (API client, Zod schemas, DB schema)
- `vercel.json` — Vercel deployment config pointing to sk-mission-board build output

## Architecture decisions

- **Splash screen plays once per session**: uses `sessionStorage` key `sk_splash_shown` — resets when the user closes and reopens the browser tab but not on in-session navigation.
- **Intro video is preloaded** in `<head>` for instant playback with no delay.
- **Dark background `#000314` set in CSS and `<head>`** so there is no white flash before React renders.
- **PWA-ready**: manifest + service worker give Android users an "Add to Home Screen" prompt with the official logo icon.
- **Logo in Navbar**: `public/logo.png` used as a small avatar alongside the brand text.

## Product

SK MISSION BOARD provides:
- Chapter-wise Notes (PDF) for all Bihar Board Class 10 subjects
- Previous Year Question Papers (PYQs)
- Model Papers and Practice Papers
- PDF Viewer and PDF Download
- Video Lectures
- Search by subject/chapter

## User preferences

- App name is **SK MISSION BOARD** (all caps) everywhere
- Logo: the uploaded SK Academy crown/shield image
- Intro animation: 5-second video, plays once at launch, Kling AI watermark removed from bottom
- Keep all existing features intact — do not remove pages or data

## Gotchas

- After code changes, the Vite dev server hot-reloads automatically — no workflow restart needed for most edits.
- To push to GitHub: connect your GitHub account via the **Git** panel in Replit's left sidebar, then push from there.
- `attached_assets/` is in `.gitignore` — those directories are Replit-internal and should not be committed.
- Vercel deployment reads `vercel.json` at the repo root — do not delete it.
