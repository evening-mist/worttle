import Vue from 'vue'
import { extend, ValidationProvider, ValidationObserver, localize } from 'vee-validate'
import { required } from 'vee-validate/dist/rules'
import en from 'vee-validate/dist/locale/en.json'
import ja from 'vee-validate/dist/locale/ja.json'

export default ({ app }) => {
  extend('required', required)
  extend('string_length_max', {
    validate: (value, { max }) => app.$countStr(value) <= max,
    params: ['max'],
    message: (_, values) => app.i18n.t('validations.stringLengthMax', values),
  })

  Vue.component('ValidationProvider', ValidationProvider)
  Vue.component('ValidationObserver', ValidationObserver)

  localize('en', en)
  localize('ja', ja)
}

export { localize }
