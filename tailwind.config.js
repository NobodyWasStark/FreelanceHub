/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "#edf2ed",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f5f0",
        "error": "#ba1a1a",
        "on-secondary-fixed-variant": "#3d4b35",
        "background": "#f6fbf6",
        "secondary": "#54634b",
        "outline": "#6e7b67",
        "primary": "#0a6e00",
        "on-error": "#ffffff",
        "on-background": "#171d1a",
        "surface-container": "#eaefea",
        "primary-container": "#14a800",
        "surface-variant": "#dfe4df",
        "on-surface": "#171d1a",
        "on-primary": "#ffffff"
        // Add additional theme colors here from your prototypes
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
