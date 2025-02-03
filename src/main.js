/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import vue3GoogleLogin from 'vue3-google-login'
import store from './store';
import './assets/css/global.css';

const app = createApp(App)

app.use(vue3GoogleLogin, {
  clientId: '1059389900242-7nftq473428e9v2eefp1c3cnr9cr2s0g.apps.googleusercontent.com'
})

app.use(store)

registerPlugins(app)

app.mount('#app')
