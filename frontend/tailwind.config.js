/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#faf7f4', 100: '#f4ecef', 200: '#e8d7df', 300: '#d6b5c4',
          400: '#c291a8', 500: '#a46e79', 600: '#80536f', 700: '#68435c',
          800: '#493348', 900: '#302333',
        },
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        elegant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        script: ['"Brush Script MT"', '"cursive"', '"Comic Sans MS"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
