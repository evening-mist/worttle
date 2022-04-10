<template lang="pug">
v-dialog(:value="value" max-width="480px" persistent scrollable @input="$emit('input', $event)")
  template(#activator="{ on, attrs }")
    slot(:on="on" :attrs="attrs")

  validation-observer(v-slot="{ invalid, handleSubmit }" ref="observer")
    v-form(@submit.prevent="handleSubmit(doJoin)")
      v-card
        v-card-title
          v-container
            v-row
              v-col.pa-0.text-center(cols="12")
                v-btn(small icon absolute left @click="doCancel()")
                  v-icon(small) {{ $t('icons.close') }}

                | {{ $t('texts.roomJoin') }}

        v-card-text
          v-container
            v-row(justify="center")
              v-col(cols="12")
                text-field(v-model="playerName" :label="$t('players.name')" counter="10" :counter-value="$countStr" :rules="{ string_length_max: { max: 10 } }" required vid="playerName" hide-details="auto")

          v-container
            v-row(justify="center")
              v-col(cols="12")
                text-field(v-model="roomId" :label="$t('rooms.id')" vid="roomId" color="correct" hide-details="auto" required)

        v-card-actions
          v-spacer

          v-btn(type="submit" color="concept" :dark="!(invalid || processing)" :loading="processing" :disabled="invalid || processing" @click="handleSubmit(doJoin)")
            | {{ $t('actions.joinRoom') }}
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'RoomJoinDialogDialogComponent',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
    initialRoomId: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      playerName: undefined,

      roomId: '',

      processing: false,
    }
  },

  computed: {
    ...mapGetters(['room']),
  },

  watch: {
    value(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.reset()
      }
    },
  },

  methods: {
    ...mapActions(['joinRoom']),

    doJoin() {
      if (this.processing) {
        return
      }

      this.processing = true

      this.joinRoom({
        playerName: this.playerName,
        roomId: this.roomId,
        callback: (response) => {
          this.$cookies.set('player_name', this.playerName)

          if (response.isSuccess) {
            this.$emit('input', false)
          } else {
            this.$emit('fail', this.roomId)

            this.processing = false
          }
        },
      })
    },
    doCancel() {
      this.$emit('input', false)

      this.$emit('cancel')
    },

    reset() {
      this.playerName = this.$cookies.get('player_name')
      this.roomId = this.initialRoomId

      this.processing = false

      this.$refs.observer?.reset()

      if (this.$present(this.$route.query.room)) {
        this.$router.replace({ name: 'index' })
      }
    },
  },
}
</script>
