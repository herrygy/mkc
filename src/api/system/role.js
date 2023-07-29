import request from '@/api'

export const roleStatus = [
  { value: 0, label: '正常' },
  { value: 1, label: '停用' }
]

export function getUserList (data) {
  return request({
    url: '/pay-management/sysUser/page',
    method: 'post',
    data: data
  })
}

// 查询角色列表
export function getRoleList (data) {
  return request({
    // url: '/pay-management/sysRole/getAllRole',
    url: '/pay-management/sysRole/page',
    method: 'post',
    data: data
  })
}
