<template lang="pug">
v-card
  v-card-text.pa-1.pa-md-2
    v-container
      v-row
        v-col.text-center
          room-leave-confirmation-dialog(v-if="index === myIndex" v-model="showingRoomLeaveConfirmationDialog" @leave="leaveRoom()")
            template(#default="{ on, attrs }")
              v-btn(:small="$vuetify.breakpoint.mdAndUp" :x-small="$vuetify.breakpoint.smAndDown" icon absolute left v-bind="attrs" v-on="on")
                v-icon(:small="$vuetify.breakpoint.mdAndUp" :x-small="$vuetify.breakpoint.smAndDown") {{ $t('icons.leave') }}

          v-btn.px-0(v-if="status === 'guessing'" absolute right text x-small disabled)
            v-progress-circular(:value="(remainingMilliseconds / 1000) / seconds * 100" color="guessing" :size="$vuetify.breakpoint.mdAndUp ? 40 : 32" :rotate="-90")
              span.text-caption {{ Math.ceil(remainingMilliseconds / 1000) }}

          v-btn(v-else-if="resettable && index === myIndex" :small="$vuetify.breakpoint.mdAndUp" :x-small="$vuetify.breakpoint.smAndDown" icon absolute right @click="requestGameReset()")
            v-icon(:small="$vuetify.breakpoint.mdAndUp" :x-small="$vuetify.breakpoint.smAndDown") {{ $t('icons.reset') }}

          .text-subtitle-1.text-sm-h6 {{ playerName(index) }}

          v-chip(v-if="$present(status)" :color="status" dark x-small :ripple="false") {{ $t(`statuses.${status}`) }}

      v-row.my-2(justify="center")
        v-col.pl-1.pr-0.py-1(v-for="letterIndex in lettersCount" :cols="lettersCount <= 6 ? 2 : undefined" :key="letterIndex")
          v-card.tile(flat)
            v-card-text.pa-0.text-center.text-caption.text-sm-h6.font-weight-black.grey--text
              span {{ answerLetters[letterIndex - 1] }}

      v-row(v-for="rowIndex in guessesAllMaxCount" justify="center" :key="rowIndex")
        v-col.pl-1.pr-0.py-1(v-for="letterIndex in lettersCount" :cols="lettersCount <= 6 ? 2 : undefined" :key="letterIndex")
          v-card.tile(tile outlined :color="tileTable[rowIndex - 1][letterIndex - 1].color")
            v-card-text.pa-0.text-center.text-caption.text-sm-h6.font-weight-black(:class="{ 'white--text': $present(tileTable[rowIndex - 1][letterIndex - 1].color) }")
              span {{ tileTable[rowIndex - 1][letterIndex - 1].letter }}
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'PlayerBoardComponent',

  props: {
    index: {
      type: Number,
      default: undefined,
    },
  },

  data() {
    return {
      showingRoomLeaveConfirmationDialog: false,
    }
  },

  computed: {
    ...mapGetters([
      'playerName', 'playerStatus', 'lettersCount', 'guessesAllMaxCount', 'seconds',
      'playerAnswer',
      'playerRemainingMilliseconds',
      'myIndex',
      'inputWord',
      'guesses', 'guessesCount',
      'turnPlayerIndex',
    ]),

    status() {
      switch (this.playerStatus(this.index)) {
        case 'win':
        case 'lose':
        case 'miss':
        case 'left':
        case 'reset':
        case 'no_contest':
          return this.playerStatus(this.index)
        case 'playing':
          return this.turnPlayerIndex === this.index ? 'guessing' : 'waiting'
        default:
          return null
      }
    },
    resettable() {
      return ['win', 'lose', 'miss'].includes(this.status)
    },

    answer() {
      return this.playerAnswer(this.index)
    },
    answerLetters() {
      const answer = this.$presence(this.answer)
      return answer ? Array.from(answer) : Array(this.lettersCount).fill('?')
    },

    tileTable() {
      const table = []

      for (let i = 0; i < this.guessesCount; i ++) {
        table[i] = []
        for (let j = 0; j < this.lettersCount; j ++) {
          table[i][j] = { letter: this.guesses?.[i]?.word?.charAt(j), color: this.guesses?.[i]?.[`judge_${this.index}`]?.[j] }
        }
      }

      if (this.guessesCount !== this.guessesAllMaxCount) {
        table[this.guessesCount] = []
        for (let j = 0; j < this.lettersCount; j ++) {
          table[this.guessesCount][j] = { letter: this.inputWord?.charAt(j) }
        }
      }

      for (let i = this.guessesCount + 1; i < this.guessesAllMaxCount; i ++) {
        table[i] = []
        for (let j = 0; j < this.lettersCount; j ++) {
          table[i][j] = {}
        }
      }

      return table
    },

    remainingMilliseconds() {
      return this.playerRemainingMilliseconds(this.index)
    },
  },

  methods: {
    ...mapActions([
      'requestGameReset', 'leaveRoom',
    ]),
  },
}
</script>
