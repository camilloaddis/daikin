import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueMoment from 'vue-moment'
import locale from 'moment/locale/it'
import VueTouch from 'vue-touch'
import VueRouter from 'vue-router'
import routes from './routes.js'
import VueCharts from 'vue-chartjs'



Vue.use(VueTouch);
Vue.use(VueRouter);
Vue.use(VueMoment, {locale});
Vue.use(VueCharts);

const router = new VueRouter({
	routes
});


	console.log(process.env)
	axios.defaults.baseURL = process.env.VUE_APP_API_URL;


Vue.config.productionTip = false

new Vue({
	router,
	render: h => h(App)
}).$mount('#app')
