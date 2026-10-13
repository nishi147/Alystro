/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060D1A',
          900: '#0B1B3D',
          850: '#0F234F',
          800: '#142C61',
          700: '#1F3F85',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          cyan: '#0284C7',
          accent: '#38BDF8',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(11, 27, 61, 0.05), 0 2px 6px -1px rgba(11, 27, 61, 0.03)',
        'card': '0 10px 30px -4px rgba(11, 27, 61, 0.08), 0 4px 10px -2px rgba(11, 27, 61, 0.04)',
        'elevated': '0 20px 40px -6px rgba(11, 27, 61, 0.12), 0 8px 16px -4px rgba(11, 27, 61, 0.06)',
      }
    },
  },
  plugins: [],
}
