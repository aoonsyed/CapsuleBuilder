/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#f8f8f8',
        textPrimary: '#2b2b2b',
        borderStrong: '#000000',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Open Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
        aboreto: ['"Aboreto"', 'cursive'],
         ebgaramond: ['"EB Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
}
