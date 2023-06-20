import { createApp } from 'vue'
import App from './App.vue'
import router from './router'


// import './assets/main.css'
import 'tw-elements/dist/css/tw-elements.min.css';
import './assets/style.css'

const app = createApp(App)

// No need to use a router
// app.use(router)

app.config.unwrapInjectedRef = true;
app.mount('#app')
