import { createApp } from 'vue'
import App from './App.vue'
import directives from '@/directives/index'
import router from '@/routers'
import i18n from '@/languages/index'
import pinia from '@/stores'
import '@/styles/reset.scss'
import '@/styles/common.scss'
import '@/assets/iconfont/iconfont.scss'
import '@/assets/fonts/font.scss'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/styles/element-dark.scss'
import '@/styles/element.scss'
import 'virtual:svg-icons-register'
import * as Icons from '@element-plus/icons-vue'
import 'virtual:windi.css'

// errorHandler
import errorHandler from '@/utils/errorHandler'

const app = createApp(App)

app.config.errorHandler = errorHandler

// register the element Icons component
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key as keyof typeof Icons])
})

app.use(directives).use(router).use(i18n).use(pinia).mount('#app')
