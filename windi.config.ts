import { defineConfig } from 'windicss/helpers'
import colors from 'windicss/colors'

export default defineConfig({
  theme: {
    extend: {
      colors: {
        black: '#000',
        white: colors.white,
        primary: '#009688',
        primaryBg: '#f2f3f5'
      },
      backgroundImage: theme => ({
      }),
      boxShadow: theme => ({
        card: '0 0 12px rgb(0 0 0 / 5%)'
      })
    }
  }
})
