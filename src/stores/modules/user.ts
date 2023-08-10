import { defineStore } from 'pinia'
import { UserState } from '@/stores/interface'
import piniaPersistConfig from '@/config/piniaPersist'

export const useUserStore = defineStore({
  id: 'makcpay-user',
  state: (): UserState => ({
    token: '',
    userInfo: {
      name: 'user',
      userId: -1,
      appKey: null
    }
  }),
  getters: {},
  actions: {
    // Set Token
    setToken (token: string) {
      this.token = token
    },
    // Set setUserInfo
    setUserInfo (userInfo: UserState['userInfo']) {
      this.userInfo = userInfo
    }
  },
  persist: piniaPersistConfig('makcpay-user')
})
