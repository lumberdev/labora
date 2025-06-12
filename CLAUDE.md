# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing a marketing website built with Astro (frontend) and Sanity (CMS). The project uses pnpm workspaces to manage both packages.

## Commands

### Development

```bash
# From root directory - runs both Astro and Sanity dev servers
pnpm dev

# Run only Astro frontend (from /astro or root with -F flag)
pnpm -F astro dev      # Runs on localhost:4321

# Run only Sanity Studio (from /sanity or root with -F flag)
pnpm -F sanity dev     # Runs on localhost:3333
```

### Build & Preview

```bash
# Build all packages
pnpm build

# Build only Astro (includes TypeScript check)
pnpm -F astro build

# Preview production builds
pnpm preview
```

### Code Quality

```bash
# Lint all packages
pnpm lint

# Clean build artifacts
pnpm clean
```

## Architecture

### Frontend (Astro)

- Static site generator that fetches content from Sanity at build time
- React components for interactivity (3D globe visualization using Three.js)
- Tailwind CSS for styling
- TypeScript throughout
- Deployed to Vercel

Key files:

- `astro/src/pages/index.astro` - Main entry point, fetches Sanity data
- `astro/src/lib/sanity.ts` - Sanity client configuration and GROQ query
- `astro/src/components/globe/` - 3D globe visualization components

### CMS (Sanity)

- Headless CMS with structured content
- Project ID: `3qdm36yh`, Dataset: `production`
- Deployed to Sanity's hosted servers

Content schemas:

- `home` - Singleton document containing all homepage sections
- `hero`, `companies`, `vision`, `impact` - Section schemas

### Integration Pattern

1. Content is edited in Sanity Studio
2. Astro fetches content at build time using GROQ queries
3. Site must be rebuilt to reflect content changes
4. The main query is defined in `astro/src/lib/sanity.ts`

## Important Notes

- The project uses pnpm with workspaces - always use pnpm, not npm or yarn
- When modifying blockContent schemas in Sanity, ensure compatibility with astro-portabletext rendering
- The 3D globe uses significant browser resources - test performance on lower-end devices
- Environment variables for Sanity are hardcoded in the client config (not using .env files)
