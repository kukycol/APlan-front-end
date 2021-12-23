import request from '@/utils/request'

export function fetchDictPage(query) {
  return request({
    url: '/tz/dict/page',
    method: 'get',
    params: query
  })
}

export function fetchDel(id) {
  return request({
    url: '/tz/dict/' + id,
    method: 'delete'
    // params: { id }
  })
}

export function fetchBtcDel(data) {
  return request({
    url: '/tz/dict/btcDel',
    method: 'delete',
    params: data
  })
}

export function createDict(data) {
  return request({
    url: '/tz/dict/',
    method: 'post',
    data
  })
}

export function updateDict(data) {
  return request({
    url: '/tz/dict/',
    method: 'put',
    data
  })
}
