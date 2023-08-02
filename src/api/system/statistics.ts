import request from '@/api'

// 获取统计信息
export function getStatisticsInfo (data = {}) {
  return request({
    url: '/pay-management/statistics/getInfo',
    method: 'post',
    data: data
  })
}
