/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF8C42',
        secondary: '#2C3E50',
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
        info: '#3498DB',
      },
    },
  },
  plugins: [],
}
