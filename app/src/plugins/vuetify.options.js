import colors from 'vuetify/es5/util/colors'
import ja from 'vuetify/es5/locale/ja.js'

export const themes = {
  default: {
    concept: colors.green.darken2,
    correct: colors.green.base,
    present: colors.yellow.darken2,
    absent: colors.grey.darken1,
    win: colors.green.base,
    lose: colors.red.base,
    miss: colors.yellow.darken3,
    guessing: colors.blue.base,
    reset: colors.cyan.base,
  },
  highContrast: {
    concept: colors.yellow.darken4,
    correct: colors.yellow.darken4,
    present: colors.blue.accent1,
    absent: colors.grey.darken1,
    win: colors.green.base,
    lose: colors.red.base,
    miss: colors.yellow.darken3,
    guessing: colors.blue.base,
    reset: colors.cyan.base,
  },
}

export default {
  icons: { iconfont: 'fa' },
  lang: {
    locales: { ja },
    current: 'ja',
  },
  theme: {
    themes: {
      light: themes.default,
      dark: themes.default,
    }
  },
}
