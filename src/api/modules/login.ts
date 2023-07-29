import authButtonList from '@/assets/json/authButtonList.json'
import request from '@/api'
import testMenuList from '@/assets/json/testMenuList.json'
import { PORT1 } from '@/api/config/servicePort'

export const loginApi = data => {
  // return testMenuList;
  return request({
    url: '/pay-management/sysUser/login',
    method: 'post',
    data: data
  })
}

// 获取菜单列表
export const getAuthMenuListApi = () => {
  return testMenuList
}

// 获取按钮权限
export const getAuthButtonListApi = () => {
  return authButtonList
}

// 用户退出登录
export const logoutApi = () => {
  return request({
    url: PORT1 + '/logout',
    method: 'post'
  })
}
