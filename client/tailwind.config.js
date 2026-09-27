/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kheelona: {
          orange: '#F26B27',
          'orange-hover': '#E05315',
          cinnamon: '#A04515',
          cream: '#FAF4EC',
          'cream-dark': '#F2E8DC',
          badge: '#FDEEE4',
          headline: '#1E1611',
          body: '#574C43',
          border: '#EADCCF'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'Inter', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'warm': '0 10px 30px -5px rgba(242, 107, 39, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 12px 32px -8px rgba(30, 22, 17, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03)'
      }
    },
  },
  plugins: [],
};
