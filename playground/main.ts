import { createApp } from 'vue';
import App from './App.vue';
import { setupNaive, setupDatafe } from './plugins';

const app = createApp(App);

setupNaive(app);
setupDatafe(app);
app.mount('#app');
