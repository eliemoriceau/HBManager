import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createUI } from '@nuxt/ui'

import App from './App.vue'
import router from './router'
import uiConfig from '../ui.config'

const app = createApp(App)
const ui = createUI(uiConfig)

app.use(createPinia())
app.use(router)
app.use(ui)
app.mount('#app')
