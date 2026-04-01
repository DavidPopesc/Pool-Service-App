import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefaf5",
          100: "#d6f3e6",
          500: "#1e7b5c",
          600: "#17634a",
          700: "#124b38",
        },
        slate: {
          950: "#09131d",
        },
      },
    },
  },
  plugins: [],
};

export default config;
