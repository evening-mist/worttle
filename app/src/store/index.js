import { socket } from '~/plugins/socket-io.client.js'
import distionaryWords from '~/assets/cefr-j-v16.json'

export const state = () => ({
  room: undefined,

  playerAnswers: [],

  playerTimers: [],

  myIndex: undefined,

  inputWord: '',

  guesses: [],

  messages: [],
})

export const mutations = {
  setRoom(state, payload) {
    state.room = payload
  },
  updateRoom(state, payload) {
    if (this.$blank(state.room)) {
      return
    }

    state.room = this.$deepMerge(state.room, payload)
  },

  setPlayer(state, { playerIndex, payload }) {
    this._vm.$set(state.playerAnswers, playerIndex, payload)
  },

  setPlayerAnswer(state, { playerIndex, answer }) {
    this._vm.$set(state.playerAnswers, playerIndex, answer)
  },

  updatePlayerTimer(state, { playerIndex, payload }) {
    this._vm.$set(state.playerTimers, playerIndex, this.$deepMerge(state.playerTimers[playerIndex], payload))
  },

  setMyIndex(state, myIndex) {
    state.myIndex = myIndex
  },

  setInputWord(state, inputWord) {
    state.inputWord = inputWord
  },
  addInputLetter(state, letter) {
    state.inputWord += letter
  },
  deleteInputLetter(state) {
    state.inputWord = state.inputWord.slice(0, -1)
  },

  addGuess(state, payload) {
    state.guesses.push(payload)
  },
  updateLastGuess(state, payload) {
    if (this.$blank(state.guesses)) {
      return
    }

    this._vm.$set(state.guesses, state.guesses.length - 1, Object.assign({}, state.guesses[state.guesses.length - 1], payload))
  },
  clearGuesses(state) {
    state.guesses = []
  },

  addMessage(state, message) {
    state.messages.push(message)
  },
  clearMessages(state) {
    state.messages = []
  },
}

