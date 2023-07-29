import { defineConfig } from 'windicss/helpers'
import colors from 'windicss/colors'

export default defineConfig({
  theme: {
    extend: {
      colors: {
        black: '#000',
        white: colors.white,
        primary: '#3C6AFF'
      },
      backgroundImage: theme => ({
      }),
      boxShadow: theme => ({
      })
    }
  }
})
