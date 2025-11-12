/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'apple-red': '#FF3B30',
        'apple-gray': '#F2F2F7',
      },
    },
  },
  plugins: [],
}
