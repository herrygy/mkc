import { createApp } from 'vue'
import App from './App.vue'
import directives from '@/directives/index'
import router from '@/routers'
import i18n from '@/languages/index'
import pinia from '@/stores'
import * as Icons from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/styles/reset.scss'
import '@/styles/common.scss'
import '@/assets/iconfont/iconfont.scss'
import '@/assets/fonts/font.scss'
import '@/styles/element-dark.scss'
import '@/styles/element.scss'
import 'virtual:svg-icons-register'
import 'virtual:windi.css'
import { dayjs } from 'element-plus'
import DayjsTimezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
// errorHandler
import errorHandler from '@/utils/errorHandler'
dayjs.extend(utc)
dayjs.extend(DayjsTimezone)

const app = createApp(App)

// app.config.errorHandler = errorHandler

// register the element Icons component
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key as keyof typeof Icons])
})

app.use(directives).use(router).use(i18n).use(pinia).mount('#app')
