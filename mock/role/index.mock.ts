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
        path: 'BlankPage',
        name: 'BlankPage',
        component: 'views/blank/Blank',
        meta: {
          title: 'router.blankPage'
        }
      }
    ]
  }
]

const testList: string[] = ['/demo', '/demo/index', '/blank/index']

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
