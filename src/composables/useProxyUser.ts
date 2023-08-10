import { ref } from 'vue'
import { getProxyInfo } from '@/api/system/user'
import { useUserStore } from '@/stores/modules/user'

export const useProxyUser = () => {
  const proxyUserInfo = ref({})
  const userStore = useUserStore()
  const getProxyUserInfo = async () => {
    const { result } = await getProxyInfo({ appKey: userStore.userInfo.appKey })
    proxyUserInfo.value = result
  }
  return {
    proxyUserInfo,
    getProxyUserInfo
  }
}
