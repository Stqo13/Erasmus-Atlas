/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#3B3B58',
        surface: {
          50:  '#FBF6F1',   // warm base
          100: '#F7EFE6',
          200: '#F2E1D4',   // sand (brand)
          300: '#E7CFBE',
        },
        accent: {
          plum: '#6F2C91',
          blue: '#A7C6ED',
          rose: '#D9B3C4',
        },
        danger: '#ef4444',
      },
      borderRadius: {
        xl2: '1rem',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(59,59,88,0.08)',
        card: '0 8px 30px rgba(59,59,88,0.10)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(.22,.61,.36,1)',
      },
      fontFamily: {
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      keyframes: {
        fadein: { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: {
        fadein: 'fadein 0.3s ease-smooth',
      },
    },
  },
  plugins: [],
}