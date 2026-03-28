/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        amber: 'var(--amber)',
        amber2: 'var(--amber2)',
        green: 'var(--green)',
        blue: 'var(--blue)',
        pink: 'var(--pink)',
        muted: 'var(--muted)',
      },
      fontFamily: {
        sans: ['Cabinet Grotesk', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'perspective(600px) rotateY(-10deg) translateY(0)' },
          '50%': { transform: 'perspective(600px) rotateY(-10deg) translateY(-16px)' },
        }
      }
    },
  },
  plugins: [],
}
