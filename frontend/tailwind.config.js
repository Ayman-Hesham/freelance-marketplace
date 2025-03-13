/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
          grey: '#EDEEF4',
          primary: {
            50: '#E6E8ED',
            100: '#C4C9D6',
            200: '#9AA3B8',
            300: '#707D9A',
            400: '#4F5D82',
            500: '#222E50',
            600: '#1B2440',
            700: '#141B30',
            800: '#0D1220',
            900: '#070910',
          },
          secondary: {
            50: '#FEF2E7',
            100: '#FDDFC3',
            200: '#FBC59B',
            300: '#F9AB73',
            400: '#F7914B',
            500: '#EC760A',
            600: '#BD5F08',
            700: '#8E4706',
            800: '#5F2F04',
            900: '#2F1802',
          },
      },
    },
  },
  plugins: [],
};