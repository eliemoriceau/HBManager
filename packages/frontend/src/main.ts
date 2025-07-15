import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Import tout le module UI d'abord
import ui from '@nuxt/ui/vue-plugin'

import App from './App.vue'
import router from './router'

const app = createApp(App)
// Utiliser createUI depuis le module importé
// const ui = NuxtUI.createUI(uiConfig)

app.use(createPinia())
app.use(router)
app.use(ui)
app.mount('#app')
