/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Amiri', 'serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        hijau: {
          50: '#f0fdf4', 100: '#dcfce7', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d', 900: '#14532d',
        },
        emas: {
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706',
        },
      },
    },
  },
  plugins: [],
}
