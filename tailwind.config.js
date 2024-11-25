/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        pink: {
          150: '#f2d8e9',
        },
        indigo: {
          750: '#64588c',
        },
        blue: {
          960: '#252640',
        },
        cream: {
          50: '#f2e7dc',
        }
      },

      fontFamily: {
        roboto_con: ['Roboto Condensed', 'sans-serif'],
        pt_sans: ['PT Sans', 'sans-serif'],
      },
      
      spacing: {
        '128': '32rem',
        '144': '36rem',
      }
    },
  },
  plugins: [],
}

