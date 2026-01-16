/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#f5f5f5',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      borderWidth: {
        DEFAULT: '2px',
        '3': '3px',
        '4': '4px',
        '6': '6px',
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
      },
      boxShadow: {
        nb: '4px 4px 0 0 #000',
        'nb-lg': '6px 6px 0 0 #000',
        'nb-sm': '2px 2px 0 0 #000',
      },
    },
  },
  plugins: [],
}
