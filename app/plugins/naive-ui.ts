import { NDatePicker } from 'naive-ui'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('NDatePicker', NDatePicker)
})
