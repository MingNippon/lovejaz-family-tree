/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      colors: {
        parchment: {
          50: '#FAF8F5',
          100: '#F5F0E6',
          200: '#EBDDC5',
          300: '#DFCAA2',
          800: '#52432D',
          900: '#34291B',
        },
      },
    },
  },
  plugins: [],
};
