/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff0f6',
          100: '#ffe0ee',
          200: '#ffc2dd',
          300: '#ff91bc',
          400: '#ff5593',
          500: '#f72b6b',
          600: '#e8184e',
          700: '#c40d3f',
          800: '#a30e38',
          900: '#8a1034',
        },
        pink: {
          DEFAULT: '#f72b6b',
        }
      },
      fontFamily: {
        sans: ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
