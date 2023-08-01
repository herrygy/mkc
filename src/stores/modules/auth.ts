import { defineStore } from 'pinia'
import { AuthState } from '@/stores/interface'
import { getAuthButtonListApi, getAuthMenuListApi } from '@/api/modules/login'
import { getFlatMenuList, getShowMenuList, getAllBreadcrumbList, formatMenu } from '@/utils'
import { getUserMenuList } from '@/api/system/menu'

export const useAuthStore = defineStore({
  id: 'geeker-auth',
  state: (): AuthState => ({
    originalMenuList: [],
    // 菜单权限列表
    authMenuList: [],
    permissions: []
  }),
  getters: {
    // 按钮权限列表
    authButtonListGet: state => state.authButtonList,
    // 菜单权限列表 ==> 这里的菜单没有经过任何处理
    authMenuListGet: state => state.authMenuList,
    // 菜单权限列表 ==> 左侧菜单栏渲染，需要剔除 isHide == true
    showMenuListGet: state => getShowMenuList(state.authMenuList),
    // 菜单权限列表 ==> 扁平化之后的一维数组菜单，主要用来添加动态路由
    flatMenuListGet: state => getFlatMenuList(state.authMenuList),
    // 递归处理后的所有面包屑导航列表
    breadcrumbListGet: state => getAllBreadcrumbList(state.authMenuList)
  },
  actions: {
    setMenuList (list) {
      this.originalMenuList = list
      this.authMenuList = formatMenu(list, {})
      this.setPermission()
    },
    setPermission () {
      const menuList = getFlatMenuList(this.originalMenuList)
      const permissions = []
      menuList.forEach(item => {
        item.children && delete item.children
        if (item.funcPerms) permissions.push(item.funcPerms)
      })
      this.permissions = permissions
    },
    async getAuthMenuList (data) {
      const { result } = await getUserMenuList(data)
      this.originalMenuList = result
      this.authMenuList = formatMenu(result, {})
      this.setPermission()
      // const { result } = await getAuthMenuListApi()
      // this.authMenuList = formatMenu(result.menuList, {})
    }
  }
})
