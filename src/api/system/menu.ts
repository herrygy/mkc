import request from '@/api'

export const menuStatus = [
  { value: 0, label: '正常' },
  { value: 1, label: '停用' }
]
export function getAllMenuList (data = {}) {
  return request({
    url: '/pay-management/sysMenu/getAll',
    method: 'post',
    data: data
  })
}

export function deleteMenu (data) {
  return request({
    url: '/pay-management/sysMenu/delete',
    method: 'post',
    data: data
  })
}

export function addMenu (data) {
  return request({
    url: '/pay-management/sysMenu/add',
    method: 'post',
    data: data
  })
}

export function updateMenu (data) {
  return request({
    url: '/pay-management/sysMenu/edit',
    method: 'post',
    data: data
  })
}

export function getUserMenuList (data) {
  return request({
    url: '/pay-management/sysMenu/getMenuListByUserId',
    method: 'post',
    data: data
  })
}
