module.exports = {
  darkMode: 'class',
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B1120',
          wood: '#C28E5A',
          walnut: '#8B5E3C',
          beige: '#F5F5F0',
          surface: '#FFFFFF',
          slate: '#64748b'
        }
      },
      fontFamily: {
        heading: ['Merriweather', 'serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        wood: '0 10px 25px -5px rgba(194, 142, 90, 0.4)',
        navy: '0 10px 30px -10px rgba(11, 17, 32, 0.6)'
      }
    }
  },
  plugins: []
}
