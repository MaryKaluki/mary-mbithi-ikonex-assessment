module.exports = {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
    "./resources/**/*.vue",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#10b981',
        dark: '#000000',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
