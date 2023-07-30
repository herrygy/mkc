import request from '@/api'

export const channelStatus = [
  { value: 0, label: '正常' },
  { value: 1, label: '停用' }
]
export function getChannelList (data = {}) {
  return request({
    url: '/pay-management/payment/getPageList',
    method: 'post',
    data: data
  })
}

export function deleteChannel (data) {
  return request({
    url: '/pay-management/payment/delete',
    method: 'get',
    params: data
  })
}

export function addOrUpdateChannel (data) {
  return request({
    url: '/pay-management/payment/addOrUpdate',
    method: 'post',
    data: data
  })
}
