// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import svgr from 'vite-plugin-svgr'

import vercel from '@astrojs/vercel'

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],

  vite: {
    plugins: [
      svgr({
        include: '**/*.svg?react',
        svgrOptions: {
          plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
          svgoConfig: {
            plugins: [
              'preset-default',
              'removeTitle',
              'removeDesc',
              'removeDoctype',
              'cleanupIds',
            ],
          },
        },
      }),
    ],
    server: {
      host: true,
      allowedHosts: ['localhost', 'labora.theolev.com'],
    },
  },

  adapter: vercel(),
})
