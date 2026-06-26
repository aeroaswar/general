/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans Variable"', "Instrument Sans", "system-ui", "sans-serif"],
        display: ['"Fraunces Variable"', "Fraunces", "Georgia", "serif"],
        mono: ['"JetBrains Mono Variable"', "ui-monospace", "monospace"],
      },
      colors: {
        bg: "var(--bg)",
        ink: "#0b0a09",
        line: "var(--line)",
        accent: "#e8743b",
        orange: "#e8743b",
      },
      borderRadius: { brand: "14px" },
    },
  },
  plugins: [],
};
