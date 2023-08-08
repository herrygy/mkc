import request from '@/api'

// 查询列表
export function getWithdrawList (data) {
  return request({
    url: '/pay-management/withdrawIndent/pageList',
    method: 'post',
    data: data
  })
}

// 保存修改提现信息
export function updateTxInfo (data) {
  return request({
    url: '/pay-management/withdrawIndent/saveOrUpdate',
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
