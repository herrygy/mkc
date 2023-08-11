import request from '@/api'

export const withdrawStatus = [
  { value: 'created', label: '创建中' },
  { value: 'success', label: '成功' },
  { value: 'failed', label: '失败' },
  { value: 'canceled', label: '已取消' }
]
// 查询列表
export function getWithdrawList (data) {
  return request({
    url: '/pay-management/withdrawIndent/pageList',
    method: 'post',
    data: data
  })
}

// 修改提现状态
export function updateTxState (data) {
  return request({
    url: '/pay-management/withdrawIndent/editState',
    method: 'post',
    data: data
  })
}

export function addWithdraw (data) {
  return request({
    url: '/pay-management/withdrawIndent/withdrawCash',
    method: 'post',
    data: data
  })
}

// 删除信息
export function deleteTx (data) {
  return request({
    url: '/pay-management/withdrawIndent/delete',
    method: 'get',
    params: data
  })
}
