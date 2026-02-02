/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'health-blue': '#1a56db',
        'health-green': '#059669',
        'health-red': '#dc2626',
        'health-purple': '#7c3aed',
      }
    },
  },
  plugins: [],
}