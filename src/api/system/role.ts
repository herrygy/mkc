import request from '@/api'

export const roleStatus = [
  { value: 0, label: '正常' },
  { value: 1, label: '停用' }
]

// 获取所有角色列表
export function getAllRole (data = {}) {
  return request({
    url: '/pay-management/sysRole/getAllRole',
    method: 'post',
    data: data
  })
}

// 角色管理分页列表
export function getRoleList (data) {
  return request({
    url: '/pay-management/sysRole/page',
    method: 'post',
    data: data
  })
}

// 获取角色明细
export function getRoleInfoById (data) {
  return request({
    url: '/pay-management/sysRole/getRoleDesc',
    method: 'post',
    data: data
  })
}

// 角色编辑
export function updateRole (data) {
  return request({
    url: '/pay-management/sysRole/edit',
    method: 'post',
    data: data
  })
}

// 角色新增
export function addRole (data) {
  return request({
    url: '/pay-management/sysRole/add',
    method: 'post',
    data: data
  })
}

// 批量删除角色
export function deleteRole (data) {
  return request({
    url: '/pay-management/sysRole/delete',
    method: 'post',
    data: data
  })
}
