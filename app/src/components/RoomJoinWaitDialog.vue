<template lang="pug">
v-dialog(:value="value" max-width="480px" persistent scrollable @input="$emit('input', $event)")
  v-card
    v-card-text.pa-4
      v-container
        v-row
          v-col(cols="12")
            text-field(:value="roomId" :label=" $t('rooms.id')" readonly outlined color="correct" hide-details="auto")

        v-row(justify="center")
          v-col(cols="auto")
            v-btn(large icon @click="copyRoomIdToClipboard()")
              v-icon {{ $t('icons.clipboard') }}
          v-col(cols="auto")
            v-btn(large icon @click="copyInvitationUrlToClipboard()")
              v-icon {{ $t('icons.link') }}

        v-row(v-if="isWaiting" justify="center")
          v-col.text-center(cols="auto")
            .text-body-1 {{ $t('texts.waitingJoin') }}

            v-progress-circular.mt-8(indeterminate :size="100" :width="10" color="concept")

    v-card-actions
      v-btn(text @click="doCancel()")
        | {{ $t('actions.cancel') }}

      v-spacer

      v-btn(type="submit" color="concept" :dark="!(isWaiting || processing)" :loading="processing" :disabled="isWaiting || processing" @click="doAccept()")
        | {{ $t('actions.acceptRoomJoin') }}
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'RoomJoinWaitDialogComponent',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      processing: false,
    }
  },

  computed: {
    ...mapGetters(['roomId', 'playerStatus']),

    invitationUrl() {
      return `${this.$config.baseUrl}/?room=${this.roomId}`
    },

    isWaiting() {
      return this.playerStatus(0) === 'wait' && this.playerStatus(1) !== 'join'
    },
  },

  methods: {
    ...mapActions(['acceptRoomJoin', 'leaveRoom', 'addMessage']),

    async copyRoomIdToClipboard() {
      if (window.clipboardData) {
        window.clipboardData.setData('Text', this.roomId)
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.roomId)
      } else {
        return false
      }

      this.addMessage({ text: this.$t('texts.copiedRoomIdToClipboard'), color: 'info' })

      return true
    },
    async copyInvitationUrlToClipboard() {
      if (window.clipboardData) {
        window.clipboardData.setData('Text', this.invitationUrl)
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.invitationUrl)
      } else {
        return false
      }

      this.addMessage({ text: this.$t('texts.copiedInvitationUrlToClipboard'), color: 'info' })

      return true
    },

    doAccept() {
      if (this.processing) {
        return
      }

      this.processing = true

      this.acceptRoomJoin()

      this.processing = false
    },
    doCancel() {
      this.leaveRoom()

      this.$emit('input', false)

      this.$emit('cancel')
    },
  },
}
</script>
