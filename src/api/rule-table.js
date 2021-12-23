import request from '@/utils/request'

export function fetchRuleList(query) {
  return request({
    url: '/sys/rule/treeTable',
    method: 'get',
    params: query
  })
}

export function fetchParentList(query) {
  return request({
    url: '/sys/rule/parentTreeTableList',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/sys/rule/' + id,
    method: 'delete'
    // params: { id }
  })
}

export function fetchArticles(data) {
  return request({
    url: '/sys/rule/btcDel',
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
    url: '/sys/rule/',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/sys/rule/',
    method: 'put',
    data
  })
}
