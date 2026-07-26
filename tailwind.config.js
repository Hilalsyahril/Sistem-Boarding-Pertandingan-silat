/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        akira: ['Syncopate', 'sans-serif'],
      },
      colors: {
        slate: {
          850: '#1e293b',
        },
        indigo: {
          850: '#312e81',
        }
      }
    },
  },
  plugins: [],
}
