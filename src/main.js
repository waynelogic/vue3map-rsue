import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const OSM_API = import.meta.env.OSM_API || null

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
