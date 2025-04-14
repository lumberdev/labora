# Labora, a 3D Web Experience static stie

A modern static site built with Astro, React, React Three Fiber, and Tailwind CSS.

## 🛠️ Tech Stack

- **[Astro](https://astro.build/)** - Static site generator with excellent performance
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Three.js](https://threejs.org/)** - 3D graphics library
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)** - React renderer for Three.js
- **[R3F Drei](https://github.com/pmndrs/drei)** - Useful helpers for React Three Fiber
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

## 🚀 Project Structure

```text
/
├── public/              # Static assets
│   ├── fonts/
│   └── world-110m.json  # Map data
├── src/
│   ├── assets/         # Images, icons, and logos
│   ├── components/     # UI components
│   │   └── globe/     # 3D globe components
│   ├── lib/           # Utilities and data
│   ├── pages/         # Astro pages
│   └── types/         # TypeScript types
└── package.json
```

## 🚀 Prerequisites

1. Install `pnpm` using one of these methods:

   ```bash
   # Using corepack (Recommended for Node.js 16.13+)
   corepack enable
   corepack prepare pnpm@latest --activate

   # Or using npm
   npm install -g pnpm
   ```

## 🎨 Development

1. Clone this repository
2. Install dependencies with `pnpm install`
3. Start the development server with `pnpm dev`
4. Open [http://localhost:4321](http://localhost:4321)

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command        | Action                                       |
| :------------- | :------------------------------------------- |
| `pnpm install` | Installs dependencies                        |
| `pnpm dev`     | Starts local dev server at `localhost:4321`  |
| `pnpm build`   | Build your production site to `./dist/`      |
| `pnpm preview` | Preview your build locally, before deploying |

## 📚 Resources

- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Documentation](https://threejs.org/docs/)
