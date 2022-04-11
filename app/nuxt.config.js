export default {
  dev: process.env.NODE_ENV !== 'production',

  server: {
    host: process.env.HOST,
    port: process.env.PORT,
    protocol: process.env.PROTOCOL,
  },

  publicRuntimeConfig: {
    baseUrl: process.env.BASE_URL,
  },

  srcDir: 'src',

  serverMiddleware: {
    'api': '~/api',
  },

  head() {
    const i18nHead = this.$nuxtI18nHead?.({ addSeoAttributes: true })
    return {
      title: this.$t?.('title'),
      htmlAttrs: i18nHead?.htmlAttrs,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: this.$t?.('texts.description') },
        { name: 'format-detection', content: 'telephone=no' },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary' },
        { hid: 'note:card', name: 'note:card', content: 'summary' },
        { hid: 'og:title', property: 'og:title', content: this.$t?.('title') },
        { hid: 'twitter:title', name: 'twitter:title', content: this.$t?.('title') },
        { hid: 'og:image', property: 'og:image', content: `${this.$config?.baseUrl}/icon.png` },
        { hid: 'twitter:image', name: 'twitter:image', content: `${this.$config?.baseUrl}/icon.png` },
        ...i18nHead?.meta ?? [],
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=M+PLUS+1+Code&display=swap' },
        { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.15.4/css/all.css' },
        ...i18nHead?.link ?? [],
      ],
    }
  },

  css: ['~/assets/app.scss'],

  plugins: [
    '~/plugins/socket-io.client.js',
    '~/plugins/utils.js',
    '~/plugins/vee-validate.js',
  ],

  components: true,

  buildModules: [
    '@nuxtjs/date-fns',
    '@nuxtjs/eslint-module',
    '@nuxtjs/stylelint-module',
    '@nuxtjs/vuetify',
  ],

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/pwa',
    'cookie-universal-nuxt',
    '~/modules/socket-io.js',
  ],

  dateFns: {
    locales: ['ja'],
    defaultLocale: 'ja',
    methods: ['parseISO', 'addSeconds', 'differenceInMilliseconds'],
  },

  vuetify: {
    optionsPath: '~/plugins/vuetify.options.js',
    customVariables: ['~/assets/variables.scss'],
    defaultAssets: { icons: 'fa', font: false },
    treeShake: true,
  },

  i18n: {
    locales: [{ code: 'en', name: 'English', iso: 'en-US', file: 'en.yml' }, { code: 'ja', name: '日本語', iso: 'ja-JP', file: 'ja.yml' }],
    defaultLocale: 'en',
    vueI18n: {
      fallbackLocale: 'en',
      silentFallbackWarn: true,
    },
    lazy: true,
    langDir: '~/locales/',
    strategy: 'no_prefix',
    baseUrl: process.env.BASE_URL,
  },

  pwa: {
    manifest: {
      name: 'Worttle(𝛂)',
      short_name: 'Worttle',
      description: 'Online Battle Version Wordle',
      theme_color: '#ffffff',
      lang: 'en',
      display: 'standalone',
      orientation: 'portrait',
    },
    workbox: {
      dev: process.env.NODE_ENV !== 'production',
    },
  },

  build: {
    watch: ['~/api/*.js'],
    transpile: ['vee-validate/dist/rules'],
    extend(config) {
      config.module.rules.push({
        test: /locales\/.*\.ya?ml$/,
        type: 'json',
        use: 'yaml-loader'
      })
    },
  },
}
