<template lang="pug">
page
  v-container(v-if="$blank(room)")
    v-row(justify="center")
      v-col(cols="auto")
        .my-8
          room-creation-dialog(v-model="showingRoomCreationDialog")
            template(#default="{ on, attrs }")
              v-btn(x-large block color="concept" dark v-bind="attrs" v-on="on")
                v-icon(left small) {{ $t('icons.create') }}
                | {{ $t('actions.createRoom') }}

        .my-8
          room-join-dialog(v-model="showingRoomJoinDialog" :initial-room-id="$route.query.room" @fail="addMessage({ text: $t('texts.failedToJoinRoom', { id: $event }), color: 'error' })")
            template(#default="{ on, attrs }")
              v-btn(x-large block color="concept" dark outlined v-bind="attrs" v-on="on")
                v-icon(left small) {{ $t('icons.join') }}
                | {{ $t('actions.joinRoom') }}

  v-container(v-else-if="!isWaiting && !isJoining" :style="{ 'margin-bottom': isPlaying ? '108px' : undefined }")
    v-row(justify="center")
      v-col.px-1(cols="6" sm="5" md="3")
        player-board(:index="myIndex")

      v-col.px-1(cols="6" sm="5" md="3")
        player-board(:index="opponentIndex")

  room-join-wait-dialog(:value="isWaiting")

  room-join-acceptance-wait-dialog(:value="isJoining")

  v-snackbar(v-for="(message, index) in messages" :value="true" top :color="message.color" :key="index")
    | {{ message.text }}

  template(v-if="isPlaying" #footer)
    v-container
      v-row(justify="center")
        v-col.pa-0(cols="12" sm="8" md="6")
          key-board(@input="onInput($event)" @enter="onEnter()" @backspace="onBackspace()")
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import distionaryWords from '~/assets/cefr-j-v16.json'

export default {
  name: 'IndexPage',

  data() {
    return {
      showingRoomCreationDialog: false,
      showingRoomJoinDialog: false,
    }
  },

  computed: {
    ...mapGetters([
      'room', 'lettersCount', 'playerStatus',
      'playerInterval',
      'myIndex', 'opponentIndex',
      'inputWord',
      'turnPlayerIndex',
      'messages',
    ]),

    isWaiting() {
      return this.playerStatus(0) === 'wait'
    },
    isJoining() {
      return this.$blank(this.playerStatus(0)) && this.playerStatus(1) === 'join'
    },
    isPlaying() {
      return this.playerStatus(0) === 'playing' && this.playerStatus(1) === 'playing'
    },
  },

  watch: {
    showingRoomJoinDialog(newValue, oldValue) {
      if (newValue !== oldValue) {
        scrollTo(0, 0)
      }
    },
  },

  mounted() {
    this.initialize()
  
    document.addEventListener('keydown', this.onKeyDown)

    if (this.$present(this.$route.query.room)) {
      this.showingRoomJoinDialog = true
    }
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.onKeyDown)

    clearInterval(this.playerInterval(0))
    clearInterval(this.playerInterval(1))
  },

  methods: {
    ...mapActions([
      'initialize',
      'updateRoom',
      'addInputLetter', 'deleteInputLetter',
      'addGuess', 'clearGuesses',
      'addMessage', 'clearMessages',
    ]),

    onInput(letter) {
      if (!this.isPlaying || this.turnPlayerIndex !== this.myIndex) {
        return
      }

      if (this.inputWord.length >= this.lettersCount) {
        return
      }

      this.addInputLetter(letter)
    },
    onEnter() {
      if (!this.isPlaying || this.turnPlayerIndex !== this.myIndex) {
        return
      }

      if (this.inputWord.length !== this.lettersCount) {
        return
      }

      if (!distionaryWords.some((word) => word.word === this.inputWord)) {
        this.addMessage({ text: this.$t('texts.invalidGuess', { guess: this.inputWord }), color: 'warning' })
        return
      }

      const judges = Array.from(this.inputWord).map((letter, index) => this.$judgeLetter(index, letter))
      const guess = {
        word: this.inputWord,
        [`judge_${this.myIndex}`]: judges,
      }
      this.addGuess(guess)
    },
    onBackspace() {
      if (!this.isPlaying || this.turnPlayerIndex !== this.myIndex) {
        return
      }

      if (this.$blank(this.inputWord)) {
        return
      }

      this.deleteInputLetter()
    },
    onKeyDown(event) {
      if (event.keyCode >= 65 && event.keyCode <= 90) {
        this.onInput(event.key.toUpperCase())
      } else if (event.keyCode === 13) {
        this.onEnter()
      } else if (event.keyCode === 8) {
        this.onBackspace()
      }
    },
  },
}
</script>
