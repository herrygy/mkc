import request from '@/api'

export const channelStatus = [
  { value: 0, label: '正常' },
  { value: 1, label: '停用' }
]

// 获取渠道列表
export function getChannelList (data = {}) {
  return request({
    url: '/pay-management/payment/getPageList',
    method: 'post',
    data: data
  })
}

// 删除渠道
export function deleteChannel (data) {
  return request({
    url: '/pay-management/payment/delete',
    method: 'get',
    params: data
  })
}

// 新增或修改
export function addOrUpdateChannel (data) {
  return request({
    url: '/pay-management/payment/addOrUpdate',
    method: 'post',
    data: data
  })
}
