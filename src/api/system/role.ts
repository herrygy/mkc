import request from '@/api'

export const roleStatus = [
  { value: 0, label: '正常' },
  { value: 1, label: '停用' }
]

export function getAllRole (data = {}) {
  return request({
    url: '/pay-management/sysRole/getAllRole',
    method: 'post',
    data: data
  })
}

export function getRoleList (data) {
  return request({
    url: '/pay-management/sysRole/page',
    method: 'post',
    data: data
  })
}

export function getRoleInfoById (data) {
  return request({
    url: '/pay-management/sysRole/getRoleDesc',
    method: 'post',
    data: data
  })
}

export function updateRole (data) {
  return request({
    url: '/pay-management/sysRole/edit',
    method: 'post',
    data: data
  })
}

export function addRole (data) {
  return request({
    url: '/pay-management/sysRole/add',
    method: 'post',
    data: data
  })
}

export function deleteRole (data) {
  return request({
    url: '/pay-management/sysRole/delete',
    method: 'post',
    data: data
  })
}
