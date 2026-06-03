import { defineStore } from 'pinia'
import { store } from '../index'
import { RememberLoginInfo, UserType } from '@/api/login/types'
import { ElMessageBox } from 'element-plus'
import { useI18n } from '@/hooks/web/useI18n'
import { loginOutApi } from '@/api/login'
import { useTagsViewStore } from './tagsView'
import router from '@/router'

interface UserState {
  userInfo?: UserType
  tokenKey: string
  token: string
  roleRouters?: string[] | AppCustomRouteRecordRaw[]
  rememberMe: boolean
  loginInfo?: RememberLoginInfo
}

const dashboardRoute: AppCustomRouteRecordRaw = {
  path: '/dashboard',
  component: '#',
  name: 'Dashboard',
  meta: {
    title: '首页',
    icon: 'ep-icon:DataLine',
    hidden: true,
    alwaysShow: false
  },
  redirect: '/dashboard/business',
  children: [
    {
      path: 'business',
      name: 'BusinessDashboard',
      component: 'views/pages/dashboard/BusinessDashboard',
      redirect: '',
      meta: {
        title: '首页',
        hidden: true,
        canTo: true
      }
    }
  ]
}

const assetManagementRoute: AppCustomRouteRecordRaw = {
  path: '/asset',
  component: '#',
  name: 'AssetManagement',
  meta: {
    title: '资产管理',
    icon: 'ep-icon:PriceTag',
    alwaysShow: true
  },
  redirect: '/asset/vehicle-list',
  children: [
    {
      path: 'vehicle-list',
      name: 'VehicleList',
      component: 'views/pages/assetManagement/vehicleList/VehicleList',
      redirect: '',
      meta: {
        title: '车辆列表'
      }
    },
    {
      path: 'vehicle-create',
      name: 'VehicleCreate',
      component: 'views/pages/assetManagement/vehicleList/VehicleCreate',
      redirect: '',
      meta: {
        title: '车辆新建',
        hidden: true,
        canTo: true,
        followRoute: '/asset/vehicle-list',
        activeMenu: '/asset/vehicle-list'
      }
    }
  ]
}

const isBlankRoute = (route: string | AppCustomRouteRecordRaw) => {
  if (typeof route === 'string') {
    return route === '/blank' || route === '/blank/index'
  }

  return route.name === 'Blank' || route.name === 'BlankPage' || route.path.includes('blank')
}

const isDashboardRoute = (route: string | AppCustomRouteRecordRaw) => {
  if (typeof route === 'string') {
    return route === '/dashboard' || route === '/dashboard/business'
  }

  return route.path === '/dashboard' || route.name === 'Dashboard'
}

const normalizeRoleRouters = (
  roleRouters?: string[] | AppCustomRouteRecordRaw[]
): string[] | AppCustomRouteRecordRaw[] | undefined => {
  if (!roleRouters) return roleRouters

  if (roleRouters.every((route): route is string => typeof route === 'string')) {
    const routers = roleRouters.filter((route) => !isBlankRoute(route))
    const normalizedRouters = routers.some(isDashboardRoute)
      ? routers
      : ['/dashboard', '/dashboard/business', ...routers]

    return normalizedRouters.includes('/asset/vehicle-list')
      ? normalizedRouters
      : [...normalizedRouters, '/asset', '/asset/vehicle-list']
  }

  const routers = (roleRouters as AppCustomRouteRecordRaw[])
    .filter((route) => !isBlankRoute(route))
    .map((route) => ({
      ...route,
      children:
        route.path === '/asset'
          ? [
              ...(route.children?.filter((child) => !isBlankRoute(child)) || []),
              ...(assetManagementRoute.children || []).filter(
                (child) => !route.children?.some((routeChild) => routeChild.name === child.name)
              )
            ]
          : route.children?.filter((child) => !isBlankRoute(child))
    }))

  const normalizedRouters = routers.some(isDashboardRoute) ? routers : [dashboardRoute, ...routers]

  return normalizedRouters.some((route) => route.path === '/asset')
    ? normalizedRouters
    : [...normalizedRouters, assetManagementRoute]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => {
    return {
      userInfo: undefined,
      tokenKey: 'Authorization',
      token: '',
      roleRouters: undefined,
      // 记住我
      rememberMe: true,
      loginInfo: undefined
    }
  },
  getters: {
    getTokenKey(): string {
      return this.tokenKey
    },
    getToken(): string {
      return this.token
    },
    getUserInfo(): UserType | undefined {
      return this.userInfo
    },
    getRoleRouters(): string[] | AppCustomRouteRecordRaw[] | undefined {
      return normalizeRoleRouters(this.roleRouters)
    },
    getRememberMe(): boolean {
      return this.rememberMe
    },
    getLoginInfo(): RememberLoginInfo | undefined {
      return this.loginInfo
    }
  },
  actions: {
    setTokenKey(tokenKey: string) {
      this.tokenKey = tokenKey
    },
    setToken(token: string) {
      this.token = token
    },
    setUserInfo(userInfo?: UserType) {
      this.userInfo = userInfo
    },
    setRoleRouters(roleRouters: string[] | AppCustomRouteRecordRaw[]) {
      this.roleRouters = normalizeRoleRouters(roleRouters)
    },
    logoutConfirm() {
      const { t } = useI18n()
      ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
        confirmButtonText: t('common.ok'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      })
        .then(async () => {
          const res = await loginOutApi().catch(() => {})
          if (res) {
            this.reset()
          }
        })
        .catch(() => {})
    },
    reset() {
      const tagsViewStore = useTagsViewStore()
      tagsViewStore.delAllViews()
      this.setToken('')
      this.setUserInfo(undefined)
      this.setRoleRouters([])
      router.replace('/login')
    },
    logout() {
      this.reset()
    },
    setRememberMe(rememberMe: boolean) {
      this.rememberMe = rememberMe
    },
    setLoginInfo(loginInfo: RememberLoginInfo | undefined) {
      this.loginInfo = loginInfo
    }
  },
  persist: {
    paths: ['userInfo', 'tokenKey', 'token', 'roleRouters', 'rememberMe', 'loginInfo']
  }
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}
