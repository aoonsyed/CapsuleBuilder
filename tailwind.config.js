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
        sans: ['"Aboreto"', 'cursive'],
        serif: ['"Aboreto"', 'cursive'],
        aboreto: ['"Aboreto"', 'cursive'],
        inter: ['"Aboreto"', 'cursive'],
        'sf-pro': ['"Aboreto"', 'cursive'],
        ebgaramond: ['"Aboreto"', 'cursive'],
      },
    },
  },
  plugins: [],
}
