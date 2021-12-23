import Cookies from 'js-cookie'
// import VueCookies from 'vue-cookies'

const TokenKey = 'Admin-Token'
const NavKey = 'Admin-Nav'

export function getToken() {
  return Cookies.get(TokenKey)
  // return VueCookies.get(TokenKey)
}

export function setToken(token, expires) {
  return Cookies.set(TokenKey, token)
  // return Cookies.set(TokenKey, token, { expires: expires / 86400 })
  // return VueCookies.set(TokenKey, token, expires)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
  // return VueCookies.remove(TokenKey)
}
export function getNavigate() {
  return Cookies.get(NavKey)
}

export function setNavigate(nav) {
  return Cookies.set(NavKey, nav)
}

export function removeNavigate() {
  return Cookies.remove(NavKey)
}