export const actions = {
  initialize({ state, getters, commit, dispatch }) {
    socket.on('after:join-room', (playerIndex, playerName) => {
      if (getters.playerStatus(0) === 'wait') {
        commit('updateRoom', { players: { [playerIndex]: { name: playerName, status: 'join' } } })
      }
    })

    socket.on('after:accept-room-join', (payload) => {
      commit('setRoom', payload)

      dispatch('initializeGame')

      dispatch('setSecondsInterval', getters.opponentIndex)
    })

    socket.on('after:update-room', (payload) => {
      commit('updateRoom', payload)
    })

    socket.on('after:leave-room', () => {
      if (getters.myStatus === 'playing') {
        commit('updateRoom', { players: { 0: { status: 'no_contest' }, 1: { status: 'no_contest' } } })
      } else {
        commit('updateRoom', { players: { [getters.opponentIndex]: { status: 'left' } } })
      }

      commit('addMessage', { text: this.$i18n.t('texts.playerHasLeft', { name: getters.opponentName }), color: 'info' })
    })

    socket.on('after:add-guess', (payload) => {
      dispatch('judgeOpponentGuess', payload)
    })

    socket.on('after:judge-opponent-guess', (judges) => {
      commit('updateLastGuess', { [`judge_${getters.opponentIndex}`]: judges })

      if (judges.every((judge) => judge === 'correct')) {
        dispatch('settleGame', state.myIndex)
      } else if (getters.lastGuess[`judge_${state.myIndex}`].some((judge) => judge !== 'correct')) {
        dispatch('setSecondsInterval', getters.opponentIndex)
      }
    })

    socket.on('after:unveil-answer', (answer) => {
      dispatch('setOpponentAnswer', answer)
    })

    socket.on('after:request-game-reset', (playerIndex) => {
      commit('updateRoom', { players: { [playerIndex]: { status: 'reset' } } })

      commit('addMessage', { text: this.$i18n.t('texts.playerHasRequestedGameReset', { name: getters.opponentName }), color: 'info' })
    })

    socket.on('after:reset-game', () => {
      dispatch('resetGame')

      commit('addMessage', { text: this.$i18n.t('texts.resetGame'), color: 'info' })
    })

    socket.on('disconnect', () => {
      commit('setRoom', null)
    })
  },

  createRoom({ commit, dispatch }, { playerName, payload, callback }) {
    const roomId = this.$nanoid()
    const playerIndex = 0
    socket.emit('join-room', roomId, playerIndex, playerName, (response) => {
      if (response.isSuccess) {
        commit('setRoom', { ...payload, id: roomId, players: { 0: { name: playerName, status: 'wait' } } })

        commit('setMyIndex', playerIndex)
        dispatch('setMe', { name: this.$i18n.t('you') })
        dispatch('setOpponent', { name: this.$i18n.t('opponent') })

        dispatch('initializeGame')
      }

      callback?.(response)
    })
  },
  joinRoom({ commit, dispatch }, { playerName, roomId, callback }) {
    if (this.$blank(roomId)) {
      return
    }

    const playerIndex = 1
    socket.emit('join-room', roomId, playerIndex, playerName, (response) => {
      if (response.isSuccess) {
        commit('setRoom', { id: roomId, players: { 1: { name: playerName, status: 'join' } } })

        commit('setMyIndex', playerIndex)
        dispatch('setMe', { name: this.$i18n.t('you') })
        dispatch('setOpponent', { name: this.$i18n.t('opponent') })

        dispatch('clearGuesses')
      }

      callback?.(response)
    })
  },
  acceptRoomJoin({ state, getters, commit, dispatch }) {
    if (this.$blank(getters.roomId)) {
      return
    }

    commit('updateRoom', { players: { 0: { status: 'playing' }, 1: { status: 'playing' } } })

    socket.emit('accept-room-join', state.room)

    dispatch('setSecondsInterval', state.myIndex)
  },
  updateRoom({ getters, commit }, payload) {
    if (this.$blank(getters.roomId)) {
      return
    }

    commit('updateRoom', payload)

    socket.emit('update-room', getters.roomId, payload)
  },
  leaveRoom({ getters, commit, dispatch }) {
    dispatch('resetRemainingMilliseconds', 0)
    dispatch('resetRemainingMilliseconds', 1)

    if (this.$blank(getters.roomId)) {
      return
    }

    const roomId = getters.roomId
    commit('setRoom', null)

    dispatch('clearGuesses')

    socket.emit('leave-room', roomId)
  },

  initializeGame({ dispatch }) {
    dispatch('resetAnswers')

    dispatch('clearGuesses')

    dispatch('resetRemainingMilliseconds', 0)
    dispatch('resetRemainingMilliseconds', 1)

    dispatch('drawMyAnswer')
  },
  settleGame({ state, getters, commit, dispatch }, winnerPlayerIndex) {
    if (this.$blank(getters.roomId)) {
      return
    }

    dispatch('updateRoom', { players: { [winnerPlayerIndex]: { status: 'win' }, [1 - winnerPlayerIndex]: { status: 'lose' } } })

    commit('addMessage', {
      text: this.$i18n.t('texts.playerWins', { name: getters.playerName(winnerPlayerIndex) }),
      color: winnerPlayerIndex === state.myIndex ? 'success' : 'error',
    })

    socket.emit('unveil-answer', getters.roomId, getters.myAnswer)
  },
  missGuessing({ state, getters, commit, dispatch }) {
    if (this.$blank(getters.roomId)) {
      return
    }

    dispatch('updateRoom', { players: { [state.myIndex]: { status: 'miss' } } })

    commit('addMessage', { text: this.$i18n.t('texts.missed'), color: 'warning' })

    dispatch('resetRemainingMilliseconds', 0)
    dispatch('resetRemainingMilliseconds', 1)

    socket.emit('unveil-answer', getters.roomId, getters.myAnswer)
  },
  requestGameReset({ state, getters, commit, dispatch }) {
    if (this.$blank(getters.roomId)) {
      return
    }

    if (getters.opponentStatus === 'reset') {
      socket.emit('reset-game', getters.roomId)

      dispatch('resetGame')

      commit('addMessage', { text: this.$i18n.t('texts.resetGame'), color: 'info' })
    } else {
      commit('updateRoom', { players: { [state.myIndex]: { status: 'reset' } } })

      socket.emit('request-game-reset', getters.roomId, state.myIndex)
    }
  },
  resetGame({ getters, commit, dispatch }) {
    if (this.$blank(getters.roomId)) {
      return
    }

    commit('updateRoom', { players: { 0: { status: 'playing' }, 1: { status: 'playing' } } })

    dispatch('initializeGame')

    dispatch('setSecondsInterval', 0)
  },

  setMe({ commit, getters }, payload) {
    commit('setPlayer', { playerIndex: getters.myIndex, payload })
  },
  setOpponent({ commit, getters }, payload) {
    commit('setPlayer', { playerIndex: getters.opponentIndex, payload })
  },

  setMyAnswer({ commit, getters }, answer) {
    commit('setPlayerAnswer', { playerIndex: getters.myIndex, answer })
  },
  setOpponentAnswer({ commit, getters }, answer) {
    commit('setPlayerAnswer', { playerIndex: getters.opponentIndex, answer })
  },
  drawMyAnswer({ getters, dispatch }) {
    const lettersCount = getters.lettersCount
    const candidates = distionaryWords.filter((word) => word.word.length === lettersCount)
    if (this.$present(candidates)) {
      const candidateIndex = Math.floor(Math.random() * candidates.length)
      dispatch('setMyAnswer', candidates[candidateIndex].word)
    }
  },
  resetAnswers({ commit }) {
    commit('setPlayerAnswer', { playerIndex: 0, answer: null })
    commit('setPlayerAnswer', { playerIndex: 1, answer: null })
  },
  setSecondsInterval({ state, getters, commit, dispatch }, playerIndex) {
    const guessTimelimit = this.$addSeconds(new Date(), getters.seconds)
    dispatch('updateRoom', { guessTimelimit })

    commit('updatePlayerTimer', {
      playerIndex,
      payload: {
        interval: setInterval(
          () => {
            const remainingMilliseconds = this.$differenceInMilliseconds(getters.guessTimelimit, new Date())
            commit('updatePlayerTimer', {
              playerIndex,
              payload: { remainingMilliseconds },
            })
            if (remainingMilliseconds <= 0) {
              dispatch('resetRemainingMilliseconds', playerIndex)

              if (playerIndex === state.myIndex) {
                dispatch('pass')
              }
            }
          },
          250
        )
      },
    })
  },
  resetRemainingMilliseconds({ getters, commit }, playerIndex) {
    clearInterval(getters.playerInterval(playerIndex))

    commit('updatePlayerTimer', {
      playerIndex,
      payload: { remainingMilliseconds: getters.seconds * 1000, interval: null },
    })
  },

  setInputWord({ commit }, inputWord) {
    commit('setInputWord', inputWord)
  },
  addInputLetter({ commit }, letter) {
    commit('addInputLetter', letter)
  },
  deleteInputLetter({ commit }) {
    commit('deleteInputLetter')
  },

  addGuess({ state, getters, commit, dispatch }, payload) {
    if (this.$blank(getters.roomId)) {
      return
    }

    commit('addGuess', payload)

    socket.emit('add-guess', getters.roomId, payload)

    commit('setInputWord', '')

    dispatch('resetRemainingMilliseconds', state.myIndex)

    if (payload[`judge_${state.myIndex}`].every((judge) => judge === 'correct')) {
      dispatch('settleGame', getters.opponentIndex)
    } else if (getters.guessesCount === getters.guessesAllMaxCount) {
      dispatch('missGuessing')
    }
  },
  judgeOpponentGuess({ state, getters, commit, dispatch }, guess) {
    if (this.$blank(getters.roomId)) {
      return
    }

    const judges = Array.from(guess.word).map((letter, index) => this.$judgeLetter(index, letter))
    commit('addGuess', { ...guess, [`judge_${state.myIndex}`]: judges })

    socket.emit('judge-opponent-guess', getters.roomId, judges)

    dispatch('resetRemainingMilliseconds', getters.opponentIndex)

    if (judges.every((judge) => judge === 'correct')) {
      dispatch('settleGame', getters.opponentIndex)
    } else if (guess[`judge_${getters.opponentIndex}`].every((judge) => judge === 'correct')) {
      commit('addMessage', { text: this.$i18n.t('texts.playerWins', { name: getters.myName }), color: 'success' })
    } else if (getters.guessesCount === getters.guessesAllMaxCount) {
      dispatch('missGuessing')
    } else {
      dispatch('setSecondsInterval', state.myIndex)
    }
  },
  pass({ getters, commit, dispatch }) {
    if (this.$blank(getters.roomId)) {
      return
    }

    const guess = {
      word: '-'.repeat(getters.lettersCount),
      judge_0: Array.from({ length: getters.lettersCount }).fill('absent'),
      judge_1: Array.from({ length: getters.lettersCount }).fill('absent'),
    }
    dispatch('addGuess', guess)

    commit('addMessage', { text: this.$i18n.t('texts.passed'), color: 'warning' })
  },
  clearGuesses({ commit }) {
    commit('clearGuesses')
  },

  addMessage({ commit }, message) {
    commit('addMessage', message)
  },
  clearMessages({ commit }) {
    commit('clearMessages')
  },
}

