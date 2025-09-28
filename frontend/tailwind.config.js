module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563eb",
          light: "#60a5fa",
          dark: "#1d4ed8",
          accent: "#f59e0b",
        },
      },
      boxShadow: {
        "brand-sm": "0 2px 4px -2px rgba(37,99,235,0.25)",
      },
    },
    container: {
      center: true,
      padding: "1rem",
      screens: {
        lg: "960px",
        xl: "1140px",
        "2xl": "1320px",
      },
    },
  },
  plugins: [],
};
