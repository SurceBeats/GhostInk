export default {
  content: [
    "./src/static/js/**/*.{js,jsx}",
    "./templates/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        "ghost-dark": "#0a0a0a",
        "ghost-surface": "#141414",
        "ghost-border": "#1e1e1e",
        "ghost-red": "#e74c3c",
        "ghost-green": "#2ecc71",
        "ghost-orange": "#e67e22",
        "ghost-muted": "#6b7280",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(231, 76, 60, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(231, 76, 60, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
