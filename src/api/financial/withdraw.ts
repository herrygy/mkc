import request from '@/api'

// 查询列表
export function getWithdrawList (data) {
  return request({
    url: '/pay-management/withdrawApply/pageList',
    method: 'post',
    data: data
  })
}

// 新增提现申请
export function addNew (data) {
  return request({
    url: '/pay-management/withdrawApply/withdrawCash',
    method: 'post',
    data: data
  })
}

// 审批信息
export function approve (data) {
  return request({
    url: '/pay-management/withdrawApply/approveWithdraw',
    method: 'post',
    data: data
  })
}
