import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/sys/user/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/sys/user/getInfo',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/sys/user/logout',
    method: 'get'
  })
}

export function getNav() {
  return request({
    url: '/sys/user/getNav',
    method: 'get'
  })
}
