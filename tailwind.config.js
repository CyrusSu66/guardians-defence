/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'game-bg': '#131313',
                'panel-bg': '#1e1e1e',
                'gold': '#f1c40f',
                'danger': '#e74c3c',
                'magic': '#3498db',
                'success': '#2ecc71',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
