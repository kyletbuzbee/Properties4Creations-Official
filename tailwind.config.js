/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./*.html",
        "./projects/*.html",
        "./components/*.html",
        "./js/**/*.js"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    navy: '#0B1120',
                    wood: '#C28E5A',
                    walnut: '#8B5E3C',
                    beige: '#F5F5F0',
                    slate: '#64748b'
                }
            },
            fontFamily: {
                heading: ['Merriweather', 'serif'],
                body: ['Inter', 'sans-serif']
            }
        }
    },
    plugins: [],
}
