<template lang="pug">
v-app
  v-app-bar(app)
    v-container
      v-row(justify="center")
        v-col.text-left(cols="2" sm="1" md="1")
          help-dialog(v-model="showingHelpDialog")
            template(#default="{ on, attrs }")
              v-btn(small icon v-bind="attrs" v-on="on")
                v-icon(small) {{ $t('icons.help') }}

        v-col.text-center(cols="8" sm="8" md="4")
          .text-h6.text-md-h5.font-weight-black
            | {{ $t('title') }}

        v-col.text-right(cols="2" sm="1" md="1")
          settings-dialog(v-model="showingSettingsDialog")
            template(#default="{ on, attrs }")
              v-btn(small icon v-bind="attrs" v-on="on")
                v-icon(small) {{ $t('icons.settings') }}

  v-main
    slot

  v-footer(v-if="$scopedSlots['footer']" app fixed)
    slot(name="footer")
</template>

<script>
export default {
  name: 'PageComponent',

  data() {
    return {
      showingHelpDialog: false,
      showingSettingsDialog: false,
    }
  },
}
</script>
