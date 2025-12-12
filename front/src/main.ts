import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'

import './styles/main.css'
import 'uno.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
})

app.use(pinia)
app.use(router)
app.mount('#app')
