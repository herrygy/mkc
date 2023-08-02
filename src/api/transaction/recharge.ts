import request from '@/api'

export const rechargeStatus = [
  { value: 'created', label: '二维码创建' },
  { value: 'processing', label: '支付中' },
  { value: 'success', label: '成功' },
  { value: 'failed', label: '失败' }
]

// 查询列表
export function getOrderList (data) {
  return request({
    url: '/pay-management/rechargeIndent/pageList',
    method: 'post',
    data: data
  })
}

// 下级代理交易记录
export function getProxyOrderList (data) {
  return request({
    url: '/pay-management/rechargeIndent/secondList',
    method: 'post',
    data: data
  })
}

// 保存修改信息
export function updateTxInfo (data) {
  return request({
    url: '/pay-management/rechargeIndent/saveOrUpdate',
    method: 'post',
    data: data
  })
}

// 删除信息
export function deleteTx (data) {
  return request({
    url: '/pay-management/rechargeIndent/saveOrUpdate',
    method: 'get',
    params: data
  })
}
