import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import { Layout } from '@/utils/routerHelper'
import { useI18n } from '@/hooks/web/useI18n'

const { t } = useI18n()

export const constantRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard/business',
    name: 'Root',
    meta: {
      hidden: true
    }
  },
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'RedirectPath',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFind',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  }
]

export const asyncRouterMap: AppRouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: Layout,
    name: 'Dashboard',
    redirect: '/dashboard/business',
    meta: {
      title: '首页',
      icon: 'ep-icon:DataLine',
      hidden: true,
      alwaysShow: false
    },
    children: [
      {
        path: 'business',
        name: 'BusinessDashboard',
        component: () => import('@/views/pages/dashboard/BusinessDashboard.vue'),
        meta: {
          title: '首页',
          hidden: true,
          canTo: true
        }
      }
    ]
  },
  {
    path: '/demo',
    component: Layout,
    name: 'Demo',
    meta: {
      title: 'Demo',
      icon: 'svg-icon:skill-level-advanced',
      alwaysShow: true
    },
    redirect: '/demo/index',
    children: [
      {
        path: 'index',
        name: 'DemoPage',
        component: () => import('@/views/demo/Demo.vue'),
        meta: {
          title: 'Demo'
        }
      },
      {
        path: 'detail/:id?',
        name: 'DemoDetail',
        component: () => import('@/views/demo/Detail.vue'),
        meta: {
          title: '处置明细详情',
          hidden: true,
          canTo: true,
          followRoute: '/demo/index',
          activeMenu: '/demo/index'
        }
      },
      {
        path: 'create',
        name: 'DemoCreate',
        component: () => import('@/views/demo/Create.vue'),
        meta: {
          title: '新建处置明细',
          hidden: true,
          canTo: true,
          followRoute: '/demo/index',
          activeMenu: '/demo/index'
        }
      }
    ]
  },
  {
    path: '/asset',
    component: Layout,
    name: 'AssetManagement',
    redirect: '/asset/vehicle-list',
    meta: {
      title: '资产管理',
      icon: 'ep-icon:PriceTag',
      alwaysShow: true
    },
    children: [
      {
        path: 'vehicle-list',
        name: 'VehicleList',
        component: () => import('@/views/pages/assetManagement/vehicleList/VehicleList.vue'),
        meta: {
          title: '车辆列表'
        }
      },
      {
        path: 'vehicle-create',
        name: 'VehicleCreate',
        component: () => import('@/views/pages/assetManagement/vehicleList/VehicleCreate.vue'),
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
]

const router = createRouter({
  history: createWebHashHistory(),
  strict: true,
  routes: constantRouterMap as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 })
})

export const resetRouter = (): void => {
  const resetWhiteNameList = ['Redirect', 'Login', 'NoFind', 'Root']
  router.getRoutes().forEach((route) => {
    const { name } = route
    if (name && !resetWhiteNameList.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name)
    }
  })
}

export const setupRouter = (app: App<Element>) => {
  app.use(router)
}

export default router
