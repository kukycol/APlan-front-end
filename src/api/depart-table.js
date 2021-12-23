import request from '@/utils/request'

export function queryTree(query) {
  return request({
    url: '/sys/depart/treeTable',
    method: 'get',
    params: query
  })
}

export function fetchParentList(query) {
  return request({
    url: '/sys/depart/parent/TableList',
    method: 'get',
    params: query
  })
}

export function del(id) {
  return request({
    url: '/sys/depart/' + id,
    method: 'delete'
    // params: { id }
  })
}

export function create(data) {
  return request({
    url: '/sys/depart/',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: '/sys/depart/',
    method: 'put',
    data
  })
}
