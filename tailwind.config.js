const path = require("path");

module.exports = {
  content: [
    path.join(__dirname, "apps/**/*.{js,ts,jsx,tsx}"),
    path.join(__dirname, "packages/shared-ui/src/**/*.{js,ts,jsx,tsx}")
  ],
  theme: {
    extend: {
      colors: {
        anime: {
          primary: "#FF69B4",
          secondary: "#9B59B6",
          accent: "#FF1493",
          background: "#1a1a2e",
          card: "#16213e",
          text: "#ffffff",
          textSoft: "#b8b8b8",
          love: "#ff4d6d",
          skip: "#4a4a4a",
          glow: "#ff69b480"
        }
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "heart-beat": "heartBeat 1.3s ease-in-out",
        "spin-slow": "spin 3s linear infinite",
        "bounce-slow": "bounce 2s infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 20px #FF69B4",
            opacity: 1
          },
          "50%": {
            boxShadow: "0 0 40px #FF1493",
            opacity: 0.8
          }
        },
        slideUp: {
          "0%": {
            transform: "translateY(20px)",
            opacity: 0
          },
          "100%": {
            transform: "translateY(0)",
            opacity: 1
          }
        },
        heartBeat: {
          "0%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.3)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.3)" },
          "70%": { transform: "scale(1)" }
        }
      },
      fontFamily: {
        anime: ['"Poppins"', '"Comic Neue"', "sans-serif"],
        cute: ['"Quicksand"', "sans-serif"]
      }
    }
  },
  plugins: []
};
