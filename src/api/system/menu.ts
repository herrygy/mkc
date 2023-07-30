import request from '@/api'

export function getAllMenuList (data = {}) {
  return request({
    url: '/pay-management/sysMenu/getAll',
    method: 'post',
    data: data
  })
}
