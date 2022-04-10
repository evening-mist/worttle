<template lang="pug">
v-dialog(:value="value" max-width="640px" persistent scrollable @input="$emit('input', $event)")
  template(#activator="{ on, attrs }")
    slot(:on="on" :attrs="attrs")

  validation-observer(v-slot="{ invalid, handleSubmit }" ref="observer")
    v-form(@submit.prevent="handleSubmit(doCreate)")
      v-card
        v-card-title
          v-container
            v-row
              v-col.pa-0.text-center(cols="12")
                v-btn(small icon absolute left @click="doCancel()")
                  v-icon(small) {{ $t('icons.close') }}

                | {{ $t('texts.roomCreation') }}

        v-card-text
          v-container
            v-row(justify="center")
              v-col(cols="12" md="8")
                text-field(v-model="playerName" :label="$t('players.name')" counter="10" :counter-value="$countStr" :rules="{ string_length_max: { max: 10 } }" required vid="playerName" hide-details="auto")

          v-container
            v-row.my-4(align="center")
              v-col.py-0(cols="12" md="4")
                | {{ $t('rooms.lettersCount') }}
              v-col.py-2(cols="auto")
                validation-provider(v-slot="{ errors }" :rules="{ required: true }" :name="$t('rooms.lettersCount')" vid="lettersCount")
                  v-radio-group.mt-0.pt-0(v-model="lettersCount" mandatory row :error="errors && errors.length !== 0" :error-messages="errors" hide-details="auto")
                    v-radio(v-for="lettersCountOption in lettersCountOptions" :label="`${lettersCountOption}`" :value="lettersCountOption" color="correct" :key="lettersCountOption")

            v-row.my-4(align="center")
              v-col.py-0(cols="12" md="4")
                | {{ $t('rooms.guessesMaxCount') }}
              v-col.py-2(cols="auto")
                validation-provider(v-slot="{ errors }" :rules="{ required: true }" :name="$t('rooms.guessesMaxCount')" vid="guessesMaxCount")
                  v-radio-group.mt-0.pt-0(v-model="guessesMaxCount" mandatory row :error="errors && errors.length !== 0" :error-messages="errors" hide-details="auto")
                    v-radio(v-for="guessesMaxCountOption in guessesMaxCountOptions" :label="`${guessesMaxCountOption}`" :value="guessesMaxCountOption" color="correct" :key="guessesMaxCountOption")

            v-row.my-4(align="center")
              v-col.py-0(cols="12" md="4")
                | {{ $t('rooms.seconds') }}
              v-col.py-2(cols="auto")
                validation-provider(v-slot="{ errors }" :name="$t('rooms.seconds')" vid="seconds")
                  v-radio-group.mt-0.pt-0(v-model="seconds" mandatory row :error="errors && errors.length !== 0" :error-messages="errors" hide-details="auto")
                    v-radio(v-for="secondOption in secondOptions" :label="`${secondOption}`" :value="secondOption" color="correct" :key="secondOption")

        v-card-actions
          v-spacer

          v-btn(type="submit" color="concept" :dark="!(invalid || processing)" :loading="processing" :disabled="invalid || processing" @click="handleSubmit(doCreate)")
            | {{ $t('actions.createRoom') }}
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'RoomCreationDialogComponent',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      playerName: undefined,

      lettersCount: undefined,
      guessesMaxCount: undefined,
      seconds: undefined,

      processing: false,
    }
  },

  computed: {
    lettersCountOptions() {
      return [4, 5, 6, 7]
    },
    guessesMaxCountOptions() {
      return [3, 4, 5, 6]
    },
    secondOptions() {
      return [30, 60, 90, 120]
    },
  },

  watch: {
    value(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.reset()
      }
    },
  },

  methods: {
    ...mapActions(['createRoom']),

    doCreate() {
      if (this.processing) {
        return
      }

      this.processing = true

      const payload = { lettersCount: this.lettersCount, guessesMaxCount: this.guessesMaxCount, seconds: this.seconds }
      this.createRoom({
        playerName: this.playerName,
        payload,
        callback: (response) => {
          this.$cookies.set('player_name', this.playerName)

          if (response.isSuccess) {
            this.$emit('input', false)
          } else {
            this.$emit('fail', payload)

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
      this.lettersCount = 5
      this.guessesMaxCount = 4
      this.seconds = 60

      this.processing = false

      this.$refs.observer?.reset()

      if (this.$present(this.$route.query.room)) {
        this.$router.replace({ name: 'index' })
      }
    },
  },
}
</script>
