/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      colors: {
        yellow: {
          DEFAULT: '#FFD85F',
        },
        'dark-gray': '#303030',
        'light-gray': '#898989',
      },
      fontFamily: {
        // Actual rendering uses "Sofia Pro" loaded via the external stylesheet
        // in index.html. Century Gothic is only a fallback.
        sans: ['Century Gothic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
