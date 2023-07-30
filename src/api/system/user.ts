import request from '@/api'

export const userStatus = [
  { value: 0, label: '正常' },
  { value: 1, label: '停用' }
]

export function login (data) {
  return request({
    url: '/pay-management/sysUser/login',
    method: 'post',
    data: data
  })
}

export function logout (data = {}) {
  return request({
    url: '/pay-management/sysUser/loginOut',
    method: 'post',
    data: data
  })
}

export function getUserList (data) {
  return request({
    url: '/pay-management/sysUser/page',
    method: 'post',
    data: data
  })
}

export function addUser (data) {
  return request({
    url: '/pay-management/sysUser/add',
    method: 'post',
    data: data
  })
}

export function updateUser (data) {
  return request({
    url: '/pay-management/sysUser/edit',
    method: 'post',
    data: data
  })
}

export function checkUserName (data) {
  return request({
    url: '/pay-management/sysUser/checkName',
    method: 'get',
    params: data
  })
}

export function deleteUser (data) {
  return request({
    url: '/pay-management/sysUser/delete',
    method: 'post',
    data: data
  })
}

export function resetPwd (data) {
  return request({
    url: '/pay-management/sysUser/resetPwd',
    method: 'post',
    data: data
  })
}

export function distributeRole (data) {
  return request({
    url: '/pay-management/sysUser/distributeRole',
    method: 'post',
    data: data
  })
}

export function getProxyList (data) {
  return request({
    url: '/pay-management/sysUser/poxyPage',
    method: 'post',
    data: data
  })
}

export function addNewProxy (data) {
  return request({
    url: '/pay-management/sysUser/addProxy',
    method: 'post',
    data: data
  })
}
