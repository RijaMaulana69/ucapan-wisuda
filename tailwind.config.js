/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        caveat: ['var(--font-caveat)', 'cursive'],
        kalam: ['var(--font-kalam)', 'cursive'],
        serifTitle: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-jakarta)', 'sans-serif'],
      },
      keyframes: {
        scaleUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        letterOpen: {
          '0%': { opacity: '0', transform: 'translateY(-30px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        scaleUp: 'scaleUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        fadeIn: 'fadeIn 0.7s ease-out forwards',
        letterOpen: 'letterOpen 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
      },
    },
  },
  plugins: [],
};
