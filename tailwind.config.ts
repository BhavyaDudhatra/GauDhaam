import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryGreen: "#496B45",
        darkGreen: "#2F4930",
        accentBrown: "#795548",
        creamBg: "#FFF8EF",
        lightGreen: "#EAF1E5",
        borderColor: "#E9DFD0",
        textGray: "#655B54",
        cardBg: "#FFFFFF",
      },
      borderRadius: {
        input: "10px",
        btn: "14px",
        card: "18px",
        banner: "24px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          '"Noto Sans"',
          "sans-serif",
        ],
      },
      fontSize: {
        caption: "12px",
        body: "15px",
        heading3: "19px",
        heading2: "clamp(22px, 3vw, 26px)",
        heading1: "clamp(26px, 4vw, 30px)",
      },
    },
  },
  plugins: [],
};
export default config;
