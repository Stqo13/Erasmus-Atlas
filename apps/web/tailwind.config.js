/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        ink:  '#3B3B58',
        sky:  { DEFAULT:'#A7C6ED', 50:'#F5F9FF',100:'#EAF3FE',200:'#D6E7FD',300:'#C1DBFB',400:'#A7C6ED' },
        rose: '#D9B3C4',
        plum: '#6F2C91',
        sand: { DEFAULT:'#F2E1D4', 50:'#FBF6F1',100:'#F7EFE6',200:'#F2E1D4',300:'#E7CFBE' },
        surface: { 50:'#FBF6F1', 100:'#F7EFE6', 200:'#F2E1D4', 300:'#E7CFBE' },
        muted: { DEFAULT:'#6A6A84' },
        danger: { DEFAULT:'#ef4444' },
      },
      boxShadow: {
        soft: '0 4px 20px rgba(59,59,88,0.08)',
        card: '0 8px 30px rgba(59,59,88,0.10)',
      },
      borderRadius: { xl2: '1rem' },
      fontFamily: {
        display: ['Inter','ui-sans-serif','system-ui','Segoe UI','Arial'],
        body: ['Inter','ui-sans-serif','system-ui','Segoe UI','Arial'],
      },
    },
  },
  plugins: [],
}