# Project Structure

This project is organized into two main subdirectories and uses pnpm workspaces to manage dependencies across packages.

## `/astro`

The `/astro` directory contains all client-side code. This code is automatically deployed whenever changes are pushed to the repository.

**Key features:**
- Automatic deployment on push
- Client-side application code
- Frontend components and logic

## `/sanity`

The `/sanity` directory houses our Content Management System (CMS) code. Unlike the client code, this requires manual deployment using the Sanity CLI.

**Deployment:**
```bash
cd sanity
sanity deploy
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run development server:
   ```bash
   pnpm dev
   ```


For more detailed information, please refer to the documentation in each subdirectory.
