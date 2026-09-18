/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan all HTML and JS files for used classes
  content: [
    './index.html',
    './*.js',
    '!./tailwind.min.js',   // exclude the old CDN runtime
    '!./sw.js',
    '!./node_modules/**',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  '#f2f9f5',
          100: '#e1f2e8',
          500: '#2d6a4f',
          600: '#1b4332',
          700: '#163829',
          800: '#112d21',
          900: '#0b1d15',
        },
        ochre: {
          50:  '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b7410e',
          800: '#8c2e08',
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
    },
  },
  // Safelist dynamic classes that are built at runtime in JS strings
  safelist: [
    // Score card backgrounds
    { pattern: /bg-(emerald|amber|rose|blue|slate|forest|red|orange|yellow|green|sky|purple)-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /text-(emerald|amber|rose|blue|slate|forest|red|orange|yellow|green|sky|purple|ochre)-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /border-(emerald|amber|rose|blue|slate|forest|red|orange|yellow|green|sky|purple)-(50|100|200|300|400|500|600|700|800|900|950)/ },
    // Dynamic grid columns used in JS renders
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4',
    'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-4', 'sm:grid-cols-5',
    // Toast types
    'bg-rose-700', 'bg-amber-600', 'bg-blue-700', 'bg-emerald-700',
    // Loading bar
    'w-0', 'w-full',
    // Animation classes
    'animate-pulse', 'animate-bounce', 'animate-spin',
    // Severity badges for diseases
    'bg-blue-100', 'text-blue-800', 'border-blue-200',
    'bg-amber-100', 'text-amber-800', 'border-amber-200',
    'bg-orange-100', 'text-orange-800', 'border-orange-200',
    'bg-red-100', 'text-red-800', 'border-red-200',
    // Arbitrary values used in HTML
    'z-[39]', 'z-[60]', 'z-[9999]',
    'max-h-[90vh]',
    // Hidden/show toggles
    'hidden', 'flex', 'block', 'inline-block', 'inline-flex',
    // Pointer events
    'pointer-events-none', 'pointer-events-auto',
    // Line clamp
    'line-clamp-1', 'line-clamp-2', 'line-clamp-3',
  ],
  plugins: [],
}
