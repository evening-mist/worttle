import Vue from 'vue'
import { customAlphabet } from 'nanoid'

import { themes } from '~/plugins/vuetify.options.js'

const deepEqual = require('deep-equal')
const deepCopy = require('deepcopy')
const deepMerge = require('deepmerge')

const groupBy = require('lodash.groupby')

export default ({ app, store, $vuetify }, inject) => {
  inject('judgeLetter', (index, letter) => {
    const answer = store.getters.myAnswer
    if (letter === answer.charAt(index)) {
      return 'correct'
    } else if (answer.includes(letter)) {
      return 'present'
    } else {
      return 'absent'
    }
  })

  inject('deepEqual', (a, b) => {
    return deepEqual(a, b, { strict: true })
  })
  inject('deepCopy', (src) => {
    return deepCopy(src)
  })
  inject('deepMerge', (original, objects) => {
    return deepMerge(original, objects)
  })

  inject('groupBy', (collection, iteratee) => {
    return groupBy(collection, iteratee)
  })

  inject('presence', (value) => {
    return app.$present(value) ? value : null
  })
  inject('present', (value) => {
    return !app.$blank(value)
  })
  inject('blank', (value) => {
    return (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim().length === 0) ||
      (Array.isArray(value) && value.length === 0)
    )
  })

  inject('sum', (array) => array.reduce((sum, value) => (sum + value), 0))
  inject('countStr', (string) => app.$sum(Array.from(string ?? '').map((c) => c.match(/[ -~]/) ? 1 : 2)))

  inject('parseBool', (str) => {
    switch (str?.toString()?.toLowerCase()) {
      case 'true':
        return true
      case 'false':
        return false
      default:
        return null
    }
  })

  inject('toDate', (date) => {
    return typeof date === 'string' ? app.$dateFns.parseISO(date) : date
  })
  inject('addSeconds', (date, seconds) => {
    return app.$dateFns.addSeconds(app.$toDate(date), seconds)
  })
  inject('differenceInMilliseconds', (date1, date2) => {
    return app.$dateFns.differenceInMilliseconds(app.$toDate(date1), app.$toDate(date2))
  })

  inject('nanoid', () => {
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 4)
    return Array.from({ length: 4 }, () => nanoid()).join('-')
  })

  inject('setDarkTheme', (dark) => {
    $vuetify.theme.dark = dark
  })
  inject('setTheme', (themeName) => {
    Vue.set($vuetify.theme.themes, 'name', themeName)

    Object.keys(themes[themeName]).forEach((colorName) => {
      $vuetify.theme.themes.light[colorName] = themes[themeName][colorName]
      $vuetify.theme.themes.dark[colorName] = themes[themeName][colorName]
    })
  })
}
