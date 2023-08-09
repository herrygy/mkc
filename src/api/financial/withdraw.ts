import request from '@/api'

// 查询列表
export function getWithdrawList (data) {
  return request({
    url: '/pay-management/withdrawIndentApply/pageList',
    method: 'post',
    data: data
  })
}

// 新增提现申请
export function updateTxInfo (data) {
  return request({
    url: '/pay-management/withdrawIndent/withdrawCash',
    method: 'post',
    data: data
  })
}

// 删除信息
export function deleteTx (data) {
  return request({
    url: '/pay-management/withdrawIndentApply/delete',
    method: 'get',
    params: data
  })
}
