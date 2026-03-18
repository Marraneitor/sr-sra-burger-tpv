/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:     '#121212',
          accent: '#E6B325',
          white:  '#FFFFFF',
        }
      },
      fontFamily: {
        bebas:      ['"Bebas Neue"', 'sans-serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
