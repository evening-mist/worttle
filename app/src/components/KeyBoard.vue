<template lang="pug">
v-container
  v-row(v-for="(keyButtonLine, keyButtonLineIndex) in keyButtons" justify="center" :key="keyButtonLineIndex")
    v-col.pl-1.pt-1.pr-0.pr-sm-1.pb-0.pb-sm-1(v-for="(keyButton, keyButtonIndex) in keyButtonLine" :cols="keyButton.cols || 1" :key="keyButtonIndex")
      v-btn.font-weight-black.px-1.py-3(v-if="!keyButton.space" block :color="keyJudges[keyButton.text] || 'blue-grey lighten-4'" :dark="!!keyJudges[keyButton.text]" :light="!keyJudges[keyButton.text]" depressed :style="{ 'font-size': keyButton.size }" @click.prevent.stop="onClickKeyButton(keyButton)")
        | {{ keyButton.text }}
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'KeyBoardComponent',

  data() {
    return {
      keyButtons: undefined,
    }
  },

  computed: {
    ...mapGetters(['opponentIndex', 'guesses']),

    keyJudges() {
      const opponentJudges = this.guesses.map((guess) => guess[`judge_${this.opponentIndex}`]?.map((judge, index) => ({ letter: guess.word.charAt(index), judge })) ?? []).flat()
      const opponentJudgeGroups = this.$groupBy(opponentJudges, 'letter')
      Object.keys(opponentJudgeGroups).forEach((letter) => {
        const judges = opponentJudgeGroups[letter].map((judge) => judge.judge)
        const judgeListIndexes = judges.map((judge) => this.judgeList.indexOf(judge))
        const minJudgeListIndex = judgeListIndexes.reduce((a, b) => Math.min(a, b))
        opponentJudgeGroups[letter] = this.judgeList[minJudgeListIndex]
      })
      return opponentJudgeGroups
    },
    judgeList() {
      return ['correct', 'present', 'absent']
    },
  },

  mounted() {
    this.initialize()
  },

  methods: {
    initialize() {
      this.keyButtons = [
        [
          { text: 'Q' }, { text: 'W' }, { text: 'E' }, { text: 'R' }, { text: 'T' }, { text: 'Y' }, { text: 'U' }, { text: 'I' }, { text: 'O' }, { text: 'P' },
          { space: true, cols: 1 },
          { text: '⌫', size: this.$vuetify.breakpoint.smAndDown ? '1.25rem' : undefined, cols: 1, onClick: () => { this.$emit('backspace')} }
        ],
        [
          { text: 'A' }, { text: 'S' }, { text: 'D' }, { text: 'F' }, { text: 'G' }, { text: 'H' }, { text: 'J' }, { text: 'K' }, { text: 'L' },
          { space: true, cols: 2 },
        ],
        [
          { space: true, cols: 1 },
          { text: 'Z' }, { text: 'X' }, { text: 'C' }, { text: 'V' }, { text: 'B' }, { text: 'N' }, { text: 'M' },
          { space: true, cols: 2 },
          { text: '⏎', cols: 2, onClick: () => { this.$emit('enter')} }
        ]
      ]
    },

    onClickKeyButton(keyButton) {
      if (keyButton.onClick) {
        keyButton.onClick()
      } else {
        this.$emit('input', keyButton.text)
      }
    },
  },
}
</script>
