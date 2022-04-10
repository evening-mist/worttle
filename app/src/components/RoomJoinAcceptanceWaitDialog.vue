<template lang="pug">
v-dialog(:value="value" max-width="480px" persistent scrollable @input="$emit('input', $event)")
  v-card
    v-card-text.pa-4
      v-container
        v-row(justify="center")
          v-col.text-center(cols="auto")
            .text-body-1 {{ $t('texts.waitingJoinAcceptance') }}

            v-progress-circular.mt-8(indeterminate :size="100" :width="10" color="concept")

    v-card-actions
      v-btn(text @click="doCancel()")
        | {{ $t('actions.cancel') }}
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'RoomJoinAcceptanceWaitDialogComponent',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    ...mapActions(['leaveRoom', 'addMessage']),

    doCancel() {
      this.leaveRoom()

      this.$emit('input', false)

      this.$emit('cancel')
    },
  },
}
</script>
