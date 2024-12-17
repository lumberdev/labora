import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    colors: {
      black: '#000',
      white: '#FFFFFF',
      'grey-dark': '#232323',
      grey: '#474747',
      'grey-light': '#8483A0',
      tan: '#D6C099',
      'tan-light': '#EAE8D0',
    },
    extend: {
      borderRadius: {
        DEFAULT: '0.625rem',
      },
      fontFamily: {
        sans: ['DM Sans', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        '2xl': '1.375rem',
        '3xl': '1.75rem',
        '5xl': '2.75rem',
        '6xl': '3.625rem',
        '9xl': '7.5rem',
      },
      letterSpacing: {
        wide: '0.03em',
      },

      lineHeight: {
        tight: '1.2',
      },
      screens: {
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}
