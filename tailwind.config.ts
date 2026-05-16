import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        marianne: {
          blue: "#003189",
          "blue-dark": "#001F5E",
          "blue-light": "#E8EDF8",
          red: "#E1000F",
          "grey-light": "#F5F5F5",
          grey: "#6A6A6A",
        },
      },
      fontFamily: {
        sans: ["Marianne", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
