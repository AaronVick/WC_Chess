/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Space Grotesk', 'sans-serif'],
        },
        colors: {
          farcaster: {
            purple: '#855DCD',
            'purple-dark': '#6A4BA6',
          },
        },
        animation: {
          'piece-move': 'movePiece 0.5s ease-in-out',
        },
      },
    },
    plugins: [],
  }