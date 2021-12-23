/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/table',
  component: Layout,
  // redirect: '/table/complex-table',
  name: 'Table',
  meta: {
    title: 'Table',
    icon: 'table'
  },
  children: [
    {
      path: 'dynamic-table',
      component: () => import('@/views/table/dynamic-table/index'),
      name: 'DynamicTable',
      meta: { title: 'Dynamic Table' }
    },
    {
      path: 'drag-table',
      component: () => import('@/views/table/drag-table'),
      name: 'DragTable',
      meta: { title: 'Drag Table' }
    },
    {
      path: 'inline-edit-table',
      component: () => import('@/views/table/inline-edit-table'),
      name: 'InlineEditTable',
      meta: { title: 'Inline Edit' }
    },
    {
      path: 'complex-table',
      component: () => import('@/views/table/complex-table2'),
      name: 'ComplexTable',
      meta: { title: 'ComplexTable' }
    },
    {
      path: 'user-table',
      component: () => import('@/views/system/user'),
      name: 'UserTable',
      meta: { title: '用户监管' }
    },
    {
      path: 'role-table',
      component: () => import('@/views/table/system/role'),
      name: 'RoleTable',
      meta: { title: '角色监管' }
    },
    {
      path: 'rule-table',
      component: () => import('@/views/system/rule/index2'),
      name: 'RuleTable',
      meta: { title: '权限监控' }
    },
    {
      path: 'test',
      component: () => import('@/views/table/test'),
      name: 'test',
      meta: { title: 'test' }
    }
  ]
}
export default tableRouter
