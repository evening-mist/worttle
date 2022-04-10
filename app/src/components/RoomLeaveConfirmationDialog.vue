<template lang="pug">
v-dialog(:value="value" max-width="480px" persistent scrollable @input="$emit('input', $event)")
  template(#activator="{ on, attrs }")
    slot(:on="on" :attrs="attrs")

  v-card
    v-card-title
      | {{ $t('texts.roomLeaveConfirmation') }}

    v-card-text
      p {{ $t('texts.confirmRoomLeave') }}

    v-card-actions
      v-btn(text @click="doCancel()") {{ $t('actions.notLeave') }}

      v-spacer

      v-btn(@click="doLeave()") {{ $t('actions.leaveRoom') }}
</template>

<script>
export default {
  name: 'RoomLeaveConfirmationDialogComponent',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    doLeave() {
      this.$emit('input', false)

      this.$emit('leave')
    },
    doCancel() {
      this.$emit('input', false)

      this.$emit('cancel')
    },
  },
}
</script>
