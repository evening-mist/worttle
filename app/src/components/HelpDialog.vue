<template lang="pug">
v-dialog(:value="value" max-width="640px" scrollable @input="$emit('input', $event)")
  template(#activator="{ on, attrs }")
    slot(:on="on" :attrs="attrs")

  v-card
    v-card-title
      v-container
        v-row
          v-col.pa-0.text-center(cols="12")
            v-btn(small icon absolute left @click="$emit('input', false)")
              v-icon(small) {{ $t('icons.close') }}

            | {{ $t('texts.help') }}

    v-card-text
      p(v-html="$t('texts.overview')")

      v-divider.my-4

      span.text-subtitle-1.font-weight-bold {{ $t('texts.example') }}

      v-container
        v-row
          v-col.px-0.px-sm-1.py-1(v-for="(tile, tileIndex) in correctExampleTiles" cols="1" :key="tileIndex")
            v-card.tile(tile outlined :color="tile.color")
              v-card-text.text-center.text-caption.text-sm-h6.text-md-h5.font-weight-black.pa-0(:class="{ 'white--text': $present(tile.color) }")
                span {{ tile.letter }}
        v-row
          v-col.pt-1(cols="auto" v-html="$t('texts.examples.correct', { letter: correctExampleTiles.find((tile) => tile.color === 'correct').letter })")

        v-row
          v-col.px-0.px-sm-1.py-1(v-for="(tile, tileIndex) in presentExampleTiles" cols="1" :key="tileIndex")
            v-card.tile(tile outlined :color="tile.color")
              v-card-text.text-center.text-caption.text-sm-h6.text-md-h5.font-weight-black.pa-0(:class="{ 'white--text': $present(tile.color) }")
                span {{ tile.letter }}
        v-row
          v-col.pt-1(cols="auto" v-html="$t('texts.examples.present', { letter: presentExampleTiles.find((tile) => tile.color === 'present').letter })")

        v-row
          v-col.px-0.px-sm-1.py-1(v-for="(tile, tileIndex) in absentExampleTiles" cols="1" :key="tileIndex")
            v-card.tile(tile outlined :color="tile.color")
              v-card-text.text-center.text-caption.text-sm-h6.text-md-h5.font-weight-black.pa-0(:class="{ 'white--text': $present(tile.color) }")
                span {{ tile.letter }}
        v-row
          v-col.pt-1(cols="auto" v-html="$t('texts.examples.absent', { letter: absentExampleTiles.find((tile) => tile.color === 'absent').letter })")

      v-divider.my-4

      p
        span.text-subtitle-1.font-weight-bold {{ $t('texts.howToStart') }}

        ol
          i18n.pre-wrap(v-for="(_, index) in $t('texts.howToStartSteps')" :path="`texts.howToStartSteps.${index}`" tag="li" :key="index")
            template(#room-creation-button)
              v-btn.mb-1(x-small color="concept" dark)
                v-icon(left x-small) {{ $t('icons.create') }}
                | {{ $t('actions.createRoom') }}
            template(#clipboard-button)
              v-btn.mb-1(x-small icon)
                v-icon(x-small) {{ $t('icons.clipboard') }}
            template(#link-button)
              v-btn.mb-1(x-small icon)
                v-icon(x-small) {{ $t('icons.link') }}
            template(#room-join-button)
              v-btn.mb-1(x-small color="concept" dark outlined)
                v-icon(left x-small) {{ $t('icons.join') }}
                | {{ $t('actions.joinRoom') }}

      v-divider.my-4

      p
        span.text-subtitle-1.font-weight-bold {{ $t('texts.resettingAndLeavingRoom') }}

        ul
          i18n.pre-wrap(v-for="(_, index) in $t('texts.resettingAndLeavingRoomDescriptions')" :path="`texts.resettingAndLeavingRoomDescriptions.${index}`" tag="li" :key="index")
            template(#room-leaving-button)
              v-btn.mb-1(x-small icon)
                v-icon(x-small) {{ $t('icons.leave') }}
            template(#room-reset-request-button)
              v-btn.mb-1(x-small icon)
                v-icon(x-small) {{ $t('icons.reset') }}

      v-divider.my-4

      p
        span.text-subtitle-1.font-weight-bold {{ $t('texts.otherNotes') }}

        ul
          li(v-for="(item, index) in $t('texts.otherNoteItems')" v-html="item" :key="index")

      p.text-center &copy; {{ $t('copyrightYear') }}
</template>

<script>
export default {
  name: 'HelpDialogComponent',

  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    correctExampleTiles() {
      return [{ letter: 'S', color: 'correct' }, { letter: 'O' }, { letter: 'L' }, { letter: 'V' }, { letter: 'E' }]
    },
    presentExampleTiles() {
      return [{ letter: 'R' }, { letter: 'I', color: 'present' }, { letter: 'G' }, { letter: 'H' }, { letter: 'T' }]
    },
    absentExampleTiles() {
      return [{ letter: 'E' }, { letter: 'X' }, { letter: 'A' }, { letter: 'C', color: 'absent' }, { letter: 'T' }]
    },
  },
}
</script>
