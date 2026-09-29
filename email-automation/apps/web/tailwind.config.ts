import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["var(--font-inter)",    "system-ui", "sans-serif"],
        display: ["var(--font-cormorant)", "Georgia",   "serif"],
      },
      colors: {
        cream: {
          DEFAULT: "#D4C5A9",
          50:  "#FAF7F2",
          100: "#F2EBE0",
          200: "#E8D9C4",
          300: "#D4C5A9",
          400: "#B89E82",
          500: "#9E8065",
        },
        ink: {
          DEFAULT: "#0A0905",
          50:  "#1A1915",
          100: "#111009",
          900: "#0A0905",
        },
      },
    },
  },
  plugins: [],
};

export default config;
