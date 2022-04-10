<template lang="pug">
validation-provider(v-slot="{ errors }" :rules="innerRules" :name="label || name" :vid="vid")
  v-text-field(:value.trim="value" :label="label" :required="required" :error="errors && errors.length !== 0" :error-messages="errors" :class="{ 'pt-0': !label, required }" v-bind="$attrs" v-on="$listeners")
</template>

<script>
export default {
  name: 'TextFieldComponent',

  inheritAttrs: false,

  props: {
    value: {
      type: [String, Number],
      default: undefined,
    },
    label: {
      type: String,
      default: undefined,
    },
    name: {
      type: String,
      default: undefined,
    },
    vid: {
      type: String,
      default: undefined,
    },
    rules: {
      type: [String, Object],
      default: () => ({}),
    },
    required: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    innerRules() {
      return Object.assign({}, this.rules, { required: this.required })
    },
  },
}
</script>
