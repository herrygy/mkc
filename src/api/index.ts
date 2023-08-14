import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { showFullScreenLoading, tryHideFullScreenLoading } from '@/config/serviceLoading'
import { LOGIN_URL } from '@/config'
import { ElMessage } from 'element-plus'
import { ResultData } from '@/api/interface'
import { ResultEnum } from '@/enums/httpEnum'
import { checkStatus } from './helper/checkStatus'
import { useUserStore } from '@/stores/modules/user'
import router from '@/routers'
// import { useRouter } from 'vue-router'

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  noLoading?: boolean;
}

const service = axios.create({
  baseURL: import.meta.env.VITE_USER_NODE_ENV === 'production' ? 'https://doc.mkcpay.com/api' : '',
  timeout: ResultEnum.TIMEOUT as number,
  withCredentials: true
})
service.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    // 当前请求不需要显示 loading，在 api 服务中通过指定的第三个参数: { noLoading: true } 来控制
    config.noLoading || showFullScreenLoading()
    if (useUserStore().token) {
      config.headers.Authorization = useUserStore().token
      config.headers.authType = 'payManagementAuth'
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    const userStore = useUserStore()
    tryHideFullScreenLoading()
    if (data.code === ResultEnum.INVALID_TOKEN) {
      userStore.setToken('')
      router.replace(LOGIN_URL)
      ElMessage.error('登录过期, 请重新登录')
      window.location.reload()
      return Promise.reject(data)
    }
    if (data.code === ResultEnum.OVERDUE) {
      userStore.setToken('')
      router.replace(LOGIN_URL)
      ElMessage.error(data.message)
      window.location.reload()
      return Promise.reject(data)
    }
    if (data.code && data.code !== ResultEnum.SUCCESS) {
      ElMessage.error(data.message)
      return Promise.reject(data)
    }
    return data
  },
  async (error: AxiosError) => {
    const { response } = error
    tryHideFullScreenLoading()
    if (error.message.indexOf('timeout') !== -1) ElMessage.error('请求超时！请您稍后重试')
    if (error.message.indexOf('Network Error') !== -1) ElMessage.error('网络错误！请您稍后重试')
    if (response) checkStatus(response.status)
    if (!window.navigator.onLine) router.replace('/500')
    return Promise.reject(error)
  }
)

export default service
