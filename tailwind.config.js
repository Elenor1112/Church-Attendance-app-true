/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./mobile/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#fbf7ef",
        foreground: "#2c211f",
        card: "#ffffff",
        muted: "#f4efe7",
        "muted-foreground": "#766a5f",
        border: "#eadfce",
        primary: "#6b1f1f",
        "primary-foreground": "#fffaf1",
        "primary-soft": "#f7e8e5",
        gold: "#d7aa3d",
        "gold-soft": "#fff2c7",
        "gold-foreground": "#4d3712",
        success: "#2f9d68",
        "success-soft": "#e4f5ec",
        warning: "#d29526",
        "warning-soft": "#fff4d4",
        destructive: "#c03232",
        "destructive-soft": "#fde8e8"
      },
      fontFamily: {
        sans: ["System"]
      },
      boxShadow: {
        soft: "0 2px 10px rgba(75, 44, 28, 0.08)",
        card: "0 8px 24px rgba(107, 31, 31, 0.10)"
      }
    }
  },
  plugins: []
};
