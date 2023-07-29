/**
 * v-auth
 * 按钮权限指令
 */
import { useAuthStore } from '@/stores/modules/auth'
import type { Directive, DirectiveBinding } from 'vue'

const auth: Directive = {
  mounted (el: HTMLElement, binding: DirectiveBinding) {
    // const { value } = binding;
    // const authStore = useAuthStore();
    // const currentPageRoles = authStore.authButtonListGet[authStore.routeName] ?? [];
    // console.log(currentPageRoles);
    // if (value instanceof Array && value.length) {
    //   const hasPermission = value.every(item => currentPageRoles.includes(item));
    //   if (!hasPermission) el.remove();
    // } else {
    //   if (!currentPageRoles.includes(value)) el.remove();
    // }
    const { value } = binding
    const allPermission:any = '*:*:*'
    const permissions = useAuthStore().permissions

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value

      const hasPermissions = permissions.some(permission => {
        return allPermission === permission || permissionFlag.includes(permission)
      })

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('请设置操作权限标签值')
    }
  }
}

export default auth
