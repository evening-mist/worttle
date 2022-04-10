<template lang="pug">
nuxt
</template>

<script>
export default {
  name: 'DefaultLayout',

  mounted() {
    this.$setDarkTheme(this.$cookies.get('dark_theme') ?? false)

    const themeName = (this.$cookies.get('high_contrast_theme') ?? false) ? 'highContrast' : 'default'
    this.$nextTick(() => {
      this.$setTheme(themeName)
    })
  },
}
</script>
