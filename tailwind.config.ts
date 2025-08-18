import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: { orange:'#FF6A00', green:'#2CFF75', yellow:'#FFF240' },
        dark: '#0A0A0A'
      },
      fontFamily: { goth:['Impact','Anton','Oswald','sans-serif'] },
      letterSpacing: { ultrawide: '.2em' }
    }
  },
  plugins: []
}
export default config