export const getters = {
  room: (state) => state.room,
  roomId: (state) => state.room?.id,
  playerName: (state) => (playerIndex) => state.room?.players?.[playerIndex]?.name,
  myName: (state, getters) => getters.playerName(state.myIndex),
  opponentName: (_state, getters) => getters.playerName(getters.opponentIndex),
  playerStatus: (state) => (playerIndex) => state.room?.players?.[playerIndex]?.status,
  myStatus: (state, getters) => getters.playerStatus(state.myIndex),
  opponentStatus: (_state, getters) => getters.playerStatus(getters.opponentIndex),
  lettersCount: (state) => state.room?.lettersCount ?? 0,
  guessesMaxCount: (state) => state.room?.guessesMaxCount ?? 0,
  guessesAllMaxCount: (state) => (state.room?.guessesMaxCount ?? 0) * 2,
  seconds: (state) => state.room?.seconds ?? 0,
  guessTimelimit: (state) => state.room?.guessTimelimit,

  playerAnswer: (state) => (playerIndex) => state.playerAnswers?.[playerIndex],
  myAnswer: (state, getters) => getters.playerAnswer(state.myIndex),

  playerTimer: (state) => (playerIndex) => state.playerTimers?.[playerIndex],
  playerInterval: (_state, getters) => (playerIndex) => getters.playerTimer(playerIndex)?.interval,
  playerRemainingMilliseconds: (_state, getters) => (playerIndex) => getters.playerTimer(playerIndex)?.remainingMilliseconds,

  myIndex: (state) => state.myIndex,
  opponentIndex: (state) => 1 - state.myIndex,

  inputWord: (state) => state.inputWord,

  guesses: (state) => state.guesses,
  lastGuess: (state) => state.guesses?.[state.guesses?.length - 1],
  guessesCount: (state) => state.guesses?.length ?? 0,

  turnPlayerIndex: (state) => state.guesses?.length % 2,

  messages: (state) => state.messages,
}
