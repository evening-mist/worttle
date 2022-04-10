<template lang="pug">
v-dialog(:value="value" max-width="480px" scrollable @input="$emit('input', $event)")
  template(#activator="{ on, attrs }")
    slot(:on="on" :attrs="attrs")

  v-card
    v-card-title
      v-container
        v-row
          v-col.pa-0.text-center(cols="12")
            v-btn(small icon absolute left @click="$emit('input', false)")
              v-icon(small) {{ $t('icons.close') }}

            | {{ $t('texts.settings') }}

    v-card-text
      v-container
        v-row.my-4(align="center")
          v-col.py-0(cols="12" md="5")
            | {{ $t('locale') }}
          v-col.py-2(cols="auto")
            v-radio-group.mt-0.pt-0(v-model="localeCode" mandatory row hide-details="auto")
              v-radio(v-for="locale in availableLocales" :label="locale.name" :value="locale.code" color="correct" :key="locale.code")

        v-row.my-4(align="center")
          v-col.py-0(cols="12" md="5")
            | {{ $t('darkTheme') }}
          v-col.py-2(cols="auto")
            v-switch.mt-0.pt-0(v-model="isDarkTheme" :true-value="true" :false-value="false" inset color="correct" :append-icon="themeIcon" hide-details="auto")

        v-row.my-4(align="center")
          v-col.py-0(cols="12" md="5")
            | {{ $t('highContrastTheme') }}
          v-col.py-2(cols="auto")
            v-switch.mt-0.pt-0(v-model="isHighContrastTheme" :true-value="true" :false-value="false" inset color="correct" hide-details="auto")
</template>

<script>
import { localize as validateLocalize } from '~/plugins/vee-validate.js'

export default {
  name: 'SettingsDialogComponent',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    localeCode: {
      get() {
        return this.$i18n.locale
      },
      async set(newValue) {
        await this.$i18n.setLocale(newValue)
        validateLocalize(newValue)
      },
    },
    availableLocales () {
      return this.$i18n.locales
    },

    isDarkTheme: {
      get() {
        return this.$vuetify.theme.dark ?? false
      },
      set(newValue) {
        this.$setDarkTheme(newValue)

        this.$cookies.set('dark_theme', newValue)
      },
    },
    themeIcon() {
      return this.isDarkTheme ? this.$t('icons.dark') : this.$t('icons.light')
    },

    themeName() {
      return this.$vuetify.theme.themes.name
    },
    isHighContrastTheme: {
      get() {
        return this.themeName === 'highContrast'
      },
      set(newValue) {
        const themeName = newValue ? 'highContrast' : 'default'
        this.$setTheme(themeName)

        this.$cookies.set('high_contrast_theme', themeName === 'highContrast')
      },
    },
  },
}
</script>
