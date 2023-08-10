import { reactive, ref } from 'vue'
import { getChannelList } from '@/api/system/channel'

export const useChannelSelect = () => {
  const channelQuery = reactive({
    currentPage: 1,
    pageSize: 5
  })
  const channelState = reactive({
    loading: false,
    finished: false
  })
  const channelOptions = ref([])
  const channelMap = ref({})
  const getChannelOptions = async () => {
    if (channelState.loading || channelState.finished) return
    channelState.loading = true
    const { result, page } = await getChannelList(channelQuery)
    channelState.loading = false
    channelOptions.value = result.list
    channelOptions.value.forEach((item:any) => {
      channelMap.value[item.identifier] = item.name
    })
    channelState.loading = false
    channelState.finished = true
  }
  return {
    channelQuery,
    channelState,
    channelOptions,
    channelMap,
    getChannelOptions
  }
}
