import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/sys/role/page',
    method: 'get',
    params: query
  })
}

export function fetchRoleList() {
  return request({
    url: '/sys/role/roleList',
    method: 'get'
    // params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/sys/role/' + id,
    method: 'delete'
    // params: { id }
  })
}

export function fetchArticles(data) {
  return request({
    url: '/sys/role/btcDel',
    method: 'delete',
    params: data
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/sys/role/',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/sys/role/',
    method: 'put',
    data
  })
}
