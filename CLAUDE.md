@AGENTS.md

# Influencer Content Generator

Personal tool that automates an influencer's Instagram content creation workflow using Google Gemini for AI image generation.

## What it does

4-step wizard:
1. **Upload** up to 6 reference images + describe a content idea
2. **Generate Hero** — AI creates a base/main image from refs + idea
3. **Generate Variations** — AI writes 4 variation prompts (text model), then generates 4 variation images (image model) using refs + hero + prompt
4. **Select & Caption** — Pick which images go in an Instagram carousel, write a caption

Also: gallery of all generated images, configurable system prompt, token/cost tracking.

## Tech stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **Google Gemini API** (`@google/genai` SDK)
  - Image gen: `gemini-3.1-flash-image-preview` (Nano Banana 2) — `responseModalities: ["IMAGE"]`, aspect `3:4`, size `2K`
  - Text/prompts: `gemini-2.5-flash`
- **sharp** for server-side image processing (PNG→JPEG, resize to 1080x1350 for Instagram 4:5)
- **zustand** with `persist` for wizard state (localStorage, excludes referenceImages to avoid size issues)
- **react-dropzone** for file upload
- **shadcn/ui** components

## Key files

```
src/lib/gemini.ts          — All Gemini API calls (hero, variation prompts, variation images)
src/lib/images.ts          — Image I/O with sharp (save, load, strip data URLs)
src/lib/prompts.ts         — Default system prompt for variation generation
src/lib/settings.ts        — Settings persistence (data/settings.json)
src/types/index.ts         — All TypeScript interfaces
src/hooks/useWizardState.ts — Zustand store (wizard state + actions)

src/app/api/gemini/
  generate-hero/route.ts      — POST: refs + idea → hero image
  generate-prompts/route.ts   — POST: idea + hero desc → 4 variation prompts
  generate-variation/route.ts — POST: refs + hero + prompt → variation image

src/app/wizard/
  layout.tsx               — Wizard shell with step nav, usage counter
  step-1-upload/page.tsx   — Dropzone + idea input
  step-2-hero/page.tsx     — Hero generation with progress bar
  step-3-variations/page.tsx — 4 parallel variation gens with per-slot retry
  step-4-select/page.tsx   — Carousel selection + caption

src/app/gallery/page.tsx   — All generated images across sessions
src/app/settings/page.tsx  — Editable system prompt, model config
```

## Known issues & gotchas

- **Gemini safety filters** can block image generation with `blockReason: "OTHER"` — no auto-retry implemented yet, user sees an error and can manually retry
- **Reference images** are NOT persisted to localStorage (too large as base64) — they're kept in memory only and lost on page refresh
- **`process.cwd()`** in `images.ts` needs `/* turbopackIgnore: true */` comment to avoid Turbopack NFT warnings
- Image gen costs $0.101 per image at 2K resolution (Nano Banana 2)

## Environment

- `GEMINI_API_KEY` in `.env.local`
- Generated images saved to `public/output/{sessionId}/`
- Settings saved to `data/settings.json`
- `serverActions.bodySizeLimit` set to `20mb` in `next.config.ts` for large image payloads

## Future plans (not yet implemented)

- Auto-retry on Gemini safety filter blocks (`blockReason: "OTHER"`)
- Instagram Graph API integration (post carousel directly)
- Google Drive backup integration

## Git

- GitHub: https://github.com/maddiejourney00/Influencer
- Author: `maddiejourney00 <maddiejourney00@gmail.com>`
