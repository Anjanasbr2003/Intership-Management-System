/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Inter"',
          'system-ui',
          'sans-serif',
        ],
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'apple-fast': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#bad4fe',
          300: '#7cb2fc',
          400: '#3787f6',
          500: '#1d63ed',
          600: '#1447db',
          700: '#1135b0',
          800: '#132d8d',
          900: '#142971',
          950: '#0d1844',
        },
        darkblack: {
          50: '#222222',
          100: '#1c1c1c',
          200: '#161616',
          300: '#121212',
          400: '#0e0e0e',
          500: '#0a0a0a',
          base: '#000000',
          card: '#0a0a0a',
          surface: '#121212',
          subtle: '#181818',
          border: '#242424',
        }
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'dropdown': '0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        'modal': '0 24px 48px -8px rgba(0, 0, 0, 0.22), 0 8px 24px -4px rgba(0, 0, 0, 0.12)',
        'glass-sm': '0 2px 8px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'glass-md': '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'glass-lg': '0 16px 36px -6px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'glass-floating': '0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        'xs': '2px',
        '3xl': '32px',
        '4xl': '48px',
      }
    },
  },
  plugins: [],
}

