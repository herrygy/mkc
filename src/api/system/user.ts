import request from '@/api'

export const userStatus = [
  { value: 0, label: '正常' },
  { value: 1, label: '停用' }
]

// 登录
export function login (data) {
  return request({
    url: '/pay-management/sysUser/login',
    method: 'post',
    data: data
  })
}

// 登录退出
export function logout (data = {}) {
  return request({
    url: '/pay-management/sysUser/loginOut',
    method: 'post',
    data: data
  })
}

// 用户管理列表
export function getUserList (data) {
  return request({
    url: '/pay-management/sysUser/page',
    method: 'post',
    data: data
  })
}

// 用户新增
export function addUser (data) {
  return request({
    url: '/pay-management/sysUser/add',
    method: 'post',
    data: data
  })
}

// 用户编辑
export function updateUser (data) {
  return request({
    url: '/pay-management/sysUser/edit',
    method: 'post',
    data: data
  })
}

// 查看用户名是否重复
export function checkUserName (data) {
  return request({
    url: '/pay-management/sysUser/checkName',
    method: 'get',
    params: data
  })
}

// 批量删除系统用户
export function deleteUser (data) {
  return request({
    url: '/pay-management/sysUser/delete',
    method: 'post',
    data: data
  })
}

// 重置密码
export function resetPwd (data) {
  return request({
    url: '/pay-management/sysUser/resetPwd',
    method: 'post',
    data: data
  })
}

// 分配角色
export function distributeRole (data) {
  return request({
    url: '/pay-management/sysUser/distributeRole',
    method: 'post',
    data: data
  })
}

// 用户详情
export function getUserDetail (data) {
  return request({
    url: '/pay-management/sysUser/getUserDesc',
    method: 'post',
    data: data
  })
}

// 新增代理
export function addNewProxy (data) {
  return request({
    url: '/pay-management/sysUser/addProxy',
    method: 'post',
    data: data
  })
}

// 下级代理列表
export function getProxyList (data) {
  return request({
    url: '/pay-management/sysUser/poxyPage',
    method: 'post',
    data: data
  })
}

export function getProxyInfo (data) {
  return request({
    url: '/pay-management/sysUser/getProxyInfo',
    method: 'post',
    data: data
  })
}

export function editProxyInfo (data) {
  return request({
    url: '/pay-management/sysUser/editProxyUser',
    method: 'post',
    data: data
  })
}
