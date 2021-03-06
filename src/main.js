import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'

import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use((config) => {
  // 请求拦截，给请求头部添加token，保证有获取数据的权限
  config.headers.Authorization = window.sessionStorage.getItem('token')

  return config
})
// 将axios挂载到Vue原型中使得每个组件都可以发起axios请求
Vue.prototype.$http = axios

Vue.config.productionTip = false
Vue.use(ElementUI)
new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
