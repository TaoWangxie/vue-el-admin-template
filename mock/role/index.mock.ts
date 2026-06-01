import { MockMethod } from 'vite-plugin-mock'
import { SUCCESS_CODE } from '@/constants'

const timeout = 1000

const adminList = [
  {
    path: '/demo',
    component: '#',
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
        component: 'views/demo/Demo',
        meta: {
          title: 'Demo'
        }
      },
      {
        path: 'detail/:id?',
        name: 'DemoDetail',
        component: 'views/demo/Detail',
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
        component: 'views/demo/Create',
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
        meta: {
          title: '车辆列表'
        }
      },
      {
        path: 'vehicle-create',
        name: 'VehicleCreate',
        component: 'views/pages/assetManagement/vehicleList/VehicleCreate',
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

const testList: string[] = ['/demo', '/demo/index', '/asset', '/asset/vehicle-list']

export default [
  // 列表接口
  {
    url: '/mock/role/list',
    method: 'get',
    timeout,
    response: ({ query }) => {
      const { roleName } = query
      return {
        code: SUCCESS_CODE,
        data: roleName === 'admin' ? adminList : testList
      }
    }
  }
] as MockMethod[]
