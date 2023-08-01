import request from '@/api'

export const menuStatus = [
  { value: 0, label: '正常' },
  { value: 1, label: '停用' }
]

// 获取所有菜单列表
export function getAllMenuList (data = {}) {
  return request({
    url: '/pay-management/sysMenu/getAll',
    method: 'post',
    data: data
  })
}

// 批量删除菜单
export function deleteMenu (data) {
  return request({
    url: '/pay-management/sysMenu/delete',
    method: 'post',
    data: data
  })
}

// 新增菜单
export function addMenu (data) {
  return request({
    url: '/pay-management/sysMenu/add',
    method: 'post',
    data: data
  })
}

// 编辑菜单
export function updateMenu (data) {
  return request({
    url: '/pay-management/sysMenu/edit',
    method: 'post',
    data: data
  })
}

// 获取指定用户菜单列表
export function getUserMenuList (data) {
  return request({
    url: '/pay-management/sysMenu/getMenuListByUserId',
    method: 'post',
    data: data
  })
}

// 获取指定菜单的子菜单
export function getChildMenuByMenuId (data) {
}
// 获取指定角色菜单列表
export function getMenuListByRoleId (data) {
}
