import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import Layout from '@/layout'

const _import = require('./router/_import_' + process.env.NODE_ENV)
// const _import = require('./router/_import_production')

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/kukycol/APlan-front-end/pull/2939
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          await store.dispatch('user/getInfo')
          await store.dispatch('user/getNav')
          if (store.getters.menus.length < 1) {
            global.antRouter = []
            next()
          }
          // console.log(store.getters.menus)
          // const menus = fnAddDynamicMenuRoutes(store.getters.menus) // 1.过滤路由
          const menus = treeData(store.getters.menus, 'id', 'parentId', 'children') // 1.过滤路由
          console.log(menus)
          router.addRoutes(menus) // 2.动态添加路由
          global.antRouter = menus // 3.将路由数据传递给全局变量，做侧边栏菜单渲染工作
          next({
            ...to,
            replace: true
          }) // hack方法 确保addRoutes已完成 ,set the replace
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

// 无线下拉树结构数据类型
function treeData(source, id, parentId, children) {
  const cloneData = JSON.parse(JSON.stringify(source))
  return cloneData.filter(father => {
    const branchArr = cloneData.filter(child => father[id] === child[parentId])
    branchArr.length > 0 ? father[children] = branchArr : ''
    father.children = branchArr

    // 目录时导入目录组件
    if (father.component === null || father.component === '') {
      father.component = Layout
    } else {
    // 菜单时导入指定菜单组件
      try {
        father.component = _import(father.component)
      } catch (e) {
        father.component = null
      }
    }

    return father[parentId] === '0' // 如果第一层不是parentId=0，请自行修改
  })
}

