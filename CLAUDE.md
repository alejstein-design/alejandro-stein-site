# CLAUDE.md

## Project
Alejandro Stein — artist portfolio + shop
Next.js 15, App Router, TypeScript strict, Tailwind CSS, Sanity.io CMS

## Commands
- `pnpm dev` — start dev server on port 3000
- `pnpm build` — production build
- `pnpm lint` — ESLint check
- `npx sanity dev` — start Sanity Studio on port 3333

## Architecture
- `src/app/(site)/` — public-facing pages
- `src/app/studio/[[...tool]]/page.tsx` — embedded Sanity Studio
- `src/components/` — shared UI components
- `src/lib/` — sanity client, queries, i18n, utilities
- `src/sanity/` — schema definitions

## Conventions
- Server components by default, "use client" only when needed
- All CMS data fetched via Sanity GROQ queries in server components
- TypeScript strict, no any types
- Tailwind only, no CSS modules
- All images via next/image with Sanity CDN URLs
- Bilingual: all text content has es and en fields in Sanity
- Commit messages: imperative mood, < 72 chars
